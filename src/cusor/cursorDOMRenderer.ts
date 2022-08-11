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

  baseWrapper.classList.add("persist");
  baseWrapper.setAttribute("persist-id", "cursor-base-wrapper");

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
  cursorElm.setAttribute("persist-id", "cursor");
  stylesheet(cursorElm, {
    position: "fixed",
    left: "0px",
    top: "0px",
    pointerEvents: "none",
    opacity: "0",
    transitionProperty: "width,height,transform,opacity",
    transitionDuration: ".2s,.2s,.1s,.2s",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    // borderRadius: "4px",
    zIndex: "10000",
  });

  const highlightElm = document.createElement("div");
  highlightElm.setAttribute("persist-id", "cursor-highlight");
  stylesheet(highlightElm, {
    position: "fixed",
    left: "0px",
    top: "0px",
    pointerEvents: "none",
    opacity: ".5",
    willChange: "width,height,transform,opacity,border-radius",
    transitionProperty: "width,height,transform,opacity,border-radius",
    transitionDuration: ".3s,.3s,.2s,.2s,.2s",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    // backgroundColor: `#F25410`,
    border: "2px dashed #F25410",
    // boxSizing: "border-box",
    // borderRadius: "4px",
    zIndex: "1000",
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
  isMouseDown,
}: CursorState) => {
  const isHoveringText = hoverTarget?.type === HoverTargetType.TEXT;
  const isHoveringTargetBig = hoverTarget?.type === HoverTargetType.TARGET_BIG;
  const isHoveringTargetSmall =
    hoverTarget?.type === HoverTargetType.TARGET_SMALL;
  const isHovering = isHoveringTargetBig || isHoveringTargetSmall;

  const maxSkewAmount = isHoveringText ? 5 : 12;
  const maxSkewSensitivity = isHoveringText ? 2 : 4;

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

  const cursorPosX = x - width / 2;
  const cursorPosY = y - height / 2;

  const BIG_TARGET_HOVER_SCALE = 3;

  const highlightElmBox = (() => {
    if (isHoveringTargetSmall && hoverTarget.bounds) {
      const posX = hoverTarget.bounds.x || cursorPosX;
      const posY = hoverTarget.bounds.y || cursorPosY;

      const paddingX = hoverTarget.bounds.width * 0.09;
      const paddingY = hoverTarget.bounds.height * 0.09;

      const boxWidth = hoverTarget.bounds.width + paddingX * 2 || width;
      const boxHeight = hoverTarget.bounds.height + paddingY * 2 || height;

      const sensitivityFactor = 0.2;
      const offsetX =
        (posX + hoverTarget.bounds.width / 2 + paddingX * 2 - x) *
        sensitivityFactor;
      const offsetY =
        (posY + hoverTarget.bounds.height / 2 + paddingY * 2 - y) *
        sensitivityFactor;
      // set it
      return {
        x: posX - paddingX - offsetX,
        y: posY - paddingY - offsetY,
        width: boxWidth,
        height: boxHeight,
      };
    }

    if (isHoveringTargetBig) {
      const boxWidth = width * BIG_TARGET_HOVER_SCALE;
      const boxHeight = height * BIG_TARGET_HOVER_SCALE;

      return {
        x: x - boxWidth / 2,
        y: y - boxHeight / 2,
        width: boxWidth,
        height: boxHeight,
      };
    }

    return { x: cursorPosX, y: cursorPosY, width: width, height: height };
  })();

  const cursorScale = (() => {
    if (hidden) {
      return 0;
    }
    if (isHoveringTargetBig) {
      return 0.5;
    }
    if (isHoveringTargetSmall) {
      return 0;
    }
    return 1;
  })();

  stylesheet(DOMElements.highlightElm, {
    // backgroundColor:
    //   isHoveringTargetBig || isHoveringTargetSmall
    //     ? "rgba(242, 84,16, 0)"
    //     : "rgba(242, 84, 16, 1)",
    opacity: isHoveringTargetBig || isHoveringTargetSmall ? "1" : "0",
    x: highlightElmBox.x,
    y: highlightElmBox.y,
    skewX: skewXAmount / 3,
    skewY: skewYAmount / 3,
    scaleX: isMouseDown ? 0.9 : 1,
    scaleY: isMouseDown ? 0.9 : 1,
    width: `${highlightElmBox.width}px`,
    height: `${highlightElmBox.height}px`,
    borderRadius: isHoveringTargetBig ? "100%" : "0%",
  });

  stylesheet(DOMElements.cursorElm, {
    backgroundColor: `#F25410`,
    opacity: hidden ? "0" : "1",
    scaleX: isMouseDown && !isHovering ? 0.92 : cursorScale,
    scaleY: isMouseDown && !isHovering ? 0.92 : cursorScale,
    width: `${width}px`,
    height: `${height}px`,
    skewX: skewXAmount,
    skewY: skewYAmount,
    x: cursorPosX,
    y: cursorPosY,
  });
};
