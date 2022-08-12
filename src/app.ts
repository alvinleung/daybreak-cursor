import { setupCursor } from "./cusor/cursor";

window.addEventListener("DOMContentLoaded", () => {
  const [refershCursorTargets, cleanupCursor] = setupCursor();
  //@ts-ignore
  if (window.router) {
    //@ts-ignore
    const router = window.router;
    router.observePageLoad(() => {
      // refershCursorTargets();
    });
  }
});
