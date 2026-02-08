<template>
    <div
        v-if="show"
        class="card-copy scroll-active"
        :style="cardStyle"
        :class="{ 'is-hidden': !isInViewport }"
        ref="cardRef"
    >
        <div class="card-content">
            <!-- Изображение -->
            <img
                v-if="cardData.imageSrc"
                :src="cardData.imageSrc"
                alt="Card"
                class="card-image"
            />

            <!-- Fallback gradient если изображение не загрузилось -->
            <div v-else class="card-fallback" :style="fallbackGradient"></div>

            <!-- Внутренняя тень точно как в слайдере -->
            <div class="inner-shadow"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface CardData {
    imageIndex: number;
    imageSrc: string;
    rectWidth: string;
    rectHeight: string;
}

interface Props {
    show: boolean;
    cardData: CardData;
}

const props = withDefaults(defineProps<Props>(), {
    show: false,
    cardData: () => ({
        imageIndex: 0,
        imageSrc: "",
        rectWidth: "15rem",
        rectHeight: "20rem",
    }),
});

const cardRef = ref<HTMLElement>();

// Стили карточки
const cardStyle = computed(() => ({
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none" as const,
}));

// Fallback градиенты точно как в слайдере
const fallbackColors = [
    ["#ff6b6b", "#ee5a24"],
    ["#4ecdc4", "#26d0ce"],
    ["#45b7d1", "#3742fa"],
    ["#96ceb4", "#6c5ce7"],
    ["#ffeaa7", "#fdcb6e"],
    ["#fd79a8", "#e84393"],
    ["#a29bfe", "#74b9ff"],
];

const fallbackGradient = computed(() => {
    const colorPair =
        fallbackColors[props.cardData.imageIndex % fallbackColors.length];
    return {
        background: `linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})`,
    };
});
</script>

<style lang="postcss" scoped>
.card-copy {
    width: 9vw;
    aspect-ratio: 8 / 10.75;

    z-index: 5;

    perspective: 1000px;
}

.card-content {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 1.25rem; /* 20px - точно как в слайдера */
    overflow: hidden;
    /* Внешняя тень */
    box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.15),
        0 1px 3px rgba(0, 0, 0, 0.1);

    transition: transform 0.3s ease;
}

.card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.card-fallback {
    width: 100%;
    height: 100%;
}

/* Внутренняя тень точно как в слайдере */
.inner-shadow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at center,
        transparent 0%,
        transparent 70%,
        rgba(0, 0, 0, 0.2) 100%
    );
    pointer-events: none;
}
</style>
