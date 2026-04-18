from rest_framework import serializers
from .models import SiteUser, Token


class SiteUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteUser
        fields = ['id', 'nickname', 'avatar', 'vip_status', 'registered_at']
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
            raise serializers.ValidationError("Токен недействителен или уже использован")
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