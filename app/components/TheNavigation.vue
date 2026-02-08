<template>
    <nav class="navigation" :class="{ dark: props.dark }">
        <div class="nav-container">
            <!-- Плавающий индикатор -->
            <div class="floating-indicator" :style="indicatorStyle" />

            <div
                v-for="item in navigationItems"
                :key="item.id"
                :ref="(el) => setItemRef(el as HTMLElement, item.id)"
                class="nav-section"
                :class="{
                    active: activeSection === item.id,
                    'is-button': item.isButton,
                }"
                @click="scrollToSection(item.id)"
            >
                <span
                    class="nav-link"
                    :class="{ 'is-button-text': item.isButton }"
                >
                    {{ item.text }}
                </span>
            </div>
        </div>
    </nav>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useScrollTo } from "~/composables/useScrollTo";

// Props
interface Props {
    dark?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    dark: false,
});

// Конфигурация навигации
const navigationItems = [
    { id: "hero", text: "Портфолио", isButton: false, offset: 0 },
    { id: "steps", text: "Этапы работы", isButton: false, offset: "30vh" },
    { id: "services", text: "Услуги", isButton: false, offset: "10vh" },
    { id: "footer", text: "Связаться", isButton: true, offset: 0 },
];

// Refs для элементов навигации
const itemRefs = ref<Record<string, HTMLElement>>({});

// Активная секция
const activeSection = ref<string>(navigationItems[0]?.id || '');

// Флаг для отслеживания инициализации
const isInitialized = ref(false);

// Установить ref для элемента
function setItemRef(el: HTMLElement | null, id: string) {
    if (el) {
        itemRefs.value[id] = el;
        // Обновляем индикатор только один раз после первой установки всех refs
        if (!isInitialized.value) {
            const allRefsSet = navigationItems.every(
                (item) => itemRefs.value[item.id],
            );
            if (allRefsSet) {
                isInitialized.value = true;
                nextTick(() => {
                    forceUpdate.value++;
                });
            }
        }
    }
}

// Форсированное обновление для ресайза
const forceUpdate = ref(0);

// Стиль для плавающего индикатора
const indicatorStyle = computed(() => {
    // Используем forceUpdate для пересчёта при ресайзе
    forceUpdate.value;

    const activeElement = itemRefs.value[activeSection.value];
    if (!activeElement) return { opacity: "0" };

    const rect = activeElement.getBoundingClientRect();
    const containerRect = activeElement.parentElement?.getBoundingClientRect();

    if (!containerRect) return { opacity: "0" };

    return {
        left: `${rect.left - containerRect.left}px`,
        width: `${rect.width}px`,
        opacity: "1",
    };
});

// Обработчик ресайза
function handleResize() {
    forceUpdate.value++;
}

// Используем composable для скролла
const { scrollToSection: scrollTo } = useScrollTo();

// Скролл к секции
function scrollToSection(section: string) {
    activeSection.value = section;

    const navItem = navigationItems.find((item) => item.id === section);
    const offset = navItem?.offset || 0;

    scrollTo(section, { offset });
}

// Отслеживание скролла для определения активной секции
function handleScroll() {
    const sectionIds = navigationItems.map((item) => item.id);

    for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId);
        if (element) {
            const rect = element.getBoundingClientRect();
            if (
                rect.top <= window.innerHeight / 2 &&
                rect.bottom >= window.innerHeight / 2
            ) {
                activeSection.value = sectionId;
                break;
            }
        }
    }
}

onMounted(async () => {
    // window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Ждем следующего тика для рендера всех refs
    await nextTick();

    // Даем небольшую задержку для полного рендера и применения шрифтов
    setTimeout(() => {
        forceUpdate.value++;
    }, 100);

    // Дополнительное обновление после загрузки шрифтов
    if (document.fonts) {
        document.fonts.ready.then(() => {
            forceUpdate.value++;
        });
    }
});

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
});
</script>

<style lang="postcss" scoped>
@import url(~/assets/css/_variables.css);

.navigation {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 2.625rem;
    position: relative;
    width: max-content;

    @media screen and (max-width: $mobile) {
        display: none;
    }
}

.nav-container {
    display: flex;
    gap: 0.125rem; /* 2px */
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;
    padding: 0.25rem;
    position: relative;
    width: 100%;
    height: 100%;
}

.floating-indicator {
    position: absolute;
    top: 0.25rem;
    height: calc(100% - 0.5rem);
    background: $white;
    border-radius: 8rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
    pointer-events: none;

    .dark & {
        background: #151515;
    }
}

.nav-section {
    display: flex;
    gap: 0.625rem;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 0.5rem 1.25rem 0.625rem 1.25rem;
    border-radius: 128px;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;

    &:hover .nav-link:not(.is-button-text) {
        color: rgba(255, 255, 255, 0.8);
    }

    /* Обычные ссылки при активации */
    &.active:not(.is-button) .nav-link {
        color: $black;

        .dark & {
            color: $white;
        }
    }

    /* Кнопка "Связаться" при активации */
    &.active.is-button .nav-link.is-button-text {
        color: $black;

        .dark & {
            color: $white;
        }
    }

    /* Кнопка "Связаться" когда НЕ активна */
    &:not(.active).is-button .nav-link.is-button-text {
        color: rgba(255, 255, 255, 0.48);
    }
}

.nav-link {
    @mixin text-regular-medium;
    color: rgba(255, 255, 255, 0.48);
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.3s ease;

    &.is-button-text {
        color: rgba(255, 255, 255, 0.48);
    }
}
</style>
