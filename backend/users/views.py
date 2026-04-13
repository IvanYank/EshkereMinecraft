from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from .models import SiteUser
from .serializers import (
    SiteUserSerializer,
    RegisterSerializer,
    LoginSerializer
)
from .jwt import get_tokens_for_user, get_user_from_token
from .authme import create_authme_user, check_authme_user_exists


class SiteUserViewSet(viewsets.ModelViewSet):
    queryset = SiteUser.objects.all()
    serializer_class = SiteUserSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        elif self.action == 'login':
            return LoginSerializer
        return SiteUserSerializer
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        nickname = serializer.validated_data['nickname']
        password = serializer.validated_data['password']
        
        if check_authme_user_exists(nickname):
            return Response({
                'error': 'Этот ник уже занят на Minecraft сервере'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
        
        success = create_authme_user(
            username=nickname,
            password=password,
            ip=ip
        )
        
        if not success:
            user.delete()
            return Response({
                'error': 'Не удалось создать аккаунт на Minecraft сервере'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if hasattr(user, '_pending_token'):
            user._pending_token.deactivate(user)
        
        tokens = get_tokens_for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'nickname': user.nickname,
                'vip_status': user.vip_status,
                'avatar': user.avatar.url if user.avatar else None,
            },
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        nickname = serializer.validated_data['nickname']
        password = serializer.validated_data['password']
        
        try:
            user = SiteUser.objects.get(nickname=nickname)
            if user.check_password(password):
                tokens = get_tokens_for_user(user)
                return Response({
                    'user': {
                        'id': user.id,
                        'nickname': user.nickname,
                        'vip_status': user.vip_status,
                        'avatar': user.avatar.url if user.avatar else None,
                    },
                    'tokens': tokens
                })
        except SiteUser.DoesNotExist:
            pass
        
        return Response({
            'error': 'Неверный ник или пароль'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'])
    def refresh(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=400)
        
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken(refresh_token)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        except (TokenError, InvalidToken):
            return Response({'error': 'Invalid refresh token'}, status=401)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return Response({'error': 'Token required'}, status=401)
        
        token = auth_header[7:]
        user = get_user_from_token(token)
        
        if user:
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        return Response({'error': 'Invalid token'}, status=401)