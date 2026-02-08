<template>
  <div
    ref="customScrollbar"
    class="custom-scrollbar"
    :class="{ 'mobile-hidden': isTouchDevice }"
  >
    <div
      ref="scrollbarThumb"
      class="custom-scrollbar-thumb"
      @mousedown.stop.prevent="startDrag"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const customScrollbar = ref(null);
const scrollbarThumb = ref(null);
const isTouchDevice = ref(false);
const isDragging = ref(false);
const dragStartY = ref(0);
const dragStartScrollTop = ref(0);

// Detect touch device
const detectTouchDevice = () => {
  isTouchDevice.value =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

const updateScrollbarPosition = () => {
  if (!scrollbarThumb.value) return;

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  const scrollPercentage = scrollTop / (documentHeight - windowHeight);
  const thumbHeight = Math.max(
    30,
    (windowHeight / documentHeight) * windowHeight
  );
  const maxThumbTop = windowHeight - thumbHeight;
  const thumbTop = scrollPercentage * maxThumbTop;

  scrollbarThumb.value.style.height = `${thumbHeight}px`;
  scrollbarThumb.value.style.top = `${thumbTop}px`;
};

onMounted(() => {
  detectTouchDevice();
  window.addEventListener("scroll", updateScrollbarPosition);
  window.addEventListener("resize", updateScrollbarPosition);
  updateScrollbarPosition();
});


const startDrag = (event) => {
  isDragging.value = true;
  dragStartY.value = event.clientY;
  dragStartScrollTop.value =
    window.pageYOffset || document.documentElement.scrollTop;

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
  document.body.style.userSelect = "none";
};

const onDrag = (event) => {
  if (!isDragging.value) return;

  const deltaY = event.clientY - dragStartY.value;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollableHeight = documentHeight - windowHeight;

  // Calculate scroll position based on drag distance
  const scrollRatio = deltaY / windowHeight;
  const newScrollTop =
    dragStartScrollTop.value + scrollRatio * scrollableHeight;

  // Clamp scroll position
  const clampedScrollTop = Math.max(
    0,
    Math.min(scrollableHeight, newScrollTop)
  );

  window.scrollTo(0, clampedScrollTop);
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.body.style.userSelect = "";
};

onUnmounted(() => {
  window.removeEventListener("scroll", updateScrollbarPosition);
  window.removeEventListener("resize", updateScrollbarPosition);
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
});
</script>

<style scoped>
.custom-scrollbar {
  position: fixed;
  top: 0;
  right: 0;
  width: 0.5rem;
  height: 100dvh;
  z-index: 9999;
  pointer-events: auto;
}

.custom-scrollbar-thumb {
  position: absolute;
  right: 0;
  width: 0.5rem;
  background: var(--scrollbar-color);
  border-radius: 100px;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10000;
}

.custom-scrollbar:hover .custom-scrollbar-thumb {
  opacity: 0.3;
}

.custom-scrollbar-thumb:hover {
  opacity: 0.5;
}

.custom-scrollbar-thumb:active {
  cursor: grabbing;
  opacity: 0.6;
}

.custom-scrollbar.mobile-hidden {
  display: none;
}
</style>
