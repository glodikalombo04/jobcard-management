from django.urls import path
from .views import (RegionListView, CustomerListView, CustomerDetailView, TechnicianListView, TechnicianDetailView, 
                    SupportAgentListView, SupportAgentDetailView, AccessoryListView, AccessoryDetailView, JobTypeListView, 
                    JobTypeDetailView, JobCardListView, JobsPerDayView, JobsPerJobType, RegionsWithJobCards,
                    CustomersWithJobCards, TotalJobCards,JobCardDetailView)

urlpatterns = [
    path('regions/', RegionListView.as_view(), name='region-list'),
    path('customers/', CustomerListView.as_view(), name='customer-list'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),
    path('technicians/', TechnicianListView.as_view(), name='technician-list'),
    path('technicians/<int:pk>/', TechnicianDetailView.as_view(), name='technician-detail'),
    path('support-agents/', SupportAgentListView.as_view(), name='support-agent-list'),
    path('support-agents/<int:pk>/', SupportAgentDetailView.as_view(), name='support-agent-detail'),
    path('accessories/', AccessoryListView.as_view(), name='accessory-list'),
    path('accessories/<int:pk>/', AccessoryDetailView.as_view(), name='accessory-detail'),
    path('job-types/', JobTypeListView.as_view(), name='jobtype-list'),
    path('job-types/<int:pk>/', JobTypeDetailView.as_view(), name='jobtype-detail'),
    path('jobcards/', JobCardListView.as_view(), name='jobcard-list'),
    path("stats/jobs-per-day/", JobsPerDayView.as_view(), name="jobs-per-day"),
    path("stats/jobs-per-type/", JobsPerJobType.as_view(), name="jobs-per-type"),
    path("regions-with-jobcards/", RegionsWithJobCards.as_view()),
    path("customers-with-jobcards/", CustomersWithJobCards.as_view()),
    path("total-jobcards/", TotalJobCards.as_view()),
    path("jobcards/<int:pk>/", JobCardDetailView.as_view(), name="jobcard-detail"),


]
