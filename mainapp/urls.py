from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'teams', views.MaintenanceTeamViewSet, basename='team')
router.register(r'users', views.UserProfileViewSet, basename='user')
router.register(r'equipment', views.EquipmentViewSet, basename='equipment')
router.register(r'maintenance-requests', views.MaintenanceRequestViewSet, basename='maintenance-request')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]
