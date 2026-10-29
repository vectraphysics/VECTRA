import { useCallback, useEffect, useRef, useState } from 'react';

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit & { triggerOnce?: boolean }
) {
  const elementRef = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Mark this node before effects run, allowing the page observer to skip it.
  const ref = useCallback((element: T | null) => {
    if (element) element.dataset.revealLocal = 'true';
    else if (elementRef.current) delete elementRef.current.dataset.revealLocal;
    elementRef.current = element;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const {
      triggerOnce = false,
      threshold = 0.01,
      rootMargin = '0px',
      ...observerOptions
    } = options ?? {};

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
      if (entry.isIntersecting && triggerOnce) observer.unobserve(entry.target);
    }, { threshold, rootMargin, ...observerOptions });

    observer.observe(element);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin, options?.triggerOnce]);

  return { ref, isVisible };
}
