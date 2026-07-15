from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.viewsets import ModelViewSet

from .models import DemoUser, Document
from .serializers import DemoUserSerializer, DocumentSerializer


def get_current_user(request):
    user_id = request.headers.get("X-User-Id") or request.query_params.get("user_id")
    if user_id:
        current_user = DemoUser.objects.filter(id=user_id).first()
        if current_user is not None:
            return current_user
    return DemoUser.objects.order_by("id").first()


class DemoUserListView(ListAPIView):
    queryset = DemoUser.objects.all().order_by("id")
    serializer_class = DemoUserSerializer


class DocumentViewSet(ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def get_queryset(self):
        current_user = get_current_user(self.request)
        queryset = super().get_queryset().prefetch_related("shared_with").order_by("-updated_at", "-created_at")
        if current_user is None:
            return queryset.none()
        return queryset.filter(Q(owner=current_user) | Q(shared_with=current_user)).distinct()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["current_user"] = get_current_user(self.request)
        return context

    def perform_create(self, serializer):
        serializer.save(owner=get_current_user(self.request))
