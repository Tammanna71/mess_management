from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings
from rest_framework.exceptions import AuthenticationFailed
from core.models import User


class CoreUserJWTAuthentication(JWTAuthentication):
    """
    JWT auth that fetches users from core_user instead of auth_user.
    """

    def get_user(self, validated_token):
        user_id = validated_token.get(api_settings.USER_ID_CLAIM)

        if user_id is None:
            raise AuthenticationFailed("Token contained no user_id")

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found", code="user_not_found")

        if not user.is_active:
            raise AuthenticationFailed("User inactive", code="user_inactive")

        return user
