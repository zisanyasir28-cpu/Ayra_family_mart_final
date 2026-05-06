import { useEffect, useRef, useState } from 'react';

interface Options {
  /** When true, only triggers once and stays true. Default: true. */
  once?:      boolean;
  /** Intersection threshold (0–1). Default: 0.2. */
  threshold?: number;
  /** Root margin (CSS shorthand). Default: '0px'. */
  rootMargin?: string;
}

/**
 * IntersectionObserver hook — returns a ref to attach to an element and a
 * boolean indicating whether the element is currently in view.
 */
export function useInView<T extends Element>({
  once       = true,
  threshold  = 0.2,
  rootMargin = '0px',
}: Options = {}): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return [ref, inView];
}
