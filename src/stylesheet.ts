type TransformationConfig = {
  x: string;
  y: string;
  scaleX: string;
  scaleY: string;
  rotateX: string;
  rotateY: string;
  rotateZ: string;
};
type Partial<T> = {
  [P in keyof T]?: T[P];
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
  const { x, y, scaleX, scaleY, rotateX, rotateY, rotateZ, ...pureCSSStyle } =
    stylesheet;

  const transformStr = [
    emptyWhenUndefined`translateX(${x})`,
    emptyWhenUndefined`translateY(${y})`,
    emptyWhenUndefined`scaleX(${scaleX})`,
    emptyWhenUndefined`scaleY(${scaleY})`,
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
