from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, ClientViewSet, CurrentUserView, InteractionViewSet, TaskViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'interactions', InteractionViewSet)
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', CurrentUserView.as_view(), name='current-user'),
]
