from rest_framework import authentication
from rest_framework import exceptions
from .jwt import get_user_from_token


class SiteUserJWTAuthentication(authentication.BaseAuthentication):
    """Аутентификация SiteUser через JWT"""
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header[7:]
        user = get_user_from_token(token)
        
        if not user:
            raise exceptions.AuthenticationFailed('Invalid token')
        
        return (user, token)