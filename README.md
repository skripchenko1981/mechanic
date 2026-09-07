# ПИВО МЕХАНІК

Full-stack основа цифрової платформи крафтової пивоварні: Next.js storefront, FastAPI REST API, PostgreSQL, Redis і Nginx.

## Запуск

1. Створіть `.env` на основі `.env.example` і замініть усі production-секрети.
2. Запустіть `docker compose up --build`.
3. Відкрийте `http://localhost:8081`, API-документацію — `http://localhost:8081/docs`.

Перед першим production-деплоєм обов'язково: налаштуйте TLS у Cloudflare/Nginx, S3 для медіа, резервні копії БД та реальний Telegram webhook.

## API

`/api/products`, `/api/categories`, `/api/wholesale/applications`, `/api/orders`, `/api/auth`, `/api/telegram/webhook/{bot_id}`. Swagger доступний за `/docs`.

## Структура

`frontend/` — Next.js 15 App Router, локалі та SEO; `backend/` — FastAPI service layer; `infra/` — reverse proxy. Дані демо створюються при старті backend.
