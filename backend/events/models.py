from django.db import models

class Event(models.Model):
    # Поле для названия события (максимум 200 символов)
    title = models.CharField(
        max_length=200, 
        verbose_name="Название"
    )

    # Поле для описания (может быть длинным текстом)
    description = models.TextField(
        verbose_name="Описание",
        blank=True,  # Делает поле необязательным для заполнения
    )

    # Поле для загрузки изображения
    # upload_to='events/' — картинки будут сохраняться в папку media/events/
    image = models.ImageField(
        upload_to='events/%Y/%m/%d/',  # Автоматически создаст подпапки по дате
        verbose_name="Картинка",
        blank=True,
        null=True,  # Разрешает NULL в базе данных (если картинка не загружена)
    )

    # Дополнительные полезные поля (опционально)
    created_at = models.DateTimeField(
        auto_now_add=True,  # Автоматически проставится при создании
        verbose_name="Дата создания"
    )

    updated_at = models.DateTimeField(
        auto_now=True,  # Будет обновляться при каждом сохранении
        verbose_name="Дата обновления"
    )

    class Meta:
        verbose_name = "Событие"
        verbose_name_plural = "События"
        ordering = ['-created_at']  # Сортировка по дате создания (сначала новые)

    def __str__(self):
        return self.title