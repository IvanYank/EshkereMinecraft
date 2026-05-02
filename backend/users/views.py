from datetime import timedelta

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .authme import check_authme_user_exists, create_authme_user
from .jwt import get_tokens_for_user, get_user_from_token
from .models import SiteUser
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    SiteUserSerializer,
)


class SiteUserViewSet(viewsets.ModelViewSet):
    queryset = SiteUser.objects.all()
    serializer_class = SiteUserSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        if self.action == 'login':
            return LoginSerializer
        return SiteUserSerializer

    # --- cookie helpers ---

    def _set_refresh_cookie(self, response, token):
        response.set_cookie(
            key='refresh_token',
            value=token,
            max_age=timedelta(days=7),
            httponly=True,
            secure=False,
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

        if check_authme_user_exists(nickname):
            return Response(
                {'error': 'Ник уже занят на сервере'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')

        if not create_authme_user(
            username=nickname, password=password, ip=ip
        ):
            user.delete()
            return Response(
                {'error': 'Ошибка создания аккаунта'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if hasattr(user, '_pending_token'):
            user._pending_token.deactivate(user)

        tokens = get_tokens_for_user(user)
        response = Response(
            {
                'user': {
                    'id': user.id,
                    'nickname': user.nickname,
                    'vip_status': user.vip_status,
                    'avatar': user.avatar.url if user.avatar else None,
                },
                'access': tokens['access'],
            },
            status=status.HTTP_201_CREATED,
        )

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
                {'error': 'Неверный ник или пароль'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {'error': 'Неверный ник или пароль'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = get_tokens_for_user(user)
        response = Response(
            {
                'user': {
                    'id': user.id,
                    'nickname': user.nickname,
                    'vip_status': user.vip_status,
                    'avatar': user.avatar.url if user.avatar else None,
                },
                'access': tokens['access'],
            }
        )

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
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            return Response(
                {'error': 'Token required'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = get_user_from_token(header[7:])
        if not user:
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(self.get_serializer(user).data)