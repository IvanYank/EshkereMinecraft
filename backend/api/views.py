from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from events.models import Event, News
from tickets.models import Ticket, TicketComment
from .serializers import (
    EventSerializer,
    NewsSerializer,
    TicketListSerializer,
    TicketDetailSerializer,
    TicketDetailWithCommentsSerializer,
    TicketCreateSerializer,
    TicketCommentSerializer,
    TicketCommentCreateSerializer
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
        try:
            return Ticket.objects.filter(author=self.request.user)
        except TypeError:
            return Ticket.objects.none()
    
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

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        """
        POST /api/tickets/{id}/comment/
        Добавить комментарий к тикету.
        Только автор тикета может комментировать.
        """
        ticket = self.get_object()
        
        # Проверка: только автор может комментировать
        if ticket.author != request.user:
            return Response(
                {'error': 'Вы не можете комментировать этот тикет'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if ticket.status in [TicketStatus.APPROVED, TicketStatus.REJECTED]:
            return Response(
                {'error': 'Нельзя комментировать тикет со статусом "Принято" или "Отклонено"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = TicketCommentCreateSerializer(
            data=request.data,
            context={
                'request': request,
                'ticket': ticket
            }
        )
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        
        # Возвращаем комментарий с данными автора
        comment_serializer = TicketCommentSerializer(comment)
        return Response(
            comment_serializer.data,
            status=status.HTTP_201_CREATED
        )