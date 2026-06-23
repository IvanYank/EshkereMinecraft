FROM php:8.2-fpm-alpine

# Установка зависимостей: nginx, pdo_mysql
RUN apk add --no-cache \
    nginx \
    $PHPIZE_DEPS \
    && docker-php-ext-install pdo_mysql \
    && apk del $PHPIZE_DEPS

# Копирование конфигурации Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Файлы копируются через volume в docker-compose, 
# но можно оставить пустую директорию для безопасности
RUN mkdir -p /var/www/bluemap

# Открываем порт 80
EXPOSE 80

# Команда запуска: сначала php-fpm, потом nginx в foreground
CMD ["sh", "-c", "php-fpm & nginx -g 'daemon off;'"]