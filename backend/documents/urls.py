from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import DemoUserListView, DocumentViewSet

router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="document")

urlpatterns = router.urls
urlpatterns += [
	path("users/", DemoUserListView.as_view(), name="demo-users"),
]
