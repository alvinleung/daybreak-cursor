import { animate, spring } from "popmotion";

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
interface SpringConfig {
  stiffness?: number;
  mass?: number;
  damping?: number;
}

type PopMotionAnimation = { stop: () => void };

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

export interface SpringAnimator {
  set: (style: CSSStyleConfig) => void;
  stop: () => void;
}

export function createSpringAnimator(
  elm: HTMLElement,
  springConfig: SpringConfig
): SpringAnimator {
  const userSpringConfig = {
    stiffness: 100,
    mass: 1,
    damping: 20,
    ...springConfig,
  };

  // current animation value
  const currCSSProps: CSSStyleConfig = {} as CSSStyleConfig;
  let animations: PopMotionAnimation[] = [];

  // init the style
  stylesheet(elm, currCSSProps);

  /**
   * Stop all the animation
   */
  const stop = () => {
    // reset all animations
    animations.forEach((anim) => {
      anim.stop();
    });
    // clear all animations
    animations = [];
  };

  const updateDOM = (CSSProps: CSSStyleConfig) => {
    stylesheet(elm, CSSProps);
  };

  /**
   * Animate to specific values
   * @param style
   */
  const set = (style: CSSStyleConfig) => {
    stop();

    const newAnimationPropKeys = Object.keys(style);
    newAnimationPropKeys.forEach((propKey, index) => {
      const newValue = style[propKey];
      const handleUpdate = (latest) => {
        currCSSProps[propKey] = latest;

        // if we are updating dom once we updated all the values
        if (index === newAnimationPropKeys.length - 1) updateDOM(currCSSProps);
      };

      const animation = animate({
        from: currCSSProps[propKey] || newValue,
        to: newValue,
        damping: userSpringConfig.damping,
        stiffness: userSpringConfig.stiffness,
        mass: userSpringConfig.mass,
        type: "spring",
        onUpdate: handleUpdate,
      });

      // const animation = animate({
      //   from: currCSSProps[propKey] || newValue,
      //   to: newValue,
      //   onUpdate: handleUpdate,
      // });

      animations.push(animation);
    });
  };

  return {
    set: set,
    stop: stop,
  };
}
