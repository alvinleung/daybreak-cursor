import { stylesheet } from "./stylesheet";

interface CursorInfo {
  elm: HTMLDivElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

type CursorDOMRenderer = (cursorInfo: CursorInfo) => void;

function createCursorElements(): HTMLDivElement {
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
  const baseElm = document.createElement("div");
  stylesheet(baseElm, {
    position: "fixed",
    left: "0px",
    top: "0px",
    pointerEvents: "none",
    transitionProperty: "width height",
    transitionDuration: ".2s",
    transitionTimingFunction: "cubic-bezier(.04,.53,.44,1)",
  });

  document.body.appendChild(baseWrapper);
  document.body.appendChild(baseElm);

  return baseElm;
}

function setupParagraphHover({
  onMouseEnter = (target: HTMLElement, lineHeight: number) => {},
  onMouseLeave = (target: HTMLElement) => {},
}) {
  const allText: NodeListOf<HTMLElement> =
    document.querySelectorAll("p,h1,h2,h3");

  function handlePointerEnter(e: PointerEvent) {
    // handle pointer enter
    const elm = e.target as HTMLElement;
    const paragraphLineHeight = getComputedStyle(elm).fontSize;
    console.log(paragraphLineHeight);
    onMouseEnter(elm, parseInt(paragraphLineHeight));
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

function createCursor(): CursorInfo {
  const baseElm = createCursorElements();
  const DEFAULT_SIZE = 10;
  const DEFAULT_SIZE_TEXT = 2;

  const cursorInfo = {
    x: 0,
    y: 0,
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
    elm: baseElm,
    destroyCursor: destroyCursor,
  };

  const cleanupTextCursor = setupParagraphHover({
    onMouseEnter: (target, lineHeight) => {
      cursorInfo.width = DEFAULT_SIZE_TEXT;
      cursorInfo.height = lineHeight;
      updateCursorDOM(cursorInfo);
    },
    onMouseLeave: () => {
      cursorInfo.height = DEFAULT_SIZE;
      cursorInfo.width = DEFAULT_SIZE;
      updateCursorDOM(cursorInfo);
    },
  });

  // Add mouse event
  window.addEventListener("pointermove", handleMouseMove);

  function handleMouseMove(e: MouseEvent) {
    cursorInfo.x = e.clientX;
    cursorInfo.y = e.clientY;
    updateCursorDOM(cursorInfo);
  }

  function destroyCursor(cursorInfo: CursorInfo) {
    document.body.removeChild(cursorInfo.elm);
    cleanupTextCursor();
    window.removeEventListener("pointermove", handleMouseMove);
  }

  return cursorInfo;
}

const updateCursorDOM: CursorDOMRenderer = (cursorInfo: CursorInfo) => {
  const { elm, x, y, width, height } = cursorInfo;

  stylesheet(elm, {
    backgroundColor: `#F25410`,
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(${x - width / 2}px,${y - height / 2}px)`,
  });
};

export { createCursor };
