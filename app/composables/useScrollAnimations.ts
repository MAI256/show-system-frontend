import { ref, onMounted, onUnmounted } from "vue";

interface ScrollAnimation {
  selector: string;
  property: string;
  from: number | string;
  to: number | string;
  start: number | string;
  end: number | string;
  easing?: (t: number) => number;
  unit?: string;
  mode?: "container" | "viewport";
  customHandler?: (
    element: HTMLElement,
    progress: number,
    animation: ScrollAnimation,
  ) => void;
}

interface ScrollAnimationsConfig {
  container: string;
  animations: ScrollAnimation[];
  progressFunction?: () => number;
  timelineMode?: "container" | "pageOffset";
  timelineEndValue?: number;
}

export function useScrollAnimations(config: ScrollAnimationsConfig) {
  const scrollPercent = ref(0);
  const scrollVh = ref(0);
  let isDestroyed = false;
  let rafId: number | null = null;
  let ticking = false;

  // SSR guard - check if we're in browser
  const isBrowser = typeof window !== "undefined";

  // Cache DOM elements and calculations
  const cachedElements = new Map<string, HTMLElement>();
  const cachedPositions = new Map<string, { start: number; end: number }>();
  let containerElement: HTMLElement | null = null;
  let innerHeight = isBrowser ? window.innerHeight : 0;
  let pageYOffset = 0;

  const easings = {
    linear: (t: number) => t,
    easeIn: (t: number) => t * t,
    easeOut: (t: number) => 1 - Math.pow(1 - t, 2),
    easeInOut: (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    cubicBezier: (t: number) => {
      const p1x = 0.1,
        p1y = 0.1,
        p2x = 0.92,
        p2y = 0.73;
      const cx = 3 * p1x;
      const bx = 3 * (p2x - p1x) - cx;
      const cy = 3 * p1y;
      const by = 3 * (p2y - p1y) - cy;
      const ay = 1 - cy - by;
      return ay * t * t * t + by * t * t + cy * t;
    },
  };

  const interpolate = (from: number, to: number, progress: number): number => {
    return from + (to - from) * progress;
  };

  const parsePosition = (
    value: number | string,
    containerHeight: number,
    mode: "container" | "viewport" = "container",
  ): number => {
    if (typeof value === "number") {
      return value / 100;
    }

    if (typeof value === "string") {
      if (value === "0" || value === "100") {
        return parseFloat(value) / 100;
      }

      if (value.endsWith("vh")) {
        const vh = parseFloat(value);
        if (mode === "container") {
          const maxScrollVh =
            (Math.max(0, containerHeight - innerHeight) * 100) / innerHeight;
          return maxScrollVh > 0 ? vh / maxScrollVh : 0;
        } else {
          return (vh * innerHeight) / 100 / containerHeight;
        }
      }
      if (value.endsWith("%")) {
        return parseFloat(value) / 100;
      }
    }

    return parseFloat(value.toString()) / 100;
  };

  // Cache element lookups
  const getElement = (selector: string): HTMLElement | null => {
    if (!isBrowser) return null;

    if (!cachedElements.has(selector)) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        cachedElements.set(selector, element);
      }
      return element;
    }
    return cachedElements.get(selector) || null;
  };

  // Cache position calculations
  const getPositions = (
    animation: ScrollAnimation,
    containerHeight: number,
  ): { start: number; end: number } => {
    const cacheKey = `${animation.selector}-${animation.start}-${animation.end}-${animation.mode}`;

    if (!cachedPositions.has(cacheKey)) {
      const mode = animation.mode || "container";
      let animStart: number, animEnd: number;

      if (mode === "viewport") {
        animStart = parsePosition(animation.start, innerHeight, "viewport");
        animEnd = parsePosition(animation.end, innerHeight, "viewport");
      } else {
        animStart = parsePosition(
          animation.start,
          containerHeight,
          "container",
        );
        animEnd = parsePosition(animation.end, containerHeight, "container");
      }

      cachedPositions.set(cacheKey, { start: animStart, end: animEnd });
    }

    return cachedPositions.get(cacheKey)!;
  };

  const updateAnimations = () => {
    if (isDestroyed || !isBrowser) return;

    let progress: number;
    let containerHeight: number;

    if (config.progressFunction) {
      progress = Math.max(0, Math.min(1, config.progressFunction()));
      containerHeight = 1;
    } else if (config.timelineMode === "pageOffset") {
      const endValue = config.timelineEndValue || innerHeight;
      progress = Math.max(0, Math.min(1, pageYOffset / endValue));
      containerHeight = endValue;
    } else {
      if (!containerElement) {
        containerElement = document.querySelector(
          config.container,
        ) as HTMLElement;
      }
      if (!containerElement) return;

      const rect = containerElement.getBoundingClientRect();
      containerHeight = containerElement.offsetHeight;
      const totalScrollDistance = containerHeight - innerHeight;
      progress =
        totalScrollDistance > 0
          ? Math.max(0, Math.min(1, -rect.top / totalScrollDistance))
          : rect.top <= 0
            ? 1
            : 0;
    }

    scrollPercent.value = Math.round(progress * 100);
    const maxScrollDistance = Math.max(0, containerHeight - innerHeight);
    scrollVh.value =
      maxScrollDistance > 0
        ? Math.round(
            ((progress * maxScrollDistance * 100) / innerHeight) * 100,
          ) / 100
        : 0;

    // Batch DOM reads and writes
    const updates: Array<{
      element: HTMLElement;
      property: string;
      value: string;
    }> = [];

    config.animations.forEach((animation) => {
      const element = getElement(animation.selector);
      if (!element) return;

      const mode = animation.mode || "container";
      let animProgress: number;

      if (mode === "viewport") {
        const { start: animStart, end: animEnd } = getPositions(
          animation,
          containerHeight,
        );
        const elementRect = element.getBoundingClientRect();
        const elementTop = pageYOffset + elementRect.top;
        const viewportProgress =
          (pageYOffset - elementTop + innerHeight) / innerHeight;

        animProgress = Math.max(
          0,
          Math.min(1, (viewportProgress - animStart) / (animEnd - animStart)),
        );
      } else {
        const startIsVh =
          typeof animation.start === "string" && animation.start.endsWith("vh");
        const endIsVh =
          typeof animation.end === "string" && animation.end.endsWith("vh");

        if (startIsVh || endIsVh) {
          const startVh = startIsVh ? parseFloat(animation.start as string) : 0;
          const endVh = endIsVh ? parseFloat(animation.end as string) : 100;

          animProgress = Math.max(
            0,
            Math.min(1, (scrollVh.value - startVh) / (endVh - startVh)),
          );
        } else {
          const { start: animStart, end: animEnd } = getPositions(
            animation,
            containerHeight,
          );
          animProgress = Math.max(
            0,
            Math.min(1, (progress - animStart) / (animEnd - animStart)),
          );
        }
      }

      const easedProgress = animation.easing
        ? animation.easing(animProgress)
        : animProgress;

      let value: string;
      if (
        typeof animation.from === "number" &&
        typeof animation.to === "number"
      ) {
        const interpolatedValue = interpolate(
          animation.from,
          animation.to,
          easedProgress,
        );
        value = `${interpolatedValue}${animation.unit || ""}`;
      } else {
        value =
          easedProgress >= 1
            ? animation.to.toString()
            : animation.from.toString();
      }

      if (animation.customHandler) {
        animation.customHandler(element, easedProgress, animation);
      } else {
        updates.push({ element, property: animation.property, value });
      }
    });

    // Batch DOM writes
    updates.forEach(({ element, property, value }) => {
      if (property.includes(".")) {
        const [obj, prop] = property.split(".");
        if (obj && prop) {
          (element as any)[obj][prop] = value;
        }
      } else if (property === "width" || property === "height") {
        element.style[property] = value;
      } else {
        (element as any)[property] = value;
      }
    });

    ticking = false;
  };

  // Throttle scroll updates using requestAnimationFrame
  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      rafId = requestAnimationFrame(updateAnimations);
    }
  };

  const handleScroll = () => {
    pageYOffset = window.pageYOffset;
    requestUpdate();
  };

  const handleResize = () => {
    innerHeight = window.innerHeight;
    // Clear position cache on resize
    cachedPositions.clear();
    containerElement = null; // Re-query container element
    requestUpdate();
  };

  const init = () => {
    if (!isBrowser) return;

    // Update initial values
    innerHeight = window.innerHeight;
    pageYOffset = window.pageYOffset;

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Delay initial update to ensure DOM is ready
    requestAnimationFrame(() => {
      updateAnimations();
    });
  };

  const destroy = () => {
    isDestroyed = true;

    if (!isBrowser) return;

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);

    // Clear caches
    cachedElements.clear();
    cachedPositions.clear();
    containerElement = null;
  };

  const clearElementCache = (selector?: string) => {
    if (selector) {
      cachedElements.delete(selector);
      // Clear position cache for this selector
      for (const key of cachedPositions.keys()) {
        if (key.startsWith(selector)) {
          cachedPositions.delete(key);
        }
      }
    } else {
      cachedElements.clear();
      cachedPositions.clear();
    }
  };

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    destroy();
  });

  return {
    scrollPercent,
    scrollVh,
    easings,
    init,
    destroy,
    clearElementCache,
  };
}
