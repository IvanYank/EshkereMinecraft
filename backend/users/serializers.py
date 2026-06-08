from rest_framework import serializers
from .models import SiteUser, Token, VipUrl


class VipUrlSerializer(serializers.ModelSerializer):
    class Meta:
        model = VipUrl
        fields = ['id', 'title', 'url']


class SiteUserSerializer(serializers.ModelSerializer):
    urls = VipUrlSerializer(many=True, read_only=True, source='vip_urls')

    class Meta:
        model = SiteUser
        fields = [
            'id', 'nickname', 'avatar', 'vip_status', 'registered_at', 'urls'
        ]
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    token = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = SiteUser
        fields = ['nickname', 'password', 'token']
    
    def validate_token(self, value):
        token = Token.objects.get_active_token(value)
        if not token:
            raise serializers.ValidationError(
                "Токен недействителен или уже использован"
            )
        return value
    
    def validate_nickname(self, value):
        if SiteUser.objects.filter(nickname=value).exists():
            raise serializers.ValidationError("Этот ник уже занят")
        return value
    
    def create(self, validated_data):
        token_value = validated_data.pop('token')
        token = Token.objects.get(token=token_value)
        
        user = SiteUser.create_user(
            nickname=validated_data['nickname'],
            password=validated_data['password'],
            token=token
        )
        
        user._pending_token = token
        return user


class LoginSerializer(serializers.Serializer):
    nickname = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)


class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteUser
        fields = ['avatar']


class TokenListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = [
            'id', 'token', 'active', 'is_vip',
            'created_at', 'used_at', 'used_by'
        ]
        read_only_fields = fields


class VipUrlCreateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = VipUrl
        fields = ['id', 'title', 'url']
