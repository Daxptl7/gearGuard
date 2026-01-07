from django.db import models
from django.contrib.auth.models import User


class MaintenanceTeam(models.Model):
    """Model for maintenance teams"""
    team_name = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'maintenance_team'
    
    def __str__(self):
        return self.team_name


class UserProfile(models.Model):
    """Extended user profile with role and team assignment"""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('technician', 'Technician'),
        ('manager', 'Manager'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    team = models.ForeignKey(MaintenanceTeam, on_delete=models.SET_NULL, null=True, blank=True)
    avatar_url = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.get_role_display()})"


class Equipment(models.Model):
    """Model for equipment/gear to be tracked"""
    DEPARTMENT_CHOICES = [
        ('Production', 'Production'),
        ('Quality Control', 'Quality Control'),
        ('R&D', 'R&D'),
        ('Warehouse', 'Warehouse'),
        ('Facilities', 'Facilities'),
        ('IT & Admin', 'IT & Admin'),
    ]

    name = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, unique=True)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, blank=True, null=True)
    owner_name = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    purchase_date = models.DateField(null=True, blank=True)
    warranty_end = models.DateField(null=True, blank=True)
    maintenance_team = models.ForeignKey(
        MaintenanceTeam, 
        on_delete=models.RESTRICT,
        related_name='equipment'
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'equipment'
    
    def __str__(self):
        return f"{self.name} ({self.serial_number})"


class MaintenanceRequest(models.Model):
    """Model for maintenance requests and tasks"""
    REQUEST_TYPE_CHOICES = [
        ('Corrective', 'Corrective'),
        ('Preventive', 'Preventive'),
    ]
    
    STATUS_CHOICES = [
        ('New', 'New'),
        ('In Progress', 'In Progress'),
        ('Repaired', 'Repaired'),
        ('Scrap', 'Scrap'),
    ]
    
    subject = models.CharField(max_length=255)
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES)
    equipment = models.ForeignKey(
        Equipment, 
        on_delete=models.CASCADE,
        related_name='maintenance_requests'
    )
    team = models.ForeignKey(
        MaintenanceTeam,
        on_delete=models.RESTRICT,
        related_name='maintenance_requests'
    )
    technician = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_requests'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_requests',
        null=True
    )
    client = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='client_requests',
        help_text="The client (user) this request is for"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='New')
    scheduled_date = models.DateField(null=True, blank=True)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'maintenance_request'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.subject} - {self.equipment.name}"


class Notification(models.Model):
    """Model for system notifications"""
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_request = models.ForeignKey(
        MaintenanceRequest, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='notifications'
    )

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.message[:50]}..."

