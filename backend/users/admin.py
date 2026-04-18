from django.contrib import admin
from django import forms
from django.shortcuts import render, redirect
from django.urls import path
from django.contrib import messages
from django.http import HttpResponse
from .models import SiteUser, Token


class GenerateTokensForm(forms.Form):
    count = forms.IntegerField(min_value=1, max_value=1000, initial=10, label="Количество токенов")
    owner = forms.ModelChoiceField(
        queryset=SiteUser.objects.filter(vip_status=True),
        required=False,
        label="Владелец (VIP)",
        help_text="Оставьте пустым, если токен без владельца"
    )


@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    list_display = ['token', 'active', 'owner', 'created_at', 'used_at', 'used_by']
    list_filter = ['active', 'created_at', 'owner']
    search_fields = ['token', 'owner__nickname']
    readonly_fields = ['created_at', 'used_at', 'used_by']
    autocomplete_fields = ['owner']
    
    actions = ['deactivate_tokens', 'export_active_tokens']
    
    def has_add_permission(self, request):
        return False
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('generate/', self.admin_site.admin_view(self.generate_tokens_view), name='generate_tokens'),
            path('generate/done/', self.admin_site.admin_view(self.generate_tokens_done_view), name='generate_tokens_done'),
        ]
        return custom_urls + urls
    
    def generate_tokens_view(self, request):
        if request.method == 'POST':
            form = GenerateTokensForm(request.POST)
            if form.is_valid():
                count = form.cleaned_data['count']
                owner = form.cleaned_data['owner']
                
                tokens = [Token.objects.create_token(owner=owner) for _ in range(count)]
                token_list = [t.token for t in tokens]
                
                request.session['generated_tokens'] = token_list
                request.session['tokens_count'] = count
                request.session['tokens_owner'] = owner.nickname if owner else None
                
                messages.success(request, f"Сгенерировано {count} токенов")
                return redirect('admin:generate_tokens_done')
        else:
            form = GenerateTokensForm()
        
        context = {
            'title': 'Генерация токенов',
            'form': form,
            'opts': self.model._meta,
        }
        return render(request, 'admin/users/token/generate_tokens.html', context)
    
    def generate_tokens_done_view(self, request):
        tokens = request.session.pop('generated_tokens', [])
        count = request.session.pop('tokens_count', 0)
        owner = request.session.pop('tokens_owner', None)
        
        context = {
            'title': 'Сгенерированные токены',
            'tokens': tokens,
            'count': count,
            'owner': owner,
            'opts': self.model._meta,
        }
        return render(request, 'admin/users/token/generate_tokens_done.html', context)
    
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_generate_button'] = True
        return super().changelist_view(request, extra_context)
    
    @admin.action(description="Деактивировать выбранные токены")
    def deactivate_tokens(self, request, queryset):
        count = queryset.update(active=False)
        self.message_user(request, f"Деактивировано {count} токенов")
    
    @admin.action(description="Экспортировать активные токены")
    def export_active_tokens(self, request, queryset):
        active_tokens = queryset.filter(active=True)
        
        if not active_tokens.exists():
            self.message_user(request, "Нет активных токенов для экспорта", level='warning')
            return
        
        content = '\n'.join(token.token for token in active_tokens)
        
        response = HttpResponse(content, content_type='text/plain; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="active_tokens.txt"'
        
        return response


@admin.register(SiteUser)
class SiteUserAdmin(admin.ModelAdmin):
    list_display = ['nickname', 'vip_status', 'registered_at', 'registered_with_token']
    list_filter = ['vip_status', 'registered_at']
    search_fields = ['nickname']
    readonly_fields = ['registered_at', 'registered_with_token', 'password']
    
    fieldsets = (
        (None, {'fields': ('nickname', 'password')}),
        ('Информация', {'fields': ('avatar', 'vip_status', 'registered_at')}),
        ('Токен', {'fields': ('registered_with_token',)}),
    )
    
    ordering = ['-registered_at']
    
    def has_add_permission(self, request):
        return False