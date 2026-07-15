from django.db import models


class DemoUser(models.Model):
    display_name = models.CharField(max_length=100, unique=True)
    email = models.EmailField(blank=True, default="")

    def __str__(self):
        return self.display_name


class Document(models.Model):
    owner = models.ForeignKey(DemoUser, on_delete=models.CASCADE, related_name="owned_documents", default=1)
    shared_with = models.ManyToManyField(DemoUser, related_name="shared_documents", blank=True)
    title = models.CharField(max_length=200, default="Untitled Document")
    content_html = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return self.title
