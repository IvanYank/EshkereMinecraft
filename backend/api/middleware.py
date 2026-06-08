from django.utils.cache import patch_cache_control


class CacheControlMiddleware:
    # Формат: (путь, max_age, public)
    CACHED_GET_PATHS = (
        ('/api/events', 10800, False),
        ('/api/news', 10800, False),
        ('/api/users/', 0, True),        # <-- теперь public
        ('/api/users/me', 0, True),
        ('/api/users/my_tokens', 0, True),
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.method != 'GET':
            return response

        for path_prefix, max_age, public in self.CACHED_GET_PATHS:
            if request.path.startswith(path_prefix):
                patch_cache_control(
                    response,
                    max_age=max_age,
                    must_revalidate=True,
                    public=public,
                )
                break

        return response