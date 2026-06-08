from django.utils.cache import patch_cache_control


class CacheControlMiddleware:
    """
    Добавляет заголовок Cache-Control для разрешённых GET-запросов.
    Формат: (путь_или_префикс, время_в_секундах, no_cache)
    Если no_cache=True — max-age не ставится, только проверка по ETag.
    """

    CACHED_GET_PATHS = (
        ('/api/events', 10800, False),
        ('/api/news', 10800, False),
        ('/api/users/', 0, True),
        ('/api/users/my_tokens', 0, True),
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.method != 'GET':
            return response

        for path_prefix, max_age, no_cache in self.CACHED_GET_PATHS:
            if request.path.startswith(path_prefix):
                if no_cache:
                    patch_cache_control(response, no_cache=True, private=True)
                else:
                    patch_cache_control(response, max_age=max_age)
                break

        return response