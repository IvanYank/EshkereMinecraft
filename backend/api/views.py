from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from events.models import Event, News
from tickets.models import Ticket, TicketComment, TicketStatus
from users.models import SiteUser
from users.jwt import get_user_from_token
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
    permission_classes = [AllowAny]

    def _get_user_from_request(self, request):
        """Извлекает пользователя из Bearer-токена в заголовке."""
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            return None, Response(
                {'error': 'Token required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        user = get_user_from_token(header[7:])
        if not user:
            return None, Response(
                {'error': 'Invalid token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return user, None

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'id'):
            return Ticket.objects.filter(author=user)
        return Ticket.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return TicketCreateSerializer
        elif self.action == 'list':
            return TicketListSerializer
        elif self.action == 'retrieve':
            return TicketDetailWithCommentsSerializer  # <-- ИСПРАВИТЬ
        return TicketDetailSerializer

    def list(self, request, *args, **kwargs):
        user, error_response = self._get_user_from_request(request)
        if error_response:
            return error_response
        
        queryset = Ticket.objects.filter(author=user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        user, error_response = self._get_user_from_request(request)
        if error_response:
            return error_response

        serializer = self.get_serializer(
            data=request.data,
            context={'request': request, 'user': user}
        )
        serializer.is_valid(raise_exception=True)
        
        ticket = Ticket.create_ticket(author=user, text=serializer.validated_data['text'])
        detail_serializer = TicketDetailSerializer(ticket)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None, *args, **kwargs):
        user, error_response = self._get_user_from_request(request)
        if error_response:
            return error_response

        try:
            ticket = Ticket.objects.get(id=pk, author=user)
        except Ticket.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(ticket)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        user, error_response = self._get_user_from_request(request)
        if error_response:
            return error_response

        try:
            ticket = Ticket.objects.get(id=pk, author=user)
        except Ticket.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if ticket.status in [TicketStatus.APPROVED, TicketStatus.REJECTED]:
            return Response(
                {'error': 'Нельзя комментировать тикет со статусом "Принято" или "Отклонено"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TicketCommentCreateSerializer(
            data=request.data,
            context={'request': request, 'ticket': ticket}
        )
        serializer.is_valid(raise_exception=True)
        comment = TicketComment.create_comment(
            ticket=ticket,
            author=user,
            text=serializer.validated_data['text']
        )

        comment_serializer = TicketCommentSerializer(comment)
        return Response(comment_serializer.data, status=status.HTTP_201_CREATED)