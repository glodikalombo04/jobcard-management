from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from inventory_management.models import (
    ItemType,
    StockLocation,
    StockTakeItem,
    StockTakeOverview,
    StockTakeItemSerial
)

from .serializers import (
    ItemTypeSerializer,
    WarehouseSerializer,
    StockTakeOverviewSerializer,
    StockTakeItemSerializer,
    StockTakeItemSerialSerializer
)



class ItemTypeListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        items = ItemType.objects.all()
        serializer = ItemTypeSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ItemTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    

class WarehouseListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        region_id = request.query_params.get("region")
        if region_id:
            region_id = int(region_id)
            warehouses = StockLocation.objects.filter(region_id=region_id)
        else:
            warehouses = StockLocation.objects.all()
        serializer = WarehouseSerializer(warehouses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WarehouseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class StockTakeOverviewListView(APIView):

    permission_classes = [AllowAny]

    def get(self,request):
        user_id = request.query_params.get("user")
        overview = StockTakeOverview.objects.all()
        if user_id is not None:
            overview = overview.filter(user_id=user_id)
            
        serializer = StockTakeOverviewSerializer(overview, many=True)
        return  Response(serializer.data)
    
    def post(self, request):
        serializer = StockTakeOverviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    


class StockTakeItemListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        stock_take_id = request.query_params.get("id")
        items = StockTakeItem.objects.all()
        if stock_take_id is not None:
            items = items.filter(stock_take_id=stock_take_id)

        serializer = StockTakeItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = StockTakeItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class StockTakeItemSerialListView(APIView):

    permission_classes = [AllowAny]

    def get(self,request):
        serials = StockTakeItemSerial.objects.all()
        serializer = StockTakeItemSerialSerializer(serials, many=True)
        return  Response(serializer.data)
    
    def post(self, request):
        serializer = StockTakeItemSerialSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)