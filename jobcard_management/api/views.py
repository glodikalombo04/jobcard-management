from django.db.models.functions import TruncDate
from django.db.models import Count, F
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from jobcard_management.models import (
    SupportAgent,
    Accessories,
    JobType,
    JobCard,
    JobCardCounter,
)
from backend_core.models import Region, Technician, Customer
from .serializers import (
    RegionSerializer,
    CustomerSerializer,
    TechnicianSerializer,
    SupportAgentSerializer,
    AccessorySerializer,
    JobTypeSerializer,
    JobCardSerializer,
)
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from datetime import datetime

# from inventory_management.models import Item, StockStatus
from simple_history.utils import update_change_reason


class RegionListView(APIView):

    # permission_classes = [AllowAny]

    def get(self, request):
        regions = Region.objects.all()
        serializer = RegionSerializer(regions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = RegionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerListView(APIView):
    def get(self, request):
        region_id = request.query_params.get("region")
        if region_id:
            customers = Customer.objects.filter(region_id=region_id)
        else:
            customers = Customer.objects.all()
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class CustomerDetailView(APIView):

    def get_object(self, pk):
        return get_object_or_404(Customer, pk=pk)

    def get(self, request, pk):
        customer = self.get_object(pk)
        serializer = CustomerSerializer(customer)
        return Response(serializer.data)

    def patch(self, request, pk):
        customer = self.get_object(pk)
        serializer = CustomerSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        customer = self.get_object(pk)
        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TechnicianListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        region_id = request.query_params.get("region")
        if region_id:
            technicians = Technician.objects.filter(region_id=region_id)
        else:
            technicians = Technician.objects.all()
        serializer = TechnicianSerializer(technicians, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TechnicianSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class TechnicianDetailView(APIView):

    permission_classes = [AllowAny]

    def get_object(self, pk):
        return get_object_or_404(Technician, pk=pk)

    def get(self, request, pk):
        technician = self.get_object(pk)
        serializer = TechnicianSerializer(technician)
        return Response(serializer.data)

    def patch(self, request, pk):
        technician = self.get_object(pk)
        serializer = TechnicianSerializer(technician, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class SupportAgentListView(APIView):
    # permission_classes = [AllowAny]

    def get(self, request):
        agents = SupportAgent.objects.all()
        serializer = SupportAgentSerializer(agents, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SupportAgentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class SupportAgentDetailView(APIView):

    def get_object(self, pk):
        return get_object_or_404(SupportAgent, pk=pk)

    def get(self, request, pk):
        agent = self.get_object(pk)
        serializer = SupportAgentSerializer(agent)
        return Response(serializer.data)

    def patch(self, request, pk):
        agent = self.get_object(pk)
        serializer = SupportAgentSerializer(agent, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        agent = self.get_object(pk)
        agent.delete()
        return Response(status=204)


class AccessoryListView(APIView):
    def get(self, request):
        accessories = Accessories.objects.all()
        serializer = AccessorySerializer(accessories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AccessorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class AccessoryDetailView(APIView):
    def get_object(self, pk):
        return get_object_or_404(Accessories, pk=pk)

    def get(self, request, pk):
        accessory = self.get_object(pk)
        serializer = AccessorySerializer(accessory)
        return Response(serializer.data)

    def patch(self, request, pk):
        accessory = self.get_object(pk)
        serializer = AccessorySerializer(accessory, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class JobTypeListView(APIView):
    def get(self, request):
        jobtypes = JobType.objects.all()
        serializer = JobTypeSerializer(jobtypes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = JobTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class JobTypeDetailView(APIView):
    def get_object(self, pk):
        return get_object_or_404(JobType, pk=pk)

    def get(self, request, pk):
        jobtype = self.get_object(pk)
        serializer = JobTypeSerializer(jobtype)
        return Response(serializer.data)

    def patch(self, request, pk):
        jobtype = self.get_object(pk)
        serializer = JobTypeSerializer(jobtype, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class JobCardListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        jobcards = JobCard.objects.all()
        serializer = JobCardSerializer(jobcards, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = JobCardSerializer(data=request.data)

        if serializer.is_valid():
            # Step 1: Get the technician
            technician_id = serializer.validated_data["technician"].id
            technician = Technician.objects.get(id=technician_id)

            # Step 2: Get the current number from JobCardCounter
            counter = JobCardCounter.objects.first()
            if not counter:
                return Response({"error": "JobCardCounter is not set up."}, status=500)

            # Step 3: Generate the unique ID
            current_number = counter.current_number
            unique_id = f"{technician.initials}{current_number}"

            # Step 4: Save the job card with the unique_id
            jobcard = serializer.save(unique_id=unique_id)

            # Step 5: Increment the counter
            counter.current_number += 1
            counter.save()
            """
            # Step 6: Update inventory item if it's a NEW TRACKING INSTALL
            try:
                if jobcard.job_type.name.strip().upper() == "NEW TRACKING INSTALL":
                    item = Item.objects.get(serial_number=jobcard.device_imei)
                    installed_status = ItemStatus.objects.get(name__iexact="Installed")
                    item.status = installed_status
                    item.installed_jobcard = jobcard
                    item._history_user = request.user
                    #update_change_reason(item, f"Installed via jobcard {jobcard.unique_id}")
                    item.save()
            except Item.DoesNotExist:
                print(f"[WARNING] Item with IMEI {jobcard.device_imei} not found.")
            except ItemStatus.DoesNotExist:
                print("[WARNING] Status 'Installed' not found.")
                """

            # Step 7: Return success response
            response_data = {
                "message": "JobCard created successfully.",
                "unique_id": unique_id,
                "jobcard": JobCardSerializer(jobcard).data,
            }
            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobCardDetailView(APIView):
    def get_object(self, pk):
        return get_object_or_404(JobCard, pk=pk)

    def get(self, request, pk):
        jobcard = self.get_object(pk)
        serializer = JobCardSerializer(jobcard)
        return Response(serializer.data)

    def patch(self, request, pk):
        jobcard = self.get_object(pk)
        serializer = JobCardSerializer(jobcard, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        jobcard = self.get_object(pk)
        jobcard.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class JobsPerDayView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        region_id = request.query_params.get("region_id")
        customer_id = request.query_params.get("customer_id")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        queryset = JobCard.objects.all()

        if region_id:
            queryset = queryset.filter(region_id=region_id)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        data = (
            queryset.annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )

        return Response(data)


class JobsPerJobType(APIView):
    # Uncomment and adjust permissions if needed
    permission_classes = [AllowAny]

    def get(self, request):
        region_id = request.query_params.get("region_id")
        customer_id = request.query_params.get("customer_id")
        technician_id = request.query_params.get("technician_id")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        queryset = JobCard.objects.all()
        if region_id:
            queryset = queryset.filter(region_id=region_id)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        if technician_id:
            queryset = queryset.filter(technician_id=technician_id)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        data = queryset.values(name=F("job_type__name")).annotate(value=Count("id"))

        return Response(data)


class RegionsWithJobCards(APIView):
    def get(self, request):
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        region_ids = JobCard.objects.values_list("region_id", flat=True).distinct()
        regions = Region.objects.filter(id__in=region_ids)
        data = [{"id": r.id, "name": r.name} for r in regions]
        return Response(data)


class CustomersWithJobCards(APIView):
    def get(self, request):
        region_id = request.query_params.get("region_id")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        jobcard_qs = JobCard.objects.all()
        if region_id:
            jobcard_qs = jobcard_qs.filter(region_id=region_id)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        customer_ids = jobcard_qs.values_list("customer_id", flat=True).distinct()
        customers = Customer.objects.filter(id__in=customer_ids)
        data = [{"id": c.id, "name": c.name} for c in customers]
        return Response(data)


class TotalJobCards(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        region_id = request.query_params.get("region_id")
        customer_id = request.query_params.get("customer_id")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        queryset = JobCard.objects.all()
        if region_id:
            queryset = queryset.filter(region_id=region_id)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        data = queryset.aggregate(count=Count("id"))

        return Response(data)
