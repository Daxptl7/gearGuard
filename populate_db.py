
import os
import django
import random
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gardgear_backend.settings')
django.setup()

from django.contrib.auth.models import User
from mainapp.models import MaintenanceTeam, UserProfile, Equipment

try:
    from faker import Faker
    fake = Faker()
except ImportError:
    print("Faker not installed. Using static data.")
    fake = None

def create_teams():
    teams_data = [
        "Electrical", "Mechanical", "Plumbing", "HVAC", "General Maintenance"
    ]
    teams = []
    print("Creating Teams...")
    for name in teams_data:
        team, created = MaintenanceTeam.objects.get_or_create(team_name=name)
        if created:
            print(f"  Created team: {name}")
        teams.append(team)
    return teams

def create_technicians(teams):
    print("Creating Technicians...")
    created_count = 0
    # Ensure we have at least these users
    users_data = [
        {"username": "tech_elec", "first_name": "John", "last_name": "Spark", "team": "Electrical"},
        {"username": "tech_mech", "first_name": "Mike", "last_name": "Gear", "team": "Mechanical"},
        {"username": "tech_hvac", "first_name": "Sarah", "last_name": "Cool", "team": "HVAC"},
    ]

    for u_data in users_data:
        if not User.objects.filter(username=u_data["username"]).exists():
            user = User.objects.create_user(
                username=u_data["username"],
                email=f"{u_data['username']}@example.com",
                password="password123",
                first_name=u_data["first_name"],
                last_name=u_data["last_name"]
            )
            
            # Find team
            team = next((t for t in teams if t.team_name == u_data["team"]), None)
            
            UserProfile.objects.create(
                user=user,
                role='technician',
                team=team
            )
            print(f"  Created technician: {u_data['username']}")
            created_count += 1
            
    # Add some random ones if Faker exists
    if fake:
        for _ in range(5):
            username = fake.user_name()
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=fake.email(),
                    password="password123",
                    first_name=fake.first_name(),
                    last_name=fake.last_name()
                )
                team = random.choice(teams)
                UserProfile.objects.create(
                    user=user,
                    role='technician',
                    team=team
                )
                print(f"  Created random technician: {username}")
                created_count += 1
                
    return created_count

def create_equipment(teams):
    print("Creating Equipment...")
    equipment_types = [
        ("Generator A1", "Electrical"),
        ("Conveyor Belt", "Mechanical"),
        ("AC Unit 5", "HVAC"),
        ("Lathe Machine", "Mechanical"),
        ("Main Switchboard", "Electrical")
    ]
    
    for name, team_name in equipment_types:
        if not Equipment.objects.filter(name=name).exists():
            team = next((t for t in teams if t.team_name == team_name), None)
            start_date = datetime.now().date() - timedelta(days=random.randint(100, 1000))
            
            Equipment.objects.create(
                name=name,
                serial_number=f"SN-{random.randint(10000, 99999)}",
                location=f"Building {random.choice(['A', 'B', 'C'])}",
                maintenance_team=team,
                purchase_date=start_date,
                warranty_end=start_date + timedelta(days=365*2),
                department="Production",
                is_active=True
            )
            print(f"  Created equipment: {name}")

def main():
    print("Starting data population...")
    teams = create_teams()
    create_technicians(teams)
    create_equipment(teams)
    print("Data population complete!")

if __name__ == "__main__":
    main()
