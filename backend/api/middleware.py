from django.utils.cache import patch_cache_control


class CacheControlMiddleware:
    """
    Добавляет заголовок Cache-Control только для разрешённых GET-запросов.
    Кешируемые эндпоинты и время жизни заданы в кортеже CACHED_GET_PATHS.
    """

    # Кортеж (путь_или_префикс, время_в_секундах)
    CACHED_GET_PATHS = (
        ('/api/events', 10800),       # 3 часа
        ('/api/news', 10800),         # 3 часа
        ('/api/users/', 10800),       # только GET /api/users/
        ('/api/users/my_tokens', 10800),
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.method != 'GET':
            return response

        for path_prefix, max_age in self.CACHED_GET_PATHS:
            if request.path.startswith(path_prefix):
                patch_cache_control(response, max_age=max_age)
                break

        return response