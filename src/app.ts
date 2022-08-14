import { setupCursor } from "./cusor/cursor";

window.addEventListener("DOMContentLoaded", () => {
  const [refershCursorTargets, cleanupCursor] = setupCursor();
  //@ts-ignore
  if (window.daybreak && window.daybreak.router) {
    //@ts-ignore
    const router = window.dabyreak.router;
    router.observePageLoad(() => {
      refershCursorTargets();
    });
  }
});
