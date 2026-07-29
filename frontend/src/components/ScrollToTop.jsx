import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search, key } = useLocation();

  const resetScroll = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useLayoutEffect(() => {
    resetScroll();
    const timer = setTimeout(resetScroll, 0);
    const animFrame = requestAnimationFrame(resetScroll);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animFrame);
    };
  }, [pathname, search, key]);

  useEffect(() => {
    // Disable browser automatic scroll restoration to ensure back navigation opens at top (0,0)
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handlePopState = () => {
      resetScroll();
      setTimeout(resetScroll, 0);
      requestAnimationFrame(resetScroll);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return null;
};

export default ScrollToTop;
