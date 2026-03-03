import { useEffect, useState } from "react";

const MEDIA_QUERIES = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1199px)",
  desktop: "(min-width: 1200px)",
} as const;

export const useBreakpoint = () => {
  const [state, setState] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const mediaEntries = Object.entries(MEDIA_QUERIES).map(([key, query]) => [
      key,
      window.matchMedia(query),
    ]) as Array<[keyof typeof MEDIA_QUERIES, MediaQueryList]>;

    const sync = () => {
      setState({
        isMobile: mediaEntries.find(([key]) => key === "mobile")?.[1].matches ?? false,
        isTablet: mediaEntries.find(([key]) => key === "tablet")?.[1].matches ?? false,
        isDesktop: mediaEntries.find(([key]) => key === "desktop")?.[1].matches ?? false,
      });
    };

    sync();
    mediaEntries.forEach(([, media]) => media.addEventListener("change", sync));

    return () => {
      mediaEntries.forEach(([, media]) => media.removeEventListener("change", sync));
    };
  }, []);

  return state;
};
