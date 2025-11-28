from rest_framework import serializers
from jobcard_management.models import SupportAgent, Accessories, JobType, JobCard
from backend_core.models import Region, Technician, Customer

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id','name']

class CustomerSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)

    class Meta:
        model = Customer
        fields = ['id', 'name', 'region', 'region_name']

class TechnicianSerializer(serializers.ModelSerializer):

    region_name = serializers.CharField(source='region.name', read_only=True)

    class Meta:
        model = Technician
        fields = ['id', 'name', 'initials', 'region', 'region_name']

class SupportAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportAgent
        fields = ['id','name']

class AccessorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Accessories
        fields = ['id','name']

class JobTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobType
        fields = ['id', 'name']

class JobCardSerializer(serializers.ModelSerializer):

    region_name = serializers.CharField(source='region.name', read_only=True)
    technician_name = serializers.CharField(source='technician.name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    job_type_name = serializers.CharField(source='job_type.name', read_only=True)
    support_agent_name = serializers.CharField(source='support_agent.name', read_only=True)

    accessories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Accessories.objects.all()
    )
    accessories_name = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="name",
        source="accessories"
    )
    unique_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    tampering = serializers.CharField(required=False, allow_null=True, allow_blank=True)


    class Meta:
        model = JobCard
        fields = [
            'id',
            'unique_id',
            'region', 'region_name',
            'technician', 'technician_name',
            'customer', 'customer_name',
            'job_type', 'job_type_name',
            'tampering',
            'support_agent', 'support_agent_name',
            'device_imei',
            'vehicle_reg',
            'accessories', 'accessories_name',
            'created_at'
        ]

