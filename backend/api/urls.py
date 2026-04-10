from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import EventViewSet

app_name = 'api'

api_router = DefaultRouter()

api_router.register('events', EventViewSet, basename='events')

urlpatterns = [
    path('', include(api_router.urls)),
]