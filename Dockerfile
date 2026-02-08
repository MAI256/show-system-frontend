# Используем официальный образ Bun
FROM oven/bun:latest AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json bun.lock ./

# Устанавливаем зависимости
RUN bun install --frozen-lockfile

# Копируем остальные файлы проекта
COPY . .

# Строим приложение для production
RUN bun run build

# Экспонируем порт
EXPOSE 3000

# Устанавливаем переменные окружения
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

CMD ["bun", ".output/server/index.mjs"]
