from django.utils.deprecation import MiddlewareMixin
from accounts.authentication_backend import JWTAuthenticationBackend


class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        token = request.COOKIES.get('Access-Token')
        if token:
            # JWTをAuthorizationヘッダーに設定
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'

            backend = JWTAuthenticationBackend()
            user = backend.authenticate(request, token=token)
            if user:
                request.user = user
