
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gardgear_backend.settings')
django.setup()

from django.contrib.auth.models import User
from mainapp.models import UserProfile, MaintenanceTeam

def create_user(username, password, role, first_name, last_name, team_name=None):
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_user(
            username=username,
            email=f"{username}@example.com",
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        team = None
        if team_name:
            team = MaintenanceTeam.objects.filter(team_name=team_name).first()

        UserProfile.objects.create(
            user=user,
            role=role,
            team=team
        )
        print(f"Created user: {username} ({role})")
    else:
        print(f"User {username} already exists.")

def main():
    print("Creating test users...")
    
    # Create Manager
    create_user("manager", "password123", "manager", "Admin", "User")
    
    # Create Client
    create_user("client", "password123", "user", "Client", "User")

    # Create Technician (if not exists)
    create_user("tech", "password123", "technician", "Tech", "User", "General Maintenance")
    
    print("Done! Password for all is 'password123'")

if __name__ == "__main__":
    main()
