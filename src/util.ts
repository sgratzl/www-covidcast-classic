import { rgb, hsl } from 'd3-color';
import ResizeObserver from 'resize-observer-polyfill';

export function getTextColorBasedOnBackground(bgColor: string): string {
  const color = hsl(bgColor);
  return color.l > 0.32 ? '#000' : '#fff';
}

export function zip<T1, T2>(a1: readonly T1[], a2: readonly T2[]): [T1, T2][] {
  return a1.map((value, index) => [value, a2[index]]);
}

export function transparent(colors: string, opacity: number): string;
export function transparent(colors: readonly string[], opacity: number): string[];
export function transparent(colors: string | readonly string[], opacity: number): string | string[] {
  if (!Array.isArray(colors)) {
    return transparent([colors as string], opacity)[0];
  }

  return colors.map((c) => {
    const rgba = rgb(c);
    rgba.opacity = opacity;
    return rgba.toString();
  });
}

const observerListeners = new WeakMap<
  HTMLElement,
  (size: { width: number; height: number }, entry: ResizeObserverEntry) => void
>();
const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
  for (const entry of entries) {
    const listener = observerListeners.get(entry.target as HTMLElement);
    if (listener) {
      listener(entry.contentRect, entry);
    }
  }
});

export function observeResize(
  element: HTMLElement,
  listener: (size: { width: number; height: number }, entry: ResizeObserverEntry) => void,
): void {
  observerListeners.set(element, listener);
  observer.observe(element);
}

export function unobserveResize(element: HTMLElement): void {
  observerListeners.delete(element);
  observer.unobserve(element);
}

export function downloadUrl(url: string, name: string): void {
  const a = document.createElement('a');
  a.download = name;
  a.href = url;
  a.style.position = 'absolute';
  a.style.left = '-10000px';
  a.style.top = '-10000px';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
