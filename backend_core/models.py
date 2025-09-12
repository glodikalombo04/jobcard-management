from django.db import models
from simple_history.models import HistoricalRecords
from django.contrib.auth.models import User


class Region(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Technician(models.Model):
    name = models.CharField(max_length=100)
    initials = models.CharField(max_length=10)
    region = models.ForeignKey(
        Region, on_delete=models.PROTECT, related_name="technicians"
    )

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.name} ({self.initials})"


class Customer(models.Model):
    name = models.CharField(max_length=100)
    region = models.ForeignKey(
        Region, on_delete=models.PROTECT, related_name="customers"
    )

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="userprofile"
    )
    role = models.CharField(
        max_length=50,
        choices=[
            ("super_admin", "Super Admin"),  # Jordan only
            ("admin", "Admin"),  # Full access
            ("regional_manager", "Regional Manager"),  # Region-limited view
        ],
    )
    region = models.ForeignKey(
        "Region", on_delete=models.CASCADE, null=True, blank=True
    )

    # warehouse = models.ForeignKey(
    #   "inventory_management.StockLocation",
    #  on_delete=models.CASCADE,
    # null=True,
    # blank=True,
    # )

    def __str__(self):
        return f"{self.user.username} - {self.role}"
