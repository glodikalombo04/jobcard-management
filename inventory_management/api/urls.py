from django.urls import path
from .views import (
    ItemTypeListView,
    WarehouseListView,
    StockTakeOverviewListView,
    StockTakeItemListView,
    StockTakeItemSerialListView,
)

urlpatterns = [
    path("itemtypes/", ItemTypeListView.as_view(), name="item-types-list"),
    path("warehouses/", WarehouseListView.as_view(), name="warehouses-list"),
    path("stock-take-overview/", StockTakeOverviewListView.as_view(), name="stock-take-overview"),
    path("stock-take-items/", StockTakeItemListView.as_view(), name="stock-take-items"),
    path("stock-take-items-serials/", StockTakeItemSerialListView.as_view(), name="stock-take-items-serials"),
]
