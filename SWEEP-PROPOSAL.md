# Display-Component Sweep Proposal

Status: research draft — no code or CSS changes proposed below have been applied.

Trigger: Menu v12.2.4 upgrade revealed that consumers had been working around theming, portal/stacking, and cleanup gaps with bespoke CSS overrides and manual lifecycle code. This sweep checks the rest of `src/javascript/display/` for the same latent debt before consumers hit it.

## The Menu v12.2.4 model (four contracts)

1. **Theming** — paired CSS custom properties (`--gadget-ui-menu-bg/-fg/-border/-hover-bg`) declared on `:root` with safe defaults, replacing hardcoded `#fff`/`#777`/`#ccc` inside component rules. The "paired" framing matters: bg and fg are exposed together so a consumer who maps only one to their theme can't produce an unreadable result.
2. **Positioning** — opt-in `portal: true` mode that appends the floating part to `document.body` to escape ancestor stacking-contexts and `overflow: hidden` clips, plus `dropdownAlign: "left"|"right"` for trigger-relative anchoring and inline `position: fixed` driven by `getBoundingClientRect`. Scroll handler (capture phase) keeps the portaled element pinned to its trigger.
3. **Event API** — `menuOpened` / `menuClosed` / `menuRemoved` lifecycle events, component-name-prefixed so listeners across instances of multiple components don't collide.
4. **Lifecycle** — explicit `destroy()` that removes injected DOM, drops portaled elements, disconnects observers, clears state. `MutationObserver` watches `document.body` for the anchor's removal and auto-destroys to prevent leaks when a framework re-renders the parent.

## Consumer-impact baseline

Direct instantiations across `/home/rmunn/git/peopoli/apps/*/client/assets/js/**` (excluding node_modules):

| Component | Instantiations |
|---|---|
| Modal | 44 |
| ProgressBar | 40 |
| Popover | 39 |
| Dialog | 34 |
| Bubble | 12 |
| Tabs | 11 |
| Lightbox | 4 |
| Overlay | 3 |
| Sidebar | 0 direct (CSS overrides exist) |
| CollapsiblePane | 0 direct found |
| FloatingPane | 0 direct (used via Dialog) |
| FileUploadWrapper | counted inside ProgressBar |

Consumer CSS already overrides `.gadgetui-modalWindow`, `.gadgetui-sidebar`, `.gadgetui-progressbar*`, `.gadgetui-lightbox-*`, `.gadget-ui-tab-h*` — theming pain is real across nearly every app.

---

## Per-component punch list

### 1. Modal — `modal.js`
- **Current**: backdrop `rgba(0,0,0,0.5)` hardcoded (CSS line 83); window `background:#fff`, `border:1px solid silver` hardcoded (96-97). Wrapper inserted in anchor's parent — NOT portaled, so overflow/stacking-context risk. Events declared `["opened","closed"]` but `destroy()` fires `"removed"` (declaration out of date). `destroy()` exists, no MutationObserver — leak if parent re-renders.
- **Add**: `--gadget-ui-modal-backdrop-bg`, `--gadget-ui-modal-bg`, `--gadget-ui-modal-fg`, `--gadget-ui-modal-border`. `portal: true` opt-in. Sync events list with `"removed"`. Optional MutationObserver auto-destroy.
- **Risk**: minor (all additive).
- **Priority**: P0. Highest consumer count + active stacking-context risk.

### 2. Dialog — `dialog.js` (extends FloatingPane)
- **Current**: inherits all FloatingPane theming gaps. Constructor portals to `document.body` when called without `element` (tangled with construction, not configurable). Buttons inline-styled (`text-align:center`, `padding:0.5em`, JS lines 30-31). No `dialogOpened`/`dialogClosed`; inherits FloatingPane's `closed`/`moved`/etc.
- **Add**: `--gadget-ui-dialog-button-bg`, `-fg`, `-padding`. Move inline button-row styles into `.gadgetui-dialog-buttons`. Optional `dialogOpened`/`dialogClosed`.
- **Risk**: minor.
- **Priority**: P0 alongside FloatingPane (34 instantiations).

### 3. FloatingPane — `floatingpane.js`
- **Current**: header `background-color:silver`, `color:black`, `border:1px solid silver` hardcoded (CSS 41-44); wrapper `border:1px solid silver`, `border-radius:5px` (15-20). `position:absolute` (24) — not portaled, clips inside `overflow:hidden` ancestors. Shrinker/closer inline-styled (JS 113-117, 142-147). `events` line commented out (12). Fires `moved`, `closed`, `maximized`, `minimized`. `close()` removes the wrapper but the `draggable()` util's listeners are never cleaned up — leak. No `destroy()`.
- **Add**: `--gadget-ui-floatingPane-bg/-fg/-border/-header-bg/-header-fg/-radius`. `portal: true` opt-in with viewport-relative positioning. Uncomment + populate `events` declaration. Real `destroy()` detaching draggable listeners and observers.
- **Risk**: minor for theming/portal (opt-in). Renaming existing events would be major — skip the rename; declare existing names.
- **Priority**: P0. Dialog inherits all of this.

### 4. Popover — `popover.js`
- **Current**: `background: var(--gadget-ui-popover-bg)` (CSS 454) — only partial theming. `border:1px solid silver`, `padding:1em` still hardcoded. `top:100px; left:50%; transform:translateX(-5%)` (458-460) — placeholder positioning. 39 instantiations and **no positioning API**. No portal. No anchor concept. Events declared `["opened","closed"]`, destroy fires `"removed"`. No MutationObserver.
- **Add (12.3.0)**: `--gadget-ui-popover-fg/-border/-radius/-padding/-shadow`. **Anchor-relative positioning API**: optional `anchor` element + `align: "left"|"right"|"center"` + `placement: "top"|"bottom"` + `portal: true`, mirroring Menu's `_positionPortaled` + capture-phase scroll handler. Sync events list with `"removed"`. MutationObserver auto-destroy. **Keep the current `top:100px; left:50%; transform:translateX(-5%)` defaults intact when neither `anchor` nor `portal` is set** — zero behavior change for the 39 existing callers.
- **Deferred to 13.0.0**: rip out the placeholder defaults and switch to viewport-centered (`position:fixed; top:50%; left:50%; transform:translate(-50%,-50%)`) as the no-anchor default. Treat as a breaking change in the release notes; sweep the 39 peopoli callers in one pass alongside the cut.
- **Risk**: minor for 12.3.0 (all additive). Major for 13.0.0 default change — schedule with other 13.0 breakers.
- **Priority**: P0. 39 instantiations + worst positioning story.

### 5. Lightbox — `lightbox.js`
- **Current**: `--gadget-ui-lightbox-bg` already used (422) — only one token. Modal portaled to body (line 80) — good. `destroy()` exists but `removeEventListener` calls at 185-200 use fresh arrow functions, so listeners leak. Events declared `["showPrevious","showNext","close","destroy"]` but only `showPrevious`/`showNext` are fired; `destroy()` never fires `"destroy"`. Out of sync.
- **Add (and fix)**: optional `--gadget-ui-lightbox-control-bg/-fg`. **Fix listener-leak bug** by storing bound references. Make `destroy()` fire `"destroy"` (or rename to `"removed"`). Optional MutationObserver on anchor.
- **Risk**: none for bug fix; minor for event-name normalization.
- **Priority**: P1. Low instantiation count (4) but real bug should ride along.

### 6. Sidebar — `sidebar.js`
- **Current**: `border:1px solid silver` hardcoded (CSS 118, 138-140). No overlay/portal need. Events `maximized`/`minimized` consistent. `destroy()` is a stub (line 123) — listener + DOM-wrap leak if a Sidebar is created on a discarded view.
- **Add**: `--gadget-ui-sidebar-border/-bg/-toggle-bg`. Real `destroy()`: remove toggle span listener, unwrap selector, remove wrapper.
- **Risk**: none.
- **Priority**: P2. Zero direct instantiations but latent destroy bug.

### 7. Tabs — `tabs.js`
- **Current**: hardcoded `#ccc`/`#777`/`white`/`#999` in 8 places (CSS 230-296). `tabSelected` declared + fired consistently. `destroy()` is a stub (line 73) — click listeners leak.
- **Add**: `--gadget-ui-tabs-bar-bg`, `--gadget-ui-tab-bg/-fg/-active-bg/-active-fg/-hover-bg`. Real `destroy()` detaching click listeners and restoring `display`.
- **Risk**: none (defaults preserved).
- **Priority**: P1. 11 instantiations + visible theming pain (`#profile`-scoped overrides in mail/me/social/skeleton confirm consumers are forced into ID-scoped CSS).

### 8. CollapsiblePane — `collapsiblepane.js`
- **Current**: shares CSS with FloatingPane (14-55); same `silver` defaults. Events `["minimized","maximized"]` declared and fired, **but also** dispatches native DOM `Event("collapse"|"expand")` on `this.element` (line 98) — two parallel event systems. No `destroy()` at all.
- **Add**: split into its own `--gadget-ui-collapsiblePane-bg/-fg/-border/-header-bg/-header-fg/-radius` tokens (not shared with FloatingPane) so consumers can style the two surfaces independently — defaults match FloatingPane values, so visual look unchanged. Real `destroy()`. Keep legacy DOM `collapse`/`expand` events alongside the component-event versions; document both.
- **Risk**: none for tokens (defaults preserved). Major if legacy DOM events removed — keep.
- **Priority**: P2.

### 9. ProgressBar — `progressbar.js`
- **Current**: `background:#999`/`#fff`/`#ddd`/`#4caf50`/`#333` hardcoded (CSS 299-340). `events = [...]` declaration is missing entirely; fires `start`/`updatePercent`/`update`/`removed`. `destroy()` removes progressbox — fine.
- **Add**: `--gadget-ui-progressbar-bg/-fg/-track-bg/-fill/-status-fg`. Declare `events`. Optional `--gadget-ui-progressbar-fill-error` for `abortUpload`.
- **Risk**: none.
- **Priority**: P1. 40 instantiations + heavy consumer-CSS overrides.

### 10. FileUploadWrapper — `fileuploadwrapper.js`
- **Current**: thin shim around ProgressBar; old prototype + `EventBindings.getAll()` pattern instead of `extends Component`. Events `["uploadComplete","uploadAborted"]` declared and fired. Cleanup delegated to `progressbar.destroy()`.
- **Action**: skip in this sweep. The convergence to `extends Component` is a separate refactor worth flagging.
- **Priority**: skip.

### 11. Overlay — `overlay.js`
- **Current**: backdrop color set via JS option, not a CSS token. **No `.gadgetui-overlay` rule in CSS at all** — all styling inline via `style.setProperty(...,'important')` (43-54). Uses ResizeObserver + capture-phase scroll listener — anchor-aware. But mounts to `parentNode.appendChild`, NOT body — same overflow-clip/stacking risk as Modal. Events `shown`/`hidden`/`destroyed`/`contentChanged` declared; also fires `click`/`mouseenter`/`mouseleave` (undeclared). `destroy()` is well-formed.
- **Add**: `.gadgetui-overlay` CSS rule + `--gadget-ui-overlay-bg/-fg` (layered fallback under the JS option). `portal: true` opt-in. Sync events list. MutationObserver on anchor removal.
- **Risk**: minor.
- **Priority**: P2. Only 3 instantiations but it's the newest API — align before usage grows.

### 12. Bubble — `bubble.js`
- **Current**: canvas-based; theming is already API-driven via options (`color`, `borderColor`, `backgroundColor`, `font*`). Canvas appended to body — effectively portaled. `attachToElement` uses inline `position:absolute` with no scroll handler — bubble drifts on scroll. No events fired. `destroy()` removes canvas only.
- **Add**: scroll handler to follow anchor when `attachToElement` is used. MutationObserver auto-destroy. Optional `bubbleShown`/`bubbleRemoved` events. Skip CSS tokens (canvas).
- **Risk**: none.
- **Priority**: P3.

---

## Suggested ordering

| # | Component | Why |
|---|---|---|
| 1 | FloatingPane | Dialog inherits it; most-overridden colors |
| 2 | Dialog | Tiny diff once #1 lands |
| 3 | Modal | 44 instantiations, active stacking-context risk |
| 4 | Popover | 39 instantiations, needs anchor-API design |
| 5 | ProgressBar | 40 instantiations, theming-only, quick win |
| 6 | Tabs | Visible theming pain + destroy stub |
| 7 | Lightbox | Listener-leak bug rides along |
| 8 | Overlay | Normalize before usage grows |
| 9 | CollapsiblePane | Token decision joint with FloatingPane |
| 10 | Sidebar | Implement destroy stub |
| 11 | Bubble | Scroll-follow + observer |
| 12 | FileUploadWrapper | Skip |

## Scope estimate

| Component | Hours |
|---|---|
| FloatingPane | 4-6 |
| Dialog | 1-2 |
| Modal | 3-4 |
| Popover | 4-6 |
| ProgressBar | 1 |
| Tabs | 2 |
| Lightbox | 2-3 |
| Overlay | 2 |
| CollapsiblePane | 2 |
| Sidebar | 1-2 |
| Bubble | 2 |
| **Total** | **24-32h** + ~4h cross-cutting docs/regression sweep |

## Version-bump strategy

**Recommendation: one 12.3.0 minor bump** rather than a patch chain (12.2.5, .6, .7…). Reasons:
- Coordinated theming + portal + lifecycle story should land as one changelog entry.
- Consumers adopting tokens want all of them at once.
- If a real breaking change becomes necessary mid-sweep (e.g., Popover's `top:100px` placeholder), one minor bump absorbs it; a patch chain cannot.

Ship in suggested order on a feature branch, merge to master, cut 12.3.0. Follow-up bugs go out as 12.3.1, 12.3.2.

## Out of scope but flagged

- `FileUploadWrapper` uses old prototype + `EventBindings` pattern — converge later.
- `Lightbox`'s `removeEventListener` bug (arrow functions create fresh references) — fix during sweep, but it's a bug not a feature.
- `FloatingPane`'s `getMaxZIndex()+1` is set once at construction; sinks if higher z-indexes appear later.
- `Component.getAll()` is used only by FileUploadWrapper — dead-ish once that converges.
- `Velocity` is a soft dependency across FloatingPane/Sidebar/CollapsiblePane; modern `Element.animate` alternative — future cleanup.
