export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export interface UseTouchInput {
  value: boolean
}

export function createHoverState(
  selector: string,
  {
    onMouseEnter = (target: HTMLElement) => { },
    onMouseLeave = (target: HTMLElement) => { },
  },
  isUsingTouch: UseTouchInput
) {
  const allText: NodeListOf<HTMLElement> = document.querySelectorAll(selector);

  function handlePointerEnter(e: PointerEvent) {
    if (isUsingTouch.value) return;
    onMouseEnter(e.target as HTMLElement);
  }
  function handlePointerLeave(e: PointerEvent) {
    if (isUsingTouch.value) return;
    // handle pointer leave
    onMouseLeave(e.target as HTMLElement);
  }

  allText.forEach((elm) => {
    elm.addEventListener("pointerover", handlePointerEnter, true);
    elm.addEventListener("pointerout", handlePointerLeave, true);
  });

  return () => {
    // cleanup
    allText.forEach((elm) => {
      elm.removeEventListener("pointerover", handlePointerEnter, true);
      elm.removeEventListener("pointerout", handlePointerLeave, true);
    });
  };
}

export function detectOffscreen({
  onEnterScreen = (e: MouseEvent) => { },
  onExitScreen = (e: MouseEvent) => { },
}, isUsingTouch: UseTouchInput) {
  const handlePointerEnter = (e: MouseEvent) => {
    if (isUsingTouch.value) return;
    onEnterScreen(e);
  };
  const handlePointerLeave = (e: MouseEvent) => {
    if (isUsingTouch.value) return;
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
  onMouseMove = (e: MouseEvent) => { },
  onMouseStop = () => { },
}, isUsingTouch: UseTouchInput) {
  const MOUSE_STOP_DELAY = 50;
  const mouseStopCallback = debounce(() => {
    onMouseStop();
  }, MOUSE_STOP_DELAY);

  function handleMouseMove(e: MouseEvent) {
    if (isUsingTouch.value) return;
    onMouseMove(e);
    // add a debouncer for timeout
    mouseStopCallback();
  }

  // Add mouse event
  window.addEventListener("mousemove", handleMouseMove);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
  };
}

export function setupIsMouseDown({
  onMouseDown = () => { },
  onMouseUp = () => { },
}, isUsingTouch: UseTouchInput) {
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  return () => {
    window.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mosueup", onMouseUp);
  };
}
