# accounts/authentication_backend.py

import jwt
from django.conf import settings
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

# AbstractBaseUserを継承: user.is_authenticatedが使用可能
class JWTAuthenticationBackend(BaseBackend):
    def authenticate(self, request, token=None):
        User = get_user_model()
        try:
            payload = jwt.decode(token, settings.SIMPLE_JWT["SIGNING_KEY"], algorithms=["HS256"])
            user_id = payload.get('user_id')
            user = User.objects.get(id=user_id)
            return user
        except jwt.ExpiredSignatureError:
            return None
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        User = get_user_model()
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
