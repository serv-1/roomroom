import { RefObject, useEffect } from "react";

const useIntersectionObserver = <T extends HTMLElement>(
  ref: RefObject<T>,
  cb: IntersectionObserverCallback,
  opts?: {
    observerOptions?: IntersectionObserverInit;
    deps?: React.DependencyList;
  },
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const io = new IntersectionObserver(cb, opts?.observerOptions);

    io.observe(element);

    return () => io.unobserve(element);
  }, opts?.deps);
};

export default useIntersectionObserver;
