FROM php:8.2-apache

# Устанавливаем PDO для MySQL
RUN docker-php-ext-install pdo_mysql

# Включаем mod_rewrite
RUN a2enmod rewrite
RUN a2dismod -f deflate
# Копируем файлы
COPY . /var/www/html/

# Удаляем существующий maps (если есть) и создаём симлинк
RUN rm -rf /var/www/html/maps && ln -s . /var/www/html/maps

# Настраиваем Apache через .htaccess
RUN echo '<Directory /var/www/html/>\n\
    Options FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

# Добавляем базовые настройки
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

RUN chown -R www-data:www-data /var/www/html