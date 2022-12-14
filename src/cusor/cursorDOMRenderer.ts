import { CursorDOMRenderer, CursorState, HoverTargetType } from "./cursor";
import { clamp } from "./cursor-util";
import { stylesheet } from "./stylesheet";

export interface CursorDOMElements {
  cursorElm: HTMLDivElement;
  highlightElm: HTMLDivElement;
  containerElm: HTMLDivElement;
  arrowSvg: SVGSVGElement;
  arrowSvgRight: SVGSVGElement;
  arrowSvgSplit: SVGSVGElement;
}

/**

  Initialising the cursor elements

 */
export function createCursorElements(): [CursorDOMElements, () => void] {
  // hide cursor
  // const baseWrapper = document.createElement("div");

  // baseWrapper.classList.add("persist");
  // baseWrapper.setAttribute("persist-id", "cursor-base-wrapper");
  // baseWrapper.setAttribute("persist-permanent", "true");

  // stylesheet(baseWrapper, {
  //   position: "fixed",
  //   left: "0px",
  //   top: "0px",
  //   bottom: "0px",
  //   right: "0px",
  //   cursor: "none",
  //   zIndex: "-1",
  // });

  // hide cursor on the background
  stylesheet(document.body, {
    cursor: "none",
  });

  const containerElm = document.createElement("div");
  containerElm.setAttribute("persist-id", "cursor");
  containerElm.setAttribute("persist-permanent", "true");
  stylesheet(containerElm, {
    position: "fixed",
    left: "0px",
    top: "0px",
    pointerEvents: "none",
    // borderRadius: "4px",
    zIndex: "10000",
  });

  // the base element of the cursor
  const cursorElm = document.createElement("div");
  stylesheet(cursorElm, {
    // position: "fixed",
    // left: "0px",
    // top: "0px",
    pointerEvents: "none",
    opacity: "0",
    willChange: "width,height,transform,opacity",
    transitionProperty: "width,height,transform,opacity",
    transitionDuration: ".2s,.2s,.1s,.2s",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  });

  const highlightElm = document.createElement("div");
  highlightElm.setAttribute("persist-id", "cursor-highlight");
  highlightElm.setAttribute("persist-permanent", "true");
  stylesheet(highlightElm, {
    position: "fixed",
    left: "0px",
    top: "0px",
    pointerEvents: "none",
    opacity: "0",
    willChange: "width,height,transform,opacity",
    transitionProperty: "width,height,transform,opacity",
    transitionDuration: ".3s,.3s,.2s,.2s,.2s",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    // backgroundColor: `#F25410`,
    border: "1px dashed #F25410",
    boxSizing: "border-box",
    // borderRadius: "4px",
    zIndex: "1000",
  });

  const arrowElm = document.createElement("div");
  arrowElm.style.position = "relative";

  const arrowSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  arrowSvg.style.position = "absolute";
  arrowSvg.style.transform = "translate(-30%,-25%) scale(0)";
  arrowSvg.style.transition = "transform .2s cubic-bezier(0.22, 1, 0.36, 1)";

  const arrowPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  arrowSvg.setAttribute("width", "24");
  arrowSvg.setAttribute("height", "24");
  arrowSvg.setAttribute("viewbox", "0 0 24 24");
  arrowSvg.setAttribute("fill", "none");

  arrowPath.setAttribute(
    "d",
    "M18.707 12.707L17.293 11.293L13 15.586V6H11V15.586L6.70697 11.293L5.29297 12.707L12 19.414L18.707 12.707Z"
  );
  arrowPath.setAttribute("fill", "#F25410");
  arrowSvg.appendChild(arrowPath);
  arrowElm.appendChild(arrowSvg);
  
  
  const arrowElmRight = document.createElement("div");
  arrowElmRight.style.position = "relative";
  
  const arrowSvgRight = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  arrowSvgRight.style.position = "absolute";
  arrowSvgRight.style.transform = "translate(-30%,-25%) scale(0)";
  arrowSvgRight.style.transition = "transform .2s cubic-bezier(0.22, 1, 0.36, 1)";

  const arrowPathRight = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  arrowSvgRight.setAttribute("width", "24");
  arrowSvgRight.setAttribute("height", "24");
  arrowSvgRight.setAttribute("viewbox", "0 0 24 24");
  arrowSvgRight.setAttribute("fill", "none");

  arrowPathRight.setAttribute(
    "d",
    "M12 5.99994L10.586 7.41394L14.879 11.7069L5.29297 11.7069L5.29297 13.7069L14.879 13.7069L10.586 17.9999L12 19.4139L18.707 12.7069L12 5.99994Z"
  );
  arrowPathRight.setAttribute("fill", "#F25410");
  arrowSvgRight.appendChild(arrowPathRight);
  arrowElmRight.appendChild(arrowSvgRight);
  
  
  const arrowElmSplit = document.createElement("div");
  arrowElmSplit.style.position = "relative";
  
  const arrowSvgSplit = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  arrowSvgSplit.style.position = "absolute";
  arrowSvgSplit.style.transform = "translate(-30%,-25%) scale(0)";
  arrowSvgSplit.style.transition = "transform .2s cubic-bezier(0.22, 1, 0.36, 1)";

  const arrowPathSplit = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  arrowSvgSplit.setAttribute("width", "24");
  arrowSvgSplit.setAttribute("height", "24");
  arrowSvgSplit.setAttribute("viewbox", "0 0 24 24");
  arrowSvgSplit.setAttribute("fill", "none");

  arrowPathSplit.setAttribute(
    "d",
    "M7.26461 16.6205L5.99964 17.8855L-0.000488281 11.8854L5.99964 5.88525L7.26461 7.15023L3.42407 10.9908L20.5755 10.9908L16.7349 7.15024L17.9999 5.88526L24 11.8854L17.9999 17.8855L16.7349 16.6205L20.5755 12.78L3.42407 12.78L7.26461 16.6205Z"
  );

  arrowPathSplit.setAttribute("fill", "#F25410");
  arrowSvgSplit.appendChild(arrowPathSplit);
  arrowElmSplit.appendChild(arrowSvgSplit);

  // document.body.appendChild(baseWrapper);
  containerElm.appendChild(arrowElmRight);
  containerElm.appendChild(arrowElmSplit);
  containerElm.appendChild(arrowElm);
  containerElm.appendChild(cursorElm);
  document.body.appendChild(containerElm);
  document.body.appendChild(highlightElm);

  const cleanup = () => {
    // document.body.removeChild(baseWrapper);
    containerElm.removeChild(cursorElm);
    document.body.removeChild(highlightElm);
    document.body.removeChild(containerElm);
  };

  return [{ cursorElm, highlightElm, containerElm, arrowSvg, arrowSvgRight, arrowSvgSplit }, cleanup];
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
  useTouchInput,
}: CursorState) => {
  if (useTouchInput.value === true) {
    stylesheet(DOMElements.highlightElm, {
      opacity: "0",
    });
    stylesheet(DOMElements.cursorElm, {
      opacity: "0",
    });
    return;
  }

  const isHoveringText = hoverTarget?.type === HoverTargetType.TEXT;
  const isHoveringTargetBig = hoverTarget?.type === HoverTargetType.TARGET_BIG;
  const isHoveringTargetArrow =
    hoverTarget?.type === HoverTargetType.TARGET_ARROW;
  const isHoveringTargetArrowRight =
    hoverTarget?.type === HoverTargetType.TARGET_ARROW_RIGHT;
  const isHoveringTargetArrowSplit =
    hoverTarget?.type === HoverTargetType.TARGET_ARROW_SPLIT;
  const isHoveringTargetSmall =
    hoverTarget?.type === HoverTargetType.TARGET_SMALL;
  const isHovering =
    isHoveringTargetBig || isHoveringTargetSmall || isHoveringTargetArrow || isHoveringTargetArrowRight || isHoveringTargetArrowSplit;

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

  const BIG_TARGET_HOVER_SCALE = 2;

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

    if (isHoveringTargetArrow) {
      return 0;
    }
    if (isHoveringTargetArrowRight) {
      return 0;
    }
    if (isHoveringTargetArrowSplit) {
      return 0;
    }

    return 1;
  })();

  stylesheet(DOMElements.containerElm, {
    x: cursorPosX,
    y: cursorPosY,
  });

  stylesheet(DOMElements.highlightElm, {
    // backgroundColor:
    //   isHoveringTargetBig || isHoveringTargetSmall
    //     ? "rgba(242, 84,16, 0)"
    //     : "rgba(242, 84, 16, 1)",
    x: highlightElmBox.x,
    y: highlightElmBox.y,
    opacity: isHoveringTargetBig || isHoveringTargetSmall ? "1" : "0",
    skewX: skewXAmount / 3,
    skewY: skewYAmount / 3,
    scaleX: isMouseDown ? 0.9 : 1,
    scaleY: isMouseDown ? 0.9 : 1,
    width: `${highlightElmBox.width}px`,
    height: `${highlightElmBox.height}px`,
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
    // x: cursorPosX,
    // y: cursorPosY,
  });

  const svgScale = isHoveringTargetArrow ? (isMouseDown ? 1.8 : 2) : 0;
  const targetRotation = hoverTarget?.target.getAttribute("angle");
  const targetRotationInt = targetRotation && parseInt(targetRotation);
  const svgRotate = targetRotationInt
    ? skewXAmount + targetRotationInt
    : skewXAmount;
  DOMElements.arrowSvg.style.transform = `translate(-30%,-25%) scale(${svgScale}) rotate(${svgRotate}deg)`;
  
  const svgScaleRight = isHoveringTargetArrowRight ? (isMouseDown ? 1.8 : 2) : 0;
  const targetRotationRight = hoverTarget?.target.getAttribute("angle");
  const targetRotationIntRight = targetRotationRight && parseInt(targetRotationRight);
  const svgRotateRight = targetRotationIntRight
    ? skewXAmount + targetRotationIntRight
    : skewXAmount;
  DOMElements.arrowSvgRight.style.transform = `translate(-30%,-25%) scale(${svgScaleRight}) rotate(${svgRotateRight}deg)`;
  
  const svgScaleSplit = isHoveringTargetArrowSplit ? (isMouseDown ? 1.8 : 2) : 0;
  const targetRotationSplit = hoverTarget?.target.getAttribute("angle");
  const targetRotationIntSplit = targetRotationSplit && parseInt(targetRotationSplit);
  const svgRotateSplit = targetRotationIntSplit
    ? skewXAmount + targetRotationIntSplit
    : skewXAmount;
  DOMElements.arrowSvgSplit.style.transform = `translate(-30%,-25%) scale(${svgScaleSplit}) rotate(${svgRotateSplit}deg)`;
};
