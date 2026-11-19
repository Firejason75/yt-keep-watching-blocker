const toggle = document.getElementById("toggle");
const status = document.getElementById("status");
const saves = document.getElementById("saves");

const render = (on) => {
  toggle.checked = on;
  status.textContent = on ? "On" : "Off";
  status.className = "status " + (on ? "on" : "off");
  chrome.action.setBadgeText({ text: on ? "" : "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: "#555" });
};

chrome.storage.local.get({ enabled: true, saves: 0 }, (s) => {
  render(s.enabled);
  saves.textContent = s.saves;
});

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggle.checked });
  render(toggle.checked);
});

document.getElementById("reset").addEventListener("click", () => {
  chrome.storage.local.set({ saves: 0 });
  saves.textContent = 0;
});

chrome.storage.onChanged.addListener((c, area) => {
  if (area === "local" && c.saves) saves.textContent = c.saves.newValue;
});
