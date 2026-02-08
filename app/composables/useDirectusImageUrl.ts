/**
 * Generate optimized Directus image URL based on device resolution
 * Accounts for screen size (not window) and devicePixelRatio (retina)
 */
export const useDirectusImageUrl = () => {
  // Get device resolution (not window)
  // Use same resolution for SSR and client to avoid hydration mismatch
  const getDeviceResolution = () => {
    // Always use standard resolution - don't optimize for device on SSR
    // Client will update images after hydration if needed
    return { width: 1920, height: 1080, ratio: 1 };
  };

  /**
   * Get optimal slider image dimensions based on screen width
   * Returns 1/4 of screen width on desktop, full width on mobile
   * Maintains 13:17 aspect ratio
   */
  const getSliderImageDimensions = () => {
    if (typeof window === "undefined") {
      // SSR - use desktop dimensions
      return { width: 480, height: 627 };
    }

    const screenWidth = window.innerWidth;
    const aspectRatio = 272 / 208; // 17rem / 13rem

    // Mobile: < 1200px - use full width
    // Desktop: >= 1200px - use 1/4 of width
    if (screenWidth < 1200) {
      // Mobile: use most of the screen width
      const width = Math.round(screenWidth * 0.95); // 95% of screen
      const height = Math.round(width * aspectRatio);
      return { width, height };
    } else {
      // Desktop: use 1/4 of screen width
      const width = Math.round(screenWidth / 4);
      const height = Math.round(width * aspectRatio);
      return { width, height };
    }
  };

  /**
   * Generate image URL with optimization parameters
   * @param fileId - File ID from Directus
   * @param quality - Quality 0-100 (default 80)
   * @param fit - Fit mode: contain, cover, crop (default contain)
   * @param width - Custom width (optional, uses device resolution if not provided)
   * @param height - Custom height (optional, uses device resolution if not provided)
   */
  const getImageUrl = (
    fileId: string,
    quality: number = 80,
    fit: "contain" | "cover" | "crop" = "cover",
    width?: number,
    height?: number,
  ): string => {
    if (!fileId) return "";

    const w = width || getDeviceResolution().width;
    const h = height || getDeviceResolution().height;

    return `https://admin.showsystem.productions/assets/${fileId}?width=${w}&height=${h}&quality=${quality}&fit=${fit}&format=webp`;
  };

  return {
    getImageUrl,
    getDeviceResolution,
    getSliderImageDimensions,
  };
};
