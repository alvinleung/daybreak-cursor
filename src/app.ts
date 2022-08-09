import { setupCursor } from "./cusor/cursor";

window.addEventListener("DOMContentLoaded", () => {
  const [cursorState, cleanupCursor] = setupCursor();
});
