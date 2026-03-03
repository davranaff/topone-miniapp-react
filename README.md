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

## Seed Modules
- `auth`
- `home`
- `courses`
- `profile`
- `mini-apps`

## Future Modules
`notifications`, `payment`, `referrals`, `leaderboard`, `chat`, `settings` уже зарезервированы как feature folders и должны повторять ту же схему.
