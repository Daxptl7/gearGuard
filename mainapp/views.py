from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from .models import MaintenanceTeam, UserProfile, Equipment, MaintenanceRequest
from .serializers import (
    MaintenanceTeamSerializer, UserProfileSerializer, EquipmentSerializer,
    MaintenanceRequestSerializer, NotificationSerializer
)
from .models import MaintenanceTeam, UserProfile, Equipment, MaintenanceRequest, Notification
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for Notification CRUD operations"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']

    def get_queryset(self):
        """Filter notifications by current user"""
        user = self.request.user
        if user.is_authenticated:
            return self.queryset.filter(recipient=user)
        return self.queryset.none()
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})



class MaintenanceTeamViewSet(viewsets.ModelViewSet):
    """ViewSet for MaintenanceTeam CRUD operations"""
    queryset = MaintenanceTeam.objects.all()
    serializer_class = MaintenanceTeamSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['team_name']
    ordering_fields = ['team_name']


class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for UserProfile CRUD operations"""
    queryset = UserProfile.objects.select_related('user', 'team').all()
    serializer_class = UserProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'team']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']
    ordering_fields = ['user__username', 'role']
    
    @action(detail=False, methods=['get'])
    def technicians(self, request):
        """Get all users with technician role"""
        technicians = self.queryset.filter(role='technician')
        team_id = request.query_params.get('team_id')
        if team_id:
            technicians = technicians.filter(team_id=team_id)
        serializer = self.get_serializer(technicians, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_team(self, request):
        """Get users by team ID"""
        team_id = request.query_params.get('team_id')
        if not team_id:
            return Response({'error': 'team_id parameter is required'}, status=400)
        users = self.queryset.filter(team_id=team_id)
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)


class EquipmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Equipment CRUD operations"""
    queryset = Equipment.objects.select_related('maintenance_team').all()
    serializer_class = EquipmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['maintenance_team', 'department', 'is_active']
    search_fields = ['name', 'serial_number', 'owner_name']
    ordering_fields = ['name', 'purchase_date']
    
    @action(detail=False, methods=['get'])
    def by_team(self, request):
        """Get equipment by team ID"""
        team_id = request.query_params.get('team_id')
        if not team_id:
            return Response({'error': 'team_id parameter is required'}, status=400)
        equipment = self.queryset.filter(maintenance_team_id=team_id, is_active=True)
        serializer = self.get_serializer(equipment, many=True)
        return Response(serializer.data)


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for MaintenanceRequest CRUD operations"""
    queryset = MaintenanceRequest.objects.select_related(
        'equipment', 'team', 'technician', 'created_by', 'client'
    ).all()
    serializer_class = MaintenanceRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'request_type', 'team', 'technician']
    search_fields = ['subject', 'equipment__name']
    ordering_fields = ['created_at', 'due_date', 'scheduled_date']
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get maintenance requests grouped by status (for Kanban board)"""
        statuses = dict(MaintenanceRequest.STATUS_CHOICES)
        result = {}
        for status_key, status_label in statuses.items():
            requests = self.queryset.filter(status=status_key)
            serializer = self.get_serializer(requests, many=True)
            result[status_key] = {
                'label': status_label,
                'count': requests.count(),
                'items': serializer.data
            }
        return Response(result)
        return Response(result)

    def perform_create(self, serializer):
        """Set created_by to current user and handle client assignment"""
        client = serializer.validated_data.get('client')
        # If no client specified and user is 'user' role, assume they are the client
        if not client and hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'user':
             client = self.request.user
             
        serializer.save(created_by=self.request.user, client=client)

    def get_queryset(self):
        """
        Filter requests based on user role:
        - Manager: See all
        - Technician: See assigned (and unassigned?)
        - User: See requests where they are the client OR created_by them
        """
        user = self.request.user
        if not user.is_authenticated:
            return self.queryset.none()
            
        # Check role
        if hasattr(user, 'profile'):
            role = user.profile.role
            if role == 'manager':
                return self.queryset
            elif role == 'technician':
                # Techs see requests assigned to them OR their team
                q = models.Q(technician=user)
                if user.profile.team:
                    q |= models.Q(team=user.profile.team)
                return self.queryset.filter(q)
            else:
                 # Users see requests they created OR where they are the client
                 return self.queryset.filter(models.Q(created_by=user) | models.Q(client=user))
        
        return self.queryset.filter(created_by=user)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            login(request, user)
            role = 'user'
            if hasattr(user, 'profile'):
                role = user.profile.role
            
            return Response({
                'id': user.id,
                'username': user.username,
                'full_name': user.get_full_name() or user.username,
                'role': role,
                'team_id': user.profile.team.id if hasattr(user, 'profile') and user.profile.team else None
            })
        return Response({'error': 'Invalid credentials'}, status=400)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'status': 'logged out'})
