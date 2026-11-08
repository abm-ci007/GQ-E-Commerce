import hashlib, secrets, json, urllib.parse, urllib.request
from datetime import datetime, timezone as datetime_timezone
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    SellerApplicationSerializer,
    SellerApplicationSubmissionSerializer,
)
from .models import SellerApplication

User = get_user_model()
def user_data(user):
    return {"id": user.id, "email": user.email, "first_name": user.first_name, "last_name": user.last_name, "mobile_phone": user.mobile_phone, "role": "admin" if user.is_staff else user.role, "is_active": user.is_active, "date_joined": user.date_joined}
def token_data(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh), "user": user_data(user)}
class AuthThrottle(AnonRateThrottle):
    rate = '10/hour'
class RegisterAPIView(APIView):
    permission_classes = [AllowAny]; throttle_classes = [AuthThrottle]
    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        user = serializer.save(); code = f'{secrets.randbelow(1000000):06d}'
        user.verification_code_hash = hashlib.sha256(code.encode()).hexdigest(); user.verification_expires_at = timezone.now()+timedelta(minutes=10); user.save(update_fields=['verification_code_hash','verification_expires_at'])
        send_mail('Your ABM Commerce verification code', f'Your code is {code}. It expires in 10 minutes.', settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
        payload = {"detail":"Verification code sent.","pending":True}
        if settings.DEBUG and settings.OTP_DEV_ECHO: payload['development_code'] = code
        return Response(payload, status=201)

class ResendVerificationAPIView(APIView):
    permission_classes = [AllowAny]; throttle_classes = [AuthThrottle]
    generic_detail = "If a pending account matches that email, a new verification code has been sent."

    def post(self, request):
        email = str(request.data.get('email', '')).lower().strip()
        user = User.objects.filter(email__iexact=email, is_active=False).first()
        payload = {"detail": self.generic_detail}
        if not user:
            return Response(payload)

        code = f'{secrets.randbelow(1000000):06d}'
        try:
            send_mail(
                'Your ABM Commerce verification code',
                f'Your code is {code}. It expires in 10 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception:
            return Response({"detail": "We could not send the verification code. Please try again shortly."}, status=503)

        user.verification_code_hash = hashlib.sha256(code.encode()).hexdigest()
        user.verification_expires_at = timezone.now() + timedelta(minutes=10)
        user.save(update_fields=['verification_code_hash', 'verification_expires_at'])
        if settings.DEBUG and settings.OTP_DEV_ECHO:
            payload['development_code'] = code
        return Response(payload)

class VerifyEmailAPIView(APIView):
    permission_classes = [AllowAny]; throttle_classes = [AuthThrottle]
    def post(self, request):
        email = str(request.data.get('email','')).lower().strip(); code = str(request.data.get('code',''))
        user = User.objects.filter(email=email, is_active=False).first()
        digest = hashlib.sha256(code.encode()).hexdigest()
        if not user or not user.verification_expires_at or user.verification_expires_at < timezone.now() or not secrets.compare_digest(user.verification_code_hash, digest): return Response({"detail":"Invalid or expired verification code."}, status=400)
        user.is_active=True; user.email_verified=True; user.verification_code_hash=''; user.verification_expires_at=None; user.save()
        return Response(token_data(user))
class LoginAPIView(APIView):
    permission_classes = [AllowAny]; throttle_classes = [AuthThrottle]
    def post(self, request):
        serializer=LoginSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        return Response(token_data(serializer.validated_data['user']))

class PasswordResetAPIView(APIView):
    permission_classes = [AllowAny]; throttle_classes = [AuthThrottle]
    generic_detail = "If an active account matches that email, a reset code has been sent."

    def post(self, request):
        email = str(request.data.get('email', '')).lower().strip()
        user = User.objects.filter(email__iexact=email, is_active=True, email_verified=True).first()
        payload = {"detail": self.generic_detail}
        if not user:
            return Response(payload)

        code = f'{secrets.randbelow(1000000):06d}'
        try:
            send_mail(
                'Your ABM Commerce password reset code',
                f'Your code is {code}. It expires in 10 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception:
            return Response({"detail": "We could not send the reset code. Please try again shortly."}, status=503)

        user.password_reset_code_hash = hashlib.sha256(code.encode()).hexdigest()
        user.password_reset_expires_at = timezone.now() + timedelta(minutes=10)
        user.save(update_fields=['password_reset_code_hash', 'password_reset_expires_at'])
        if settings.DEBUG and settings.OTP_DEV_ECHO:
            payload['development_code'] = code
        return Response(payload)

    def put(self, request):
        email = str(request.data.get('email', '')).lower().strip()
        code = str(request.data.get('code', ''))
        password = str(request.data.get('password', ''))
        user = User.objects.filter(email__iexact=email, is_active=True, email_verified=True).first()
        digest = hashlib.sha256(code.encode()).hexdigest()
        if (
            not user
            or not user.password_reset_expires_at
            or user.password_reset_expires_at < timezone.now()
            or not secrets.compare_digest(user.password_reset_code_hash, digest)
        ):
            return Response({"detail": "Invalid or expired reset code."}, status=400)
        try:
            validate_password(password, user)
        except ValidationError as error:
            return Response({"detail": list(error.messages)}, status=400)

        user.set_password(password)
        user.password_reset_code_hash = ''
        user.password_reset_expires_at = None
        user.save(update_fields=['password', 'password_reset_code_hash', 'password_reset_expires_at'])
        return Response({"detail": "Password updated. You can now sign in."})

class GoogleLoginAPIView(APIView):
    permission_classes = [AllowAny]; throttle_classes = [AuthThrottle]
    def post(self, request):
        if not settings.GOOGLE_CLIENT_ID: return Response({"detail":"Google sign-in is not configured."},status=503)
        try:
            token = str(request.data['credential'])
            if not token or len(token) > 10000: raise ValueError()
            url='https://oauth2.googleapis.com/tokeninfo?id_token='+urllib.parse.quote(token)
            with urllib.request.urlopen(url, timeout=5) as response: claims=json.loads(response.read())
            issuer = claims.get('iss')
            expires_at = int(claims.get('exp', '0'))
            if (
                claims.get('aud') != settings.GOOGLE_CLIENT_ID
                or claims.get('email_verified') != 'true'
                or issuer not in {'accounts.google.com', 'https://accounts.google.com'}
                or expires_at <= int(datetime.now(datetime_timezone.utc).timestamp())
                or not claims.get('sub')
                or not claims.get('email')
            ):
                raise ValueError()
            email=claims['email'].lower().strip()
            user, created=User.objects.get_or_create(email=email, defaults={'username':email,'first_name':claims.get('given_name','')[:150],'last_name':claims.get('family_name','')[:150],'is_active':True,'email_verified':True})
            if not user.is_active: return Response({"detail":"Account is disabled."},status=403)
            return Response(token_data(user))
        except Exception: return Response({"detail":"Invalid Google credential."},status=400)
class MeAPIView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request): return Response(user_data(request.user))
    def patch(self,request):
        for field in ('first_name','last_name','mobile_phone'):
            if field in request.data: setattr(request.user,field,str(request.data[field])[:150])
        request.user.save(); return Response(user_data(request.user))


class SellerApplicationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        application = SellerApplication.objects.filter(user=request.user).first()
        return Response({"application": SellerApplicationSerializer(application).data if application else None})

    @transaction.atomic
    def post(self, request):
        user = request.user
        if user.is_staff or user.role == "seller":
            return Response({"detail": "This account already has seller access."}, status=status.HTTP_409_CONFLICT)
        if not user.is_active or not user.email_verified:
            return Response({"detail": "Verify your email before applying to sell."}, status=status.HTTP_403_FORBIDDEN)

        application = SellerApplication.objects.select_for_update().filter(user=user).first()
        if application and application.status in ("pending", "approved"):
            return Response({"detail": "An application is already in review or this account is approved."}, status=status.HTTP_409_CONFLICT)

        serializer = SellerApplicationSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if application:
            for key, value in serializer.validated_data.items():
                setattr(application, key, value)
            application.status = "pending"
            application.review_note = ""
            application.reviewed_at = None
            application.reviewed_by = None
            application.submitted_at = timezone.now()
            application.save()
        else:
            application = serializer.save(user=user)
        return Response({"application": SellerApplicationSerializer(application).data}, status=status.HTTP_201_CREATED)


class SellerApplicationAdminListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        applications = SellerApplication.objects.select_related("user", "reviewed_by").all()
        status_filter = request.query_params.get("status")
        if status_filter in {"pending", "approved", "rejected"}:
            applications = applications.filter(status=status_filter)
        return Response(SellerApplicationSerializer(applications, many=True).data)


class SellerApplicationReviewAPIView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def patch(self, request, pk):
        decision = str(request.data.get("status", ""))
        note = str(request.data.get("review_note", "")).strip()[:1000]
        if decision not in {"approved", "rejected"}:
            return Response({"detail": "Choose approved or rejected."}, status=status.HTTP_400_BAD_REQUEST)
        if decision == "rejected" and len(note) < 5:
            return Response({"detail": "Add a short note explaining what the applicant should update."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            application = SellerApplication.objects.select_for_update().select_related("user").get(pk=pk)
        except SellerApplication.DoesNotExist:
            return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
        if application.status != "pending":
            return Response({"detail": "Only pending applications can be reviewed."}, status=status.HTTP_409_CONFLICT)

        application.status = decision
        application.review_note = note
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save(update_fields=["status", "review_note", "reviewed_by", "reviewed_at"])
        user = application.user
        user.role = "seller" if decision == "approved" else "customer"
        user.save(update_fields=["role"])
        return Response(SellerApplicationSerializer(application).data)
