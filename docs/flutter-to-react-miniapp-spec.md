# TЗ: перенос `topone-mobile` в `topone-miniapp-react`

## 1. Цель

Перенести весь продуктовый функционал, бизнес-логику, API-интеграции и основные UX-сценарии из Flutter-приложения `topone-mobile` в `topone-miniapp-react` как mobile-first Telegram Web App.

Итоговая React-версия должна:

- повторять логику Flutter-приложения без функциональных потерь;
- использовать тот же backend и те же расчеты/состояния прогресса;
- поддерживать Telegram login, Telegram Mini App init, подписки и оплаты;
- иметь более сильный визуальный уровень: black/gold по умолчанию, white/gold как альтернативная тема;
- строиться на переиспользуемых компонентах без поломки текущей feature-first структуры;
- быть оптимизированной для мобильных экранов и иметь economy mode для слабых устройств.

## 2. Что было изучено

### Исходники

- `topone-mobile`
- `topone-backend`
- `topone-bot`
- `topone-miniapp-react`

### Что подтверждено по коду

- Flutter-приложение покрывает auth, home, courses, lessons, challenges, quizzes, resources, achievements, leaderboard, referrals, notifications, profile, settings, payments, subscriptions, chat, mini apps, transactions, feedback и ряд демо-модулей.
- Backend уже содержит большую часть нужных API (`v1` и `v2`), включая auth, phone login, password flows, statistics, notifications, achievements, referrals, challenges, lessons, quizzes, payments, subscriptions и chat token.
- Telegram bot участвует в phone login, password reset/set-password confirm и invoice payment flows.
- Текущий React miniapp покрывает только seed-модули: `auth`, `home`, `courses`, `profile`, `mini-apps`. Остальные страницы пока представлены заглушками.

## 3. Текущее состояние `topone-miniapp-react`
 - есть просто нужная структура

- список placeholder routes для большинства Flutter-экранов.

### Основной gap

- нет полноценного дизайн-сета под mobile premium UI;
- нет паритета по маршрутам, данным и сценариям;
- в API-слое React описана только малая часть endpoint-ов;
- нет полноценных модулей:
  - `settings`
  - `notifications`
  - `leaderboard`
  - `payment`
  - `referrals`
  - `chat`
  - `lessons`
  - `quiz`
  - `subscription`
  - `transactions`
  - `achievements`
  - `resources`
  - `challenges`
  - `account`
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/telegram/init`
  - `/home`
  - `/courses`
  - `/courses/:courseId`
  - `/profile`
  - `/mini-apps`
  - `/mini-apps/:slug`

## 4. Ключевые продуктовые требования

### 4.1 Общие

- Полный функциональный паритет с Flutter.
- Мобильный приоритет: ширина 360-430 px как основной сценарий.
- Telegram Web App должен быть first-class runtime, а не второстепенной оболочкой.
- Все важные сценарии должны иметь loading, empty, error, retry, locked, success states.
- Навигация и CTA должны быть удобны одной рукой.

### 4.2 Дизайн

- Тема по умолчанию: `dark black + gold`.
- Альтернативная тема: `light white + gold`.
- Много blur/liquid-glass элементов, но без деградации FPS.
- Визуальный язык:
  - глубокий черный фон;
  - теплые золотые акценты;
  - крупные стеклянные карточки;
  - подсветка и glow только по делу;
  - soft gradients вместо плоских фонов;
  - большие touch targets;
  - фиксированные bottom bars и floating actions.

### 4.3 Производительность

- Нельзя делать постоянный тяжелый blur на всех слоях одновременно.
- Нужен `economy mode`, отключающий:
  - тяжелые backdrop blur;
  - многослойные тени;
  - сложные анимации;
  - лишние параллаксы и shimmer-эффекты.
- Нужно использовать lazy loading по маршрутам и тяжелым модулям.

## 5. Backend и интеграции, которые обязательно сохранить

### 5.1 Auth и Telegram

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/register/telegram`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/telegram/auth/telegram`
- `POST /api/v2/auth/request-login`
- `POST /api/v2/auth/verify`
- `POST /api/v2/auth/telegram-confirm`
- `POST /api/v2/auth/password-reset-confirm`
- `POST /api/v2/auth/set-password-confirm`

### 5.2 Password management

- `POST /api/v2/auth/forgot-password`
- `POST /api/v2/auth/reset-password`
- `POST /api/v2/auth/request-set-password`
- `POST /api/v2/auth/set-password`
- `POST /api/v2/auth/set-password-simple`
- `POST /api/v2/auth/change-password`

### 5.3 Courses / lessons / quiz

- `GET /api/v1/courses/categories`
- `GET /api/v1/courses/`
- `GET /api/v1/courses/{id}`
- `GET /api/v1/courses/{id}/stats`
- `GET /api/v1/courses/stats`
- `GET /api/v1/lessons/by_course/{courseId}`
- `GET /api/v1/lessons/{lessonId}`
- `GET /api/v1/lessons/by_course/{courseId}/progress-stats`
- `GET /api/v1/lessons/{lessonId}/navigation`
- lesson progress CRUD/complete
- lesson quiz endpoints
- quiz attempts start/submit/complete/history/detail

### 5.4 Challenges

- `GET /api/v1/challenges/`
- `GET /api/v1/challenges/stats`
- `GET /api/v1/challenges/{id}`
- `GET /api/v1/challenges/{id}/stats`
- `GET /api/v1/challenges/categories`
- `GET /api/v1/challenges/by_course/{courseId}`
- challenge progress CRUD
- `GET /api/v1/challenges/{id}/subchallenges`

### 5.5 Resources / content

- `GET /api/v1/additional_resources/categories`
- `GET /api/v1/additional_resources/`
- `GET /api/v1/additional_resources/{id}`
- `GET /api/v1/announcements/`

### 5.6 Gamification / profile / levels

- `GET /api/v2/statistics/my-statistics/`
- `GET /api/v1/statistics/my-ranking`
- `GET /api/v2/statistics/leaderboard/xp`
- `GET /api/v2/statistics/leaderboard/coins`
- `GET /api/v2/statistics/leaderboard/referrals`
- `GET /api/v2/statistics/my-position/xp`
- `GET /api/v2/statistics/my-position/referrals`
- `GET /api/v1/levels`
- `GET /api/v1/levels/{id}`
- `GET /api/v1/levels/leaderboard`
- `GET /api/v2/gamification/state/streaks/{activityType}`
- `GET /api/v2/gamification/transactions/*`

### 5.7 Achievements

- `GET /api/v1/achievements/catalog`
- `GET /api/v1/achievements/my`
- `GET /api/v1/achievements/my/earned`
- `GET /api/v1/achievements/{id}/progress`
- `POST /api/v1/achievements/{id}/claim`
- `GET /api/v2/achievements/`
- `GET /api/v2/achievements/user`

### 5.8 Referrals

- referral levels/history/my-stats/leaderboard
- checkout referral CRUD
- pay/extend subscription from referral earnings

### 5.9 Notifications

- `GET /api/v2/notifications/`
- unread count
- mark as read
- mark all as read
- delete
- websocket: `/api/v2/ws/notifications`
- user notification settings/devices routes

### 5.10 Payment / subscription

- `GET /api/v1/payment/plans/active`
- `POST /api/v1/payment/plans/{plan_id}/subscribe`
- `POST /api/v1/payment/invoices?plan_id=...`
- `GET /api/v1/payment/invoices/{invoice_id}/links`
- `GET /api/v1/payment/invoices/{invoice_id}/status`
- `GET /api/v1/payment/subscriptions/`
- `GET /api/v1/payment/subscriptions/history`
- `POST /api/v1/payment/subscriptions/pay-from-referral-earnings`
- `POST /api/v1/payment/subscriptions/extend-from-referral-earnings`

### 5.11 Chat

- `POST /api/v1/chat/token`
- дальше прямое подключение к GetStream Chat

### 5.12 Bot-зависимые сценарии

Из `topone-bot` нужно сохранить интеграции:

- phone login через Telegram bot и confirm token;
- password reset confirm через Telegram bot;
- set password confirm через Telegram bot;
- invoice payment links;
- support payment methods: `Click`, `Payme`, `Tribute`.

## 6. Полная карта экранов для переноса

| Модуль | Экран / flow | Что должно быть в React |
| --- | --- | --- |
| Splash | splash | bootstrap app, refresh session, preload profile/subscription, redirect |
| Auth | login choice / login form / register | username+password, telegram login, register, validation |
| Auth | telegram login / code verify / telegram init | phone -> bot confirm -> verify -> session |
| Auth | forgot password / reset password / set password | все password flows из Flutter и bot confirm |
| Home | main dashboard | announcements, mini apps, recommended courses, active challenges, timer |
| Courses | course catalog | category tabs, permission locks, progress stats |
| Lessons | lessons list | lessons by selected course, progress summary, locked/open states |
| Lesson details | lesson detail | video, tabs details/resources/quizzes, XP/coins, complete flow |
| Quiz | quiz detail / take / result / history / attempt details | полный quiz lifecycle |
| Challenges | daily/weekly/monthly list | stats cards, timer, tabs, locked/pro states |
| Challenge details | challenge detail | description, reward, how-to, subchallenges, submit result |
| Resources | resources catalog | featured carousel, tabs by category, locked states |
| Profile | profile overview | stats, badges, subscription shortcut, achievements preview |
| Account | account edit | email/username/name/phone, password section, save |
| Settings | settings | language, notification prefs, dark theme, economy mode, app info, legal, logout |
| Notifications | inbox | filters, unread count, mark read/all, delete, pagination |
| Leaderboard | XP / referral leaderboard | podium, user position, list, tabs |
| Achievements | catalog + earned | progress, claim, locked/unlocked states |
| Levels / statistics | level and ranking views | progress and rank visualization |
| Referrals | partner / withdrawal | referral code, stats, levels, history, payout/plan payment |
| Transactions | XP / coins / generic history | segmented list and pagination |
| Subscription | premium screen | plan carousel, features, statuses, locked access prompts |
| Payment | methods / waiting / result | invoice create, provider links, poll result, success/fail |
| Chat | chat list / channel / info | GetStream token init and mobile chat UI |
| Feedback | feedback form | submit product feedback |
| Mini Apps | catalog / host | list, host iframe/web bundle, JS bridge |
| WebView | generic external page | terms/privacy/payment docs |
| Marketplace | demo marketplace | локальный модуль, если остается в продукте |
| Room | virtual room demo | локальный room demo, если остается в продукте |

## 7. Обязательная маршрутизация

Нужно сохранить совместимость с Flutter route naming, потому что это упрощает миграцию, deep link mapping и QA. Канонические web paths можно улучшить позже, но на этапе переноса обязательны:

- `/`
- `/splash`
- `/login`
- `/login-form`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/set-password`
- `/telegram-login`
- `/telegram-code-verification`
- `/telegram/init`
- `/telegram-webapp-init`
- `/home`
- `/courses`
- `/lessons`
- `/lesson-details`
- `/challenges`
- `/challenge-detail`
- `/resources`
- `/profile`
- `/account`
- `/settings`
- `/notifications`
- `/leaderboard`
- `/achievements`
- `/referrals`
- `/premium-subscription`
- `/subscription-history`
- `/transactions`
- `/transactions/xp`
- `/transactions/coins`
- `/payment-methods`
- `/payment-waiting`
- `/payment-result`
- `/stream-chat-list`
- `/stream-chat-channel`
- `/stream-chat-channel-info`
- `/feedback`
- `/mini-apps`
- `/mini-app-host`
- `/webview`

### Требование

- Текущие placeholder pages должны быть заменены реальными feature pages, а не обернуты сверху временными моками.

## 8. Функциональная декомпозиция по React-архитектуре

### 8.1 Shared

В `shared/` должны жить только инфраструктурные вещи:

- API client
- query keys
- route helpers
- Telegram WebApp adapter
- theme tokens
- animation presets
- performance/economy helpers
- date/number/price formatters
- generic UI primitives

### 8.2 Entities

Нужны entity-модели минимум для:

- user
- subscription
- permission
- course
- lesson
- challenge
- challenge progress
- quiz
- quiz attempt
- resource
- achievement
- leaderboard entry
- referral stats
- transaction
- notification
- payment plan
- invoice
- mini app
- chat channel

### 8.3 Features

Отдельные feature folders:

- `auth`
- `telegram-auth`
- `home`
- `courses`
- `lessons`
- `quiz`
- `challenges`
- `resources`
- `profile`
- `account`
- `settings`
- `notifications`
- `leaderboard`
- `achievements`
- `referrals`
- `transactions`
- `payment`
- `subscription`
- `chat`
- `feedback`
- `mini-apps`
- `webview`

### 8.4 Widgets

Переиспользуемые составные блоки:

- top action cluster with coins/stars/notifications/settings
- mobile page header with title/subtitle
- bottom navigation
- sticky bottom CTA bar
- featured carousel
- hero promo card
- stat cards row
- segmented tab bar
- course card
- lesson card/list item
- challenge card
- challenge timer block
- podium leaderboard
- payment method list
- profile header
- settings sections
- notification list
- empty/error/retry blocks

## 9. Дизайн-система, которую нужно собрать до массовой верстки

### 9.1 Theme tokens

Обязательные CSS variables/tokens:

- background:
  - `--bg-base`
  - `--bg-elevated`
  - `--bg-surface`
- glass:
  - `--glass-fill`
  - `--glass-stroke`
  - `--glass-blur`
- accent:
  - `--accent-gold`
  - `--accent-gold-strong`
  - `--accent-green`
  - `--accent-red`
  - `--accent-blue`
- text:
  - `--text-primary`
  - `--text-secondary`
  - `--text-muted`
- shadows/glow:
  - `--shadow-soft`
  - `--shadow-gold`

### 9.2 Обязательные базовые UI primitives

- `MobileScreen`
- `PageHeader`
- `GlassPanel`
- `GlassCard`
- `GlassButton`
- `IconBadge`
- `StatCard`
- `SegmentedTabs`
- `ListTileCard`
- `SectionTitle`
- `BottomDock`
- `FloatingCircleButton`
- `SheetModal`
- `ConfirmDialog`
- `FormField`
- `OtpInput`
- `ProgressBar`
- `StatusChip`
- `SkeletonBlock`
- `EmptyState`
- `ErrorState`

### 9.3 Motion

- page enter reveal;
- staggered section appearance;
- bottom bar soft slide;
- modal blur/fade;
- no excessive spring animations on every list item.

### 9.4 Economy mode

При включении economy mode:

- blur уменьшается или заменяется полупрозрачным fill;
- отключаются тяжелые backdrop filters;
- анимации сокращаются;
- shimmer заменяется статичным skeleton;
- фоновые glow-слои урезаются.

## 10. Детальные требования по ключевым модулям

### 10.1 Auth

Нужно реализовать:

- login screen;
- register screen;
- telegram login screen;
- telegram code verification;
- forgot password;
- reset password;
- set password;
- change password;
- Telegram Mini App auto-auth через `initData`;
- refresh token;
- bootstrap current user;
- logout;
- permissions fetch;
- subscription refresh после login/payment.

### Acceptance

- все auth flows работают как в Flutter;
- form validation соответствует backend contract;
- после успешного login открывается актуальный root flow;
- после telegram/bot confirm пользователь получает полноценную сессию.

### 10.2 Home

Собрать как composable mobile dashboard:

- header area;
- announcements carousel;
- mini apps shortcut;
- recommended courses;
- active challenges;
- timer block;
- CTA на все курсы и все challenges.

Home не должен быть монолитной страницей. Каждая секция должна быть отдельным widget + data hook.

### 10.3 Courses / lessons / quiz

Нужно перенести:

- categories;
- course list;
- progress stats;
- course detail summary;
- lessons list;
- lesson navigation;
- lesson details tabs:
  - details
  - resources
  - quizzes
- Mux video playback;
- lesson complete flow;
- quizzes:
  - details
  - start attempt
  - submit
  - result
  - history
  - attempt details

### 10.4 Challenges

Нужно сохранить:

- daily/weekly/monthly tabs;
- stats summary:
  - total
  - active
  - completed
  - failed
- countdown timer;
- challenge detail;
- progress/subchallenge states;
- challenge completion submission с Telegram URL/report text;
- locked/pro access rules.

### 10.5 Profile / account / settings

### Profile

- avatar/initials;
- membership badges;
- coin/star/streak stats;
- achievements preview;
- subscription CTA.

### Account

- editable personal fields;
- change-password / set-password block;
- save only on dirty state;
- success/error feedback.

### Settings

- language switch;
- notifications;
- dark mode;
- economy mode;
- app version;
- legal pages;
- logout.

### 10.6 Notifications

Нужно реализовать:

- inbox list;
- unread badge count;
- mark one as read;
- mark all as read;
- delete notification;
- real-time updates по websocket;
- optimistic UI там, где это уже делал Flutter.

### 10.7 Leaderboard / achievements / referrals / transactions

### Leaderboard

- XP tab;
- referral tab;
- podium;
- current user position;
- list with pagination/loading states.

### Achievements

- catalog;
- earned list;
- progress bars;
- claim action;
- reward feedback.

### Referrals

- referral code;
- my stats;
- levels;
- history;
- leaderboard;
- withdrawal/request block;
- pay subscription from referral balance;
- extend subscription from referral balance.

### Transactions

- generic history;
- XP history;
- coins history;
- infinite scroll/pagination.

### 10.8 Payment / subscription

Нужно повторить весь flow:

- premium plans screen;
- plan details;
- payment methods select;
- invoice create;
- open provider link;
- waiting screen with polling/check button;
- payment result screen;
- subscription history;
- latest subscription summary;
- lock/unlock UI по permissions/subscription.

### Payment providers

- Click
- Payme
- Tribute

### Важное требование

После успешной оплаты UI должен гарантированно:

- обновить subscription state;
- обновить permissions;
- снять locked states со всех premium-модулей;
- корректно обработать возврат из внешней платежной страницы.

### 10.9 Chat

Так как backend ушел в GetStream, React-реализация должна:

- получать token через `POST /api/v1/chat/token`;
- инициализировать Stream client;
- поддерживать channel list;
- поддерживать channel screen;
- поддерживать channel info;
- быть стилистически встроенной в общий dark/gold UI.

### 10.10 Mini Apps

В mobile mini apps сейчас частично hardcoded и грузятся как local HTML bundle.

Для React нужно:

- сохранить каталог;
- сделать host screen;
- определить формат запуска:
  - `iframe URL`
  - локальная public bundle
  - отдельный route-host
- перенести JS bridge contract, если мини-приложения должны вызывать native/web actions.

### 10.11 Marketplace и Room

По изученному коду:

- `marketplace` в Flutter сейчас локальный демо-модуль с hardcoded products;
- `room` тоже демо-модуль без реального backend room orchestration.

### Решение для ТЗ

- не выкидывать из scope без решения продукта;
- пометить как `Phase 8 / optional product confirmation`;
- если остаются, переносить как isolated feature modules без влияния на core app.

## 11. Обязательные backend-facing store/hook слои

Нужно завести отдельные hooks/services для:

- session bootstrap
- current user
- user permissions
- active subscription
- latest subscription
- notifications unread count
- global coins/stars counters
- course categories/list/detail/stats
- lessons list/detail/navigation/progress
- challenges list/detail/stats/progress
- resources categories/list/detail
- achievements catalog/my/earned/claim
- leaderboard xp/referral/my position
- referral stats/history/levels/checkout requests
- payment plans/invoices/status
- transactions
- quiz lifecycle
- chat token/client init

## 12. Навигация и layout rules

### Bottom navigation

Нужно собрать настоящий mobile dock, а не generic desktop-like nav.

Обязательные core tabs:

- `Asosiy`
- `Kurslar`
- `Chellenj`
- `Profil`
- `Chat` или floating chat FAB, в зависимости от текущего раздела

Для отдельных зон допускаются контекстные nav-конфигурации, как это было во Flutter.

### Header actions

Глобальный action cluster должен поддерживать:

- coins
- stars
- notifications
- settings

Этот блок должен быть единым reusable widget, а не копироваться по страницам.

## 13. I18n

Обязательные языки:

- Uzbek
- Russian

Требования:

- не захардкодить тексты в компоненты;
- переводы должны лежать в namespace-структуре по feature;
- названия экранов, CTA, ошибок и статусов полностью переносить в i18n.

## 14. Порядок реализации

### Phase 0. Foundation

- собрать design tokens;
- собрать mobile layout primitives;
- собрать glass component kit;
- обновить `globals.css` и theme architecture;
- подготовить responsive rules;
- добавить economy mode infrastructure.

### Phase 1. Session / auth / Telegram

- splash bootstrap;
- login/register;
- telegram login/code verify;
- telegram miniapp init auth;
- forgot/reset/set/change password;
- session refresh and logout.

### Phase 2. Global shell

- bottom dock;
- top action cluster;
- page header system;
- shared loading/empty/error components;
- theme switch + language switch.

### Phase 3. Home / profile / settings / notifications

- home;
- profile;
- account;
- settings;
- notifications;
- feedback.

### Phase 4. Courses / lessons / resources / quiz

- courses catalog;
- course detail;
- lessons;
- lesson detail;
- resources;
- quiz lifecycle.

### Phase 5. Challenges

- list by cadence;
- timer;
- detail;
- completion/submission flows;
- stats sync.

### Phase 6. Gamification

- leaderboard;
- achievements;
- levels/statistics;
- transactions;
- referrals.

### Phase 7. Subscription / payments

- plans;
- methods;
- invoice;
- waiting;
- result;
- history;
- locked-state refresh.

### Phase 8. Chat / mini apps / optional demos

- stream chat;
- mini apps host;
- marketplace;
- room;
- webview wrappers.

## 15. Acceptance criteria для всего проекта

- React miniapp повторяет основные бизнес-сценарии Flutter без функциональных провалов.
- Все ключевые API Flutter представлены в React API layer.
- UI соответствует dark/gold premium mobile direction.
- Светлая тема существует и визуально согласована.
- Все premium/permission gates работают корректно.
- Telegram auth и bot-driven flows работают end-to-end.
- Payment flows проходят полностью, включая возврат и обновление subscription state.
- Notifications и unread counters синхронизированы.
- Challenge, lesson, quiz, referral и leaderboard логика не расходится с backend.
- Код разбит на reusable components/features, а не собран в несколько больших файлов.
- На слабых устройствах приложение остается usable за счет economy mode.

## 16. Риски и открытые вопросы

### Подтвержденные риски

- В React сейчас отсутствует большая часть API-мэппинга, поэтому перенос надо начинать с data contract layer, а не с голой верстки.
- `marketplace` и `room` выглядят как демо-модули без реального backend parity.
- Mini apps в Flutter частично hardcoded, а не полностью backend-driven.
- Chat теперь зависит от GetStream, значит UI и инициализация должны строиться отдельно от legacy custom chat assumptions.

### Что нужно подтвердить перед реализацией

- финальный список premium plans и валют;
- актуальный дизайн для светлой темы;
- нужен ли полный перенос `marketplace` и `room` в production scope;
- формат хранения/отдачи мини-приложений в web;
- Mux credentials/player strategy для web;
- правила deep links из Telegram bot и сайта.

## 17. Итог

Это не задача "переверстать несколько страниц". Это полноценная миграция продукта из Flutter в React Mini App с сохранением:

- бизнес-логики;
- backend-контрактов;
- Telegram flows;
- платежных сценариев;
- gamification;
- premium gating;
- контентной структуры.

Реализация должна идти от foundation и data contract layer к feature parity, а не наоборот. Иначе получится красивая оболочка без реального совпадения с мобильным приложением.
