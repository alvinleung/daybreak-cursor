import { stylesheet } from "./stylesheet";
import {
  Partial,
  clamp,
  createHoverState,
  detectOffscreen,
  observeMouseMove,
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
  isHoveringText: boolean;
  hidden: boolean;
  width: number;
  height: number;
}

export type CursorDOMRenderer = (cursorInfo: CursorState) => void;
export type CursorCleanup = () => void;

function setupCursorState(
  cursorState: CursorState,
  renderFunction: CursorDOMRenderer
): [CursorState, (newCursorState: Partial<CursorState>) => void] {
  function mutateCursorState(newInfo: Partial<CursorState>) {
    Object.keys(newInfo).forEach((infoKey: string) => {
      cursorState[infoKey] = newInfo[infoKey];
    });

    // trigger re-render when setting cursor info
    renderFunction(cursorState);
  }

  return [cursorState, mutateCursorState];
}

/**
 *
 * @returns [CursorState, CursorCleanup]
 */
export function setupCursor(): [CursorState, CursorCleanup] {
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
      isHoveringText: false,
      width: DEFAULT_SIZE,
      height: DEFAULT_SIZE,
      DOMElements: allCursorElm,
    },
    updateCursorDOM
  );

  const cleanupTextCursor = createHoverState("p,h1,h2,h3", {
    onMouseEnter: (target) => {
      const lineHeight = parseInt(getComputedStyle(target).fontSize);
      mutateCursorState({
        width: DEFAULT_SIZE_TEXT,
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

  const cleanupLink = createHoverState(".hover-target-small, a", {
    onMouseEnter: (target) => {
      const bounds = target.getBoundingClientRect();
      mutateCursorState({
        hoverTarget: {
          type: HoverTargetType.TARGET_SMALL,
          bounds: bounds,
        },
      });
    },
    onMouseLeave: (target) => {
      mutateCursorState({ hoverTarget: null });
    },
  });

  const cleanupLinkArea = createHoverState(".hover-target-big", {
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
    cleanupTextCursor();
    cleanupLink();
    cleanupLinkArea();
    cleanupOffscreenDetector();
    cleanupMouseMoveListeners();
  }

  return [cursorState, cleanup];
}
