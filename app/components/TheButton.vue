<script setup lang="ts">
defineProps<{
    dark?: boolean;
}>();
</script>

<template>
    <button :class="{ dark }"><slot>Кнопка</slot></button>
</template>

<style lang="postcss" scoped>
@import url(~/assets/css/_variables.css);

button {
    width: 100%;

    display: flex;
    padding: 1rem 2rem;
    justify-content: center;
    align-items: center;

    border-radius: 1.25rem;
    border: none;
    outline: none;
    background: #fff;

    @mixin text-regular-medium;
    color: #000;
    text-align: center;

    transition: all 0.3s ease;

    cursor: pointer;

    &:hover {
        background: #ffffffe3;
    }

    &:active {
        background: #ffffff75;
    }

    &.dark {
        background: #151515;
        color: #fff;

        &:hover {
            background: #1f1f1f;
        }

        &:active {
            background: #2a2a2a;
        }
    }
}
</style>
