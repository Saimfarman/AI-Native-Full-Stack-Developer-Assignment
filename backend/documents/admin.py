from django.contrib import admin

from .models import DemoUser, Document


@admin.register(DemoUser)
class DemoUserAdmin(admin.ModelAdmin):
    list_display = ("display_name", "email")
    search_fields = ("display_name", "email")


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "updated_at", "created_at")
    search_fields = ("title",)
    list_filter = ("owner",)
