from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from .models import Ticket, TicketStatus, TicketComment


class TicketCommentInline(admin.TabularInline):
    """Комментарии внутри тикета"""
    model = TicketComment
    extra = 1
    fields = ['author', 'text', 'created_at']
    readonly_fields = ['created_at']


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'status', 'created_at', 'text_preview', 'comments_count']
    list_filter = ['status', 'created_at']
    search_fields = ['author__nickname', 'text']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    inlines = [TicketCommentInline]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('author', 'text', 'created_at')
        }),
        ('Статус', {
            'fields': ('status',),
            'classes': ('wide',)
        }),
    )
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Текст (предпросмотр)'
    
    def comments_count(self, obj):
        return obj.comments.count()
    comments_count.short_description = 'Комментариев'
    
    actions = ['mark_as_approved', 'mark_as_rejected']
    
    def mark_as_approved(self, request, queryset):
        updated = queryset.update(status=TicketStatus.APPROVED)
        self.message_user(request, f'Отмечено как "Принято": {updated} тикетов')
    mark_as_approved.short_description = 'Отметить как "Принято"'
    
    def mark_as_rejected(self, request, queryset):
        updated = queryset.update(status=TicketStatus.REJECTED)
        self.message_user(request, f'Отмечено как "Отклонено": {updated} тикетов')
    mark_as_rejected.short_description = 'Отметить как "Отклонено"'


@admin.register(TicketComment)
class TicketCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'ticket_link', 'author', 'text_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['ticket__id', 'author__nickname', 'text']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    def ticket_link(self, obj):
        url = reverse('admin:tickets_ticket_change', args=[obj.ticket.id])
        return format_html('<a href="{}">Тикет #{}</a>', url, obj.ticket.id)
    ticket_link.short_description = 'Тикет'
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Текст'