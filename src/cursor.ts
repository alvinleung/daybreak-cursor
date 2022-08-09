import { stylesheet } from "./stylesheet";

interface CursorInfo {
  elm: HTMLDivElement;
  x: number;
  y: number;
  hidden: boolean;
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
    transitionProperty: "width,height,transform,opacity",
    transitionDuration: ".2s",
    transitionTimingFunction: "cubic-bezier(.04,.53,.44,1)",
  });

  document.body.appendChild(baseWrapper);
  document.body.appendChild(baseElm);

  return baseElm;
}

function detectParagraphHover({
  onMouseEnter = (target: HTMLElement, lineHeight: number) => {},
  onMouseLeave = (target: HTMLElement) => {},
}) {
  const allText: NodeListOf<HTMLElement> =
    document.querySelectorAll("p,h1,h2,h3");

  function handlePointerEnter(e: PointerEvent) {
    // handle pointer enter
    const elm = e.target as HTMLElement;
    const paragraphLineHeight = getComputedStyle(elm).fontSize;
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

function detectOffscreen({
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

function createCursor(): CursorInfo {
  const baseElm = createCursorElements();

  const DEFAULT_SIZE = 10;
  const DEFAULT_SIZE_TEXT = 2;

  const cursorInfo = {
    x: 0,
    y: 0,
    velx: 0,
    vely: 0,
    hidden: false,
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
    elm: baseElm,
    destroyCursor: destroyCursor,
  };

  const cleanupTextCursor = detectParagraphHover({
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

  const cleanupOffscreenDetector = detectOffscreen({
    onEnterScreen: (e: MouseEvent) => {
      cursorInfo.x = e.clientX;
      cursorInfo.y = e.clientY;
      cursorInfo.hidden = false;
      updateCursorDOM(cursorInfo);
    },
    onExitScreen: () => {
      cursorInfo.hidden = true;
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
    cleanupOffscreenDetector();
    window.removeEventListener("pointermove", handleMouseMove);
  }

  return cursorInfo;
}

const updateCursorDOM: CursorDOMRenderer = ({
  elm,
  x,
  y,
  width,
  height,
  hidden,
}: CursorInfo) => {
  stylesheet(elm, {
    backgroundColor: `#F25410`,
    opacity: hidden ? "0" : "1",
    scaleX: hidden ? "0" : "1",
    scaleY: hidden ? "0" : "1",
    width: `${width}px`,
    height: `${height}px`,
    x: `${x - width / 2}px`,
    y: `${y - height / 2}px`,
  });
};

export { createCursor };
