FROM php:8.2-apache

RUN docker-php-ext-install pdo_mysql
RUN a2enmod rewrite

COPY . /var/www/html/

# Создаём симлинк maps -> . (чтобы статика отдавалась)
RUN ln -s . /var/www/html/maps

# Добавляем конфигурацию в apache2.conf
RUN echo '<Directory /var/www/html/>\n\
    Options FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
    RewriteEngine On\n\
    # Если запрос к /maps/имя_карты/ (с возможным слешем) – отдаём index.html\n\
    RewriteRule ^maps/([^/]+)/?$ /index.html [L]\n\
    # Если запрос к существующему файлу или папке – ничего не делаем\n\
    RewriteCond %{REQUEST_FILENAME} -f [OR]\n\
    RewriteCond %{REQUEST_FILENAME} -d\n\
    RewriteRule ^ - [L]\n\
    # Всё остальное (тайлы, мета-файлы) – передаём sql.php\n\
    RewriteRule ^ /sql.php [L]\n\
</Directory>' >> /etc/apache2/apache2.conf

RUN chown -R www-data:www-data /var/www/html