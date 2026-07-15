from django.db import migrations, models
import django.db.models.deletion


def seed_demo_users(apps, schema_editor):
    DemoUser = apps.get_model("documents", "DemoUser")

    demo_users = [
        (1, "Ajaia Owner", "owner@ajaia.local"),
        (2, "Ajaia Teammate", "teammate@ajaia.local"),
        (3, "Ajaia Reviewer", "reviewer@ajaia.local"),
    ]

    for user_id, display_name, email in demo_users:
        DemoUser.objects.update_or_create(
            id=user_id,
            defaults={"display_name": display_name, "email": email},
        )


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="DemoUser",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("display_name", models.CharField(max_length=100, unique=True)),
                ("email", models.EmailField(blank=True, default="", max_length=254)),
            ],
        ),
        migrations.RunPython(seed_demo_users, migrations.RunPython.noop),
        migrations.AddField(
            model_name="document",
            name="owner",
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name="owned_documents", to="documents.demouser"),
        ),
        migrations.AddField(
            model_name="document",
            name="shared_with",
            field=models.ManyToManyField(blank=True, related_name="shared_documents", to="documents.demouser"),
        ),
    ]