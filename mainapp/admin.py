from django.contrib import admin
from .models import MaintenanceTeam, UserProfile, Equipment, MaintenanceRequest


@admin.register(MaintenanceTeam)
class MaintenanceTeamAdmin(admin.ModelAdmin):
    list_display = ['id', 'team_name']
    search_fields = ['team_name']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'role', 'team']
    list_filter = ['role', 'team']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']
    raw_id_fields = ['user']


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'serial_number', 'department', 'owner_name', 'maintenance_team', 'is_active']
    list_filter = ['is_active', 'maintenance_team', 'department']
    search_fields = ['name', 'serial_number', 'owner_name']
    date_hierarchy = 'purchase_date'


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'subject', 'request_type', 'equipment', 'team', 'technician', 'status', 'due_date']
    list_filter = ['status', 'request_type', 'team']
    search_fields = ['subject', 'equipment__name']
    date_hierarchy = 'created_at'
    raw_id_fields = ['equipment', 'technician']
