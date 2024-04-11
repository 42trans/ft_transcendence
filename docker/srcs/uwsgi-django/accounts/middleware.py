from django.utils.deprecation import MiddlewareMixin


class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        token = request.COOKIES.get('Access-Token')
        if token:
            # JWTをAuthorizationヘッダーに設定
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
