from django.contrib import admin

from .models import (
    ItemType,
    StockLocation,
    StockStatus,
    StockTakeOverview,
    StockTakeItem,
    StockTakeItemSerial
)

@admin.register(ItemType)
class ItemTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "requires_serial", "is_bulk"]
    list_filter = ["requires_serial", "is_bulk"]

@admin.register(StockLocation)
class StockLocationAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "region", "is_warehouse"]


@admin.register(StockStatus)
class StatusAdmin(admin.ModelAdmin):
    list_display = ["id", "name"]

@admin.register(StockTakeOverview)
class StockTakeOverviewAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "location", "created_at"]

@admin.register(StockTakeItem)
class StockTakeItemAdmin(admin.ModelAdmin):
    list_display = ["id","stock_take", "item_type", "quantity"]

@admin.register(StockTakeItemSerial)
class StockTakeItemSerialAdmin(admin.ModelAdmin):
    list_display = ["id", "stock_take_item", "serial_number"]