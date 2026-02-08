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

## GitHub Pages (стейджинг)

Сайт автоматически деплоится на GitHub Pages при пуше в ветку `main` или по ручному запуску workflow.

1. В репозитории: **Settings → Pages** выберите **Source**: "GitHub Actions".
2. После первого успешного деплоя сайт будет доступен по адресу:  
   `https://<user>.github.io/<repository>/`

Локальная сборка под тот же baseURL (для проверки):

```bash
NUXT_APP_BASE_URL=/имя-репозитория/ npm run build -- --preset github_pages
npx nuxi preview
```
