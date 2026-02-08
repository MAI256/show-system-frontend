<template>
  <div class="mobile-menu-button" @click="emit('click')">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 12H21M3 6H21M3 18H21"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span>Меню</span>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<style lang="postcss" scoped>
@import url(~/assets/css/_variables.css);

.mobile-menu-button {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);

  display: none;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;

  @mixin text-regular-medium;
  color: rgba(255, 255, 255, 0.7);

  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2rem;

  cursor: pointer;
  z-index: 998;

  transition: all 0.3s ease;

  @media screen and (max-width: $mobile) {
    display: flex;
  }

  &:active {
    background: rgba(255, 255, 255, 0.08);
    color: $white;
    transform: translateX(-50%) scale(0.95);
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  span {
    font-weight: 400;
  }
}
</style>
