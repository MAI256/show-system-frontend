<template>
    <div class="fractal-background" :style="animatedStyle">
        <!-- Динамический цветной фон -->
        <div class="color-layer"></div>

        <!-- Растровая картинка из запечённого SVG -->
        <img
            v-if="rasterImageUrl"
            :src="rasterImageUrl"
            class="overlay"
            alt=""
            aria-hidden="true"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

interface FractalBackgroundProps {
    animationDuration?: number;
}

const props = withDefaults(defineProps<FractalBackgroundProps>(), {
    animationDuration: 600,
});

const emit = defineEmits<{
    mounted: [];
    rasterReady: [];
}>();

const isMobile = ref(false);
const rasterImageUrl = ref<string | null>(null);

// Mobile detection
const checkMobile = () => {
    const rootStyles = getComputedStyle(document.documentElement);
    const mobileBreakpoint =
        rootStyles.getPropertyValue("--mobile") || "1100px";
    const breakpoint = parseInt(mobileBreakpoint.replace("px", ""));
    isMobile.value = window.innerWidth <= breakpoint;
};

// Получаем путь к SVG
const getSvgPath = () =>
    isMobile.value ? "/fractal-mobile.svg" : "/fractal-desktop.svg";

// Запекаем SVG в растр и получаем data URL
const bakeSvgToRaster = async () => {
    try {
        const response = await fetch(getSvgPath());
        const svgText = await response.text();

        // Парсим SVG, чтобы получить размеры
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.documentElement;

        const width = parseFloat(svg.getAttribute("width") || "1440");
        const height = parseFloat(svg.getAttribute("height") || "1600");

        // Создаём скрытый canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Рендерим SVG в canvas
        const img = new Image();
        const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // Получаем data URL и сохраняем
            rasterImageUrl.value = canvas.toDataURL("image/png");

            URL.revokeObjectURL(url);
            emit("mounted");
            emit("rasterReady");
        };

        img.onerror = () => {
            console.error("Failed to load SVG for baking");
            URL.revokeObjectURL(url);
        };

        img.src = url;
    } catch (error) {
        console.error("Error baking SVG to raster:", error);
    }
};

onMounted(() => {
    checkMobile();
    window.addEventListener("resize", () => {
        checkMobile();
        bakeSvgToRaster();
    });
    bakeSvgToRaster();
});

onUnmounted(() => {
    window.removeEventListener("resize", checkMobile);
    rasterImageUrl.value = null;
});

const animatedStyle = computed(() => ({
    "--animation-duration": `${props.animationDuration}ms`,
}));
</script>

<style scoped>
.fractal-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
}

.color-layer {
    position: absolute;
    top: 2px;
    left: 0;
    right: 0;
    height: calc(100% - 4px);
    background-color: var(--slide-color);
    transition: background-color var(--animation-duration)
        cubic-bezier(0.4, 0, 0.2, 1);
    z-index: -1;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    display: block;
    z-index: 2;
    pointer-events: none;
}
</style>
