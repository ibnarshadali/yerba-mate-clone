import { useEffect, useRef } from 'react';
export function Animation({ url, className = '' }: { url: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let animation: { destroy: () => void } | undefined;
    import('lottie-web').then(({ default: lottie }) => {
      if (disposed || !ref.current) return;
      animation = lottie.loadAnimation({ container: ref.current, renderer: 'svg', loop: true, autoplay: !window.matchMedia('(prefers-reduced-motion: reduce)').matches, path: url });
    });
    return () => { disposed = true; animation?.destroy(); };
  }, [url]);
  return <div ref={ref} className={className} aria-hidden="true" />;
}