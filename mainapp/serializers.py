from rest_framework import serializers
from django.contrib.auth.models import User
from .models import MaintenanceTeam, UserProfile, Equipment, MaintenanceRequest, Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at', 'related_request']



class MaintenanceTeamSerializer(serializers.ModelSerializer):
    """Serializer for MaintenanceTeam model"""
    class Meta:
        model = MaintenanceTeam
        fields = ['id', 'team_name']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for Django User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model with nested user data"""
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    team_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'user_id', 'role', 'team', 'team_name', 'avatar_url', 'full_name']
    
    def get_team_name(self, obj):
        return obj.team.team_name if obj.team else None
    
    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class EquipmentSerializer(serializers.ModelSerializer):
    """Serializer for Equipment model"""
    maintenance_team_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Equipment
        fields = [
            'id', 'name', 'serial_number', 'department', 'owner_name',
            'location', 'purchase_date', 'warranty_end', 'maintenance_team',
            'maintenance_team_name', 'is_active'
        ]
    
    def get_maintenance_team_name(self, obj):
        return obj.maintenance_team.team_name if obj.maintenance_team else None


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    """Serializer for MaintenanceRequest model"""
    equipment_name = serializers.SerializerMethodField()
    equipment_serial = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()
    technician_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MaintenanceRequest
        fields = [
            'id', 'subject', 'request_type', 'equipment', 'equipment_name',
            'equipment_serial', 'team', 'team_name', 'technician', 'technician_name',
            'status', 'scheduled_date', 'duration_hours', 'due_date', 'created_at',
            'created_by', 'client'
        ]
        read_only_fields = ['created_at', 'created_by']
    
    def get_equipment_name(self, obj):
        return obj.equipment.name if obj.equipment else None
    
    def get_equipment_serial(self, obj):
        return obj.equipment.serial_number if obj.equipment else None
    
    def get_team_name(self, obj):
        return obj.team.team_name if obj.team else None
    
    def get_technician_name(self, obj):
        if obj.technician:
            return obj.technician.get_full_name() or obj.technician.username
        return None
