<template>
  <main class="error-page">
    <TheFractalBackground />

    <div class="error-content">
      <h1>{{ error?.statusCode || 500 }}</h1>
      <p class="error-message">{{ errorMessage }}</p>

      <div class="error-actions">
        <NuxtLink v-if="is404" to="/" class="button">
          На главную
        </NuxtLink>
        <button v-else @click="handleRetry" class="button">
          Попробовать снова
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const props = defineProps({
  error: Object as any,
});

const is404 = computed(() => props.error?.statusCode === 404);

const errorMessage = computed(() => {
  if (is404.value) return "Страница не найдена";
  return "Произошла ошибка. Попробуйте обновить страницу.";
});

const handleRetry = () => {
  clearError({ redirect: "/" });
};
</script>

<style scoped lang="postcss">
@import url(~/assets/css/_variables.css);

.error-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-bg, #010101);
  overflow: hidden;
}

.error-page :deep(.fractal-background) {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.error-content {
  z-index: 10;
  text-align: center;
  padding: 3rem;
  position: relative;

  h1 {
    font-family: "Unbounded", sans-serif;
    font-size: 8rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(255, 255, 255, 0.5) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .error-message {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2rem;
    font-family: "Geologica", sans-serif;
  }
}

.button {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Geologica", sans-serif;

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
}
</style>
