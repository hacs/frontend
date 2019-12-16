export function scrollToTarget(element: any, target: any) {
  const top = 0;
  const scroller = target;
  const easingFn = function easeOutQuad(t, b, c, d) {
    /* eslint-disable no-param-reassign, space-infix-ops, no-mixed-operators */
    t /= d;
    return -c * t * (t - 2) + b;
    /* eslint-enable no-param-reassign, space-infix-ops, no-mixed-operators */
  };
  const animationId = Math.random();
  const duration = 200;
  const startTime = Date.now();
  const currentScrollTop = scroller.scrollTop;
  const deltaScrollTop = top - currentScrollTop;
  element._currentAnimationId = animationId;
  (function updateFrame() {
    const now = Date.now();
    const elapsedTime = now - startTime;
    if (elapsedTime > duration) {
      scroller.scrollTop = top;
    } else if (element._currentAnimationId === animationId) {
      scroller.scrollTop = easingFn(
        elapsedTime,
        currentScrollTop,
        deltaScrollTop,
        duration
      );
      requestAnimationFrame(updateFrame.bind(element));
    }
  }.call(element));
}

export const navigate = (_node: any, path: string) => {
  history.pushState(null, "", path);
};

export function isnullorempty(test: any): boolean {
  if (test === undefined) true;
  if (test === null) true;
  if (test === "") true;
  if (test === 0) true;
  return false;
}
