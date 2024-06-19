import logging

logger = logging.getLogger(__name__)

class LogRequestSchemeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        scheme = request.scheme
        method = request.method
        path = request.path
        headers = request.headers
        logger.info(f"Request scheme: {scheme}, method: {method}, path: {path}, headers: {headers}")
        response = self.get_response(request)
        return response
