from django.urls import path
from .views import CurrentUserProfileView

urlpatterns = [
    path("user-profile/me/", CurrentUserProfileView.as_view(), name="user-profiles"),
]
