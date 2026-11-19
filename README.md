# YouTube Keep Watching

A small Chrome/Opera extension that stops YouTube and YouTube Music from pausing with **"Video paused. Continue watching?"**

## How it works

- **Prevention:** YouTube decides you're idle by checking `window._lact`, the time of your last activity. The extension updates it every minute, so YouTube shouldn't think you're idle.
- **Backup:** if the dialog appears anyway, the extension clicks **Yes** and resumes the video.
- **Safety:** on regular YouTube, it only auto-confirms when the video is paused *and* you haven't touched the page for 60 seconds. That way it never confirms a dialog you opened yourself, like "delete playlist?".
- **Toggle:** click the toolbar icon to turn it on or off. The popup also counts how many pauses it has blocked.

## Install

1. Download or clone this repo.
2. Open `chrome://extensions` (or `opera://extensions` in Opera) and turn on **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Reload any YouTube tabs you already have open.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Manifest V3 config |
| `keepalive.js` | Runs in the page's own context and keeps `_lact` fresh |
| `content.js` | Watches for the dialog, clicks it and syncs the on/off state |
| `popup.html` / `popup.js` | Toolbar popup with the on/off switch and counter |
