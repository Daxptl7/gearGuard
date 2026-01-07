from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from mainapp.models import MaintenanceTeam, UserProfile, Equipment, MaintenanceRequest
from faker import Faker
import random
from datetime import timedelta
from decimal import Decimal

fake = Faker()


class Command(BaseCommand):
    help = 'Generate random test data for GearGuard application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--teams',
            type=int,
            default=5,
            help='Number of maintenance teams to create'
        )
        parser.add_argument(
            '--users',
            type=int,
            default=20,
            help='Number of users to create'
        )
        parser.add_argument(
            '--equipment',
            type=int,
            default=50,
            help='Number of equipment items to create'
        )
        parser.add_argument(
            '--requests',
            type=int,
            default=100,
            help='Number of maintenance requests to create'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before generating new data'
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

        # Generate Maintenance Teams
        self.stdout.write('Generating maintenance teams...')
        teams = self.generate_teams(options['teams'])
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(teams)} teams'))

        # Generate Users
        self.stdout.write('Generating users...')
        users = self.generate_users(options['users'], teams)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(users)} users'))

        # Generate Equipment
        self.stdout.write('Generating equipment...')
        equipment_list = self.generate_equipment(options['equipment'], teams)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(equipment_list)} equipment items'))

        # Generate Maintenance Requests
        self.stdout.write('Generating maintenance requests...')
        requests = self.generate_requests(options['requests'], equipment_list, teams, users)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(requests)} maintenance requests'))

        self.stdout.write(self.style.SUCCESS('\n✓ Data generation complete!'))

    def generate_teams(self, count):
        """Generate maintenance teams"""
        team_types = [
            'Electrical', 'Mechanical', 'HVAC', 'Plumbing', 'IT Support',
            'Facility Maintenance', 'Equipment Repair', 'Preventive Maintenance'
        ]
        
        teams = []
        for i in range(count):
            if i < len(team_types):
                team_name = f"{team_types[i]} Team"
            else:
                team_name = f"{fake.catch_phrase()} Team"
            
            team = MaintenanceTeam.objects.create(team_name=team_name)
            teams.append(team)
        
        return teams

    def generate_users(self, count, teams):
        """Generate users with roles distributed as 60% user, 30% technician, 10% manager"""
        users = []
        roles = ['user'] * 12 + ['technician'] * 6 + ['manager'] * 2  # Distribution pattern
        
        for i in range(count):
            # Create Django User
            username = fake.user_name() + str(random.randint(100, 999))
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = f"{username}@{fake.domain_name()}"
            
            user = User.objects.create_user(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                password='password123'  # Default password for testing
            )
            
            # Create UserProfile
            role = roles[i % len(roles)]
            team = random.choice(teams) if teams else None
            avatar_url = fake.image_url() if random.random() > 0.5 else None
            
            profile = UserProfile.objects.create(
                user=user,
                role=role,
                team=team,
                avatar_url=avatar_url
            )
            
            users.append(user)
        
        return users

    def generate_equipment(self, count, teams):
        """Generate equipment items"""
        equipment_list = []
        departments = [
            'Engineering', 'Manufacturing', 'Quality Control', 'Research & Development',
            'Production', 'Warehouse', 'Shipping', 'Maintenance', 'IT & Admin', 'Facilities'
        ]
        
        # More realistic equipment data with models
        equipment_catalog = [
            {'name': 'CNC Vertical Center', 'prefix': 'CNC-VC'},
            {'name': 'Industrial Robot Arm', 'prefix': 'ROB-AR'},
            {'name': 'Heavy Duty Conveyor', 'prefix': 'CON-HD'},
            {'name': 'Electric Forklift', 'prefix': 'FL-EL'},
            {'name': 'Rotary Screw Compressor', 'prefix': 'CMP-RS'},
            {'name': 'Diesel Generator 500kVA', 'prefix': 'GEN-DS'},
            {'name': 'Hydraulic Press 100T', 'prefix': 'PRS-HY'},
            {'name': 'MIG Welding Station', 'prefix': 'WLD-MG'},
            {'name': 'Precision Lathe', 'prefix': 'LTH-PR'},
            {'name': '5-Axis Milling Machine', 'prefix': 'MLL-5A'},
            {'name': 'CNC Press Brake', 'prefix': 'BRK-CN'},
            {'name': 'Surface Grinder', 'prefix': 'GRD-SF'},
            {'name': 'Radial Drill Press', 'prefix': 'DRL-RD'},
            {'name': 'Industrial 3D Printer', 'prefix': 'PRT-3D'},
            {'name': 'Fiber Laser Cutter', 'prefix': 'LSR-FB'},
            {'name': 'Injection Molder 200T', 'prefix': 'INJ-20'},
            {'name': 'Vacuum Furnace', 'prefix': 'FUR-VC'},
            {'name': 'Powder Coating Booth', 'prefix': 'BTH-PC'},
            {'name': 'Overhead Crane 10T', 'prefix': 'CRN-Ov'},
            {'name': 'Auto-Palletizer', 'prefix': 'PLT-AU'}
        ]
        
        for i in range(count):
            item = random.choice(equipment_catalog)
            name = item['name']
            
            # Generate a consistent serial number format
            serial_number = f"{item['prefix']}-{fake.bothify(text='####-???').upper()}"
            
            department = random.choice(departments)
            owner_name = fake.name()
            location = f"Building {random.choice(['A', 'B', 'C'])}, Floor {random.randint(1, 3)}, Area {random.choice(['North', 'South', 'East', 'West'])}"
            
            # Random dates
            purchase_date = fake.date_between(start_date='-5y', end_date='today')
            warranty_end = fake.date_between(start_date=purchase_date, end_date='+3y')
            
            team = random.choice(teams) if teams else None
            is_active = random.random() > 0.05  # 95% active
            
            equipment = Equipment.objects.create(
                name=name,
                serial_number=serial_number,
                department=department,
                owner_name=owner_name,
                location=location,
                purchase_date=purchase_date,
                warranty_end=warranty_end,
                maintenance_team=team,
                is_active=is_active
            )
            
            equipment_list.append(equipment)
        
        return equipment_list

    def generate_requests(self, count, equipment_list, teams, users):
        """Generate maintenance requests"""
        if not equipment_list or not teams:
            self.stdout.write(self.style.WARNING('Cannot generate requests without equipment and teams'))
            return []
        
        requests = []
        request_types = ['Corrective', 'Preventive']
        statuses = ['New', 'In Progress', 'Repaired', 'Scrap']
        status_weights = [40, 30, 20, 10]  # Distribution percentages
        
        # Get technicians
        technician_profiles = UserProfile.objects.filter(role='technician')
        technician_users = [profile.user for profile in technician_profiles] if technician_profiles.exists() else users[:5]
        
        for i in range(count):
            equipment = random.choice(equipment_list)
            team = equipment.maintenance_team
            
            # Subject based on request type
            request_type = random.choices(request_types, weights=[70, 30])[0]
            
            if request_type == 'Corrective':
                subjects = [
                    f'Repair required for {equipment.name}',
                    f'{equipment.name} malfunction',
                    f'Emergency repair - {equipment.name}',
                    f'{equipment.name} not functioning properly',
                    f'Breakdown: {equipment.name}'
                ]
            else:
                subjects = [
                    f'Scheduled maintenance for {equipment.name}',
                    f'Preventive service - {equipment.name}',
                    f'Routine inspection: {equipment.name}',
                    f'{equipment.name} quarterly maintenance',
                    f'Annual service for {equipment.name}'
                ]
            
            subject = random.choice(subjects)
            status = random.choices(statuses, weights=status_weights)[0]
            
            # Assign technician (70% chance)
            technician = random.choice(technician_users) if random.random() > 0.3 and technician_users else None
            
            # Dates
            scheduled_date = fake.date_between(start_date='-30d', end_date='+60d')
            due_date = scheduled_date + timedelta(days=random.randint(1, 14))
            duration_hours = Decimal(random.uniform(1.0, 24.0)).quantize(Decimal('0.01'))
            
            request = MaintenanceRequest.objects.create(
                subject=subject,
                request_type=request_type,
                equipment=equipment,
                team=team,
                technician=technician,
                status=status,
                scheduled_date=scheduled_date,
                duration_hours=duration_hours,
                due_date=due_date
            )
            
            requests.append(request)
        
        return requests
