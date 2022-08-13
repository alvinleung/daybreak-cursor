import { stylesheet } from "./stylesheet";
import {
  Partial,
  clamp,
  createHoverState,
  detectOffscreen,
  observeMouseMove,
  setupIsMouseDown,
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
}

export interface HoverTarget {
  type: HoverTargetType;
  bounds: DOMRect | null;
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
export function setupCursor(): [CursorTargetRefresh, CursorCleanup] {
  const [allCursorElm, removeAllCursorElm] = createCursorElements();

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
    const cleanupTextCursorSelector = buildSelector({
      include: ".hover-target-text, .body-fractul,.body-founders,p,h1,h2,h3",
      exclude: ".hover-target-small, .hover-target-big",
    });
    const cleanupTextCursor = createHoverState(cleanupTextCursorSelector, {
      onMouseEnter: (target) => {
        const lineHeight = parseInt(getComputedStyle(target).fontSize);
        mutateCursorState({
          width: clamp(lineHeight * 0.08, DEFAULT_SIZE_TEXT, 12),
          height: lineHeight,
          hoverTarget: {
            type: HoverTargetType.TEXT,
            bounds: null,
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
    });

    const cleanupLinkSelector = buildSelector({
      include: ".hover-target-small, a",
      exclude: ".hover-target-big",
    });
    const cleanupLink = createHoverState(cleanupLinkSelector, {
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
          },
        });
      },
      onMouseLeave: (target) => {
        target.style.removeProperty("color");
        target.style.removeProperty("cursor");
        mutateCursorState({ hoverTarget: null });
      },
    });

    const cleanupLinkAreaSelector = buildSelector({
      include: ".hover-target-big, .project, .next-up-overlay",
      exclude: ".hover-target-small",
    });
    const cleanupLinkArea = createHoverState(cleanupLinkAreaSelector, {
      onMouseEnter: (target) => {
        const bounds = target.getBoundingClientRect();

        mutateCursorState({
          hoverTarget: {
            type: HoverTargetType.TARGET_BIG,
            bounds: bounds,
          },
        });
      },
      onMouseLeave: (target) => {
        mutateCursorState({ hoverTarget: null });
      },
    });

    return () => {
      cleanupLinkArea();
      cleanupLink();
      cleanupTextCursor();

      const resetAfterMouseMove = () => {
        mutateCursorState({
          width: DEFAULT_SIZE,
          height: DEFAULT_SIZE,
          hoverTarget: null,
        });
        window.removeEventListener("pointermove", resetAfterMouseMove);
      };
      window.addEventListener("pointermove", resetAfterMouseMove);
    };
  };

  let cleanupHoverState = setupHoverStates();
  function refreshHoverTargets() {
    cleanupHoverState();
    cleanupHoverState = setupHoverStates();
  }

  const cleaupIsMouseDown = setupIsMouseDown({
    onMouseDown: () => {
      mutateCursorState({ isMouseDown: true });
    },
    onMouseUp: () => {
      mutateCursorState({ isMouseDown: false });
    },
  });

  const cleanupOffscreenDetector = detectOffscreen({
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
  });

  const cleanupMouseMoveListeners = observeMouseMove({
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
  });

  function cleanup() {
    removeAllCursorElm();
    cleanupHoverState();
    cleanupOffscreenDetector();
    cleanupMouseMoveListeners();
    cleaupIsMouseDown();
  }

  return [refreshHoverTargets, cleanup];
}
