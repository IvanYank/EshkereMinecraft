# YEA Project

### Настройка окружения

1. Перейдите в папку `infra`:

```
cd infra
```

2. Создайте файл .env на основе примера:a

```
cp env.example .env
```

3. Заполните .env своими значениями

```
ALLOWED_HOSTS=localhost,127.0.0.1,backend,gateway

POSTGRES_DB=yea_database
POSTGRES_USER=yea_user
POSTGRES_PASSWORD=your_secure_password
DB_HOST=db
DB_PORT=5432
```

4. Запуск

### Сборка и запуск всех контейнеров
```
docker-compose up --build -d
```

### Просмотр логов
```
docker-compose logs -f
```

### Остановка
```
docker-compose down
```

## Создание суперпользователя Django

```
docker exec -it yea_backend python manage.py createsuperuser
```

## Доступ к сервисам

Фронтенд - http://localhost
Админка Django - http://localhost/admin/

## Документация
http://127.0.0.1:8000/swagger/
http://127.0.0.1:8000/redoc/


### Примечания
API доступен только для запросов с фронтенда (проверка по Referer)
Админка доступна публично
Статические и медиа файлы хранятся в volumes static_volume и media_volume