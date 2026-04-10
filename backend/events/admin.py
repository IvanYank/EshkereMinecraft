from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_at']  # Поля для отображения в списке
    search_fields = ['title']               # Поиск по названию
    list_filter = ['created_at']            # Фильтр по дате