<template>
    <div class="arc-slider-wrapper">
        <div class="arc-slider">
            <canvas ref="canvasRef" class="slider-canvas"></canvas>
        </div>

        <div
            v-if="tooltip.show"
            class="project-tooltip"
            :class="{ 'tooltip-visible': tooltip.visible }"
            :style="{
                transform: `translate(calc(${tooltip.x}px + ${tooltip.xOffset}px), calc(${tooltip.y}px - 125%))`,
            }"
        >
            {{ tooltip.text }}
        </div>
    </div>
</template>

<script lang="ts" setup>
interface ArcSliderProps {
    images: string[];
    projectNames?: string[];
    projectSlugs?: string[];
    modelValue?: number;
    autoScroll?: boolean;
    autoScrollSpeed?: number;
    rectWidth?: string;
    rectHeight?: string;
    arcRadius?: number;
    arcAngle?: number;
    arcDepth?: number;
    showOutline?: boolean;
}

// Определяем события которые компонент может эмитить
const emit = defineEmits<{
    "update:modelValue": [index: number];
    showCardCopy: [
        cardData: {
            imageIndex: number;
            imageSrc: string;
            rectWidth: string;
            rectHeight: string;
        },
    ];
    hideCardCopy: [];
    projectClick: [slug: string];
    ready: [];
}>();

const props = withDefaults(defineProps<ArcSliderProps>(), {
    projectNames: () => [],
    modelValue: 0,
    autoScroll: true,
    autoScrollSpeed: 3000,
    rectWidth: "15rem",
    rectHeight: "20rem",
    arcRadius: 800,
    arcAngle: 60,
    arcDepth: 0.3,
    showOutline: true,
});

const canvasRef = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D;
let canvasInfo = { width: 0, height: 0, dpr: 1 };
let animationFrameId: number;
let autoScrollInterval: ReturnType<typeof setInterval> | null = null;
let hoverResetTimeout: ReturnType<typeof setTimeout> | null = null;
let hoverAnimationFrameId: number | null = null;

const loadedImages = ref<HTMLImageElement[]>([]);
const imagesLoaded = ref(false);

const galleryState = ref({
    totalItems: props.images.length,
    visibleCount: 7,
    currentOffset: 0,
    targetOffset: 0,
    animationDuration: 500,
    isAnimating: false,
    startTime: 0,
    startOffset: 0,
    hoveredIndex: -1,
    previousHoveredIndex: -1,
    hoverAnimationProgress: 0,
    isHoverAnimating: false,
    hoverStartTime: 0,
    hoverAnimationDuration: 300,
    currentCenterIndex: 0,
    // Состояние анимации для каждого элемента
    elementStates: [] as Array<{
        currentBlur: number;
        currentDarken: number;
        targetBlur: number;
        targetDarken: number;
    }>,
});

// ====== CONSOLIDATED STATE (объединённое состояние) ======
const interactionState = reactive({
    // Scroll
    scrollTimeout: null as ReturnType<typeof setTimeout> | null,
    lastScrollTime: 0,
    scrollDebounceDelay: 300, // Время для предотвращения множественных переключений
    accumulatedDeltaX: 0,
    lastSwitchAccumulatedDeltaX: 0, // Сохраняем accumulated при последнем переключении
    lastScrollDirection: 0, // Направление последнего скролла (1 или -1)
    // Swipe
    swipeStartX: 0,
    swipeStartY: 0,
    isSwipeActive: false,
    lastSwipeTime: 0,
    swipeThreshold: 50,
    // Hover
    hoverDelayTimeout: null as ReturnType<typeof setTimeout> | null,
    hoverDelay: 200,
    lastMouseX: 0,
    lastMouseY: 0,
    // Slider state
    isSliderCenterInView: false,
    isCardCopyShown: false,
});

// Event handler declarations
let handleMouseMove: (e: MouseEvent) => void;
let handleMouseLeave: () => void;
let handleKeydown: (e: KeyboardEvent) => void;
let handleWheel: (e: WheelEvent) => void;
let handleTouchStart: (e: TouchEvent) => void;
let handleTouchMove: (e: TouchEvent) => void;
let handleTouchEnd: (e: TouchEvent) => void;
let handlePointerDown: (e: PointerEvent) => void;
let handlePointerMove: (e: PointerEvent) => void;
let handlePointerUp: (e: PointerEvent) => void;
let handleCanvasClick: (e: PointerEvent) => void;

// Resize cleanup
let resizeCleanup: (() => void) | null = null;

// Tooltip state
const tooltip = ref({
    show: false,
    visible: false,
    x: 0,
    y: 0,
    text: "",
    xOffset: 20,
});

// ====== COMPUTED PROPERTIES (кешированные вычисления) ======
const rectWidthPx = computed(() => convertToPixels(props.rectWidth));
const rectHeightPx = computed(() => convertToPixels(props.rectHeight));
const arcAngleRad = computed(() => (props.arcAngle * Math.PI) / 180);
const spacing = computed(() => 10);
const totalWidth = computed(
    () =>
        galleryState.value.visibleCount * rectWidthPx.value +
        (galleryState.value.visibleCount - 1) * spacing.value,
);
const startX = computed(() => (canvasInfo.width - totalWidth.value) / 2);
const baseY = computed(() => canvasInfo.height / 2 - rectHeightPx.value / 2);
const centerX = computed(() => canvasInfo.width / 2);
const centerY = computed(() => baseY.value);
const borderRadius = computed(() => convertToPixels("1.25rem"));

// Конвертация размеров в пиксели
function convertToPixels(value: string): number {
    if (value.includes("rem")) {
        const rootFontSize = parseFloat(
            getComputedStyle(document.documentElement).fontSize,
        );
        return parseFloat(value) * rootFontSize;
    }
    if (value.includes("px")) {
        return parseFloat(value);
    }
    return parseFloat(value) || 0;
}

// Функция позиционирования tooltip
function updateTooltipPosition(mouseX: number, mouseY: number) {
    if (!tooltip.value.show) return;

    // Примерная ширина tooltip
    const estimatedWidth = tooltip.value.text.length * 8 + 40;
    const viewportWidth = window.innerWidth;
    const offset = 15;

    // Определяем с какой стороны больше места
    const spaceRight = viewportWidth - mouseX;
    const spaceLeft = mouseX;

    let xOffset;
    if (spaceRight >= estimatedWidth + offset || spaceRight >= spaceLeft) {
        // Размещаем справа от курсора
        xOffset = offset;
    } else {
        // Размещаем слева от курсора
        xOffset = -estimatedWidth - offset;
    }

    tooltip.value.x = mouseX;
    tooltip.value.y = mouseY;
    tooltip.value.xOffset = xOffset;
}

// Настройка High DPI canvas
function setupHighDPICanvas(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;

    if (!parent) return { dpr: 1, width: 800, height: 600 };

    const rect = parent.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";

    ctx.scale(dpr, dpr);

    return { dpr, width: displayWidth, height: displayHeight };
}

// Загрузка изображений
async function loadImages() {
    const imagePromises = props.images.map((src) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load: ${src}`));
            img.src = src;
        });
    });

    try {
        loadedImages.value = await Promise.all(imagePromises);
        imagesLoaded.value = true;
    } catch (error) {
        console.warn("Some images failed to load:", error);
        imagesLoaded.value = false;
    }
}

// Получение точки на верхней дуге
function getTopArcPoint(
    x: number,
    arcRadius: number,
    arcAngle: number,
    centerX: number,
    centerY: number,
    arcDepth: number,
) {
    const dx = x - centerX;
    const maxDx = arcRadius * Math.sin(arcAngle / 2);

    if (Math.abs(dx) > maxDx) {
        return { x, y: centerY };
    }

    const t = dx / maxDx;
    const angle = t * (arcAngle / 2);
    const arcY = centerY - arcRadius + arcRadius * Math.cos(angle);
    const finalY = centerY + (arcY - centerY) * arcDepth;

    return { x, y: finalY };
}

// Получение точки на нижней дуге
function getBottomArcPoint(
    x: number,
    arcRadius: number,
    arcAngle: number,
    centerX: number,
    centerY: number,
    rectHeight: number,
    arcDepth: number,
) {
    const dx = x - centerX;
    const maxDx = arcRadius * Math.sin(arcAngle / 2);

    if (Math.abs(dx) > maxDx) {
        return { x, y: centerY + rectHeight };
    }

    const t = dx / maxDx;
    const angle = t * (arcAngle / 2);
    const arcY = centerY + rectHeight + arcRadius - arcRadius * Math.cos(angle);
    const baseY = centerY + rectHeight;
    const finalY = baseY + (arcY - baseY) * arcDepth;

    return { x, y: finalY };
}

// ====== HELPER: Получение всех 4 точек деформированного прямоугольника ======
function getDeformedRectPoints(
    x: number,
    width: number,
    height: number,
    arcRadius: number,
    arcAngle: number,
    centerX: number,
    centerY: number,
    arcDepth: number,
) {
    return {
        topLeft: getTopArcPoint(
            x,
            arcRadius,
            arcAngle,
            centerX,
            centerY,
            arcDepth,
        ),
        topRight: getTopArcPoint(
            x + width,
            arcRadius,
            arcAngle,
            centerX,
            centerY,
            arcDepth,
        ),
        bottomRight: getBottomArcPoint(
            x + width,
            arcRadius,
            arcAngle,
            centerX,
            centerY,
            height,
            arcDepth,
        ),
        bottomLeft: getBottomArcPoint(
            x,
            arcRadius,
            arcAngle,
            centerX,
            centerY,
            height,
            arcDepth,
        ),
    };
}

// Создание скругленного Path2D для деформированного прямоугольника
function drawRoundedPath(
    path: Path2D,
    topLeft: { x: number; y: number },
    topRight: { x: number; y: number },
    bottomRight: { x: number; y: number },
    bottomLeft: { x: number; y: number },
    radius: number,
) {
    // Вычисляем векторы сторон для правильного направления скруглений
    const topVec = { x: topRight.x - topLeft.x, y: topRight.y - topLeft.y };
    const rightVec = {
        x: bottomRight.x - topRight.x,
        y: bottomRight.y - topRight.y,
    };
    const bottomVec = {
        x: bottomLeft.x - bottomRight.x,
        y: bottomLeft.y - bottomRight.y,
    };
    const leftVec = {
        x: topLeft.x - bottomLeft.x,
        y: topLeft.y - bottomLeft.y,
    };

    // Нормализуем векторы
    const normalize = (v: { x: number; y: number }) => {
        const len = Math.sqrt(v.x * v.x + v.y * v.y);
        return { x: v.x / len, y: v.y / len };
    };

    const topDir = normalize(topVec);
    const rightDir = normalize(rightVec);
    const bottomDir = normalize(bottomVec);
    const leftDir = normalize(leftVec);

    // Вычисляем точки начала и конца каждой стороны с учетом радиуса
    const p1 = {
        x: topLeft.x + topDir.x * radius,
        y: topLeft.y + topDir.y * radius,
    };
    const p2 = {
        x: topRight.x - topDir.x * radius,
        y: topRight.y - topDir.y * radius,
    };
    const p3 = {
        x: topRight.x + rightDir.x * radius,
        y: topRight.y + rightDir.y * radius,
    };
    const p4 = {
        x: bottomRight.x - rightDir.x * radius,
        y: bottomRight.y - rightDir.y * radius,
    };
    const p5 = {
        x: bottomRight.x + bottomDir.x * radius,
        y: bottomRight.y + bottomDir.y * radius,
    };
    const p6 = {
        x: bottomLeft.x - bottomDir.x * radius,
        y: bottomLeft.y - bottomDir.y * radius,
    };
    const p7 = {
        x: bottomLeft.x + leftDir.x * radius,
        y: bottomLeft.y + leftDir.y * radius,
    };
    const p8 = {
        x: topLeft.x - leftDir.x * radius,
        y: topLeft.y - leftDir.y * radius,
    };

    // Строим путь
    path.moveTo(p1.x, p1.y);
    path.lineTo(p2.x, p2.y);
    path.quadraticCurveTo(topRight.x, topRight.y, p3.x, p3.y);
    path.lineTo(p4.x, p4.y);
    path.quadraticCurveTo(bottomRight.x, bottomRight.y, p5.x, p5.y);
    path.lineTo(p6.x, p6.y);
    path.quadraticCurveTo(bottomLeft.x, bottomLeft.y, p7.x, p7.y);
    path.lineTo(p8.x, p8.y);
    path.quadraticCurveTo(topLeft.x, topLeft.y, p1.x, p1.y);
    path.closePath();
}

// Отрисовка деформированного прямоугольника
function drawDeformedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    arcRadius: number,
    arcAngle: number,
    centerX: number,
    centerY: number,
    arcDepth: number,
    imageIndex: number,
    _isHovered: boolean = false,
    blurIntensity: number = 0,
    darkenIntensity: number = 0,
) {
    // Используем helper для получения всех 4 точек сразу
    const { topLeft, topRight, bottomRight, bottomLeft } =
        getDeformedRectPoints(
            x,
            width,
            height,
            arcRadius,
            arcAngle,
            centerX,
            centerY,
            arcDepth,
        );

    const minX = Math.min(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x);
    const maxX = Math.max(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x);
    const minY = Math.min(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y);
    const maxY = Math.max(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y);
    const deformedWidth = maxX - minX;
    const deformedHeight = maxY - minY;

    if (imagesLoaded.value && loadedImages.value[imageIndex]) {
        ctx.save();

        // Применяем blur эффект с анимацией
        if (blurIntensity > 0) {
            ctx.filter = `blur(${blurIntensity * 8}px)`;
        }

        // Используем Path2D для скругленного контура
        const path = new Path2D();
        drawRoundedPath(
            path,
            topLeft,
            topRight,
            bottomRight,
            bottomLeft,
            borderRadius.value,
        );
        ctx.clip(path);

        // Логика object-fit: cover для изображения
        const img = loadedImages.value[imageIndex];
        const imgAspect = img.width / img.height;
        const rectAspect = deformedWidth / deformedHeight;

        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > rectAspect) {
            // Изображение шире чем прямоугольник - обрезаем по ширине
            drawHeight = deformedHeight;
            drawWidth = deformedHeight * imgAspect;
            drawX = minX - (drawWidth - deformedWidth) / 2;
            drawY = minY;
        } else {
            // Изображение выше чем прямоугольник - обрезаем по высоте
            drawWidth = deformedWidth;
            drawHeight = deformedWidth / imgAspect;
            drawX = minX;
            drawY = minY - (drawHeight - deformedHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        ctx.restore();

        // Рисуем внутреннюю тень поверх изображения
        ctx.save();
        const shadowPath = new Path2D();
        drawRoundedPath(
            shadowPath,
            topLeft,
            topRight,
            bottomRight,
            bottomLeft,
            borderRadius.value,
        );

        // Создаем градиент для внутренней тени
        const gradient = ctx.createRadialGradient(
            (topLeft.x + topRight.x + bottomLeft.x + bottomRight.x) / 4, // центр X
            (topLeft.y + topRight.y + bottomLeft.y + bottomRight.y) / 4, // центр Y
            0,
            (topLeft.x + topRight.x + bottomLeft.x + bottomRight.x) / 4, // центр X
            (topLeft.y + topRight.y + bottomLeft.y + bottomRight.y) / 4, // центр Y
            Math.max(deformedWidth, deformedHeight) / 2,
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(0.7, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");

        ctx.fillStyle = gradient;
        ctx.fill(shadowPath);
        ctx.restore();

        // Добавляем затемнение с анимацией
        if (darkenIntensity > 0) {
            ctx.save();
            const darkenPath = new Path2D();
            drawRoundedPath(
                darkenPath,
                topLeft,
                topRight,
                bottomRight,
                bottomLeft,
                borderRadius.value,
            );
            ctx.fillStyle = `rgba(0, 0, 0, ${darkenIntensity * 0.5})`;
            ctx.fill(darkenPath);
            ctx.restore();
        }
    } else {
        // Fallback colors
        const colors = [
            ["#ff6b6b", "#ee5a24"],
            ["#4ecdc4", "#26d0ce"],
            ["#45b7d1", "#3742fa"],
            ["#96ceb4", "#6c5ce7"],
            ["#ffeaa7", "#fdcb6e"],
            ["#fd79a8", "#e84393"],
            ["#a29bfe", "#74b9ff"],
        ];

        const colorPair = colors[imageIndex % colors.length];
        if (colorPair && colorPair[0] && colorPair[1]) {
            const gradient = ctx.createLinearGradient(
                topLeft.x,
                topLeft.y,
                bottomRight.x,
                bottomRight.y,
            );
            gradient.addColorStop(0, colorPair[0]);
            gradient.addColorStop(1, colorPair[1]);

            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = "#ff6b6b";
        }

        const path = new Path2D();
        drawRoundedPath(
            path,
            topLeft,
            topRight,
            bottomRight,
            bottomLeft,
            borderRadius.value,
        );
        ctx.fill(path);
    }
}

// Интерполяция
function lerp(start: number, end: number, t: number) {
    return start + (end - start) * t;
}

// Easing функция
function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Анимация галереи
function animateGallery() {
    if (!galleryState.value.isAnimating) return;

    const elapsed = Date.now() - galleryState.value.startTime;
    const progress = Math.min(
        elapsed / galleryState.value.animationDuration,
        1,
    );
    const easedProgress = easeInOutCubic(progress);

    galleryState.value.currentOffset = lerp(
        galleryState.value.startOffset,
        galleryState.value.targetOffset,
        easedProgress,
    );

    drawSlider();

    if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateGallery);
    } else {
        galleryState.value.isAnimating = false;
        galleryState.value.currentOffset = galleryState.value.targetOffset; // Убедимся что offset точно равен target
    }
}

// Инициализация состояний элементов
function initializeElementStates() {
    galleryState.value.elementStates = [];
    for (let i = 0; i < galleryState.value.visibleCount + 1; i++) {
        // +1 для fractional элемента
        galleryState.value.elementStates.push({
            currentBlur: 0,
            currentDarken: 0,
            targetBlur: 0,
            targetDarken: 0,
        });
    }
}

// Обновление целевых состояний элементов
function updateTargetStates() {
    for (let i = 0; i < galleryState.value.elementStates.length; i++) {
        const isHovered = galleryState.value.hoveredIndex === i;
        const shouldHaveEffect =
            galleryState.value.hoveredIndex !== -1 && !isHovered;

        if (shouldHaveEffect) {
            galleryState.value.elementStates[i]!.targetBlur = 1;
            galleryState.value.elementStates[i]!.targetDarken = 1;
        } else {
            galleryState.value.elementStates[i]!.targetBlur = 0;
            galleryState.value.elementStates[i]!.targetDarken = 0;
        }
    }
}

// Анимация hover эффектов
function animateHoverEffects() {
    if (!galleryState.value.isHoverAnimating) return;

    // Обновляем текущие состояния каждого элемента
    let allElementsReachedTarget = true;

    for (let i = 0; i < galleryState.value.elementStates.length; i++) {
        const state = galleryState.value.elementStates[i]!;

        // Интерполируем к целевому состоянию с учетом скорости анимации
        const animationSpeed = 0.15; // Скорость анимации (чем больше, тем быстрее)

        const blurDiff = state.targetBlur - state.currentBlur;
        const darkenDiff = state.targetDarken - state.currentDarken;

        state.currentBlur += blurDiff * animationSpeed;
        state.currentDarken += darkenDiff * animationSpeed;

        // Проверяем, достиг ли элемент целевого состояния
        if (Math.abs(blurDiff) > 0.01 || Math.abs(darkenDiff) > 0.01) {
            allElementsReachedTarget = false;
        }
    }

    drawSlider();

    if (!allElementsReachedTarget) {
        hoverAnimationFrameId = requestAnimationFrame(animateHoverEffects);
    } else {
        galleryState.value.isHoverAnimating = false;
        hoverAnimationFrameId = null;

        // Устанавливаем финальные значения
        for (let i = 0; i < galleryState.value.elementStates.length; i++) {
            const state = galleryState.value.elementStates[i]!;
            state.currentBlur = state.targetBlur;
            state.currentDarken = state.targetDarken;
        }
    }
}

// Запуск hover анимации
function startHoverAnimation() {
    // Обновляем целевые состояния
    updateTargetStates();

    galleryState.value.hoverStartTime = Date.now();
    galleryState.value.isHoverAnimating = true;

    if (hoverAnimationFrameId) {
        cancelAnimationFrame(hoverAnimationFrameId);
    }

    hoverAnimationFrameId = requestAnimationFrame(animateHoverEffects);
}

// Переключение слайдера
function slideGallery(direction: number) {
    if (galleryState.value.isAnimating) return;

    const newOffset = galleryState.value.targetOffset + direction;

    // Сначала обновляем modelValue до начала анимации
    const newCenterIndex = calculateCenterIndexForOffset(newOffset);
    if (newCenterIndex !== galleryState.value.currentCenterIndex) {
        galleryState.value.currentCenterIndex = newCenterIndex;
        emit("update:modelValue", newCenterIndex);
    }

    // Затем запускаем анимацию
    galleryState.value.startOffset = galleryState.value.currentOffset;
    galleryState.value.targetOffset = newOffset;
    galleryState.value.startTime = Date.now();
    galleryState.value.isAnimating = true;

    animationFrameId = requestAnimationFrame(animateGallery);
}

// Создание clip-path для обертки
function createContainerClipPath() {
    // Используем computed свойства вместо пересчётов
    const rectWidth = rectWidthPx.value;
    const rectHeight = rectHeightPx.value;
    const arcRadius = props.arcRadius;
    const arcAngle = arcAngleRad.value;
    const arcDepth = props.arcDepth;

    const fractionalOffset = galleryState.value.currentOffset % 1;
    const allPoints: Array<{ x: number; y: number }> = [];

    // Собираем все точки в правильном порядке для замкнутого контура

    // 1. Верхние точки слева направо
    for (let i = 0; i < galleryState.value.visibleCount; i++) {
        const x =
            startX.value + (i - fractionalOffset) * (rectWidth + spacing.value);
        const points = getDeformedRectPoints(
            x,
            rectWidth,
            rectHeight,
            arcRadius,
            arcAngle,
            centerX.value,
            centerY.value,
            arcDepth,
        );

        if (i === 0) allPoints.push(points.topLeft); // Добавляем левую точку только для первого
        allPoints.push(points.topRight);
    }

    // 2. Нижние точки справа налево
    for (let i = galleryState.value.visibleCount - 1; i >= 0; i--) {
        const x =
            startX.value + (i - fractionalOffset) * (rectWidth + spacing.value);
        const points = getDeformedRectPoints(
            x,
            rectWidth,
            rectHeight,
            arcRadius,
            arcAngle,
            centerX.value,
            centerY.value,
            arcDepth,
        );

        if (i === galleryState.value.visibleCount - 1)
            allPoints.push(points.bottomRight); // Добавляем правую точку только для последнего
        allPoints.push(points.bottomLeft);
    }

    // Конвертируем в проценты для clip-path
    const toPercent = (val: number, isX: boolean) => {
        const max = isX ? canvasInfo.width : canvasInfo.height;
        return ((val / max) * 100).toFixed(2);
    };

    // Создаем замкнутый путь для clip-path
    const pathPoints = allPoints
        .map(
            (point) =>
                `${toPercent(point.x, true)}% ${toPercent(point.y, false)}%`,
        )
        .join(", ");

    return `polygon(${pathPoints})`;
}

// Обновление clip-path контейнера
function updateContainerClipPath() {
    const container = canvasRef.value?.parentElement;
    if (!container) return;

    const clipPath = createContainerClipPath();
    container.style.clipPath = clipPath;
}

// Вычисление индекса центрального элемента для текущего offset
function calculateCenterIndex(): number {
    return calculateCenterIndexForOffset(galleryState.value.currentOffset);
}

// Вычисление индекса центрального элемента для заданного offset
function calculateCenterIndexForOffset(offset: number): number {
    // Центральный элемент находится в середине видимых элементов
    const centerPosition = Math.floor(galleryState.value.visibleCount / 2);
    const centerIndex = Math.floor(offset) + centerPosition;

    // Нормализуем индекс с учетом цикличности
    return (
        ((centerIndex % galleryState.value.totalItems) +
            galleryState.value.totalItems) %
        galleryState.value.totalItems
    );
}

// Обновление и эмит центрального индекса (только для автоскролла)
function updateCenterIndex() {
    const newCenterIndex = calculateCenterIndex();

    if (newCenterIndex !== galleryState.value.currentCenterIndex) {
        galleryState.value.currentCenterIndex = newCenterIndex;
        emit("update:modelValue", newCenterIndex);
    }
}

// Отрисовка слайдера
function drawSlider() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasInfo.width, canvasInfo.height);

    // Используем computed свойства
    const rectWidth = rectWidthPx.value;
    const rectHeight = rectHeightPx.value;
    const arcRadius = props.arcRadius;
    const arcAngle = arcAngleRad.value;
    const arcDepth = props.arcDepth;

    // Обновляем центральный индекс только при автоскролле (не при пользовательских действиях)
    if (
        !galleryState.value.isAnimating ||
        galleryState.value.targetOffset === galleryState.value.currentOffset
    ) {
        updateCenterIndex();
    }

    for (let i = 0; i < galleryState.value.visibleCount; i++) {
        // Пропускаем отрисовку центрального элемента если показана его копия
        const centerIndex = Math.floor(galleryState.value.visibleCount / 2);
        if (interactionState.isCardCopyShown && i === centerIndex) {
            continue;
        }

        // Нормализуем currentOffset чтобы он всегда был положительным
        let normalizedOffset = galleryState.value.currentOffset;
        while (normalizedOffset < 0) {
            normalizedOffset += galleryState.value.totalItems;
        }

        const rawItemIndex = Math.floor(normalizedOffset) + i;
        const fractionalOffset = normalizedOffset % 1;
        const x =
            startX.value + (i - fractionalOffset) * (rectWidth + spacing.value);
        const y = baseY.value;

        const imageIndex = rawItemIndex % galleryState.value.totalItems;

        // Получаем текущие значения из состояния элемента
        const isHovered = galleryState.value.hoveredIndex === i;
        let blurIntensity = 0;
        let darkenIntensity = 0;

        if (i < galleryState.value.elementStates.length) {
            const elementState = galleryState.value.elementStates[i]!;
            blurIntensity = elementState.currentBlur;
            darkenIntensity = elementState.currentDarken;
        }

        drawDeformedRect(
            x,
            y,
            rectWidth,
            rectHeight,
            arcRadius,
            arcAngle,
            centerX.value,
            centerY.value,
            arcDepth,
            imageIndex,
            isHovered,
            blurIntensity,
            darkenIntensity,
        );

        if (fractionalOffset > 0) {
            const nextRawItemIndex = rawItemIndex + 1;
            const nextX =
                startX.value +
                (i + 1 - fractionalOffset) * (rectWidth + spacing.value);
            const nextImageIndex =
                nextRawItemIndex % galleryState.value.totalItems;

            // Получаем текущие значения для следующего элемента
            const nextIsHovered = galleryState.value.hoveredIndex === i + 1;
            let nextBlurIntensity = 0;
            let nextDarkenIntensity = 0;

            const nextElementIndex = i + 1;
            if (nextElementIndex < galleryState.value.elementStates.length) {
                const nextElementState =
                    galleryState.value.elementStates[nextElementIndex]!;
                nextBlurIntensity = nextElementState.currentBlur;
                nextDarkenIntensity = nextElementState.currentDarken;
            }

            drawDeformedRect(
                nextX,
                y,
                rectWidth,
                rectHeight,
                arcRadius,
                arcAngle,
                centerX.value,
                centerY.value,
                arcDepth,
                nextImageIndex,
                nextIsHovered,
                nextBlurIntensity,
                nextDarkenIntensity,
            );
        }
    }

    // Отрисовка контура для дебага (только один раз, не пересчитывается)
    // drawClipPathDebug();
}

// Автоскролл
function startAutoScroll() {
    if (!props.autoScroll || interactionState.isSliderCenterInView) return;

    // Убеждаемся что предыдущий интервал полностью уничтожен
    if (autoScrollInterval !== null) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }

    autoScrollInterval = setInterval(() => {
        slideGallery(1);
    }, props.autoScrollSpeed);
}

function stopAutoScroll() {
    if (autoScrollInterval !== null) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

// Проверка позиции центра слайдера относительно центра viewport
function checkSliderCenterPosition() {
    if (!canvasRef.value) return;

    const rect = canvasRef.value.getBoundingClientRect();
    const sliderCenterY = rect.top + rect.height / 2;
    const viewportCenterY = window.innerHeight / 2;

    // Проверяем, находится ли центр слайдера в центре viewport или выше
    const wasInView = interactionState.isSliderCenterInView;
    interactionState.isSliderCenterInView = sliderCenterY <= viewportCenterY;

    if (interactionState.isSliderCenterInView && !wasInView) {
        // Центр слайдера попал в центр viewport или выше - включаем hover для центрального элемента и отключаем ВСЕ взаимодействия
        enableCenterHoverEffect();
        stopAutoScroll();
        showCardCopy();
    } else if (!interactionState.isSliderCenterInView && wasInView) {
        // Центр слайдера ушел ниже центра viewport - отключаем hover и включаем автоскролл
        disableCenterHoverEffect();
        if (props.autoScroll) {
            startAutoScroll();
        }
    }
}

// Включение hover эффекта для центрального элемента
function enableCenterHoverEffect() {
    const centerIndex = Math.floor(galleryState.value.visibleCount / 2);

    if (galleryState.value.hoveredIndex !== centerIndex) {
        galleryState.value.previousHoveredIndex =
            galleryState.value.hoveredIndex;
        galleryState.value.hoveredIndex = centerIndex;

        // Эмитим индекс центрального элемента
        const itemIndex =
            Math.floor(galleryState.value.currentOffset) + centerIndex;
        const centerImageIndex =
            ((itemIndex % galleryState.value.totalItems) +
                galleryState.value.totalItems) %
            galleryState.value.totalItems;
        emit("update:modelValue", centerImageIndex);

        startHoverAnimation();
    }
}

// Отключение hover эффекта
function disableCenterHoverEffect() {
    if (galleryState.value.hoveredIndex !== -1) {
        // Скрываем копию карточки если она показана
        if (interactionState.isCardCopyShown) {
            hideCardCopy();
        }

        galleryState.value.previousHoveredIndex =
            galleryState.value.hoveredIndex;
        galleryState.value.hoveredIndex = -1;

        // Возвращаем индекс центрального элемента
        const centerIndex = calculateCenterIndex();
        emit("update:modelValue", centerIndex);

        startHoverAnimation();
    }
}

// Показ копии карточки
function showCardCopy() {
    if (interactionState.isCardCopyShown) return;

    // Принудительно скрываем tooltip при переходе к CardCopy
    tooltip.value.visible = false;
    setTimeout(() => {
        tooltip.value.show = false;
    }, 150);

    const centerIndex = Math.floor(galleryState.value.visibleCount / 2);
    const itemIndex =
        Math.floor(galleryState.value.currentOffset) + centerIndex;
    const imageIndex =
        ((itemIndex % galleryState.value.totalItems) +
            galleryState.value.totalItems) %
        galleryState.value.totalItems;

    const cardData = {
        imageIndex,
        imageSrc: props.images[imageIndex] || "",
        rectWidth: props.rectWidth,
        rectHeight: props.rectHeight,
    };

    interactionState.isCardCopyShown = true;
    emit("showCardCopy", cardData);

    // Перерисовываем слайдер чтобы скрыть центральный элемент
    drawSlider();
}

// Скрытие копии карточки
function hideCardCopy() {
    if (!interactionState.isCardCopyShown) return;

    interactionState.isCardCopyShown = false;
    emit("hideCardCopy");

    // Перерисовываем слайдер чтобы показать центральный элемент обратно
    drawSlider();
}

// Обновление tooltip на основе текущей позиции курсора
function updateTooltipForCurrentCursor() {
    // Проверяем что tooltip показан и у нас есть сохраненная позиция курсора
    if (
        !tooltip.value.show ||
        interactionState.lastMouseX < 0 ||
        interactionState.lastMouseY < 0
    ) {
        return;
    }

    // Проверяем, есть ли карточка под текущей позицией курсора
    const rectWidth = rectWidthPx.value;
    const rectHeight = rectHeightPx.value;
    const fractionalOffset = galleryState.value.currentOffset % 1;

    for (let i = 0; i < galleryState.value.visibleCount; i++) {
        const x =
            startX.value + (i - fractionalOffset) * (rectWidth + spacing.value);
        const y = baseY.value;

        // Проверяем, находится ли курсор над этой карточкой
        if (
            interactionState.lastMouseX >= x &&
            interactionState.lastMouseX <= x + rectWidth &&
            interactionState.lastMouseY >= y &&
            interactionState.lastMouseY <= y + rectHeight
        ) {
            // Вычисляем индекс изображения для этой карточки
            const itemIndex = Math.floor(galleryState.value.currentOffset) + i;
            const imageIndex =
                ((itemIndex % galleryState.value.totalItems) +
                    galleryState.value.totalItems) %
                galleryState.value.totalItems;

            // Обновляем текст tooltip
            const projectName = props.projectNames?.[imageIndex] || "";
            if (projectName && tooltip.value.text !== projectName) {
                tooltip.value.text = projectName;
            }

            // Останавливаем автоскролл если tooltip показан и курсор над карточкой
            stopAutoScroll();

            break;
        }
    }
}

// Обработчик scroll события
function handleScroll() {
    checkSliderCenterPosition();
}

// Обработка изменения размера
function handleResize() {
    if (!canvasRef.value) return;

    canvasInfo = setupHighDPICanvas(canvasRef.value);

    // Force redraw
    if (ctx) {
        ctx.clearRect(0, 0, canvasInfo.width, canvasInfo.height);
    }

    drawSlider();
    updateContainerClipPath();

    // Проверяем позицию после изменения размера
    checkSliderCenterPosition();
}

// Watcher для обновления tooltip при изменении offset
watch(
    () => galleryState.value.currentOffset,
    () => {
        updateTooltipForCurrentCursor();
    },
);

onMounted(async () => {
    if (!canvasRef.value) return;

    ctx = canvasRef.value.getContext("2d")!;
    canvasInfo = setupHighDPICanvas(canvasRef.value);

    // Инициализируем состояния элементов
    initializeElementStates();

    await loadImages();

    drawSlider();
    updateContainerClipPath();

    // Emit ready event so loader knows component is ready
    emit("ready");

    // Добавляем слушатель scroll события
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Проверяем начальную позицию
    checkSliderCenterPosition();

    if (props.autoScroll) {
        startAutoScroll();
    }

    // Debounce resize to avoid excessive redraws
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const debouncedResize = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResize();
            resizeTimeout = null;
        }, 100);
    };

    window.addEventListener("resize", debouncedResize);

    // Store cleanup function for onUnmounted
    resizeCleanup = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        window.removeEventListener("resize", debouncedResize);
    };

    // Mouse hover controls для определения наведения на прямоугольники
    let isHovering = false;

    handleMouseMove = (e: MouseEvent) => {
        // Если центр слайдера в центре viewport или показана CardCopy, игнорируем события мыши
        if (
            interactionState.isSliderCenterInView ||
            interactionState.isCardCopyShown
        )
            return;

        const rect = canvasRef.value!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Сохраняем последнюю позицию мыши
        interactionState.lastMouseX = mouseX;
        interactionState.lastMouseY = mouseY;

        // Проверяем, находится ли курсор над любым из видимых прямоугольников
        let hoveringOverRect = false;

        // Используем computed свойства
        const rectWidth = rectWidthPx.value;
        const rectHeight = rectHeightPx.value;
        const fractionalOffset = galleryState.value.currentOffset % 1;

        for (let i = 0; i < galleryState.value.visibleCount; i++) {
            const x =
                startX.value +
                (i - fractionalOffset) * (rectWidth + spacing.value);
            const y = baseY.value;

            // Простая прямоугольная область для проверки (без деформации для упрощения)
            if (
                mouseX >= x &&
                mouseX <= x + rectWidth &&
                mouseY >= y &&
                mouseY <= y + rectHeight
            ) {
                hoveringOverRect = true;

                // Обновляем позицию tooltip только если он уже показан
                if (galleryState.value.hoveredIndex === i) {
                    const globalX = e.clientX;
                    const globalY = e.clientY;

                    // Мгновенное обновление позиции как в референсе
                    updateTooltipPosition(globalX, globalY);
                }

                // Обновляем индекс наведения с задержкой только для первого hover
                if (
                    galleryState.value.hoveredIndex !== i &&
                    !interactionState.isSwipeActive
                ) {
                    // Если уже есть активный hover, меняем сразу без задержки
                    if (galleryState.value.hoveredIndex !== -1) {
                        galleryState.value.previousHoveredIndex =
                            galleryState.value.hoveredIndex;
                        galleryState.value.hoveredIndex = i;

                        // Эмитим индекс наведенного прямоугольника
                        const itemIndex =
                            Math.floor(galleryState.value.currentOffset) + i;
                        const hoveredImageIndex =
                            ((itemIndex % galleryState.value.totalItems) +
                                galleryState.value.totalItems) %
                            galleryState.value.totalItems;
                        emit("update:modelValue", hoveredImageIndex);

                        // Обновляем tooltip с новым текстом
                        const projectName =
                            props.projectNames?.[hoveredImageIndex] || "";
                        if (projectName) {
                            const globalX = e.clientX;
                            const globalY = e.clientY;

                            tooltip.value.show = true;
                            tooltip.value.text = projectName;
                            updateTooltipPosition(globalX, globalY);
                            // Показываем с небольшой задержкой для плавной анимации
                            setTimeout(() => {
                                tooltip.value.visible = true;
                            }, 10);
                        }

                        startHoverAnimation();

                        // Очищаем таймер сброса если он есть
                        if (hoverResetTimeout) {
                            clearTimeout(hoverResetTimeout);
                            hoverResetTimeout = null;
                        }
                    } else {
                        // Для первого hover используем задержку
                        // Очищаем предыдущий таймер задержки hover
                        if (interactionState.hoverDelayTimeout) {
                            clearTimeout(interactionState.hoverDelayTimeout);
                        }

                        // Устанавливаем задержку для hover эффекта
                        interactionState.hoverDelayTimeout = setTimeout(() => {
                            // Проверяем что свайп не активен и курсор все еще над элементом
                            if (
                                !interactionState.isSwipeActive &&
                                canvasRef.value
                            ) {
                                // Используем последнюю сохраненную позицию мыши
                                const currentMouseX =
                                    interactionState.lastMouseX;
                                const currentMouseY =
                                    interactionState.lastMouseY;

                                // Используем computed свойства
                                const currentRectWidth = rectWidthPx.value;
                                const currentRectHeight = rectHeightPx.value;
                                const currentFractionalOffset =
                                    galleryState.value.currentOffset % 1;
                                const currentX =
                                    startX.value +
                                    (i - currentFractionalOffset) *
                                        (currentRectWidth + spacing.value);
                                const currentBaseY = baseY.value;

                                // Проверяем что курсор все еще над элементом и не вышел за пределы canvas
                                if (
                                    currentMouseX >= 0 &&
                                    currentMouseY >= 0 && // мышь не покинула canvas
                                    currentMouseX >= currentX &&
                                    currentMouseX <=
                                        currentX + currentRectWidth &&
                                    currentMouseY >= currentBaseY &&
                                    currentMouseY <=
                                        currentBaseY + currentRectHeight
                                ) {
                                    galleryState.value.previousHoveredIndex =
                                        galleryState.value.hoveredIndex;
                                    galleryState.value.hoveredIndex = i;

                                    // Эмитим индекс наведенного прямоугольника
                                    const itemIndex =
                                        Math.floor(
                                            galleryState.value.currentOffset,
                                        ) + i;
                                    const hoveredImageIndex =
                                        ((itemIndex %
                                            galleryState.value.totalItems) +
                                            galleryState.value.totalItems) %
                                        galleryState.value.totalItems;
                                    emit(
                                        "update:modelValue",
                                        hoveredImageIndex,
                                    );

                                    // Показываем tooltip с проект-именем
                                    const projectName =
                                        props.projectNames?.[
                                            hoveredImageIndex
                                        ] || "";
                                    if (projectName) {
                                        // Получаем глобальные координаты курсора
                                        const rect =
                                            canvasRef.value?.getBoundingClientRect();
                                        if (rect) {
                                            const globalX =
                                                rect.left + currentMouseX;
                                            const globalY =
                                                rect.top + currentMouseY;

                                            tooltip.value.show = true;
                                            tooltip.value.text = projectName;
                                            updateTooltipPosition(
                                                globalX,
                                                globalY,
                                            );
                                            // Показываем с небольшой задержкой для плавной анимации
                                            setTimeout(() => {
                                                tooltip.value.visible = true;
                                            }, 10);
                                        }
                                    }

                                    // Инициализируем состояния элементов если нужно
                                    if (
                                        galleryState.value.elementStates
                                            .length === 0
                                    ) {
                                        initializeElementStates();
                                    }

                                    startHoverAnimation();
                                }
                            }
                            interactionState.hoverDelayTimeout = null;
                        }, interactionState.hoverDelay);
                    }
                }

                break;
            }
        }

        // Если не наводимся ни на один прямоугольник, устанавливаем задержку для сброса
        if (!hoveringOverRect && galleryState.value.hoveredIndex !== -1) {
            // Очищаем таймер задержки hover
            if (interactionState.hoverDelayTimeout) {
                clearTimeout(interactionState.hoverDelayTimeout);
                interactionState.hoverDelayTimeout = null;
            }

            // Очищаем предыдущий таймер если он есть
            if (hoverResetTimeout) {
                clearTimeout(hoverResetTimeout);
            }

            // Устанавливаем задержку 200ms перед сбросом hover состояния
            hoverResetTimeout = setTimeout(() => {
                // Скрываем tooltip только при полном сбросе hover
                tooltip.value.visible = false;
                setTimeout(() => {
                    tooltip.value.show = false;
                }, 150); // даём время на анимацию исчезновения

                galleryState.value.previousHoveredIndex =
                    galleryState.value.hoveredIndex;
                galleryState.value.hoveredIndex = -1;

                // Возвращаем индекс центрального прямоугольника
                const centerIndex = calculateCenterIndex();
                emit("update:modelValue", centerIndex);

                startHoverAnimation(); // Запускаем анимацию к новому состоянию
                hoverResetTimeout = null;
            }, 200);
        }

        // Управляем автоскроллом в зависимости от наведения
        if (hoveringOverRect && !isHovering) {
            isHovering = true;
            stopAutoScroll();
        } else if (!hoveringOverRect && isHovering) {
            isHovering = false;
            if (props.autoScroll && !interactionState.isSliderCenterInView) {
                startAutoScroll();
            }
        }
    };

    if (canvasRef.value) {
        canvasRef.value.addEventListener("mousemove", handleMouseMove);
    }

    // Track if we're swiping to prevent click from firing
    let wasSwiping = false;

    // Handle canvas clicks to navigate to project
    const handleCanvasClick = (e: MouseEvent) => {
        // Не обрабатываем клики если это был свайп или CardCopy показана
        if (wasSwiping || interactionState.isCardCopyShown) {
            wasSwiping = false;
            return;
        }

        if (!canvasRef.value) return;

        const rect = canvasRef.value.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Проверяем, находится ли клик над одним из видимых слайдов
        const rectWidth = rectWidthPx.value;
        const rectHeight = rectHeightPx.value;
        const fractionalOffset = galleryState.value.currentOffset % 1;

        for (let i = 0; i < galleryState.value.visibleCount; i++) {
            const x =
                startX.value + (i - fractionalOffset) * (rectWidth + spacing.value);
            const y = baseY.value;

            // Простая прямоугольная проверка клика
            if (
                mouseX >= x &&
                mouseX <= x + rectWidth &&
                mouseY >= y &&
                mouseY <= y + rectHeight
            ) {
                // Нашли клик на слайде, получаем индекс проекта
                const itemIndex = Math.floor(galleryState.value.currentOffset) + i;
                const projectIndex =
                    ((itemIndex % galleryState.value.totalItems) +
                        galleryState.value.totalItems) %
                    galleryState.value.totalItems;

                // Получаем slug проекта
                const slug = props.projectSlugs?.[projectIndex];
                if (slug) {
                    emit("projectClick", slug);
                }
                break;
            }
        }
    };

    if (canvasRef.value) {
        canvasRef.value.addEventListener("click", handleCanvasClick);
    }

    // Если мышь покидает весь канвас, возобновляем автоскролл
    handleMouseLeave = () => {
        // Если центр слайдера в центре viewport или показана CardCopy, игнорируем события мыши
        if (
            interactionState.isSliderCenterInView ||
            interactionState.isCardCopyShown
        )
            return;

        // Обновляем позицию мыши чтобы показать что мышь вне canvas
        interactionState.lastMouseX = -1;
        interactionState.lastMouseY = -1;

        if (isHovering) {
            isHovering = false;
            if (props.autoScroll && !interactionState.isSliderCenterInView) {
                startAutoScroll();
            }
        }

        // Сбрасываем состояние наведения с анимацией
        if (galleryState.value.hoveredIndex !== -1) {
            // Скрываем tooltip с анимацией
            tooltip.value.visible = false;
            setTimeout(() => {
                tooltip.value.show = false;
            }, 150);

            // Очищаем таймеры задержки
            if (interactionState.hoverDelayTimeout) {
                clearTimeout(interactionState.hoverDelayTimeout);
                interactionState.hoverDelayTimeout = null;
            }
            if (hoverResetTimeout) {
                clearTimeout(hoverResetTimeout);
                hoverResetTimeout = null;
            }

            galleryState.value.previousHoveredIndex =
                galleryState.value.hoveredIndex;
            galleryState.value.hoveredIndex = -1;

            // Возвращаем индекс центрального прямоугольника
            const centerIndex = calculateCenterIndex();
            emit("update:modelValue", centerIndex);

            startHoverAnimation(); // Запускаем анимацию к новому состоянию
        }
    };

    if (canvasRef.value) {
        canvasRef.value.addEventListener("mouseleave", handleMouseLeave);
    }

    // Horizontal scroll controls with debounce
    handleWheel = (e: WheelEvent) => {
        // Если центр слайдера в центре viewport, игнорируем wheel события
        if (interactionState.isSliderCenterInView) return;

        // Сразу предотвращаем дефолтное поведение для горизонтального скролла
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Игнорируем события wheel если уже идет анимация
        if (galleryState.value.isAnimating) {
            return;
        }

        // Only handle horizontal scroll
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            // Блокируем hover эффекты во время wheel scroll
            if (interactionState.hoverDelayTimeout) {
                clearTimeout(interactionState.hoverDelayTimeout);
                interactionState.hoverDelayTimeout = null;
            }

            const currentTime = Date.now();
            const timeSinceLastSwitch =
                currentTime - interactionState.lastScrollTime;

            const currentDirection = e.deltaX > 0 ? 1 : -1;

            // Если направление изменилось - сбрасываем accumulated и reference
            if (
                interactionState.lastScrollDirection !== 0 &&
                interactionState.lastScrollDirection !== currentDirection
            ) {
                interactionState.accumulatedDeltaX = 0;
                interactionState.lastSwitchAccumulatedDeltaX = 0;
            }

            // Обновляем текущее направление
            interactionState.lastScrollDirection = currentDirection;

            // Гибридный debounce: всегда проверяем силу жеста если был предыдущий свитч
            if (interactionState.lastSwitchAccumulatedDeltaX > 0) {
                // Проверяем силу жеста который будет после добавления текущего deltaX
                const futureAccumulated =
                    interactionState.accumulatedDeltaX + Math.abs(e.deltaX);
                const gestureStrengthThreshold =
                    interactionState.lastSwitchAccumulatedDeltaX * 0.7;

                if (futureAccumulated < gestureStrengthThreshold) {
                    // Это слабый хвост инерции - НЕ накапливаем и выходим
                    return;
                }
            }

            // Накапливаем deltaX только если прошли проверку
            interactionState.accumulatedDeltaX += Math.abs(e.deltaX);

            // Проверяем, достаточно ли накоплено для переключения
            const threshold = 50; // Порог для переключения карточки

            if (interactionState.accumulatedDeltaX >= threshold) {
                const direction = e.deltaX > 0 ? 1 : -1;

                // Сохраняем текущий accumulated для будущих проверок силы жеста
                interactionState.lastSwitchAccumulatedDeltaX =
                    interactionState.accumulatedDeltaX;

                // Обновляем время последнего переключения СРАЗУ
                interactionState.lastScrollTime = currentTime;

                slideGallery(direction);

                // Сбрасываем накопленное значение
                interactionState.accumulatedDeltaX = 0;

                // Stop and restart autoscroll to reset timer
                stopAutoScroll();
                if (
                    props.autoScroll &&
                    !interactionState.isSliderCenterInView
                ) {
                    startAutoScroll();
                }
            }

            // Clear previous timeout and set new one to reset accumulated delta
            if (interactionState.scrollTimeout) {
                clearTimeout(interactionState.scrollTimeout);
            }

            // Сбрасываем accumulated через короткое время
            interactionState.scrollTimeout = setTimeout(() => {
                interactionState.accumulatedDeltaX = 0;

                // lastSwitchAccumulatedDeltaX сбрасываем только если анимация не идет
                if (!galleryState.value.isAnimating) {
                    interactionState.lastSwitchAccumulatedDeltaX = 0;
                }

                interactionState.scrollTimeout = null;
            }, 50);
        }
    };

    if (canvasRef.value) {
        canvasRef.value.addEventListener("wheel", handleWheel, { passive: false });
    }

    // Touch/Swipe controls for mobile
    handleTouchStart = (e: TouchEvent) => {
        // Если центр слайдера в центре viewport, игнорируем touch события
        if (interactionState.isSliderCenterInView) return;

        if (e.touches.length === 1) {
            interactionState.swipeStartX = e.touches[0]!.clientX;
            interactionState.swipeStartY = e.touches[0]!.clientY;
            interactionState.isSwipeActive = true;

            // Блокируем hover эффекты во время свайпа
            if (interactionState.hoverDelayTimeout) {
                clearTimeout(interactionState.hoverDelayTimeout);
                interactionState.hoverDelayTimeout = null;
            }
        }
    };

    handleTouchMove = (e: TouchEvent) => {
        // Если центр слайдера в центре viewport, игнорируем touch события
        if (interactionState.isSliderCenterInView) return;

        if (!interactionState.isSwipeActive || e.touches.length !== 1) return;

        // Вычисляем направление свайпа
        const touch = e.touches[0]!;
        const deltaX = Math.abs(touch.clientX - interactionState.swipeStartX);
        const deltaY = Math.abs(touch.clientY - interactionState.swipeStartY);

        // Предотвращаем жесты Safari только при горизонтальном свайпе
        if (deltaX > deltaY && deltaX > 10) {
            e.preventDefault();
        }
    };

    handleTouchEnd = (e: TouchEvent) => {
        // Если центр слайдера в центре viewport, игнорируем touch события
        if (interactionState.isSliderCenterInView) return;

        if (!interactionState.isSwipeActive) return;

        const touch = e.changedTouches[0]!;
        const deltaX = touch.clientX - interactionState.swipeStartX;
        const deltaY = touch.clientY - interactionState.swipeStartY;

        // Only handle horizontal swipes
        if (
            Math.abs(deltaX) > Math.abs(deltaY) &&
            Math.abs(deltaX) > interactionState.swipeThreshold
        ) {
            const currentTime = Date.now();

            // If this is first swipe or enough time passed, execute immediately
            if (
                currentTime - interactionState.lastSwipeTime >
                interactionState.scrollDebounceDelay
            ) {
                const direction = deltaX > 0 ? -1 : 1; // Reverse direction for natural swipe
                slideGallery(direction);

                // Stop and restart autoscroll to reset timer
                stopAutoScroll();
                if (
                    props.autoScroll &&
                    !interactionState.isSliderCenterInView
                ) {
                    startAutoScroll();
                }
            }

            interactionState.lastSwipeTime = currentTime;

            // Always reset autoscroll timer on any swipe event
            stopAutoScroll();
            if (props.autoScroll && !interactionState.isSliderCenterInView) {
                startAutoScroll();
            }
        }

        interactionState.isSwipeActive = false;
    };

    if (canvasRef.value) {
        canvasRef.value.addEventListener("touchstart", handleTouchStart, {
            passive: true,
        });
        canvasRef.value.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        });
        canvasRef.value.addEventListener("touchend", handleTouchEnd, {
            passive: true,
        });
    }

    // Pointer events for PC mouse drag/swipe
    handlePointerDown = (e: PointerEvent) => {
        // Если центр слайдера в центре viewport, игнорируем pointer события
        if (interactionState.isSliderCenterInView) return;

        if (e.pointerType === "mouse" && e.button === 0) {
            interactionState.swipeStartX = e.clientX;
            interactionState.swipeStartY = e.clientY;
            interactionState.isSwipeActive = true;
            canvasRef.value!.setPointerCapture(e.pointerId);

            // Блокируем hover эффекты во время свайпа
            if (interactionState.hoverDelayTimeout) {
                clearTimeout(interactionState.hoverDelayTimeout);
                interactionState.hoverDelayTimeout = null;
            }
        }
    };

    handlePointerMove = (e: PointerEvent) => {
        // Если центр слайдера в центре viewport, игнорируем pointer события
        if (interactionState.isSliderCenterInView) return;

        if (!interactionState.isSwipeActive || e.pointerType !== "mouse")
            return;
        e.preventDefault();
    };

    handlePointerUp = (e: PointerEvent) => {
        // Если центр слайдера в центре viewport, игнорируем pointer события
        if (interactionState.isSliderCenterInView) return;

        if (!interactionState.isSwipeActive || e.pointerType !== "mouse")
            return;

        const deltaX = e.clientX - interactionState.swipeStartX;
        const deltaY = e.clientY - interactionState.swipeStartY;

        // Only handle horizontal swipes
        if (
            Math.abs(deltaX) > Math.abs(deltaY) &&
            Math.abs(deltaX) > interactionState.swipeThreshold
        ) {
            wasSwiping = true;
            const currentTime = Date.now();

            // If this is first swipe or enough time passed, execute immediately
            if (
                currentTime - interactionState.lastSwipeTime >
                interactionState.scrollDebounceDelay
            ) {
                const direction = deltaX > 0 ? -1 : 1; // Reverse direction for natural swipe
                slideGallery(direction);

                // Stop and restart autoscroll to reset timer
                stopAutoScroll();
                if (
                    props.autoScroll &&
                    !interactionState.isSliderCenterInView
                ) {
                    startAutoScroll();
                }
            }

            interactionState.lastSwipeTime = currentTime;

            // Always reset autoscroll timer on any swipe event
            stopAutoScroll();
            if (props.autoScroll && !interactionState.isSliderCenterInView) {
                startAutoScroll();
            }
        }

        interactionState.isSwipeActive = false;
        canvasRef.value!.releasePointerCapture(e.pointerId);
    };

    if (canvasRef.value) {
        canvasRef.value.addEventListener("pointerdown", handlePointerDown);
        canvasRef.value.addEventListener("pointermove", handlePointerMove);
        canvasRef.value.addEventListener("pointerup", handlePointerUp);
    }

    // Keyboard controls
    handleKeydown = (e: KeyboardEvent) => {
        // Если центр слайдера в центре viewport, игнорируем keyboard события
        if (interactionState.isSliderCenterInView) return;

        if (e.key === "ArrowLeft") {
            e.preventDefault();
            slideGallery(-1);
            // Останавливаем автоскролл
            stopAutoScroll();
            // Перезапускаем после завершения анимации
            setTimeout(() => {
                if (
                    props.autoScroll &&
                    !interactionState.isSliderCenterInView
                ) {
                    startAutoScroll();
                }
            }, galleryState.value.animationDuration);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            slideGallery(1);
            // Останавливаем автоскролл
            stopAutoScroll();
            // Перезапускаем после завершения анимации
            setTimeout(() => {
                if (
                    props.autoScroll &&
                    !interactionState.isSliderCenterInView
                ) {
                    startAutoScroll();
                }
            }, galleryState.value.animationDuration);
        }
    };

    document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if (hoverAnimationFrameId) {
        cancelAnimationFrame(hoverAnimationFrameId);
    }
    if (hoverResetTimeout) {
        clearTimeout(hoverResetTimeout);
    }
    if (interactionState.scrollTimeout) {
        clearTimeout(interactionState.scrollTimeout);
    }
    if (interactionState.hoverDelayTimeout) {
        clearTimeout(interactionState.hoverDelayTimeout);
    }
    stopAutoScroll();
    if (resizeCleanup) {
        resizeCleanup();
    }
    window.removeEventListener("scroll", handleScroll);

    // Cleanup event listeners
    if (canvasRef.value) {
        canvasRef.value.removeEventListener("mousemove", handleMouseMove);
        canvasRef.value.removeEventListener("mouseleave", handleMouseLeave);
        canvasRef.value.removeEventListener("wheel", handleWheel);
        canvasRef.value.removeEventListener("touchstart", handleTouchStart);
        canvasRef.value.removeEventListener("touchmove", handleTouchMove);
        canvasRef.value.removeEventListener("touchend", handleTouchEnd);
        canvasRef.value.removeEventListener("pointerdown", handlePointerDown);
        canvasRef.value.removeEventListener("pointermove", handlePointerMove);
        canvasRef.value.removeEventListener("pointerup", handlePointerUp);
        canvasRef.value.removeEventListener("click", handleCanvasClick);
    }

    document.removeEventListener("keydown", handleKeydown);
});
</script>

<style lang="postcss" scoped>
@import url(~/assets/css/_variables.css);

.arc-slider-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;

    position: absolute;
    width: 100%;
    height: 100%;
}

.arc-slider {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;

    cursor: grab;

    /* Предотвращаем жесты навигации Safari */
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;

    &:hover {
        cursor: pointer;
    }
}

.slider-canvas {
    background: transparent;
    width: 100%;
    height: 100%;
    display: block;
    overscroll-behavior-x: none;
    overscroll-behavior-y: none;
    touch-action: pan-y;
}

.project-tooltip {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    pointer-events: none;

    padding: 0.75rem 1.25rem;
    width: max-content;
    white-space: nowrap;

    display: flex;
    justify-content: center;
    align-items: center;

    will-change: transform, opacity;
    transition:
        transform 0.5s ease-out,
        opacity 0.15s ease;

    @mixin text-regular-medium;
    color: #c1c1c1;

    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(4px);

    opacity: 0;
}

.project-tooltip.tooltip-visible {
    opacity: 1;
}
</style>
