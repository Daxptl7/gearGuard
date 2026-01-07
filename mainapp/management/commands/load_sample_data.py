from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from mainapp.models import MaintenanceTeam, UserProfile, Equipment, MaintenanceRequest
from datetime import date


class Command(BaseCommand):
    help = 'Load the sample data from the SQL script (IT Support, Amit Sharma, etc.)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before loading sample data'
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            MaintenanceRequest.objects.all().delete()
            Equipment.objects.all().delete()
            UserProfile.objects.all().delete()
            User.objects.exclude(is_superuser=True).delete()
            MaintenanceTeam.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✓ Cleared existing data'))

        # Check if sample data already exists
        if MaintenanceTeam.objects.filter(team_name='IT Support').exists():
            self.stdout.write(self.style.WARNING('Sample data already exists. Use --clear to reload.'))
            return

        self.stdout.write('Loading sample data from SQL script...')

        # 1. Create Teams
        self.stdout.write('Creating teams...')
        team_it = MaintenanceTeam.objects.create(team_name='IT Support')
        team_mechanical = MaintenanceTeam.objects.create(team_name='Mechanical')
        team_electrical = MaintenanceTeam.objects.create(team_name='Electrical')
        self.stdout.write(self.style.SUCCESS('✓ Created 3 teams'))

        # 2. Create Users
        self.stdout.write('Creating users...')
        
        # Manager - Amit Sharma
        user_amit = User.objects.create_user(
            username='amit.sharma',
            first_name='Amit',
            last_name='Sharma',
            email='amit.sharma@example.com',
            password='password123'
        )
        UserProfile.objects.create(user=user_amit, role='manager', team=team_it)

        # Technician - Rahul Verma
        user_rahul = User.objects.create_user(
            username='rahul.verma',
            first_name='Rahul',
            last_name='Verma',
            email='rahul.verma@example.com',
            password='password123'
        )
        UserProfile.objects.create(user=user_rahul, role='technician', team=team_it)

        # Technician - Suresh Patel
        user_suresh = User.objects.create_user(
            username='suresh.patel',
            first_name='Suresh',
            last_name='Patel',
            email='suresh.patel@example.com',
            password='password123'
        )
        UserProfile.objects.create(user=user_suresh, role='technician', team=team_mechanical)

        # Technician - Neha Singh
        user_neha = User.objects.create_user(
            username='neha.singh',
            first_name='Neha',
            last_name='Singh',
            email='neha.singh@example.com',
            password='password123'
        )
        UserProfile.objects.create(user=user_neha, role='technician', team=team_electrical)

        # General User
        user_general = User.objects.create_user(
            username='general.user',
            first_name='General',
            last_name='User',
            email='general.user@example.com',
            password='password123'
        )
        UserProfile.objects.create(user=user_general, role='user', team=None)

        self.stdout.write(self.style.SUCCESS('✓ Created 5 users'))

        # 3. Create Equipment
        self.stdout.write('Creating equipment...')
        
        equipment_printer = Equipment.objects.create(
            name='Office Printer',
            serial_number='PRN-001',
            department='IT & Admin',
            owner_name='Amit Sharma',
            location='Floor 1',
            purchase_date=date(2023, 1, 10),
            warranty_end=date(2026, 1, 10),
            maintenance_team=team_it
        )

        equipment_cnc = Equipment.objects.create(
            name='CNC Machine',
            serial_number='CNC-045',
            department='Production',
            owner_name='Factory Head',
            location='Plant A',
            purchase_date=date(2022, 6, 15),
            warranty_end=date(2027, 6, 15),
            maintenance_team=team_mechanical
        )

        equipment_server = Equipment.objects.create(
            name='Server Rack',
            serial_number='SRV-010',
            department='IT & Admin',
            owner_name='IT Dept',
            location='Server Room',
            purchase_date=date(2021, 11, 20),
            warranty_end=date(2026, 11, 20),
            maintenance_team=team_it
        )
        
        # Additional equipment to cover all departments
        Equipment.objects.create(
            name='Microscope',
            serial_number='QC-MIC-001',
            department='Quality Control',
            owner_name='QC Manager',
            location='Lab 1',
            purchase_date=date(2023, 3, 10),
            warranty_end=date(2028, 3, 10),
            maintenance_team=team_electrical
        )

        Equipment.objects.create(
            name='Test Chamber',
            serial_number='RND-CHM-002',
            department='R&D',
            owner_name='Dr. Smith',
            location='Innovation Lab',
            purchase_date=date(2023, 5, 20),
            warranty_end=date(2026, 5, 20),
            maintenance_team=team_mechanical
        )

        Equipment.objects.create(
            name='Forklift',
            serial_number='WH-FL-003',
            department='Warehouse',
            owner_name='Warehouse Mgr',
            location='Dock A',
            purchase_date=date(2022, 1, 15),
            warranty_end=date(2027, 1, 15),
            maintenance_team=team_mechanical
        )

        Equipment.objects.create(
            name='HVAC Unit 1',
            serial_number='FAC-HVAC-004',
            department='Facilities',
            owner_name='Facility Mgr',
            location='Roof',
            purchase_date=date(2021, 6, 1),
            warranty_end=date(2031, 6, 1),
            maintenance_team=team_electrical
        )

        self.stdout.write(self.style.SUCCESS('✓ Created 7 equipment items covering all 6 departments'))

        # 4. Create Maintenance Request
        self.stdout.write('Creating maintenance requests...')
        
        request = MaintenanceRequest.objects.create(
            subject='Printer not working',
            request_type='Corrective',
            equipment=equipment_printer,
            team=team_it,
            technician=user_rahul,  # Assigned to Rahul Verma (user_id 2 in SQL)
            status='New',
            due_date=date(2025, 1, 10)
        )

        self.stdout.write(self.style.SUCCESS('✓ Created 1 maintenance request'))

        self.stdout.write(self.style.SUCCESS('\n✓ Sample data loaded successfully!'))
        self.stdout.write('\nSummary:')
        self.stdout.write(f'  Teams: IT Support, Mechanical, Electrical')
        self.stdout.write(f'  Users: Amit Sharma (manager), Rahul Verma (tech), Suresh Patel (tech), Neha Singh (tech), General User')
        self.stdout.write(f'  Equipment: Office Printer, CNC Machine, Server Rack')
        self.stdout.write(f'  Requests: Printer not working [assigned to Rahul Verma]')
