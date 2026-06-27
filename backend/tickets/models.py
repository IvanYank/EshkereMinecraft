from django.db import models
from django.core.exceptions import ValidationError
from users.models import SiteUser


class TicketStatus(models.TextChoices):
    PROCESSING = 'processing', 'В обработке'
    APPROVED = 'approved', 'Принято'
    REJECTED = 'rejected', 'Отклонено'


class Ticket(models.Model):
    """
    Модель обращения пользователя в поддержку.
    """
    
    author = models.ForeignKey(
        SiteUser,
        on_delete=models.CASCADE,
        related_name='tickets',
        verbose_name="Автор"
    )
    text = models.TextField(
        verbose_name="Текст обращения",
        help_text="Опишите вашу проблему или вопрос"
    )
    status = models.CharField(
        max_length=20,
        choices=TicketStatus.choices,
        default=TicketStatus.PROCESSING,
        verbose_name="Статус"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания"
    )
    
    class Meta:
        verbose_name = "Тикет"
        verbose_name_plural = "Тикеты"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['author', 'status']),
            models.Index(fields=['created_at']),
        ]
        
    
    def __str__(self):
        return f"Тикет #{self.id} от {self.author.nickname}"
    
    def clean(self):
        if not self.text or len(self.text.strip()) < 3:
            raise ValidationError({'text': 'Текст должен содержать минимум 3 символа'})
    
    @classmethod
    def create_ticket(cls, author: SiteUser, text: str) -> 'Ticket':
        """
        Фабричный метод создания тикета.
        """
        ticket = cls(
            author=author,
            text=text.strip(),
            status=TicketStatus.PROCESSING
        )
        ticket.full_clean()
        ticket.save()
        return ticket


class TicketComment(models.Model):
    """Комментарий к тикету"""
    
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Тикет"
    )
    author = models.ForeignKey(
        SiteUser,
        on_delete=models.CASCADE,
        related_name='ticket_comments',
        verbose_name="Автор"
    )
    text = models.TextField(
        verbose_name="Текст комментария",
        help_text="Введите комментарий"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания"
    )
    
    class Meta:
        verbose_name = "Комментарий к тикету"
        verbose_name_plural = "Комментарии к тикетам"
        ordering = ['created_at']
    
    def __str__(self):
        return f"Комментарий #{self.id} к тикету #{self.ticket.id} от {self.author.nickname}"
    
    def clean(self):
        if not self.text or len(self.text.strip()) < 3:
            raise ValidationError({'text': 'Комментарий должен содержать минимум 3 символа'})
    
    @classmethod
    def create_comment(cls, ticket: Ticket, author: SiteUser, text: str) -> 'TicketComment':
        comment = cls(
            ticket=ticket,
            author=author,
            text=text.strip()
        )
        comment.full_clean()
        comment.save()
        return comment