import { HomeAssistant } from "custom-card-helpers";

export function RepositoryWebSocketAction(
  hass: HomeAssistant,
  repository: string,
  Action: string,
  Data: any = undefined
): void {
  let message: {
    [x: string]: any;
    type: string;
    action?: string;
    repository?: string;
    data?: any;
    id?: number;
  };
  if (Data !== undefined) {
    message = {
      type: "hacs/repository/data",
      action: Action,
      repository: repository,
      data: Data
    };
  } else {
    message = {
      type: "hacs/repository",
      action: Action,
      repository: repository
    };
  }
  hass.connection.sendMessage(message);
}

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
  if (test === undefined) return true;
  if (test === null) return true;
  if (test === "") return true;
  if (test === 0) return true;
  return false;
}
