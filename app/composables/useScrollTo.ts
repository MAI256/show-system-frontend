/**
 * Composable для анимированного скролла к секциям
 */

// Конвертация offset в пиксели
function parseOffset(offset: number | string): number {
  if (typeof offset === "number") {
    return offset;
  }

  if (typeof offset === "string") {
    if (offset.endsWith("vh")) {
      const vh = parseFloat(offset);
      return (vh * window.innerHeight) / 100;
    }
    if (offset.endsWith("%")) {
      const percent = parseFloat(offset);
      return (percent * window.innerHeight) / 100;
    }
    if (offset.endsWith("px")) {
      return parseFloat(offset);
    }
  }

  return parseFloat(offset.toString()) || 0;
}

// // Плавный ease-out
// function easeOut(t: number): number {
//   return 1 - Math.pow(1 - t, 3);
// }

// // Анимированный скролл с динамической длительностью и разгоном
// function animateScrollTo(targetPosition: number) {
//   const startPosition = window.pageYOffset;
//   const distance = Math.abs(targetPosition - startPosition);

//   const viewportHeight = window.innerHeight;
//   const distanceInVh = distance / viewportHeight;

//   // Нелинейная зависимость с разгоном после 250vh (ускорено в 3 раза)
//   function calculateDuration(vh: number): number {
//     if (vh <= 250) {
//       return vh * 0.25; // 0.75 / 3
//     } else {
//       const baseTime = 250 * 0.333; // 1 / 3
//       const excessVh = vh - 250;
//       const acceleratedTime = Math.log(excessVh + 1) * 40; // 120 / 3
//       return baseTime + acceleratedTime;
//     }
//   }

//   const durationSeconds = calculateDuration(distanceInVh);
//   const duration = Math.max(durationSeconds * 1000, 100); // 300 / 3

//   let startTime: number | null = null;

//   function animation(currentTime: number) {
//     if (startTime === null) startTime = currentTime;
//     const timeElapsed = currentTime - startTime;
//     const progress = Math.min(timeElapsed / duration, 1);

//     const easedProgress = easeOut(progress);
//     const currentPosition =
//       startPosition + (targetPosition - startPosition) * easedProgress;

//     window.scrollTo(0, currentPosition);

//     if (progress < 1) {
//       requestAnimationFrame(animation);
//     }
//   }

//   requestAnimationFrame(animation);
// }

// Мгновенная телепортация
function animateScrollTo(targetPosition: number) {
  window.scrollTo(0, targetPosition);
}

export interface ScrollToOptions {
  offset?: number | string;
}

/**
 * Composable для анимированного скролла к элементу
 */
export function useScrollTo() {
  const scrollToSection = (
    sectionId: string,
    options: ScrollToOptions = {},
  ) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const offset = options.offset || 0;
    const elementTop = element.offsetTop;
    const offsetPixels = parseOffset(offset);
    const finalPosition = elementTop + offsetPixels;

    animateScrollTo(finalPosition);
  };

  return {
    scrollToSection,
  };
}
