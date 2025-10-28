from rest_framework import serializers
from inventory_management.models import (
    ItemType,
    StockLocation,
    StockTakeItem,
    StockTakeOverview,
    StockTakeItemSerial
)

class ItemTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemType
        fields = ["id", "name", "requires_serial", "is_bulk"]

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockLocation
        fields = ["id", "name", "region", "technician", "customer", "is_warehouse"]

class StockTakeOverviewSerializer(serializers.ModelSerializer):

    display_name = serializers.SerializerMethodField()

    class Meta:
        model = StockTakeOverview
        fields = ["id", "user", "location", "created_at", "display_name"]

    def get_display_name(self, obj):
        return str(obj)  # uses __str__ method


class StockTakeItemSerializer(serializers.ModelSerializer):
    
    item_type_name = serializers.CharField(source='item_type.name', read_only=True)

    class Meta:
        model = StockTakeItem
        fields = ["id","stock_take", "item_type","item_type_name", "quantity"]

class StockTakeItemSerialSerializer(serializers.ModelSerializer):

    class Meta:
        model = StockTakeItemSerial
        fields = ["id", "stock_take_item", "serial_number"]