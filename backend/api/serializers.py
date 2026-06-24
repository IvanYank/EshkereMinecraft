from rest_framework import serializers
from django.conf import settings
from django.utils import timezone
from events.models import Event, News
from tickets.models import Ticket, TicketStatus, TicketComment


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'image', 'created_at', 'updated_at']
        read_only_fields = fields


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ['id', 'title', 'text', 'image', 'created_at']
        read_only_fields = fields


class TicketListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка тикетов"""
    
    author_nickname = serializers.CharField(
        source='author.nickname',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    
    class Meta:
        model = Ticket
        fields = [
            'id', 
            'author_nickname', 
            'text', 
            'status', 
            'status_display',
            'created_at'
        ]
        read_only_fields = fields


class TicketDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для детального просмотра тикета"""
    
    author_nickname = serializers.CharField(
        source='author.nickname',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    
    class Meta:
        model = Ticket
        fields = [
            'id',
            'author_nickname',
            'text',
            'status',
            'status_display',
            'created_at'
        ]
        read_only_fields = fields


class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['text']
    
    def validate_text(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Текст должен содержать минимум 3 символа")
        return value.strip()
    
    def validate(self, data):
        """Простая проверка - 1 тикет в день"""
        user = self.context['request'].user
        today = timezone.now().date()
        
        tickets_today = Ticket.objects.filter(
            author=user,
            created_at__date=today
        ).count()
        
        # Проверяем лимит из настроек
        limit = getattr(settings, 'TICKETS_PER_DAY_LIMIT', 1)
        
        if tickets_today >= limit:
            raise serializers.ValidationError(
                f"Вы уже создали {limit} тикет{'а' if limit == 1 else 'ов'} сегодня. Попробуйте завтра."
            )
        
        return data
    
    def create(self, validated_data):
        user = self.context['request'].user
        return Ticket.create_ticket(
            author=user,
            text=validated_data['text']
        )


class TicketCommentSerializer(serializers.ModelSerializer):
    """Сериализатор для комментариев"""
    
    author_nickname = serializers.CharField(
        source='author.nickname',
        read_only=True
    )
    
    class Meta:
        model = TicketComment
        fields = ['id', 'author', 'author_nickname', 'text', 'created_at']
        read_only_fields = ['id', 'author', 'author_nickname', 'created_at']


class TicketCommentCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания комментария"""
    
    class Meta:
        model = TicketComment
        fields = ['text']
    
    def validate_text(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Комментарий должен содержать минимум 3 символа")
        return value.strip()
    
    def create(self, validated_data):
        request = self.context.get('request')
        ticket = self.context.get('ticket')
        
        return TicketComment.create_comment(
            ticket=ticket,
            author=request.user,
            text=validated_data['text']
        )


class TicketDetailWithCommentsSerializer(TicketDetailSerializer):
    """Детальный сериализатор с комментариями"""
    
    comments = TicketCommentSerializer(many=True, read_only=True)
    
    class Meta(TicketDetailSerializer.Meta):
        fields = TicketDetailSerializer.Meta.fields + ['comments']
