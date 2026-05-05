from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import EventViewSet, NewsViewSet
from users.views import SiteUserViewSet

app_name = 'api'

api_router = DefaultRouter()
api_router.register('events', EventViewSet, basename='events')
api_router.register('users', SiteUserViewSet, basename='users')
api_router.register('news', NewsViewSet, basename='news')

urlpatterns = [
    path('', include(api_router.urls)),
]