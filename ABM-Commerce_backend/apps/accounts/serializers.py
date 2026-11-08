from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import SellerApplication

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    def validate_email(self, value):
        if User.objects.filter(email__iexact=value.strip()).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.strip().lower()
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password", "mobile_phone"]
    def create(self, data):
        email = data["email"].lower().strip()
        return User.objects.create_user(username=email, email=email, is_active=False, **{k:v for k,v in data.items() if k != "email"})

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    def validate(self, attrs):
        user = authenticate(username=attrs["email"].lower().strip(), password=attrs["password"])
        if not user or not user.is_active or not user.email_verified:
            raise serializers.ValidationError("Invalid credentials or email not verified.")
        attrs["user"] = user
        return attrs


class SellerApplicationSerializer(serializers.ModelSerializer):
    applicant_email = serializers.EmailField(source="user.email", read_only=True)
    applicant_name = serializers.SerializerMethodField()

    class Meta:
        model = SellerApplication
        fields = [
            "id", "store_name", "business_type", "contact_phone", "city", "website",
            "description", "status", "review_note", "submitted_at", "reviewed_at",
            "applicant_email", "applicant_name",
        ]
        read_only_fields = ["id", "status", "review_note", "submitted_at", "reviewed_at", "applicant_email", "applicant_name"]

    def get_applicant_name(self, application):
        return application.user.get_full_name() or application.user.email


class SellerApplicationSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerApplication
        fields = ["store_name", "business_type", "contact_phone", "city", "website", "description"]

    def validate_store_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Enter a store name with at least 2 characters.")
        return value

    def validate_contact_phone(self, value):
        value = value.strip()
        if len(value) < 7:
            raise serializers.ValidationError("Enter a valid contact phone number.")
        return value

    def validate_city(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Enter your city.")
        return value

    def validate_description(self, value):
        value = value.strip()
        if len(value) < 30:
            raise serializers.ValidationError("Tell us a little more about what you plan to sell (at least 30 characters).")
        return value
