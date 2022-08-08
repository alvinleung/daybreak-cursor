interface Point {
  x: number;
  y: number;
}

interface CursorInfo {
  elm: HTMLDivElement;
  x: number;
  y: number;
  size: number;
}

function createElements(): HTMLDivElement {
  // hide cursor
  const baseWrapper = document.createElement("div");
  baseWrapper.style.position = "fixed";
  baseWrapper.style.left = "0px";
  baseWrapper.style.top = "0px";
  baseWrapper.style.bottom = "0px";
  baseWrapper.style.right = "0px";
  baseWrapper.style.cursor = "none";
  baseWrapper.style.zIndex = "-1";
  document.body.appendChild(baseWrapper);

  // hide cursor on the background
  document.body.style.cursor = "none";

  // the base element of the cursor
  const baseElm = document.createElement("div");
  baseElm.style.position = "fixed";
  baseElm.style.left = "0px";
  baseElm.style.top = "0px";
  baseElm.style.pointerEvents = "none";
  document.body.appendChild(baseElm);

  return baseElm;
}

function createCursor(): CursorInfo {
  const baseElm = createElements();

  const cursorInfo = {
    x: 0,
    y: 0,
    size: 10,
    elm: baseElm,
    destroyCursor: destroyCursor,
  };

  // Add mouse event
  window.addEventListener("mousemove", handleMouseMove);

  function handleMouseMove(e: MouseEvent) {
    cursorInfo.x = e.clientX;
    cursorInfo.y = e.clientY;
    updateCursorElement(cursorInfo);
  }

  function destroyCursor(cursorInfo: CursorInfo) {
    document.body.removeChild(cursorInfo.elm);
    window.removeEventListener("mousemove", handleMouseMove);
  }

  return cursorInfo;
}

function updateCursorElement(cursorInfo: CursorInfo) {
  const { elm, x, y, size } = cursorInfo;

  elm.style.backgroundColor = `#F25410`;
  elm.style.width = `${size}px`;
  elm.style.height = `${size}px`;
  elm.style.transform = `translate(${x - size / 2}px,${y - size / 2}px)`;
}

export { createCursor };
