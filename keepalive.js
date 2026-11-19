// Runs in the page's own context.
// YouTube decides you're "idle" by checking window._lact (last activity time).
// Keeping it fresh stops the prompt from being triggered in the first place.
// content.js sets data-ykw-enabled on <html> so this script knows the on/off state.
(() => {
  const enabled = () => document.documentElement.dataset.ykwEnabled !== "0";
  const refresh = () => {
    if (!enabled()) return;
    try { window._lact = Date.now(); } catch (_) {}
  };
  refresh();
  setInterval(refresh, 60 * 1000);
})();
