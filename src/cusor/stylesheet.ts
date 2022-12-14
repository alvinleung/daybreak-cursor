import { Partial } from "./cursor-util";

type TransformationConfig = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
};

type CSSStyleConfig = Partial<CSSStyleDeclaration> &
  Partial<TransformationConfig>;

function emptyWhenUndefined(
  strings: TemplateStringsArray,
  value: string | number | undefined
) {
  if (value === undefined) return "";
  return strings[0] + value + strings[1];
}

export function stylesheet(elm: HTMLElement, stylesheet: CSSStyleConfig) {
  // process all x, y, scaleX, scaleY
  const {
    x,
    y,
    scaleX,
    scaleY,
    rotateX,
    rotateY,
    rotateZ,
    skewX,
    skewY,
    ...pureCSSStyle
  } = stylesheet;

  const transformStr = [
    emptyWhenUndefined`translateX(${x}px)`,
    emptyWhenUndefined`translateY(${y}px)`,
    emptyWhenUndefined`scaleX(${scaleX})`,
    emptyWhenUndefined`scaleY(${scaleY})`,
    emptyWhenUndefined`skewX(${skewX}deg)`,
    emptyWhenUndefined`skewY(${skewY}deg)`,
    emptyWhenUndefined`rotateX(${rotateX})`,
    emptyWhenUndefined`rotateY(${rotateY})`,
    emptyWhenUndefined`rotateZ(${rotateZ})`,
  ].join(" ");

  // compose the transform string
  elm.style.transform = transformStr;

  Object.keys(pureCSSStyle).forEach((styleKey) => {
    elm.style[styleKey] = pureCSSStyle[styleKey];
  });
}
