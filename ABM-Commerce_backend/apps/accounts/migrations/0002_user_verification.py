from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [("accounts", "0001_initial")]
    operations = [migrations.AddField(model_name="user", name="email_verified", field=models.BooleanField(default=False)), migrations.AddField(model_name="user", name="verification_code_hash", field=models.CharField(blank=True, max_length=128)), migrations.AddField(model_name="user", name="verification_expires_at", field=models.DateTimeField(blank=True, null=True))]
