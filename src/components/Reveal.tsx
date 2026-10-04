import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** Content stays visible without JavaScript and with reduced motion. */
export default function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (element.getBoundingClientRect().top >= window.innerHeight) element.dataset.visible = 'false';
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        element.dataset.visible = 'true';
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}>{children}</div>;
}
