import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Initializes Lenis smooth scroll on the window.
 * Mount once with client:load — no wrapper needed, Lenis hooks into window scroll.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.07,
      duration: 1.2,
      smoothWheel: true,
      syncTouch: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
