from datetime import timedelta

from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Prefetch

from .authme import change_authme_password

from .authme import check_authme_user_exists, create_authme_user
from .jwt import get_tokens_for_user, get_user_from_token
from .models import SiteUser, Token, VipUrl
from .serializers import (
    AvatarSerializer,
    ChangePasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    SiteUserSerializer,
    TokenListSerializer,
    VipUrlSerializer,
    VipUrlCreateSerializer,
)


class SiteUserViewSet(viewsets.ModelViewSet):
    queryset = SiteUser.objects.prefetch_related(
        Prefetch('vip_urls', queryset=VipUrl.objects.order_by('id'))
    ).order_by('id')
    serializer_class = SiteUserSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        if self.action == 'login':
            return LoginSerializer
        return SiteUserSerializer

    def _get_user_from_request(self, request):
        """Извлекает пользователя из Bearer-токена в заголовке.
        Возвращает (user, None) при успехе, иначе (None, Response) с ошибкой.
        """
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            return None, Response(
                {'error': 'Token required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        user = get_user_from_token(header[7:])
        if not user:
            return None, Response(
                {'error': 'Invalid token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return user, None

    def _check_vip(self, user):
        """Проверяет, является ли пользователь VIP. Возвращает Response с ошибкой или None."""
        if not user.vip_status:
            return Response(
                {'error': 'Только для VIP'},
                status=status.HTTP_403_FORBIDDEN
            )
        return None

    def _build_user_response(self, user, tokens, include_urls=False):
        data = {
            'id': user.id,
            'nickname': user.nickname,
            'vip_status': user.vip_status,
            'avatar': user.avatar.url if user.avatar else None,
        }
        if include_urls:
            urls_data = VipUrlSerializer(
                VipUrl.objects.filter(vip=user),
                many=True
            ).data
            data['urls'] = urls_data
        return {
            'user': data,
            'access': tokens['access'],
        }

    def _set_refresh_cookie(self, response, token):
        response.set_cookie(
            key='refresh_token',
            value=token,
            max_age=timedelta(days=7),
            httponly=True,
            secure=getattr(settings, 'SECURE_COOKIE', False),
            samesite='Lax',
            path='/api/users/refresh/',
        )

    def _get_refresh_token(self, request):
        return request.data.get('refresh') or request.COOKIES.get(
            'refresh_token'
        )

    # --- auth actions ---

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        nickname = serializer.validated_data['nickname']
        password = serializer.validated_data['password']

        # 1. Проверяем наличие и активность токена регистрации ДО создания пользователя
        token_value = serializer.validated_data.get('token')
        if not token_value:
            return Response(
                {'error': 'Токен регистрации обязателен'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token_obj = Token.objects.get(token=token_value, active=True)
        except Token.DoesNotExist:
            return Response(
                {'error': 'Недействительный токен регистрации'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2. Проверяем, не занят ли ник в AuthMe
        if check_authme_user_exists(nickname):
            return Response(
                {'error': 'Ник уже занят на сервере'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3. Создаём пользователя в Django
        user = serializer.save()
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')

        # 4. Создаём пользователя в AuthMe
        if not create_authme_user(username=nickname, password=password, ip=ip):
            user.delete()
            return Response(
                {'error': 'Ошибка создания аккаунта'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # 5. Деактивируем токен (теперь он точно валиден, так как мы проверили)
        try:
            token_obj.deactivate(user)  # или token_obj.active = False; token_obj.save()
        except Exception as e:
            # Если деактивация не удалась – откатываем всё
            user.delete()
            try:
                from .authme import delete_authme_user
                delete_authme_user(nickname)
            except ImportError:
                pass
            return Response(
                {'error': 'Ошибка активации аккаунта'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # 6. Успех – выдаём токены и ответ
        tokens = get_tokens_for_user(user)
        response_data = self._build_user_response(user, tokens, include_urls=False)
        response = Response(response_data, status=status.HTTP_201_CREATED)
        self._set_refresh_cookie(response, tokens['refresh'])
        return response

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        nickname = serializer.validated_data['nickname']
        password = serializer.validated_data['password']

        try:
            user = SiteUser.objects.get(nickname=nickname)
        except SiteUser.DoesNotExist:
            return Response(
                {
                    'login': 'Неверный ник или пароль',
                    'password': 'Неверный ник или пароль',
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {
                    'login': 'Неверный ник или пароль',
                    'password': 'Неверный ник или пароль',
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = get_tokens_for_user(user)
        response_data = self._build_user_response(user, tokens, include_urls=True)
        response = Response(response_data)
        self._set_refresh_cookie(response, tokens['refresh'])
        return response

    @action(detail=False, methods=['post'])
    def refresh(self, request):
        token = self._get_refresh_token(request)
        if not token:
            return Response(
                {'error': 'Refresh token required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            refresh = RefreshToken(token)
            response = Response({'access': str(refresh.access_token)})
            self._set_refresh_cookie(response, str(refresh))
            return response
        except (TokenError, InvalidToken):
            return Response(
                {'error': 'Invalid refresh token'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

    @action(detail=False, methods=['post'])
    def logout(self, request):
        response = Response({'message': 'Logged out'})
        response.delete_cookie(
            'refresh_token', path='/api/users/refresh/'
        )
        return response

    @action(detail=False, methods=['get'])
    def me(self, request):
        user, error_response = self._get_user_from_request(request)
        if error_response:
            return error_response
        return Response(self.get_serializer(user).data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user, error_response = self._get_user_from_request(request)
        if error_response:
            return error_response

        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Неверный текущий пароль'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_password = serializer.validated_data['new_password']

        # Сначала меняем пароль в AuthMe
        if not change_authme_password(user.nickname, new_password):
            return Response(
                {'error': 'Ошибка смены пароля на сервере'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Затем меняем пароль в Django
        user.set_password(new_password)
        user.save()

        return Response({'message': 'Пароль изменён'})

    @action(detail=False, methods=['patch'])
    def avatar(self, request):
        """Смена аватарки — только для VIP"""
        user, error_response = self._get_user_from_request(request)
        if error_response:
            return error_response

        vip_error = self._check_vip(user)
        if vip_error:
            return vip_error

        serializer = AvatarSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({'avatar': user.avatar.url if user.avatar else None})

    @action(detail=False, methods=['get'])
    def my_tokens(self, request):
        """Список активных токенов пользователя — только для VIP"""
        user, error_response = self._get_user_from_request(request)
        if error_response:
            return error_response

        vip_error = self._check_vip(user)
        if vip_error:
            return vip_error

        tokens = Token.objects.filter(owner=user, active=True)
        serializer = TokenListSerializer(tokens, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'post', 'delete'])
    def vip_urls(self, request):
        if request.method == 'GET':
            return self._handle_get_vip_urls(request)
        elif request.method == 'POST':
            return self._handle_post_vip_urls(request)
        elif request.method == 'DELETE':
            return self._handle_delete_vip_urls(request)

    def _handle_get_vip_urls(self, request):
        vip_id = request.query_params.get('id')
        if not vip_id:
            return Response({'error': 'id required'}, status=400)
        try:
            vip = SiteUser.objects.get(id=vip_id, vip_status=True)
        except SiteUser.DoesNotExist:
            return Response({'error': 'VIP not found'}, status=404)
        urls = VipUrl.objects.filter(vip=vip)
        return Response({
            'nickname': vip.nickname,
            'urls': VipUrlSerializer(urls, many=True).data,
        })

    def _handle_post_vip_urls(self, request):
        user, error_response = self._get_user_from_request(request)
        if error_response:
            return error_response
        vip_error = self._check_vip(user)
        if vip_error:
            return vip_error
        serializer = VipUrlCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(vip=user)
        return Response(serializer.data, status=201)

    def _handle_delete_vip_urls(self, request):
        user, error_response = self._get_user_from_request(request)
        if error_response:
            return error_response
        vip_error = self._check_vip(user)
        if vip_error:
            return vip_error
        url_id = request.data.get('id')
        if not url_id:
            return Response({'error': 'id required'}, status=400)
        deleted, _ = VipUrl.objects.filter(id=url_id, vip=user).delete()
        if not deleted:
            return Response({'error': 'Not found'}, status=404)
        return Response({'message': 'Deleted'})

    @action(detail=False, methods=['get'])
    def streamers(self, request):
        """Список VIP-пользователей (стримеров) с их ссылками"""
        queryset = self.get_queryset().filter(vip_status=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)