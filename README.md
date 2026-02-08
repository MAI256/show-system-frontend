# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Тестовый стейджинг

### Вариант 1: Vercel или Netlify (рекомендуется)

Удобнее всего для стейджинга: нет возни с baseURL, JS и стили работают из коробки, есть превью для каждого PR.

- **Vercel**: [vercel.com](https://vercel.com) → Import Git repository → Nuxt определяется автоматически. Пуш в `main` = прод, ветки = preview-URL.
- **Netlify**: [netlify.com](https://netlify.com) → Add new site → Import from Git. Build command: `npm run build`, Publish directory: `.output/public` (или укажите Nitro preset в `nuxt.config` для static).

Дополнительные конфиги не нужны.

### Вариант 2: GitHub Pages

Сайт деплоится workflow **Deploy to GitHub Pages** при пуше в `main`. Используется один workflow (`deploy-pages.yml`) с `nuxt build --preset github_pages` и корректным baseURL.

1. **Settings → Pages** → Source: **GitHub Actions**.
2. Сайт: `https://<user>.github.io/<repository>/`

Локальная проверка сборки под тот же baseURL:

```bash
NUXT_APP_BASE_URL=/имя-репозитория/ npm run build -- --preset github_pages
npx nuxi preview
```
