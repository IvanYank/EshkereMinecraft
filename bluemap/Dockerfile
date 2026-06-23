FROM php:8.2-fpm-alpine

# Установка зависимостей: nginx, pdo_mysql
RUN apk add --no-cache \
    nginx \
    $PHPIZE_DEPS \
    && docker-php-ext-install pdo_mysql \
    && apk del $PHPIZE_DEPS

# Копирование конфигурации Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Копирование файлов BlueMap
COPY . /var/www/bluemap/

# Настройка прав доступа
RUN chown -R www-data:www-data /var/www/bluemap \
    && mkdir -p /run/nginx

# Открываем порт 80
EXPOSE 80

# Запуск Nginx и PHP-FPM
CMD ["sh", "-c", "php-fpm & nginx -g 'daemon off;'"]