<template>
    <Transition name="loader">
        <div v-if="isVisible" class="loader">
            <img
                src="~/assets/img/brandmark.svg"
                alt="ShowSystem"
                class="logo"
            />
        </div>
    </Transition>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps<{
    show: boolean;
}>();

const isVisible = ref(props.show);

// Block scrolling when loader is visible
const blockScroll = () => {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${window.scrollY}px`;
};

const unblockScroll = () => {
    const scrollY = document.body.style.top;
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    document.body.style.top = "";

    if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
};

watch(
    () => props.show,
    (newVal) => {
        isVisible.value = newVal;

        if (newVal) {
            blockScroll();
        } else {
            unblockScroll();
        }
    },
);

onMounted(() => {
    if (props.show) {
        blockScroll();
    }
});

onUnmounted(() => {
    unblockScroll();
});
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

.loader-enter-active {
    transition: opacity 0.3s ease;
}

.loader-leave-active {
    transition: opacity 0.5s ease;
}

.loader-enter-from,
.loader-leave-to {
    opacity: 0;
}
</style>
