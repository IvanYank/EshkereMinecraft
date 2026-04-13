from django.db import models
import secrets


class TokenManager(models.Manager):
    def create_token(self, owner=None):
        token = secrets.token_urlsafe(16)
        return self.create(token=token, owner=owner)
    
    def get_active_token(self, token_value):
        try:
            return self.get(token=token_value, active=True)
        except Token.DoesNotExist:
            return None


class SiteUser(models.Model):
    """Обычный пользователь сайта"""
    
    nickname = models.CharField(max_length=50, unique=True, verbose_name="Ник")
    password = models.CharField(max_length=128, verbose_name="Пароль")
    registered_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата регистрации")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="Аватар")
    vip_status = models.BooleanField(default=False, verbose_name="VIP статус")
    
    registered_with_token = models.ForeignKey(
        'Token',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='users',
        verbose_name="Токен регистрации"
    )
    
    class Meta:
        verbose_name = "Пользователь сайта"
        verbose_name_plural = "Пользователи сайта"
    
    def __str__(self):
        return self.nickname
    
    def set_password(self, raw_password):
        from django.contrib.auth.hashers import make_password
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password)
    
    @classmethod
    def create_user(cls, nickname, password, token=None):
        user = cls(nickname=nickname)
        user.set_password(password)
        if token:
            user.registered_with_token = token
        user.save()
        return user


class Token(models.Model):
    token = models.CharField(max_length=32, unique=True, verbose_name="Токен")
    active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    used_at = models.DateTimeField(blank=True, null=True, verbose_name="Дата использования")
    used_by = models.ForeignKey(
        SiteUser,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='used_tokens',
        verbose_name="Использован пользователем"
    )
    owner = models.ForeignKey(
        SiteUser,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='owned_tokens',
        limit_choices_to={'vip_status': True},
        verbose_name="Владелец (VIP)"
    )
    
    objects = TokenManager()
    
    class Meta:
        verbose_name = "Токен"
        verbose_name_plural = "Токены"
    
    def __str__(self):
        return f"{self.token} ({'Активен' if self.active else 'Использован'})"
    
    def deactivate(self, user):
        from django.utils import timezone
        self.active = False
        self.used_at = timezone.now()
        self.used_by = user
        self.save()