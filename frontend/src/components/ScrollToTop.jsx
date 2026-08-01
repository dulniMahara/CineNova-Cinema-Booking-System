import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Reusable component that resets window scroll position to (0, 0)
 * whenever route location changes.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
