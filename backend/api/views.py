from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from events.models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet только для чтения (GET запросы).
    Доступен list (список всех событий) и retrieve (одно событие по id).
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]