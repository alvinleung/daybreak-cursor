import { stylesheet } from "./stylesheet";
import {
  Partial,
  clamp,
  createHoverState,
  detectOffscreen,
  observeMouseMove,
  setupIsMouseDown,
  UseTouchInput,
} from "./cursor-util";
import {
  createCursorElements,
  CursorDOMElements,
  updateCursorDOM,
} from "./cursorDOMRenderer";

export enum HoverTargetType {
  TEXT, // for paragraph
  TARGET_BIG, // for an area like a photo
  TARGET_SMALL, // for text link
  TARGET_ARROW,
}

export interface HoverTarget {
  type: HoverTargetType;
  bounds: DOMRect | null;
  target: HTMLElement;
}

export interface CursorState {
  DOMElements: CursorDOMElements;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  velX: number;
  velY: number;
  accelX: number;
  accelY: number;
  hoverTarget: HoverTarget | null;
  isMouseDown: boolean;
  hidden: boolean;
  width: number;
  height: number;
  useTouchInput: UseTouchInput;
}

export type CursorDOMRenderer = (cursorInfo: CursorState) => void;
export type CursorCleanup = () => void;
export type CursorTargetRefresh = () => void;

function setupCursorState(
  cursorState: CursorState,
  renderFunction: CursorDOMRenderer
): [CursorState, (newCursorState: Partial<CursorState>) => void] {
  let hasUnrenderedState = false;

  // delay the render to the next animation frame
  // so that everything render as one after state mutation
  function attemptRender() {
    if (cursorState.useTouchInput.value === true) return;

    // Only render if there's new state
    if (!hasUnrenderedState) return;
    hasUnrenderedState = false;
    renderFunction(cursorState);
  }
  function triggerRender() {
    hasUnrenderedState = true;
    requestAnimationFrame(attemptRender);
  }

  function mutateCursorState(newInfo: Partial<CursorState>) {
    Object.keys(newInfo).forEach((infoKey: string) => {
      cursorState[infoKey] = newInfo[infoKey];
    });

    // trigger re-render when setting cursor info
    triggerRender();
  }

  return [cursorState, mutateCursorState];
}

/**
 *
 * @returns [CursorState, CursorCleanup]
 */

const isTouchDevice: any =
  navigator.maxTouchPoints || "ontouchstart" in document.documentElement;

export function setupCursor() {
  const [allCursorElm, removeAllCursorElm] = createCursorElements();
  const useTouchInput: UseTouchInput = { value: isTouchDevice };

  const DEFAULT_SIZE = 10;
  const DEFAULT_SIZE_TEXT = 2;

  const [cursorState, mutateCursorState] = setupCursorState(
    {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      velX: 0,
      velY: 0,
      accelX: 0,
      accelY: 0,
      hoverTarget: null,
      hidden: false,
      isMouseDown: false,
      width: DEFAULT_SIZE,
      height: DEFAULT_SIZE,
      DOMElements: allCursorElm,
      useTouchInput: useTouchInput,
    },
    updateCursorDOM
  );

  const buildSelector = ({ include = "", exclude = "" }) => {
    if (exclude === "") return include;

    return include
      .split(",")
      .map((includeClass) => {
        return `${includeClass}:not(${exclude})`;
      })
      .join(",");
  };

  const setupHoverStates = () => {
    Array.from<HTMLElement>(document.querySelectorAll("a *")).forEach(
      (elm: HTMLElement) => {
        return (elm.style.pointerEvents = "none");
      }
    );

    const textCursorSelector = buildSelector({
      include:
        ".hover-target-text, .body-fractul,.body-founders, .caption,p,h1,h2,h3",
      exclude:
        ".hover-target-small, .hover-target-big, a *, .hover-target-small *, .hover-target-arrow *, .next-up-wrapper *",
    });
    const cleanupTextCursor = createHoverState(
      textCursorSelector,
      {
        onMouseEnter: (target) => {
          if (
            target.style.opacity === "0" ||
            target.style.visibility === "hidden"
          )
            return;

          const lineHeight = parseInt(getComputedStyle(target).fontSize);
          mutateCursorState({
            width: clamp(lineHeight * 0.06, DEFAULT_SIZE_TEXT, 12),
            height: lineHeight,
            hoverTarget: {
              type: HoverTargetType.TEXT,
              bounds: null,
              target,
            },
          });
        },
        onMouseLeave: () => {
          mutateCursorState({
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            hoverTarget: null,
          });
        },
      },
      useTouchInput
    );

    const linkSelector = buildSelector({
      include: ".hover-target-small, a",
      exclude: ".hover-target-big",
    });
    const cleanupLink = createHoverState(
      linkSelector,
      {
        onMouseEnter: (target) => {
          const bounds = target.getBoundingClientRect();
          target.style.color = "#f25410";
          target.style.cursor = "none";
          mutateCursorState({
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            hoverTarget: {
              type: HoverTargetType.TARGET_SMALL,
              bounds: bounds,
              target: target,
            },
          });
        },
        onMouseLeave: (target) => {
          target.style.removeProperty("color");
          target.style.removeProperty("cursor");
          mutateCursorState({ hoverTarget: null });
        },
      },
      useTouchInput
    );

    const linkAreaSelector = buildSelector({
      include: ".hover-target-big, .project",
      exclude: ".hover-target-small",
    });
    const cleanupLinkArea = createHoverState(
      linkAreaSelector,
      {
        onMouseEnter: (target) => {
          const bounds = target.getBoundingClientRect();

          mutateCursorState({
            hoverTarget: {
              type: HoverTargetType.TARGET_BIG,
              bounds: bounds,
              target,
            },
          });
        },
        onMouseLeave: (target) => {
          mutateCursorState({ hoverTarget: null });
        },
      },
      useTouchInput
    );

    const arrowLinkSelector = buildSelector({
      include: ".hover-target-arrow, .next-up-wrapper",
      exclude: ".hover-target-small",
    });
    const cleanupArrowLink = createHoverState(
      arrowLinkSelector,
      {
        onMouseEnter: (target) => {
          const bounds = target.getBoundingClientRect();

          mutateCursorState({
            hoverTarget: {
              type: HoverTargetType.TARGET_ARROW,
              bounds: bounds,
              target,
            },
          });
        },
        onMouseLeave: (target) => {
          mutateCursorState({ hoverTarget: null });
        },
      },
      useTouchInput
    );

    return () => {
      const cleanup = () => {
        cleanupLinkArea();
        cleanupLink();
        cleanupTextCursor();
        cleanupArrowLink();
      };

      // just straight up execute cleanup if no hover target
      if (!cursorState.hoverTarget) {
        cleanup();
        return;
      }

      const resetAfterMouseMove = () => {
        if (cursorState.hoverTarget) return;
        mutateCursorState({
          width: DEFAULT_SIZE,
          height: DEFAULT_SIZE,
          hoverTarget: null,
        });
        window.removeEventListener("mousemove", resetAfterMouseMove);
      };
      window.addEventListener("mousemove", resetAfterMouseMove);
    };
  };

  let cleanupHoverState = setupHoverStates();
  function refreshHoverTargets() {
    cleanupHoverState();
    cleanupHoverState = setupHoverStates();
  }

  const cleaupIsMouseDown = setupIsMouseDown(
    {
      onMouseDown: () => {
        mutateCursorState({ isMouseDown: true });
      },
      onMouseUp: () => {
        mutateCursorState({ isMouseDown: false });
      },
    },
    useTouchInput
  );

  const cleanupOffscreenDetector = detectOffscreen(
    {
      onEnterScreen: (e: MouseEvent) => {
        mutateCursorState({
          x: e.clientX,
          y: e.clientY,
          hidden: false,
        });
      },
      onExitScreen: () => {
        mutateCursorState({
          hidden: true,
        });
      },
    },
    useTouchInput
  );

  const cleanupMouseMoveListeners = observeMouseMove(
    {
      onMouseMove: (e: MouseEvent) => {
        const prevX = cursorState.x;
        const prevY = cursorState.y;
        const x = e.clientX;
        const y = e.clientY;
        const velX = x - prevX;
        const velY = y - prevY;

        mutateCursorState({
          prevX: prevX,
          prevY: prevY,
          x: x,
          y: y,
          velX: velX,
          velY: velY,
        });
      },
      onMouseStop: () => {
        mutateCursorState({
          prevX: cursorState.x,
          prevY: cursorState.y,
          velX: 0,
          velY: 0,
        });
      },
    },
    useTouchInput
  );

  const switchTouchAndMouse = (e: PointerEvent) => {
    if (e.pointerType === "mouse") {
      useTouchInput.value = false;
    }
    if (e.pointerType === "touch") {
      useTouchInput.value = true;
    }
  };
  document.body.addEventListener("pointermove", switchTouchAndMouse);

  function cleanup() {
    document.body.addEventListener("pointermove", switchTouchAndMouse);
    removeAllCursorElm();
    cleanupHoverState();
    cleanupOffscreenDetector();
    cleanupMouseMoveListeners();
    cleaupIsMouseDown();
  }

  return { refershCursorTargets: refreshHoverTargets, cleanupCursor: cleanup };
}
