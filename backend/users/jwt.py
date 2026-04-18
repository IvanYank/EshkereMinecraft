from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.conf import settings


def get_tokens_for_user(user):
    """Создать access и refresh токены для SiteUser"""
    refresh = RefreshToken()
    
    # Добавляем кастомные поля в токен
    refresh['user_id'] = user.id
    refresh['nickname'] = user.nickname
    refresh['vip_status'] = user.vip_status
    refresh['user_type'] = 'site_user'
    
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


def get_user_from_token(token):
    """Получить пользователя из токена"""
    from .models import SiteUser
    
    try:
        access_token = AccessToken(token)
        user_id = access_token.get('user_id')
        user_type = access_token.get('user_type')
        
        if user_type != 'site_user':
            return None
        
        return SiteUser.objects.get(id=user_id)
    except Exception:
        return None