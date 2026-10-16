import { useEffect, useRef } from 'react';
export function Animation({ url, className = '' }: { url: string | undefined; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let animation: { destroy: () => void } | undefined;
    const element = ref.current;
    if (!element || !url) return;
    let started = false;
    const load = () => {
      if (started || disposed) return;
      started = true;
      import('lottie-web').then(({ default: lottie }) => {
        if (disposed) return;
        animation = lottie.loadAnimation({ container: element, renderer: 'svg', loop: true, autoplay: !window.matchMedia('(prefers-reduced-motion: reduce)').matches, path: url });
      });
    };
    // Fetch the visible artwork first, not every animation in the long page.
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        load();
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); animation?.destroy(); };
  }, [url]);
  return <div ref={ref} className={className} aria-hidden="true" />;
}