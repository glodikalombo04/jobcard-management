from django.db import models
from simple_history.models import HistoricalRecords
from backend_core.models import Region, Technician, Customer


class SupportAgent(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class JobType(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class JobCardCounter(models.Model):
    current_number = models.PositiveIntegerField(default=68746)

    def __str__(self):
        return f"Current JobCard Number: {self.current_number}"


class Accessories(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class JobCard(models.Model):
    region = models.ForeignKey(
        Region, on_delete=models.PROTECT, related_name="jobcards"
    )
    technician = models.ForeignKey(
        Technician, on_delete=models.PROTECT, related_name="jobcards"
    )
    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name="jobcards"
    )
    job_type = models.ForeignKey(
        JobType, on_delete=models.PROTECT, related_name="jobcards"
    )
    support_agent = models.ForeignKey(
        SupportAgent, on_delete=models.PROTECT, related_name="jobcards"
    )

    unique_id = models.CharField(
        max_length=20, unique=True, blank=True
    )  # e.g., 68746AD
    device_imei = models.CharField(max_length=30)
    vehicle_reg = models.CharField(max_length=30)
    accessories = models.ManyToManyField(
        Accessories, blank=True, related_name="jobcards"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    tampering = models.CharField(
        max_length=3,
        choices=[("YES", "Yes"), ("NO", "No")],
        null=True,
        blank=True,
        help_text="Only applicable for inspection job types.",
    )

    def __str__(self):
        return self.unique_id
