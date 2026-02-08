<template>
    <header>
        <!-- <div>
            <NuxtLink to="">Главная</NuxtLink>
            <span>/</span>
            <NuxtLink to="">Презентация</NuxtLink>
        </div> -->
        <img src="/logo.svg" @click="navigateTo('/')" />
        <!-- <div>
            <NuxtLink to="">Контакты</NuxtLink>
            <span>/</span>
            <NuxtLink to="">Портфолио</NuxtLink>
        </div> -->
    </header>
</template>

<style lang="postcss">
@import url(~/assets/css/_variables.css);

header {
    height: 7rem;
    padding: 0 6rem;

    display: flex;
    align-items: center;
    /*justify-content: space-between;*/
    justify-content: center;

    position: relative;

    z-index: 20;

    @media screen and (max-width: $mobile) {
        padding: 0 2rem;
        justify-content: center;
    }

    img {
        width: 16vw;
        cursor: pointer;

        @media screen and (max-width: $mobile) {
            width: 48vw;
            transform: none;
        }
    }

    div {
        display: flex;
        align-items: center;
        gap: 1rem;

        font-size: 1rem;
        line-height: 1.4;

        @media screen and (max-width: $mobile) {
            display: none;
        }

        a {
            opacity: 0.48;
            color: $text-color-primary;
            text-decoration: none;

            transition: opacity 0.3s ease;

            cursor: pointer;

            &:hover {
                opacity: 1;
            }
        }

        span {
            color: #161616;
        }
    }
}
</style>
