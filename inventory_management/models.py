from django.db import models
from backend_core.models import Region, Technician, Customer
from django.contrib.auth import get_user_model

User = get_user_model()


class ItemType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    barcode = models.CharField(max_length=50, unique=True, null=True, blank=True)
    requires_serial = models.BooleanField(default=False)
    is_bulk = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class StockStatus(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class StockLocation(models.Model):
    name = models.CharField(max_length=255, blank=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)

    technician = models.ForeignKey(
        Technician, on_delete=models.SET_NULL, null=True, blank=True
    )
    customer = models.ForeignKey(
        Customer, on_delete=models.SET_NULL, null=True, blank=True
    )

    is_warehouse = models.BooleanField(default=False)

    def __str__(self):
        if self.is_warehouse:
            return f"{self.name}"
        elif self.technician:
            return f"{self.technician.name} (Technician Stock)"
        elif self.customer:
            return f"{self.customer.name} (Customer Stock)"
        return self.name

    @property
    def location_type(self):
        if self.is_warehouse:
            return "Warehouse"
        elif self.technician:
            return "Technician"
        elif self.customer:
            return "Customer"
        return "Unknown"
    
class StockTakeOverview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    location = models.ForeignKey(StockLocation, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Stock Take {self.location.name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class StockTakeItem(models.Model):
    stock_take = models.ForeignKey(
        StockTakeOverview,
        on_delete=models.CASCADE,
        related_name="items",
    )
    item_type = models.ForeignKey(ItemType, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=0)

    class Meta:
        # Prevent two rows for the same item_type in the same stock take
        constraints = [
            models.UniqueConstraint(
                fields=["stock_take", "item_type"],
                name="uniq_item_per_take"
            )
        ]

    def __str__(self):
        return f"{self.item_type.name} x{self.quantity} @ {self.stock_take.location.name}"


class StockTakeItemSerial(models.Model):
    stock_take_item = models.ForeignKey(
        StockTakeItem,
        on_delete=models.CASCADE,
        related_name="serials",
    )
    serial_number = models.CharField(max_length=64, db_index=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["stock_take_item", "serial_number"],
                name="uniq_serial_per_line"
            )
        ]

    def __str__(self):
        return self.serial_number
