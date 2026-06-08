import hashlib
from django.utils.cache import patch_cache_control


class CacheControlMiddleware:
    # Публичные пути (ответ не зависит от пользователя)
    PUBLIC_PATHS = ('/api/events', '/api/news', '/api/users/')
    # Приватные пути (нужна авторизация, ответ зависит от пользователя)
    PRIVATE_PATHS = ('/api/users/me', '/api/users/my_tokens')

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.method != 'GET':
            return response

        path = request.path

        if any(path.startswith(p) for p in self.PUBLIC_PATHS + self.PRIVATE_PATHS):
            if not response.has_header('ETag'):
                content = response.content
                etag = hashlib.md5(content).hexdigest() if content else ''
                if etag:
                    response['ETag'] = f'"{etag}"'

        # Публичные эндпоинты
        if any(path.startswith(p) for p in self.PUBLIC_PATHS):
            if path.startswith('/api/events') or path.startswith('/api/news'):
                patch_cache_control(response, max_age=10800)
            else:
                patch_cache_control(response, no_cache=True, public=True)

            if 'Authorization' in request.headers:
                vary = response.get('Vary', '')
                vary = ', '.join(
                    v for v in vary.split(', ') if v.strip() != 'Authorization'
                )
                if vary:
                    response['Vary'] = vary
                else:
                    del response['Vary']

        # Приватные эндпоинты
        elif any(path.startswith(p) for p in self.PRIVATE_PATHS):
            patch_cache_control(response, no_cache=True, private=True)

        return response