import { setupCursor } from "./cusor/cursor";

window.addEventListener("DOMContentLoaded", () => {
  const [refershCursorTargets, cleanupCursor] = setupCursor();

  //@ts-ignore
  window.daybreak = window.daybreak || {}

  //@ts-ignore
  window.daybreak.cursor = {
    refershCursorTargets
  }


  //@ts-ignore
  if (window.daybreak.router) {
    //@ts-ignore
    const router = window.daybreak.router;
    router.observePageLoad(() => {
      refershCursorTargets();
    });
  }
});
