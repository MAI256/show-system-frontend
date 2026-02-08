<template>
    <NuxtLayout>
        <!-- Loader must be rendered first, without ClientOnly -->
        <TheLoader :show="false" />

        <!-- Content wrapper that gets hidden during loading -->
        <div :class="{ 'content-hidden': false }">
            <TheHeader />
            <NuxtPage
                :transition="{
                    name: 'page',
                    mode: 'out-in',
                }"
            />
            <TheFooter />
        </div>

        <CustomScrollbar />
    </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(async () => {
    // Wait for next tick to ensure all child components are mounted
    // await nextTick();

    // let checkInterval: ReturnType<typeof setInterval> | null = null;
    // let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;

    // Function to hide loader
    // const hideLoader = () => {
    //     if (checkInterval) clearInterval(checkInterval);
    //     if (fallbackTimeout) clearTimeout(fallbackTimeout);

    //     const nuxtApp = document.getElementById("__nuxt");
    //     const loader = document.getElementById("nuxt-loading");

    //     // Always show the content, even if loader doesn't exist
    //     if (nuxtApp) {
    //         nuxtApp.classList.add("loaded");
    //     }

    //     // Hide and remove the loader if it exists
    //     if (loader) {
    //         // Then hide the loader with a slight delay for seamless transition
    //         setTimeout(() => {
    //             loader.classList.add("hide");

    //             // Remove loader from DOM after animation completes
    //             setTimeout(() => {
    //                 loader.remove();
    //             }, 500); // Match transition duration in app.html
    //         }, 200); // Small delay to create overlap
    //     }
    // };

    // // Wait a bit for the page to signal it's ready via setLoading(false)
    // // The native loader will hide when page components are ready
    // checkInterval = setInterval(() => {
    //     // Hide native loader when page signals it's ready (isLoading becomes false)
    //     if (!isLoading.value) {
    //         hideLoader();
    //     }
    // }, 50);

    // // Fallback: if no page signals ready after 10 seconds, force hide loader
    // // (accounts for large image files that may take time to download)
    // fallbackTimeout = setTimeout(() => {
    //     hideLoader();

    //     // Emergency fallback: if loader still exists after 2 more seconds, remove it forcefully
    //     setTimeout(() => {
    //         const loader = document.getElementById("nuxt-loading");
    //         if (loader) {
    //             loader.remove();
    //         }
    //         const nuxtApp = document.getElementById("__nuxt");
    //         if (nuxtApp) {
    //             nuxtApp.classList.add("loaded");
    //         }
    //     }, 2000);
    // }, 15000);
});
</script>

<style>
/* Hide content while loading */
.content-hidden {
    opacity: 0;
    pointer-events: none;
    position: absolute;
    visibility: hidden;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;
}

.page-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.page-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>
