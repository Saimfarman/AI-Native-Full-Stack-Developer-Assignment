from rest_framework import serializers

from .models import DemoUser, Document


class DemoUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemoUser
        fields = ["id", "display_name", "email"]


class DocumentSerializer(serializers.ModelSerializer):
    owner = DemoUserSerializer(read_only=True)
    shared_users = DemoUserSerializer(source="shared_with", many=True, read_only=True)
    shared_user_ids = serializers.PrimaryKeyRelatedField(
        source="shared_with",
        many=True,
        queryset=DemoUser.objects.all(),
        required=False,
    )
    access_role = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_share = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "content_html",
            "owner",
            "shared_users",
            "shared_user_ids",
            "access_role",
            "can_edit",
            "can_share",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "shared_users", "access_role", "can_edit", "can_share", "created_at", "updated_at"]

    def validate_title(self, value):
        cleaned = value.strip()
        return cleaned or "Untitled Document"

    def get_access_role(self, instance):
        current_user = self.context.get("current_user")
        if current_user is None:
            return "viewer"
        if instance.owner_id == current_user.id:
            return "owned"
        if instance.shared_with.filter(id=current_user.id).exists():
            return "shared"
        return "viewer"

    def get_can_edit(self, instance):
        return self.get_access_role(instance) in {"owned", "shared"}

    def get_can_share(self, instance):
        current_user = self.context.get("current_user")
        return current_user is not None and instance.owner_id == current_user.id

    def create(self, validated_data):
        current_user = self.context.get("current_user")
        if current_user is None:
            raise serializers.ValidationError("A current user is required to create a document.")
        validated_data["owner"] = current_user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        current_user = self.context.get("current_user")
        shared_with = validated_data.pop("shared_with", None)
        instance = super().update(instance, validated_data)
        if current_user is not None and instance.owner_id == current_user.id and shared_with is not None:
            instance.shared_with.set(shared_with)
        return instance
