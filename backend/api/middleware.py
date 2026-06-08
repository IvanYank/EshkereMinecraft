from django.utils.cache import patch_cache_control


class CacheControlMiddleware:
    """
    Добавляет Cache-Control для GET-запросов.
    Формат: (путь, max_age, режим_проверки)
    - max_age > 0: обычный кеш (events, news)
    - max_age == 0 и проверка=True: max-age=0, must-revalidate, private (users, me, my_tokens)
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

        for path_prefix, max_age, revalidate in self.CACHED_GET_PATHS:
            if request.path.startswith(path_prefix):
                if revalidate:
                    patch_cache_control(
                        response,
                        max_age=0,
                        must_revalidate=True,
                        private=True,
                    )
                else:
                    patch_cache_control(response, max_age=max_age)
                break

        return response