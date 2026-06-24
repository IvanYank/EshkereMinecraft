from django.contrib import admin
from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    """
    Админка для управления тикетами.
    Только здесь можно изменять статус тикета.
    """
    
    list_display = ['id', 'author', 'status', 'created_at', 'text_preview']
    list_filter = ['status', 'created_at']
    search_fields = ['author__nickname', 'text']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
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
    
    actions = ['mark_as_approved', 'mark_as_rejected']
    
    def mark_as_approved(self, request, queryset):
        updated = queryset.update(status=Ticket.Status.APPROVED)
        self.message_user(request, f'Отмечено как "Принято": {updated} тикетов')
    mark_as_approved.short_description = 'Отметить как "Принято"'
    
    def mark_as_rejected(self, request, queryset):
        updated = queryset.update(status=Ticket.Status.REJECTED)
        self.message_user(request, f'Отмечено как "Отклонено": {updated} тикетов')
    mark_as_rejected.short_description = 'Отметить как "Отклонено"'