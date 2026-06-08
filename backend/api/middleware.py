import hashlib
from django.utils.cache import patch_cache_control
from django.http import HttpResponseNotModified


class CacheControlMiddleware:
    CACHED_GET_PATHS = (
        ('/api/events', 10800, False),
        ('/api/news', 10800, False),
        ('/api/users/', 0, True),
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.method != 'GET':
            return response

        for path_prefix, max_age, no_cache in self.CACHED_GET_PATHS:
            if request.path.startswith(path_prefix):
                content = response.content
                if content:
                    etag = hashlib.md5(content).hexdigest()
                    response['ETag'] = f'"{etag}"'

                    if_none_match = request.headers.get('If-None-Match', '')
                    if if_none_match == response['ETag']:
                        return HttpResponseNotModified()

                if no_cache:
                    patch_cache_control(response, no_cache=True, private=True)
                else:
                    patch_cache_control(response, max_age=max_age)
                break

        return response