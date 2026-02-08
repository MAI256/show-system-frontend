<template>
    <div v-if="isVisible" class="loader" :class="{ 'loader-hide': isHiding }">
        <img src="~/assets/img/brandmark.svg" alt="ShowSystem" class="logo" />
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

const props = defineProps<{
    show: boolean;
}>();

const isVisible = ref(true);
const isHiding = ref(false);

watch(
    () => props.show,
    (newVal) => {
        if (!newVal) {
            // When show becomes false, start fade-out animation
            isHiding.value = true;
            // Remove from DOM after animation completes
            setTimeout(() => {
                isVisible.value = false;
            }, 500); // Match CSS transition duration
        } else {
            // When show becomes true, show again
            isHiding.value = false;
            isVisible.value = true;
        }
    },
);
</script>

<style lang="postcss" scoped>
.loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    pointer-events: all;
    opacity: 1;
    transition: opacity 0.5s ease;
}

.loader.loader-hide {
    opacity: 0;
    pointer-events: none;
}

.logo {
    width: 3vw;
    min-width: 35px;
    max-width: 60px;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 0.6;
        transform: scale(1);
    }
    50% {
        opacity: 1;
        transform: scale(1.05);
    }
}
</style>
