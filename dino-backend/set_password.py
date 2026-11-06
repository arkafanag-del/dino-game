"""Управление паролями игроков.

Нужен для старых аккаунтов, созданных до появления аутентификации:
у них password_hash пустой, поэтому войти в игру они не могут.

Примеры:
    python set_password.py --list
    python set_password.py alice
    python set_password.py alice --force
    python set_password.py alice --stdin < password.txt

Пароль читается скрыто (getpass) или из stdin при --stdin.
"""

import argparse
import getpass
import sys
import time

import db
from main import PASSWORD_ITERATIONS, _hash_password

MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128


def _read_password(from_stdin: bool) -> str:
    if from_stdin:
        password = sys.stdin.readline().rstrip("\r\n")
        confirm = password
    else:
        password = getpass.getpass("Новый пароль: ")
        confirm = getpass.getpass("Повторите пароль: ")

    if password != confirm:
        raise SystemExit("Ошибка: пароли не совпадают")
    if len(password) < MIN_PASSWORD_LENGTH or len(password) > MAX_PASSWORD_LENGTH:
        raise SystemExit(
            f"Ошибка: пароль должен быть от {MIN_PASSWORD_LENGTH} "
            f"до {MAX_PASSWORD_LENGTH} символов"
        )
    return password


def _list_players() -> None:
    conn = db.get_db_connection()
    try:
        rows = conn.execute(
            "SELECT name, password_hash FROM players ORDER BY name"
        ).fetchall()
    finally:
        conn.close()

    if not rows:
        print("Игроков нет.")
        return

    print(f"Всего игроков: {len(rows)}")
    no_password = [row["name"] for row in rows if not row["password_hash"]]
    print(f"Без пароля (не могут войти): {len(no_password)}")
    for name in no_password:
        print(f"  - {name}")


def _set_password(name: str, password: str, force: bool) -> None:
    # Не обрезаем имя: иначе опечатка в длинном имени могла бы сменить
    # пароль другому игроку с совпадающим префиксом.
    clean_name = (name or "").strip()
    if not clean_name:
        raise SystemExit("Ошибка: пустое имя игрока")
    now = time.time()

    with db.transaction() as conn:
        row = conn.execute(
            "SELECT name, password_hash FROM players WHERE name = ?",
            (clean_name,),
        ).fetchone()
        if not row:
            raise SystemExit(f"Ошибка: игрок {clean_name!r} не найден")

        if row["password_hash"] and not force:
            raise SystemExit(
                f"Ошибка: у игрока {clean_name!r} уже есть пароль. "
                "Используйте --force, чтобы заменить его."
            )

        conn.execute(
            "UPDATE players SET password_hash = ?, updated_at = ? WHERE name = ?",
            (_hash_password(password), now, clean_name),
        )
        # Старые сессии должны перестать действовать после смены пароля.
        conn.execute("DELETE FROM sessions WHERE player_name = ?", (clean_name,))

    print(f"Готово: пароль для {clean_name!r} установлен.")
    print(f"PBKDF2 iterations: {PASSWORD_ITERATIONS}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Установка пароля игроку")
    parser.add_argument("name", nargs="?", help="имя игрока")
    parser.add_argument(
        "--force",
        action="store_true",
        help="заменить уже существующий пароль",
    )
    parser.add_argument(
        "--stdin",
        action="store_true",
        help="прочитать пароль из stdin (для автоматизации)",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="показать игроков без пароля",
    )
    args = parser.parse_args()

    db.init_db()

    if args.list:
        _list_players()
        return

    if not args.name:
        parser.error("укажите имя игрока или --list")

    password = _read_password(args.stdin)
    _set_password(args.name, password, args.force)


if __name__ == "__main__":
    main()
