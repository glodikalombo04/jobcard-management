from django.contrib import admin
from import_export import resources, fields
from import_export.admin import ImportExportModelAdmin
from .models import Customer, Region
from import_export.results import RowResult


class CustomerResource(resources.ModelResource):
    region = fields.Field(attribute='region', column_name='region')

    class Meta:
        model = Customer
        fields = ('id', 'name', 'region')
        import_id_fields = ['id']

    def before_import_row(self, row, **kwargs):
        region_name = row.get('region')
        customer_name = row.get('name')
        region_obj = None
        if region_name:
            try:
                region_obj = Region.objects.get(name=region_name.strip())
                row['region'] = region_obj
            except Region.DoesNotExist:
                row['region'] = None

        # Prevent duplicate customer name in the same region
        if region_obj and customer_name:
            if Customer.objects.filter(name=customer_name.strip(), region=region_obj).exists():
                row['region'] = None  # This will trigger error handling in import_row

    def import_row(self, row, instance_loader, **kwargs):
        import_result = super().import_row(row, instance_loader, **kwargs)
        if row.get('region') is None:
            import_result.errors.append(
                f"Region not found or duplicate customer: '{row.get('region')}' (Customer: {row.get('name')})"
            )
            import_result.import_type = RowResult.IMPORT_TYPE_SKIP
        return import_result

@admin.register(Customer)
class CustomerAdmin(ImportExportModelAdmin):
    resource_class = CustomerResource
    list_display = ["id", "name", "region"]
    search_fields = ["name"]
    list_filter = ["region"]


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ["id", "name"]
    search_fields = ["name"]

