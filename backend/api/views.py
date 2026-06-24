from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from events.models import Event, News
from tickets.models import Ticket
from .serializers import (
    EventSerializer, 
    NewsSerializer, 
    TicketListSerializer,
    TicketDetailSerializer,
    TicketCreateSerializer
)


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


class TicketViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    """
    ViewSet для работы с тикетами.
    Доступные действия:
    - POST /api/tickets/ - создание тикета
    - GET /api/tickets/ - список тикетов пользователя
    - GET /api/tickets/{id}/ - детали тикета (только свой)
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Возвращает только тикеты текущего пользователя.
        """
        return Ticket.objects.filter(author=self.request.user)
    
    def get_serializer_class(self):
        """
        Выбор сериализатора в зависимости от действия.
        """
        if self.action == 'create':
            return TicketCreateSerializer
        elif self.action == 'list':
            return TicketListSerializer
        return TicketDetailSerializer
    
    def list(self, request, *args, **kwargs):
        """
        GET /api/tickets/
        Получение списка тикетов текущего пользователя.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """
        POST /api/tickets/
        Создание нового тикета.
        """
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()
        
        # Возвращаем детальную информацию о созданном тикете
        detail_serializer = TicketDetailSerializer(ticket)
        return Response(
            detail_serializer.data,
            status=status.HTTP_201_CREATED
        )
    
    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        GET /api/tickets/{id}/
        Получение конкретного тикета (только если он принадлежит пользователю).
        """
        ticket = self.get_object()  # Автоматическая проверка через get_queryset
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)
