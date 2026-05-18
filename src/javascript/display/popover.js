import { Component } from '../../objects/component.js';

export class Popover extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);
		this.addControl();
		this.addBindings();
		this._observeForRemoval();

		if (this.autoOpen) {
			this.open();
		}
	}

	// Events fired (call .on(name, handler) to subscribe):
	//   "opened"  — open() was called (or autoOpen at construction)
	//   "closed"  — close() was called
	//   "removed" — destroy() ran (manual destroy(), or MutationObserver
	//               auto-destroy on element / anchor removal)
	// (Previous `events = ["opened","closed"]` class field overwrote
	//  Component's `this.events` listener dict with an array — removed.)

	addControl() {
		if (this.class) {
			this.element.classList.add(this.class);
		}
		this.element.classList.add("gadgetui-popover");

		// Track the element's original DOM location so portal-mode
		// destroy can return it to where the consumer put it.
		this._originalParent = this.element.parentNode;
		this._originalNextSibling = this.element.nextSibling;

		// portal: true detaches the element from its current parent and
		// mounts it on document.body. Escapes any `overflow:hidden` /
		// stacking-context / transformed-ancestor problem the consumer's
		// view tree imposes. Without portal, the element stays where the
		// consumer placed it.
		if (this.portal && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
			document.body.appendChild(this.element);
		}
	}

	addBindings() {
		// Only need scroll/resize repositioning when we're driving
		// position from an anchor's rect. The no-anchor default uses
		// static CSS (top:100px; left:50%) which doesn't care about
		// viewport changes.
		if (!this.anchor) return;

		// Capture phase so we catch scrolls from nested scrollable
		// containers (those don't bubble to window). Matches Menu's
		// pattern for portaled dropdowns.
		this._onScroll = () => this._positionRelativeToAnchor();
		window.addEventListener("scroll", this._onScroll, {
			passive: true,
			capture: true,
		});
		this._onResize = () => this._positionRelativeToAnchor();
		window.addEventListener("resize", this._onResize, { passive: true });
	}

	// Auto-destroy when either the popover element or the anchor leaves
	// the DOM (e.g. framework re-render of the controlling view). Same
	// pattern as Modal / FloatingPane.
	_observeForRemoval() {
		this._observer = new MutationObserver(() => {
			const elGone = !document.contains(this.element);
			const anchorGone = this.anchor && !document.contains(this.anchor);
			if (elGone || anchorGone) this.destroy();
		});
		this._observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	// Position the popover relative to its anchor's viewport rect.
	// Overrides the CSS defaults (position:absolute; top:100px; left:50%;
	// transform:translateX(-5%)) via inline styles. Requires the popover
	// to be visible — offsetWidth/Height are 0 while visibility:hidden,
	// so open() calls this after applying the .gadgetui-showPopover class.
	_positionRelativeToAnchor() {
		if (!this.anchor) return;
		const rect = this.anchor.getBoundingClientRect();
		const el = this.element;
		el.style.position = "fixed";
		el.style.transform = "none";
		if (this.placement === "top") {
			el.style.top = rect.top - el.offsetHeight + "px";
		} else {
			el.style.top = rect.bottom + "px";
		}
		if (this.align === "right") {
			el.style.left = rect.right - el.offsetWidth + "px";
		} else if (this.align === "center") {
			el.style.left =
				rect.left + (rect.width - el.offsetWidth) / 2 + "px";
		} else {
			el.style.left = rect.left + "px";
		}
	}

	open() {
		this.element.classList.add("gadgetui-showPopover");
		// Position after the show-class flips visibility, so
		// offsetWidth/Height are measurable.
		if (this.anchor) this._positionRelativeToAnchor();
		this.fireEvent("opened");
	}

	close() {
		this.element.classList.remove("gadgetui-showPopover");
		this.fireEvent("closed");
	}

	destroy() {
		if (this._destroyed) return;
		this._destroyed = true;

		if (this._observer) {
			this._observer.disconnect();
			this._observer = null;
		}
		if (this._onScroll) {
			window.removeEventListener("scroll", this._onScroll, {
				capture: true,
			});
			this._onScroll = null;
		}
		if (this._onResize) {
			window.removeEventListener("resize", this._onResize);
			this._onResize = null;
		}

		if (this.element && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
		// Return the element to its original DOM location for consumer
		// reuse (only meaningful in portal mode — without portal, the
		// element was never moved). If the original parent has since
		// been removed (framework re-render → MutationObserver triggered
		// us), the element ends up orphaned in that detached parent.
		if (this.portal && this._originalParent) {
			if (this._originalNextSibling) {
				this._originalParent.insertBefore(
					this.element,
					this._originalNextSibling,
				);
			} else {
				this._originalParent.appendChild(this.element);
			}
		}

		this.fireEvent("removed");
	}

	config(options) {
		this.class = options.class || false;
		this.autoOpen = options.autoOpen !== false; // Default to true unless explicitly false
		// Optional anchor-relative positioning. Without `anchor`, the
		// popover uses the CSS placeholder defaults (top:100px etc.) for
		// back-compat with pre-12.3.0 callers.
		this.anchor = options.anchor || null;
		this.placement = options.placement === "top" ? "top" : "bottom";
		this.align = ["left", "right", "center"].includes(options.align)
			? options.align
			: "left";
		this.portal = options.portal === true;
	}
}
