from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from events.models import Event, News
from .serializers import EventSerializer, NewsSerializer


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet только для чтения (GET запросы).
    Доступен list (список всех событий) и retrieve (одно событие по id).
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]


class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = News.objects.all().order_by('-created_at')
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]