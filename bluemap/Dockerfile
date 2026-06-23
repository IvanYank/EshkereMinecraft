FROM php:8.2-fpm

RUN docker-php-ext-install pdo_mysql

COPY . /var/www/html/
RUN ln -s . /var/www/html/maps