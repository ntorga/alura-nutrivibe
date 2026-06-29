---
shortDescription: "Browser inspection and interaction for verifying rendered web UI during development"
version: "1.0.0"
lastUpdated: "2026-06-28"
---

## Purpose

An agent editing UI code cannot confirm that the result is correct by reading source files alone. CSS can be purged or overridden, client-side JS only runs in the browser, and server-rendered markup may differ from what the template suggests. Without looking at the live page, an agent is guessing. This skill codifies how to inspect, interact with, and verify rendered web UI using agent-browser.

## Procedure

**Pre-flight 1/3: reject PowerShell.** All steps require bash or zsh:

```bash
[ -z "$PSVersionTable" ] || { echo "ERROR: PowerShell detected. Open bash/zsh or install WSL: wsl --install"; exit 1; }
```

**Pre-flight 2/3: ensure agent-browser CLI exists.** Install if missing:

```bash
command -v agent-browser &>/dev/null || { echo "ERROR: agent-browser not found. Install via: npm install -g agent-browser"; exit 1; }
```

**Pre-flight 3/3: ensure Chrome for Testing is installed.** Run once on first use:

```bash
agent-browser install
```

Always use `--engine chrome`. Lightpanda has no rendering engine and cannot display visual output.

### 1. The verification loop

After every UI change, run this cycle:

1. Edit the source file(s).
2. Rebuild / let the watcher handle it.
3. Server reloads and serves at `localhost:<port>`.
4. **Inspect** the rendered result (CSS, console, DOM state).
5. **Interact** with the component (click, fill, navigate).
6. **Read the screenshot** to visually confirm. Fix issues, repeat.

Never assume a component is correct without looking at it in the browser.

### 2. Inspection

**CSS.** Check whether classes are actually applied to rendered elements:

```bash
agent-browser get styles "h1"
agent-browser get styles "@e3"          # use refs from a prior snapshot
```

Diagnose: missing classes (purged or misspelled), specificity conflicts, responsive breakpoint issues, or dynamic classes that weren't generated.

**Console errors.** After any UI change, always check for runtime errors:

```bash
agent-browser console                   # view console logs
agent-browser errors                    # view page errors only
```

**Network traffic.** When the UI makes server requests, inspect them:

```bash
agent-browser network requests          # list captured requests
```

**DOM state.** Evaluate client-side state via JS when the framework exposes it:

```bash
agent-browser eval "document.title"
agent-browser eval "document.querySelectorAll('.my-class').length"
```

### 3. Interaction

**Core workflow: snapshot, ref, interact.** Always follow this sequence:

```bash
# 1. Navigate to the page
agent-browser open http://localhost:3000/page

# 2. Get the accessibility snapshot with interactive element refs
agent-browser snapshot -i

# 3. Interact using stable refs (@e1, @e2, etc.)
agent-browser click @e3

# 4. Re-snapshot after any state change
agent-browser snapshot -i

# 5. Capture an annotated screenshot
agent-browser screenshot --annotate /tmp/component-state.png
```

Refs are scoped to the current snapshot. After any navigation, client-side state change, or DOM update, take a new snapshot before using refs. Never reuse refs across page states.

**Forms.** Fill fields and trigger blur/validation:

```bash
agent-browser snapshot -i
agent-browser fill @e2 "test value"
agent-browser press Tab                  # trigger blur/validation events
agent-browser snapshot -i
agent-browser screenshot --annotate /tmp/input-filled.png
```

**Dropdowns and modals.** Hidden content (via `display: none`, `visibility: hidden`, or conditional rendering) won't appear until triggered. Click the trigger first, then re-snapshot to get refs for the now-visible elements:

```bash
agent-browser click @e4              # open dropdown/modal
agent-browser snapshot -i            # get refs for visible content
agent-browser click @e7              # select an option
agent-browser snapshot -i            # verify state updated
```

**Waiting for async operations.** After triggering a server request or animation, wait before re-snapshotting:

```bash
agent-browser click @e5              # trigger a request
agent-browser wait networkidle       # wait for network to settle
agent-browser snapshot -i
agent-browser screenshot --annotate /tmp/result.png
```

**Responsive testing.** Compare viewport sizes to verify responsive behavior:

```bash
agent-browser set viewport 375 812
agent-browser screenshot --annotate /tmp/mobile.png

agent-browser set viewport 1280 800
agent-browser screenshot --annotate /tmp/desktop.png
```

**Reading screenshots.** After taking an annotated screenshot, always read the file to close the loop. The annotation overlay shows element refs on top of the rendered page — both visual layout and interactive targets are visible together.

## Guardrails

- Never assume a rendered component is correct from source code alone. Styling, client-side behavior, and server interactions can only be verified in the browser.
- Never reuse agent-browser refs across page states. Any navigation, state change, or DOM update invalidates existing refs — always re-snapshot first.
- Never use Lightpanda — it has no rendering engine and cannot display visual output.
