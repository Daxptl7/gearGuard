
import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gardgear_backend.settings')
django.setup()

from mainapp.models import MaintenanceRequest

def check_requests():
    target_date = "2025-12-23"
    print(f"Searching for maintenance requests scheduled on: {target_date}")
    
    requests = MaintenanceRequest.objects.filter(scheduled_date=target_date)
    
    if requests.exists():
        print(f"Found {requests.count()} request(s):")
        for req in requests:
            print(f"- [ID: {req.id}] Subject: {req.subject}")
            print(f"  Equipment: {req.equipment.name if req.equipment else 'N/A'}")
            print(f"  Team: {req.team.team_name if req.team else 'N/A'}")
            print(f"  Status: {req.status}")
            print(f"  Created At: {req.created_at}")
    else:
        print("No requests found for this date.")

if __name__ == "__main__":
    check_requests()
