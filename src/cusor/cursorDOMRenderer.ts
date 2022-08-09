import { CursorDOMRenderer, CursorState, HoverTargetType } from "./cursor";
import { clamp } from "./cursor-util";
import { stylesheet } from "./stylesheet";

export interface CursorDOMElements {
  cursorElm: HTMLDivElement;
  highlightElm: HTMLDivElement;
}

/**

  Initialising the cursor elements

 */
export function createCursorElements(): [CursorDOMElements, () => void] {
  // hide cursor
  const baseWrapper = document.createElement("div");

  stylesheet(baseWrapper, {
    position: "fixed",
    left: "0px",
    top: "0px",
    bottom: "0px",
    right: "0px",
    cursor: "none",
    zIndex: "-1",
  });

  // hide cursor on the background
  stylesheet(document.body, {
    cursor: "none",
  });

  // the base element of the cursor
  const cursorElm = document.createElement("div");
  stylesheet(cursorElm, {
    position: "fixed",
    left: "0px",
    top: "0px",
    pointerEvents: "none",
    transitionProperty: "width,height,transform,opacity",
    transitionDuration: ".2s,.2s,.1s,.2s",
    transitionTimingFunction: "cubic-bezier(.04,.53,.44,1)",
  });

  const highlightElm = document.createElement("div");
  stylesheet(highlightElm, {
    position: "fixed",
    left: "0px",
    top: "0px",
    pointerEvents: "none",
    opacity: "1",
    transitionProperty: "width,height,transform,opacity",
    transitionDuration: ".2s,.2s,.1s,.2s",
    transitionTimingFunction: "cubic-bezier(.04,.53,.44,1)",
  });

  document.body.appendChild(baseWrapper);
  document.body.appendChild(cursorElm);
  document.body.appendChild(highlightElm);

  const cleanup = () => {
    document.body.removeChild(baseWrapper);
    document.body.removeChild(cursorElm);
    document.body.removeChild(highlightElm);
  };

  return [{ cursorElm, highlightElm }, cleanup];
}
/**

  Updating the dom elements

 */
export const updateCursorDOM: CursorDOMRenderer = ({
  DOMElements,
  x,
  y,
  velX,
  velY,
  width,
  height,
  hidden,
  hoverTarget,
}: CursorState) => {
  const maxSkewAmount = hoverTarget?.type === HoverTargetType.TEXT ? 5 : 50;
  const maxSkewSensitivity = hoverTarget?.type === HoverTargetType.TEXT ? 2 : 4;

  const skewXAmount = clamp(
    velX * maxSkewSensitivity,
    -maxSkewAmount,
    maxSkewAmount
  );
  const skewYAmount = clamp(
    velY * maxSkewSensitivity,
    -maxSkewAmount,
    maxSkewAmount
  );
  requestAnimationFrame(() =>
    stylesheet(DOMElements.cursorElm, {
      backgroundColor: `#F25410`,
      opacity: hidden ? "0" : "1",
      scaleX: hidden ? 0 : 1,
      scaleY: hidden ? 0 : 1,
      width: `${width}px`,
      height: `${height}px`,
      skewX: skewXAmount,
      skewY: skewYAmount,
      x: x - width / 2,
      y: y - height / 2,
    })
  );
};
