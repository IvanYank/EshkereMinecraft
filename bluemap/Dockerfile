FROM php:8.2-apache

# Устанавливаем расширение PDO для MySQL
RUN docker-php-ext-install pdo_mysql

# Включаем mod_rewrite (на случай если понадобится)
RUN a2enmod rewrite

# Копируем файлы BlueMap в корень веб-сервера
COPY . /var/www/html/

# Настраиваем FallbackResource – все запросы к несуществующим файлам направляем на sql.php
RUN echo 'FallbackResource /sql.php' >> /etc/apache2/apache2.conf

# Опционально: меняем владельца на www-data (если нужно)
RUN chown -R www-data:www-data /var/www/html