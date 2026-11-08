from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [("accounts", "0002_user_verification")]
    operations = [migrations.AddField(model_name="user", name="mobile_phone", field=models.CharField(blank=True, max_length=32))]
