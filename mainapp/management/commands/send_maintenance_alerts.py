from django.core.management.base import BaseCommand
from django.utils import timezone
from mainapp.models import MaintenanceRequest, Notification, UserProfile
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Send alerts for scheduled maintenance requests'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        self.stdout.write(f"Checking for maintenance requests scheduled for: {today}")

        requests = MaintenanceRequest.objects.filter(scheduled_date=today)
        count = 0

        for req in requests:
            # Determine recipients: Assigned Technician or Team members if no tech assigned
            recipients = []
            
            if req.technician:
                recipients.append(req.technician)
            elif req.team:
                # Get all technicians in the team
                team_techs = UserProfile.objects.filter(team=req.team, role='technician')
                for profile in team_techs:
                    recipients.append(profile.user)
            
            # Additional fallback: Admins/Managers? For now, stick to direct assignees/team.

            for user in recipients:
                # Check if notification already exists for this request today
                # This prevents duplicate alerts if command runs multiple times
                exists = Notification.objects.filter(
                    recipient=user, 
                    related_request=req,
                    created_at__date=today
                ).exists()

                if not exists:
                    message = (
                        f"Reminder: Scheduled maintenance '{req.subject}' for equipment "
                        f"'{req.equipment.name}' is due today ({req.scheduled_date})."
                    )
                    
                    Notification.objects.create(
                        recipient=user,
                        message=message,
                        related_request=req
                    )
                    self.stdout.write(f"  - Sent notification to {user.username} for request #{req.id}")
                    count += 1
                else:
                    self.stdout.write(f"  - Notification already sent to {user.username} for request #{req.id}")

        self.stdout.write(self.style.SUCCESS(f'Successfully processed. Sent {count} new notifications.'))
