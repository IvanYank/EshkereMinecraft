import hashlib
import secrets
import pymysql
import time
from django.conf import settings


def generate_authme_hash(password: str) -> str:
    """
    Генерирует хеш пароля в формате AuthMe SHA256.
    Формат: $SHA$<соль>$<хеш>
    """
    salt = secrets.token_hex(8)
    first_hash = hashlib.sha256(password.encode('utf-8')).digest()
    final_hash = hashlib.sha256(
        first_hash.hex().encode('utf-8') + salt.encode('utf-8')
    ).hexdigest()
    
    return f"$SHA${salt}${final_hash}"


def get_authme_connection():
    """Создаёт соединение с MySQL базой AuthMe"""
    return pymysql.connect(
        host=settings.AUTHME_HOST,
        port=settings.AUTHME_PORT,
        user=settings.AUTHME_USER,
        password=settings.AUTHME_PASSWORD,
        database=settings.AUTHME_DATABASE,
        charset='utf8mb4',
        autocommit=True
    )


def create_authme_user(username: str, password: str, email: str = None, ip: str = None) -> bool:
    """
    Создаёт пользователя в таблице AuthMe.
    """
    connection = None
    try:
        connection = get_authme_connection()
        cursor = connection.cursor()
        
        # Проверяем существование
        cursor.execute(
            f"SELECT 1 FROM {settings.AUTHME_TABLE} WHERE username = %s",
            (username,)
        )
        if cursor.fetchone():
            print(f"User {username} already exists in AuthMe")
            return False
        
        password_hash = generate_authme_hash(password)
        current_time = int(time.time() * 1000)
        
        if not ip:
            ip = '127.0.0.1'
        if not email:
            email = f"{username}@yea.local"
        
        # Вставляем запись со всеми обязательными полями
        cursor.execute(
            f"""
            INSERT INTO {settings.AUTHME_TABLE} 
            (username, realname, password, email, ip, regip, regdate, lastlogin, 
             x, y, z, world, yaw, pitch, isLogged, hasSession)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                username,           # username
                username,           # realname
                password_hash,      # password
                email,              # email
                ip,                 # ip
                ip,                 # regip
                current_time,       # regdate
                0,                  # lastlogin (0 = никогда не заходил)
                0.0,                # x
                0.0,                # y
                0.0,                # z
                'world',            # world
                0.0,                # yaw
                0.0,                # pitch
                0,                  # isLogged
                0                   # hasSession
            )
        )
        
        print(f"User {username} created in AuthMe")
        return True
        
    except Exception as e:
        print(f"AuthMe error: {e}")
        return False
    finally:
        if connection:
            connection.close()


def check_authme_user_exists(username: str) -> bool:
    """Проверяет, существует ли пользователь в AuthMe"""
    connection = None
    try:
        connection = get_authme_connection()
        cursor = connection.cursor()
        
        cursor.execute(
            f"SELECT 1 FROM {settings.AUTHME_TABLE} WHERE username = %s",
            (username,)
        )
        return cursor.fetchone() is not None
        
    except Exception as e:
        print(f"AuthMe error: {e}")
        return False
    finally:
        if connection:
            connection.close()


def change_authme_password(username: str, new_password: str) -> bool:
    """Меняет пароль пользователя в AuthMe"""
    connection = None
    try:
        connection = get_authme_connection()
        cursor = connection.cursor()
        
        password_hash = generate_authme_hash(new_password)
        
        cursor.execute(
            f"UPDATE {settings.AUTHME_TABLE} SET password = %s WHERE username = %s",
            (password_hash, username)
        )
        
        return cursor.rowcount > 0
        
    except Exception as e:
        print(f"AuthMe error: {e}")
        return False
    finally:
        if connection:
            connection.close()