// Backup plan: if the "Video paused. Continue watching?" dialog shows up anyway,
// click "Yes" and resume playback. Also syncs the on/off switch from the popup.
(() => {
  const LOG = (...a) => console.debug("[Keep Watching]", ...a);

  // ---- On/off state -------------------------------------------------------
  let enabled = true;
  const applyState = (on) => {
    enabled = on !== false;
    document.documentElement.dataset.ykwEnabled = enabled ? "1" : "0";
  };
  applyState(true);
  chrome.storage.local.get({ enabled: true }, (s) => applyState(s.enabled));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.enabled) applyState(changes.enabled.newValue);
  });

  const countSave = () => {
    chrome.storage.local.get({ saves: 0 }, (s) =>
      chrome.storage.local.set({ saves: s.saves + 1 })
    );
  };

  // ---- Idle guard -----------------------------------------------------------
  // Only auto-confirm if you haven't touched the page recently, so we never
  // click "yes" on a dialog you opened yourself (e.g. "delete playlist?").
  const IDLE_MS = 60 * 1000;
  let lastInput = 0;
  ["mousedown", "keydown", "touchstart", "wheel"].forEach((ev) =>
    window.addEventListener(ev, (e) => { if (e.isTrusted) lastInput = Date.now(); }, true)
  );
  const userIsIdle = () => Date.now() - lastInput > IDLE_MS;

  // Note: offsetParent is null for position:fixed elements (which popups often are),
  // so use checkVisibility / client rects instead.
  const isVisible = (el) => {
    if (!el || !el.isConnected) return false;
    if (typeof el.checkVisibility === "function") {
      return el.checkVisibility({ visibilityProperty: true, opacityProperty: true });
    }
    return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
  };

  const resumeVideo = () => {
    const v = document.querySelector("video");
    if (v && v.paused) v.play().catch(() => {});
  };

  let lastClick = 0;
  const clickAndResume = (btn, where) => {
    if (Date.now() - lastClick < 3000) return; // don't double-count one dialog
    lastClick = Date.now();
    btn.click();
    LOG("Dismissed", where);
    countSave();
    setTimeout(resumeVideo, 300);
  };

  const handle = () => {
    if (!enabled) return;

    // YouTube Music has its own dedicated dialog, safe to click any time.
    const music = document.querySelector("ytmusic-you-there-renderer");
    if (isVisible(music)) {
      const btn = music.querySelector("button, tp-yt-paper-button, yt-button-renderer");
      if (btn) clickAndResume(btn, "(YT Music)");
      return;
    }

    // Regular YouTube uses a generic confirm dialog.
    const dialog = document.querySelector("ytd-popup-container yt-confirm-dialog-renderer");
    if (!isVisible(dialog) || !userIsIdle()) return;

    const video = document.querySelector("video");
    if (video && !video.paused) return; // the real prompt always pauses the video first

    const btn =
      dialog.querySelector("#confirm-button button") ||
      dialog.querySelector("#confirm-button") ||
      dialog.querySelector("yt-button-renderer[dialog-confirm] button");
    if (btn) clickAndResume(btn, "(YouTube)");
  };

  const start = () => {
    new MutationObserver(handle).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden", "style", "aria-hidden"],
    });
    setInterval(handle, 5000); // safety net
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
