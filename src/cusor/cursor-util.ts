export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export function createHoverState(
  selector: string,
  {
    onMouseEnter = (target: HTMLElement) => {},
    onMouseLeave = (target: HTMLElement) => {},
  }
) {
  const allText: NodeListOf<HTMLElement> = document.querySelectorAll(selector);

  function handlePointerEnter(e: PointerEvent) {
    onMouseEnter(e.target as HTMLElement);
  }
  function handlePointerLeave(e: PointerEvent) {
    // handle pointer leave
    onMouseLeave(e.target as HTMLElement);
  }

  allText.forEach((elm) => {
    elm.addEventListener("pointerenter", handlePointerEnter);
    elm.addEventListener("pointerleave", handlePointerLeave);
  });

  return () => {
    // cleanup
    allText.forEach((elm) => {
      elm.removeEventListener("pointerenter", handlePointerEnter);
      elm.removeEventListener("pointerleave", handlePointerLeave);
    });
  };
}

export function detectOffscreen({
  onEnterScreen = (e: MouseEvent) => {},
  onExitScreen = (e: MouseEvent) => {},
}) {
  const handlePointerEnter = (e: MouseEvent) => {
    onEnterScreen(e);
  };
  const handlePointerLeave = (e: MouseEvent) => {
    onExitScreen(e);
  };

  document.addEventListener("pointerenter", handlePointerEnter);
  document.addEventListener("pointerleave", handlePointerLeave);

  return () => {
    document.removeEventListener("pointerenter", handlePointerEnter);
    document.removeEventListener("pointerleave", handlePointerLeave);
  };
}

export function debounce(callback: Function, millisec: number) {
  let timeoutId: number;
  function triggerDebounce() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, millisec);
  }

  return triggerDebounce;
}

export function observeMouseMove({
  onMouseMove = (e: MouseEvent) => {},
  onMouseStop = () => {},
}) {
  const MOUSE_STOP_DELAY = 50;
  const mouseStopCallback = debounce(() => {
    onMouseStop();
  }, MOUSE_STOP_DELAY);

  function handleMouseMove(e: MouseEvent) {
    onMouseMove(e);

    // add a debouncer for timeout
    mouseStopCallback();
  }

  // Add mouse event
  window.addEventListener("pointermove", handleMouseMove);

  return () => {
    window.removeEventListener("pointermove", handleMouseMove);
  };
}
