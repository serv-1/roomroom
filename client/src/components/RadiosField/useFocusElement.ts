import { useEffect } from "react";

const useFocusElement = <T extends HTMLElement>(
  element: React.RefObject<T>,
  focused?: boolean,
) => {
  useEffect(() => {
    if (focused && element.current) {
      element.current.focus({ preventScroll: true });
    }
  }, [focused]);
};

export default useFocusElement;
