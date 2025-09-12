from django.contrib import admin
from .models import SupportAgent, JobType, JobCardCounter, Accessories, JobCard
from simple_history.admin import SimpleHistoryAdmin
from backend_core.models import Region, Technician, Customer


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ["id", "name"]
    search_fields = ["name"]


@admin.register(Technician)
class TechnicianAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "initials", "region"]
    search_fields = ["name", "initials"]
    list_filter = ["region"]


@admin.register(Customer)
class CustomerAdmin(SimpleHistoryAdmin):
    list_display = ["id", "name", "region"]
    search_fields = ["name"]
    list_filter = ["region"]


@admin.register(SupportAgent)
class SupportAgentAdmin(admin.ModelAdmin):
    list_display = ["name"]


@admin.register(JobType)
class JobTypeAdmin(admin.ModelAdmin):
    list_display = ["id", "name"]


@admin.register(JobCardCounter)
class JobCardCounterAdmin(admin.ModelAdmin):
    list_display = ["current_number"]


@admin.register(Accessories)
class AccessoriesAdmin(admin.ModelAdmin):
    list_display = ["name"]


@admin.register(JobCard)
class JobCardAdmin(admin.ModelAdmin):
    list_display = [
        "region",
        "unique_id",
        "technician",
        "customer",
        "job_type",
        "support_agent",
        "created_at",
    ]
    list_filter = ["region", "job_type", "technician"]
    search_fields = ["unique_id", "technician__name", "customer__name", "vehicle_reg"]
    filter_horizontal = ["accessories"]
    readonly_fields = ["unique_id", "created_at"]
    ordering = ["-created_at"]
