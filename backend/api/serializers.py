from rest_framework import serializers
from events.models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'image', 'created_at', 'updated_at']
        read_only_fields = fields  # Все поля только для чтения