from rest_framework import serializers
from backend_core.models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    # warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "user",
            "role",
            "role_display",
            "region",
            # "warehouse",
            # "warehouse_name",
        ]
