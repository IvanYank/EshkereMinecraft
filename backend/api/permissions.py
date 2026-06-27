from rest_framework import permissions


class IsTicketAuthor(permissions.BasePermission):
    """
    Разрешение: пользователь может изменять только свои тикеты.
    """
    
    def has_object_permission(self, request, view, obj):
        # Только автор может изменять тикет
        return obj.author == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Разрешение: админ может всё, остальные только читают.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff