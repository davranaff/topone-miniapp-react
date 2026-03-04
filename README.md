# TopOne React App

Feature-first `React + Vite + Tailwind` каркас для переноса `flutter-topsecret` в web и Telegram Mini App runtime.

## Stack
- `react`, `react-router-dom`
- `axios`
- `@tanstack/react-query`
- `zustand`
- `react-hook-form` + `zod`
- `i18next`
- `tailwindcss`
- `@radix-ui/react-*`

## Structure Rules
- `shared/` хранит только cross-cutting инфраструктуру.
- `entities/` описывает стабильные бизнес-модели и мапперы.
- `features/` владеют своими `api`, `hooks`, `components`, `pages`, `schemas`.
- `widgets/` собирают feature/entity-компоненты в reusable sections.
- Компоненты не импортируют `axios` напрямую.
- Server state хранится только в `react-query`.
- UI/session/runtime state хранится в `zustand`.

## Environment
Скопируйте `.env.example` в `.env` и заполните:

```bash
VITE_API_BASE_URL=https://api.top1secret.uz
VITE_APP_ENV=development
VITE_ENABLE_QUERY_DEVTOOLS=true
```

## Deploy (AWS Amplify)
Проект готов к deploy через [`amplify.yml`](./amplify.yml):
- build output: `dist`
- Node.js: `20`
- Vite env переменные формируются в preBuild (`.env`)

### Amplify Environment Variables
В Amplify Console задайте:
- `VITE_API_BASE_URL` (или `API_BASE_URL` как fallback)
- `VITE_APP_ENV` (`production`, `staging`, `development`, `local`)
- `VITE_TELEGRAM_BOT_NAME` (optional)
- `VITE_ENABLE_QUERY_DEVTOOLS` (`false` для prod)

### SPA Rewrite Rule (обязательно)
В Amplify Console -> App settings -> Rewrites and redirects добавьте правило:
- Source address: `</^[^.]+$|\\.(?!(css|gif|ico|jpg|jpeg|js|json|map|png|svg|txt|webp|woff2?)$)([^.]+$)/>`
- Target address: `/index.html`
- Type: `200 (Rewrite)`

Это нужно для корректной работы `react-router` при прямом открытии маршрутов (`/home`, `/courses/:id`, `/leaderboard` и т.д.).

## Seed Modules
- `auth`
- `home`
- `courses`
- `profile`
- `mini-apps`

## Future Modules
`notifications`, `payment`, `referrals`, `leaderboard`, `chat`, `settings` уже зарезервированы как feature folders и должны повторять ту же схему.
