import { setupCursor } from "./cusor/cursor";

let registered = false;

//@ts-ignore
if (window.router) {
  //@ts-ignore
  const router = window.router;
  const [refershCursorTargets, cleanupCursor] = setupCursor();
  router.onRouteChange(() => {
    refershCursorTargets();
  });

  registered = true;
}

window.addEventListener("DOMContentLoaded", () => {
  if (registered) return;
  const [refershCursorTargets, cleanupCursor] = setupCursor();
});
