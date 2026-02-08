<template>
    <div>
        <main>
            <!-- Мобильное меню -->
            <ClientOnly>
                <TheMobileMenuButton @click="isMobileMenuOpen = true" />
                <TheMobileMenu
                    :is-open="isMobileMenuOpen"
                    @close="isMobileMenuOpen = false"
                />
            </ClientOnly>

            <section id="head" ref="headRef" class="head">
                <TheFractalBackground
                    :style="{ '--slide-color': mainColor }"
                    @raster-ready="handleHeadFractalReady"
                />
                <div></div>
                <TheTextSplitter ref="titleRef" tag="h1">{{
                    project?.title
                }}</TheTextSplitter>
            </section>

            <div style="height: 90vh; background: transparent"></div>

            <section
                v-if="sliderImages.length > 0"
                id="slider"
                ref="sliderRef"
                class="slider"
            >
                <div v-for="img in sliderImages" :key="img" class="img">
                    <img :src="img" />
                </div>
            </section>

            <section
                v-if="showGallery"
                id="gallery"
                ref="gallerySectionRef"
                class="gallery-section"
            >
                <TheFractalBackground
                    :style="{ '--slide-color': mainColor }"
                    @raster-ready="handleGalleryFractalReady"
                />

                <div
                    v-for="(chunk, index) in galleryChunks"
                    :key="index"
                    class="gallery-set"
                >
                    <div v-for="img in chunk" :key="img.id" class="img">
                        <img :src="getImageUrl(img)" />
                    </div>
                </div>
            </section>
            <section class="pager" id="pager">
                <NuxtLink
                    v-if="project?.prevProject"
                    :to="`/case/${project.prevProject.slug}`"
                    class="pager-item-wrapper prev-wrapper"
                >
                    <div class="pager-card prev">
                        <div class="pager-card-content">
                            <img
                                :src="getPrevProjectImageUrl()"
                                :alt="project.prevProject.title"
                            />
                            <div class="inner-shadow"></div>
                        </div>
                    </div>
                    <div class="pager-label-circle">
                        <span>previous<br />case</span>
                    </div>
                </NuxtLink>

                <NuxtLink to="/" class="home"
                    ><span>На главную страницу</span></NuxtLink
                >

                <NuxtLink
                    v-if="project?.nextProject"
                    :to="`/case/${project.nextProject.slug}`"
                    class="pager-item-wrapper next-wrapper"
                >
                    <div class="pager-card next">
                        <div class="pager-card-content">
                            <img
                                :src="getNextProjectImageUrl()"
                                :alt="project.nextProject.title"
                            />
                            <div class="inner-shadow"></div>
                        </div>
                    </div>
                    <div class="pager-label-circle">
                        <span>next<br />case</span>
                    </div>
                </NuxtLink>
            </section>
        </main>

        <!-- Parallax absolute + sticky inside via Teleport -->
        <Teleport to="body">
            <div class="parallax" ref="parallaxRef">
                <div
                    class="bg"
                    ref="bgRef"
                    :style="{ backgroundImage: `url(${mainPhotoUrl})` }"
                ></div>
            </div>
        </Teleport>
    </div>
</template>

<script lang="ts" setup>
// Image URL generator with device resolution
const { getImageUrl: generateImageUrl } = useDirectusImageUrl();

const handleHeadFractalReady = () => {};
const handleGalleryFractalReady = () => {};

const route = useRoute();
const { getProject } = useDirectus();

// Data Fetching
const { data: project, error: projectError } = await useAsyncData(
    `project-${route.params.slug}`,
    async () => {
        const slug = Array.isArray(route.params.slug)
            ? route.params.slug[0]
            : route.params.slug;
        try {
            return await getProject(slug);
        } catch (err) {
            throw err;
        }
    },
);

// Handle fatal errors only on initial load (not on transitions)
if (projectError.value && !project.value) {
    const error = projectError.value as any;
    throw showError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || "Ошибка загрузки проекта",
        message: error.message,
        fatal: true,
    });
}

// Watch for project changes on client during transitions
if (import.meta.client) {
    watch(
        () => project.value,
        (newProject) => {
            // Check for errors during transition
            if (projectError.value) {
                return;
            }

            if (!newProject) {
                return;
            }

            try {
                // loadProjectCompletely();
            } catch (e) {
                // Error handled silently
            }
        },
    );
}

const getImageUrl = (fileOrId: any, quality: number = 85) => {
    if (!fileOrId) return "";
    const file = fileOrId.directus_files_id || fileOrId;
    const id = typeof file === "object" ? file.id : file;
    return generateImageUrl(id, quality, "cover");
};

const getPrevProjectImageUrl = () => {
    if (!project.value?.prevProject?.main_photo) return "";
    const file =
        project.value.prevProject.main_photo.directus_files_id ||
        project.value.prevProject.main_photo;
    const id = typeof file === "object" ? file.id : file;
    return generateImageUrl(id, 75, "cover");
};

const getNextProjectImageUrl = () => {
    if (!project.value?.nextProject?.main_photo) return "";
    const file =
        project.value.nextProject.main_photo.directus_files_id ||
        project.value.nextProject.main_photo;
    const id = typeof file === "object" ? file.id : file;
    return generateImageUrl(id, 75, "cover");
};

const mainColor = computed(() => project.value?.main_color || "#000000");
const mainPhotoUrl = computed(() => getImageUrl(project.value?.main_photo));

// Sync global color for footer
// watch(
//     mainColor,
//     (newColor) => {
//         if (import.meta.client) {
//             document.documentElement.style.setProperty(
//                 "--slide-color",
//                 newColor,
//             );
//         }
//     },
//     { immediate: true },
// );

const sliderImages = computed(() => {
    if (!project.value) return [];
    const images = [];
    for (let i = 1; i <= 5; i++) {
        const img = project.value[`slider_${i}`];
        if (img) images.push(getImageUrl(img));
    }
    return images;
});

const galleryImagesData = computed(() => {
    if (!project.value?.images) return [];

    return project.value.images.filter((item: any) => {
        const file = item.directus_files_id || item;
        if (typeof file === "object" && file.type) {
            return file.type.startsWith("image/");
        }
        return true;
    });
});

const galleryChunks = computed(() => {
    const allImages = galleryImagesData.value;
    const chunks = [];
    for (let i = 0; i < allImages.length; i += 8) {
        chunks.push(allImages.slice(i, i + 8));
    }
    return chunks;
});

const showGallery = computed(() => galleryImagesData.value.length >= 5);

// UI State
const isMobileMenuOpen = ref(false);
const isMobile = ref(false);

const checkMobile = () => {
    if (typeof window === "undefined") return;
    isMobile.value = window.innerWidth <= 1024;
};
const headRef = ref<HTMLElement | null>(null);
const sliderRef = ref<HTMLElement | null>(null);
const titleRef = ref<any>(null);

// Gallery refs
const gallerySectionRef = ref<HTMLElement | null>(null);
const galleryImages = ref<HTMLElement[]>([]);

// Cached values for smooth scroll
let cachedSliderTop = 0;
let cachedGalleryTop = 0;
let cachedGalleryHeight = 0;
let windowInnerHeight = 0;
let firstSliderImg: HTMLElement | null = null;
let lastSliderImg: HTMLElement | null = null;
let mobileBreakpoint = 1200;

const handleScroll = () => {
    requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        // --- Gallery Fractal Sticky ---
        if (gallerySectionRef.value && cachedGalleryHeight > 0) {
            const galleryFractal = gallerySectionRef.value.querySelector(
                ".fractal-background",
            ) as HTMLElement;

            if (galleryFractal) {
                const isMobileLayout = window.innerWidth <= mobileBreakpoint;
                const offsetFactor = isMobileLayout ? 0.35 : 0.55;
                const baseOffset = -windowInnerHeight * offsetFactor;
                // Add offset compensation to max scroll so background reaches bottom of section
                const maxStickyScroll =
                    cachedGalleryHeight - windowInnerHeight - baseOffset;

                let translateY = baseOffset;

                if (scrollY >= cachedGalleryTop) {
                    // Inside or past gallery - sticky effect clamped to gallery bounds
                    const scrollIntoGallery = scrollY - cachedGalleryTop;
                    const stickyShift = Math.min(
                        scrollIntoGallery,
                        maxStickyScroll,
                    );
                    translateY = baseOffset + stickyShift;
                }

                galleryFractal.style.transform = `translateY(${translateY}px)`;
            }
        }

        // --- Slider horizontal scroll sync (desktop only) ---
        if (sliderRef.value && firstSliderImg && !isMobile.value) {
            const imgRect = firstSliderImg.getBoundingClientRect();
            // Zone at top and bottom where animation pauses/doesn't start
            const triggerDistance = window.innerHeight * 0.02;
            const sliderScrollHeight =
                sliderRef.value.scrollWidth - sliderRef.value.offsetWidth;
            const bottomDist =
                window.innerHeight - (imgRect.top + imgRect.height);
            const topDist = imgRect.top;

            // Only animate when the element is "centered" enough (within margins)
            if (bottomDist >= triggerDistance && topDist >= triggerDistance) {
                // The total vertical distance available for the animation
                const rangeSize =
                    window.innerHeight - imgRect.height - 2 * triggerDistance;

                // Calculate progress:
                // When top is large (near bottom), we want 0 (Start).
                // When top is small (near top), we want 1 (End).
                // (imgRect.top - triggerDistance) goes from rangeSize -> 0 as we scroll down

                const rawFraction = (imgRect.top - triggerDistance) / rangeSize;

                // Invert so it scrolls 0 -> 1 (Left -> Right)
                const progress = 1 - rawFraction;

                sliderRef.value.scrollLeft = progress * sliderScrollHeight;
            }
        }

        // --- Gallery Logic ---
        if (gallerySectionRef.value) {
            console.log({galleryImages})
            galleryImages.value.forEach((img) => {
                const rect = img.getBoundingClientRect();
                if (rect.top <= 0) {
                    const p = -rect.top / img.offsetHeight;
                    let scale = 1 - p;
                    if (scale < 0) scale = 0;
                    img.style.transform = `scale3d(${scale})`;
                }
            });
        }
    });
};

const calculateGallerySetHeight = (gallerySet: HTMLElement) => {
    const images = gallerySet.querySelectorAll(
        ".img",
    ) as NodeListOf<HTMLElement>;
    if (images.length === 0) return;

    let maxBottom = 0;
    images.forEach((img) => {
        const top = img.offsetTop;
        const height = img.offsetHeight;
        const bottom = top + height;
        if (bottom > maxBottom) {
            maxBottom = bottom;
        }
    });

    const marginBottom =
        parseFloat(window.getComputedStyle(gallerySet).marginBottom) || 0;
    gallerySet.style.height = `${maxBottom + marginBottom}px`;
};

const recalculateAllGallerySets = () => {
    if (gallerySectionRef.value) {
        const gallerySets = gallerySectionRef.value.querySelectorAll(
            ".gallery-set",
        ) as NodeListOf<HTMLElement>;
        gallerySets.forEach((set) => {
            calculateGallerySetHeight(set);
        });
        // Recache gallery position on resize
        cachedGalleryTop = gallerySectionRef.value.offsetTop;
        cachedGalleryHeight = gallerySectionRef.value.offsetHeight;
    }
};

// Функция для загрузки проекта полностью
const loadProjectCompletely = async () => {
    if (!project.value) {
        return;
    }

    // Only run on client
    if (!import.meta.client) {
        return;
    }

    try {
        handleScroll();
        setTimeout(() => {
            if (titleRef.value?.$el) {
                titleRef.value.$el.classList.add("animate-text-split");
            }
        }, 250);
    } catch {
        // no-op
    }
};

onMounted(() => {
    if (!import.meta.client) return;

    // Read mobile breakpoint from CSS variable
    const computedStyle = getComputedStyle(document.documentElement);
    const mobileVar = computedStyle.getPropertyValue("--mobile");
    if (mobileVar) {
        mobileBreakpoint = parseInt(mobileVar, 10);
    }

    // Check initial mobile state
    checkMobile();

    // Get first and last slider images
    if (sliderRef.value) {
        const sliderImgs = sliderRef.value.querySelectorAll(".img");
        firstSliderImg = (sliderImgs[0] as HTMLElement) || null;
        lastSliderImg =
            (sliderImgs[sliderImgs.length - 1] as HTMLElement) || null;
    }

    // Collect images for gallery
    if (gallerySectionRef.value) {
        galleryImages.value = Array.from(
            gallerySectionRef.value.querySelectorAll(".img"),
        ) as HTMLElement[];
        galleryImages.value.forEach((img) => {
            img.style.transformOrigin = "top center";
        });

        // Calculate gallery set heights
        recalculateAllGallerySets();
    }

    // Cache static values to avoid reflow
    if (sliderRef.value) {
        cachedSliderTop = sliderRef.value.offsetTop;
    }
    if (gallerySectionRef.value) {
        cachedGalleryTop = gallerySectionRef.value.offsetTop;
        cachedGalleryHeight = gallerySectionRef.value.offsetHeight;
    }
    // windowInnerHeight = window.innerHeight;

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", recalculateAllGallerySets);
    window.addEventListener("resize", checkMobile);

    handleScroll();
});

onUnmounted(() => {
    if (!import.meta.client) return;

    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", recalculateAllGallerySets);
    window.removeEventListener("resize", checkMobile);
});

// SEO Meta tags
useHead({
    title: computed(() =>
        project.value
            ? `${project.value.title} — ShowSystem`
            : "ShowSystem — Комплексные решения",
    ),
    meta: [
        {
            name: "description",
            content: "Свет, звук, сцена и мультимедиа.",
        },
    ],
});
</script>

<style lang="postcss" scoped>
@import url(~/assets/css/_variables.css);

.head {
    height: 50vh;
    padding: 1.5rem 3rem 2.125rem 3rem;

    position: relative;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    background: $background;

    .fractal-background {
        position: absolute;
        transform: translateY(-75%);
        z-index: 0;
    }

    h1 {
        max-width: 50vw;

        font-family: $font-family-display;
        font-size: 4.5rem;
        font-weight: 700;
        line-height: 0.98;
        text-align: center;
        text-transform: uppercase;

        @media screen and (max-width: $mobile) {
            max-width: 60vw;
            @mixin display-bold-small;
            font-size: 2rem;
        }
    }
}

.slider {
    padding: 0 5vw;
    padding-top: 30vh;
    padding-bottom: 15vh;

    display: flex;
    gap: 1.5rem;
    overflow-x: scroll;
    overflow-y: hidden;

    position: relative;
    z-index: 15;

    background: $background;

    &:has(+ .gallery-section) {
        background: linear-gradient($background 70%, transparent 100%);
    }

    .img {
        height: 30rem;
        min-width: 45vw;
    }

    @media screen and (max-width: $mobile) {
        padding-top: 2rem;
        scroll-snap-type: x mandatory;
        scroll-padding-left: 6.5vw;
        scroll-padding-right: 6.5vw;
        scroll-behavior: smooth;

        .img {
            height: 56vw;
            min-width: 76vw;
            scroll-snap-align: start;
            scroll-snap-stop: always;
        }
    }
}

.img {
    border-radius: 2.5rem;

    overflow: hidden;

    position: relative;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}

.gallery-section {
    width: 100vw;
    position: relative;

    background: $background;

    .fractal-background {
        height: 100vh;
        position: absolute;
        transform: translateY(-55%);
        will-change: transform;
        backface-visibility: hidden;

        @media screen and (max-width: $mobile) {
            transform: translateY(-35%);
        }
    }

    .gallery-set {
        position: relative;
        margin: 8vh 5vw;
    }

    .gallery-set .img {
        position: absolute !important;

        transform-origin: top center;
        transform: scale(1);
        will-change: transform;
    }

    .gallery-set .img:nth-of-type(2),
    .gallery-set .img:nth-of-type(7),
    .gallery-set .img:nth-of-type(8) {
        width: 37vw;
        height: 22vw;
    }

    .gallery-set .img:nth-of-type(5),
    .gallery-set .img:nth-of-type(6) {
        width: 14vw;
        height: 22vw;
    }

    .gallery-set .img:nth-of-type(1) {
        width: 30vw;
        height: 19.4vw;
        top: 0%;
        right: 7.7vw;
    }

    .gallery-set .img:nth-of-type(2) {
        top: 8.75rem;
        left: 0;
    }

    .gallery-set .img:nth-of-type(3) {
        width: 21.5vw;
        height: 31vw;
        top: 22.75rem;
        right: 0%;
    }

    .gallery-set .img:nth-of-type(4) {
        width: 29vw;
        height: 42vw;
        top: 35.625rem;
        left: 50%;
        margin-left: -14.5vw;
        border-radius: 3.4rem;
    }

    .gallery-set .img:nth-of-type(5) {
        top: 50rem;
        left: 7.7vw;
    }

    .gallery-set .img:nth-of-type(6) {
        top: 64rem;
        right: 7.7vw;
    }

    .gallery-set .img:nth-of-type(7) {
        top: 84rem;
        left: 0%;
    }

    .gallery-set .img:nth-of-type(8) {
        top: 97.25rem;
        right: 0%;
    }

    @media screen and (max-width: $mobile) {
        .gallery-set {
            margin: 1.5rem 6.25vw;
        }

        .gallery-set .img:nth-of-type(1) {
            width: 57vw;
            height: 37.5vw;
            top: 1.5rem;
            right: 0;
            left: auto;
        }

        .gallery-set .img:nth-of-type(2) {
            width: 72vw;
            height: 43.5vw;
            top: 16rem;
            left: 0;
            right: auto;
        }

        .gallery-set .img:nth-of-type(3) {
            width: 26vw;
            height: 37.5vw;
            top: 32rem;
            right: 0;
            left: auto;
        }

        .gallery-set .img:nth-of-type(4) {
            width: 57vw;
            height: 81vw;
            top: 37rem;
            left: 0;
            right: auto;
            margin-left: 0;
            border-radius: 2.5rem;
        }

        .gallery-set .img:nth-of-type(5) {
            width: 72vw;
            height: 43.5vw;
            top: 65rem;
            right: 0;
            left: auto;
        }

        .gallery-set .img:nth-of-type(6) {
            width: 41.5vw;
            height: 66.5vw;
            top: 80rem;
            left: 0;
            right: auto;
        }

        .gallery-set .img:nth-of-type(7) {
            width: 41.5vw;
            height: 66.5vw;
            top: 93rem;
            right: 0;
            left: auto;
        }

        .gallery-set .img:nth-of-type(8) {
            width: 87.5vw;
            height: 53vw;
            top: 115rem;
            left: 0;
            right: auto;
        }
    }
}

.parallax {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 275vh;
    overflow: visible;
    z-index: -15;
    pointer-events: none;
    user-select: none;

    .bg {
        position: sticky;
        top: 0;
        width: 100%;
        height: 100vh;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
    }
}

.pager {
    width: 100%;

    background: linear-gradient($background 70%, transparent 100%);

    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;

    @media screen and (max-width: $mobile) {
        flex-wrap: wrap;
        gap: 0.875rem;
    }
}

.gallery-section + .pager {
    background: unset;
}

.pager-card {
    width: 21.5vw;
    aspect-ratio: 13 / 17;

    position: relative;
    perspective: 1000px;
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;

    &.prev {
        transform: rotateY(30deg);
    }

    &.next {
        transform: rotateY(-30deg);
    }

    @media screen and (max-width: $mobile) {
        width: 100%;
    }
}

.pager-item-wrapper {
    position: relative;
    text-decoration: none;
    color: inherit;
    cursor: pointer;

    &:hover .pager-card-content {
        filter: brightness(1);
    }

    @media screen and (max-width: $mobile) {
        width: 36vw;
    }
}

.pager-label-circle {
    width: 13vw;
    height: 13vw;

    position: absolute;
    top: 50%;
    transform: translateY(-50%);

    border-radius: 50%;
    border: 0.75px solid #ffffff14;
    background: #ffffff05;
    backdrop-filter: blur(72px);

    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    transition:
        width 0.3s ease,
        height 0.3s ease;

    span {
        @mixin display-bold-small;
        text-transform: uppercase;
        text-align: center;
    }

    @media screen and (max-width: $mobile) {
        width: 24vw;
        height: 24vw;

        span {
            font-size: 0.85rem;
        }
    }
}

.pager-item-wrapper:hover .pager-label-circle {
    width: 14vw;
    height: 14vw;

    @media screen and (max-width: $mobile) {
        width: 24vw;
        height: 24vw;
    }
}

.prev-wrapper .pager-label-circle {
    left: -7vw;
}

.next-wrapper .pager-label-circle {
    right: -7vw;
}

.pager-card-content {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 1.25rem;
    overflow: hidden;
    box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.15),
        0 1px 3px rgba(0, 0, 0, 0.1);
    filter: brightness(0.6);
    transition: filter 0.3s ease;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
}

.pager-card-content .inner-shadow {
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

.pager .home {
    width: calc(21.5vw * 17 / 13);
    height: calc(21.5vw * 17 / 13);

    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;

    border-radius: 1.5rem;
    border: solid 1px #ffffff14;
    background: #ffffff05;
    backdrop-filter: blur(16px);
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: box-shadow 0.3s ease;

    span {
        max-width: 14vw;
        @mixin display-bold-small;
        text-transform: uppercase;
    }

    &:hover {
        box-shadow:
            0 0 32px rgba(255, 255, 255, 0.2),
            0 0 64px rgba(255, 255, 255, 0.1);
    }

    @media screen and (max-width: $mobile) {
        width: calc(36vw + 36vw + 0.875rem);
        height: 4rem;
        order: 3;
        border-radius: 1rem;

        span {
            max-width: none;
            width: 35vw;
            font-size: 1rem;
        }
    }
}
</style>
