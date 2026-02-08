<template>
    <Teleport to="body">
        <!-- Backdrop -->
        <Transition name="fade">
            <div v-if="isOpen" class="backdrop" @click="close" />
        </Transition>

        <!-- Bottom Sheet -->
        <Transition name="slide-up">
            <div v-if="isOpen" class="bottom-sheet">
                <div class="sheet-content">
                    <!-- Header меню -->
                    <!-- <div class="menu-section">
                        <NuxtLink to="" @click="close">Главная</NuxtLink>
                         <NuxtLink to="" @click="close">Презентация</NuxtLink>
            <NuxtLink to="" @click="close">Контакты</NuxtLink>
            <NuxtLink to="" @click="close">Портфолио</NuxtLink>
                    </div>

                    <hr /> -->

                    <!-- Навигация по секциям -->
                    <div class="navigation-section">
                        <div
                            v-for="item in navigationItems"
                            :key="item.id"
                            class="nav-item"
                            @click="handleNavClick(item.id, item.offset)"
                        >
                            {{ item.text }}
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts" setup>
import { useScrollTo } from "~/composables/useScrollTo";

interface Props {
    isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: "close"): void;
}>();

// Навигационные элементы
const navigationItems = [
    { id: "hero", text: "Портфолио", isButton: false, offset: "-15vh" },
    { id: "steps", text: "Этапы работы", isButton: false, offset: "30vh" },
    { id: "services", text: "Услуги", isButton: false, offset: "10vh" },
    { id: "footer", text: "Связаться", isButton: true, offset: "15vh" },
];

const { scrollToSection } = useScrollTo();

const close = () => {
    emit("close");
};

const handleNavClick = (sectionId: string, offset: number | string) => {
    scrollToSection(sectionId, { offset });
    close();
};

// Блокировка скролла при открытом меню
watch(
    () => props.isOpen,
    (isOpen) => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    },
);

// Очистка при размонтировании
onUnmounted(() => {
    document.body.style.overflow = "";
});
</script>

<style lang="postcss" scoped>
@import url(~/assets/css/_variables.css);

.backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 999;
}

.bottom-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 80vh;
    z-index: 1000;
    padding: 0 2rem;
}

.sheet-content {
    width: 100%;
    padding: 2rem 1.25rem;
    padding-top: 3rem;

    display: flex;
    flex-direction: column;
    gap: 2rem;

    border-radius: 2.5rem 2.5rem 0 0;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: none;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);

    overflow-y: auto;
    max-height: calc(80vh - 2rem);
}

.menu-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0 0.75rem;

    a {
        @mixin display-bold-medium;
        color: $white;
        text-decoration: none;
        text-transform: uppercase;
        transition: opacity 0.3s ease;

        &:active {
            opacity: 0.7;
        }
    }
}

.navigation-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0 0.75rem;
}

.nav-item {
    @mixin display-bold-medium;
    color: $white;
    text-decoration: none;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.3s ease;

    &:active {
        opacity: 0.7;
    }
}

hr {
    background: rgba(255, 255, 255, 0.08);
    border: none;
    height: 1px;
    margin: 0;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}
</style>
