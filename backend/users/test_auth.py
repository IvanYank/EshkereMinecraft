from users.authme import get_authme_connection, check_authme_user_exists

# Проверить подключение
conn = get_authme_connection()
print("Connected!")

# Проверить таблицу
cursor = conn.cursor()
cursor.execute("SHOW TABLES")
for row in cursor.fetchall():
    print(row)

# Проверить пользователей
cursor.execute("SELECT username FROM authme LIMIT 5")
for row in cursor.fetchall():
    print(row)

conn.close()