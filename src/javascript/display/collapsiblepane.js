import { Component } from '../../objects/component.js';
import { setStyle, getStyle } from '../gadget-ui.util.js';

export class CollapsiblePane extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);

		this.addControl();
		this.addCSS();
		this.addHeader();

		this.icon = this.wrapper.querySelector("div.oi");
		this.addBindings();

		this.height = this.wrapper.offsetHeight;
		this.headerHeight = this.header.offsetHeight;
		this.selectorHeight = this.element.offsetHeight;

		this._observeForRemoval();

		if (this.collapse) {
			this.toggle();
		}
	}

	// Events fired (call .on(name, handler) to subscribe):
	//   "minimized" / "maximized" — toggle() completed; component event
	//   "removed"                 — destroy() ran (manual destroy(), or
	//                               MutationObserver auto-destroy on
	//                               wrapper removal)
	// Legacy DOM events (kept for back-compat — also fired on toggle):
	//   element.dispatchEvent(new Event("collapse")) — before collapsing
	//   element.dispatchEvent(new Event("expand"))   — before expanding
	// (Previous `events = ["minimized","maximized"]` class field
	//  overwrote Component's `this.events` listener dict with an array
	//  — removed.)

	addControl() {
		const pane = document.createElement("div");

		if (this.class) {
			pane.classList.add(this.class);
		}
		pane.classList.add("gadget-ui-collapsiblePane");

		this.element.parentNode.insertBefore(pane, this.element);
		this.wrapper = this.element.previousSibling;
		this.element.parentNode.removeChild(this.element);
		pane.appendChild(this.element);
	}

	addHeader() {
		const header = document.createElement("div");
		const css = setStyle;

		header.classList.add("gadget-ui-collapsiblePane-header");
		if (this.headerClass) {
			header.classList.add(this.headerClass);
		}
		header.innerHTML = this.title;

		this.wrapper.insertBefore(header, this.element);
		this.header = this.wrapper.querySelector(
			this.headerClass
				? `div.${this.headerClass}`
				: "div.gadget-ui-collapsiblePane-header",
		);

		const div = document.createElement("div");
		this.header.appendChild(div);
	}

	addCSS() {
		const css = setStyle;
		css(this.wrapper, "width", this.width);
	}

	addBindings() {
		const header = this.wrapper.querySelector(
			this.headerClass
				? `div.${this.headerClass}`
				: "div.gadget-ui-collapsiblePane-header",
		);

		// Store the bound handler so destroy() can detach it
		// symmetrically. An inline arrow (the previous pattern) can't be
		// removed later because each call creates a fresh ref.
		this._onHeaderClick = () => this.toggle();
		header.addEventListener("click", this._onHeaderClick);
		this._headerEl = header;
	}

	// Auto-destroy when the wrapper leaves the DOM (e.g. consumer's
	// framework re-renders the view without calling destroy()). Same
	// pattern as Modal / Popover / FloatingPane / etc.
	_observeForRemoval() {
		this._observer = new MutationObserver(() => {
			if (!document.contains(this.wrapper)) this.destroy();
		});
		this._observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	destroy() {
		if (this._destroyed) return;
		this._destroyed = true;

		if (this._observer) {
			this._observer.disconnect();
			this._observer = null;
		}
		if (this._headerEl && this._onHeaderClick) {
			this._headerEl.removeEventListener("click", this._onHeaderClick);
		}
		if (this.wrapper && this.wrapper.parentNode) {
			this.wrapper.parentNode.removeChild(this.wrapper);
		}

		this.fireEvent("removed");
	}

	toggle() {
		const css = setStyle;
		let icon, display, myHeight, selectorHeight;

		if (this.collapsed) {
			icon = "";
			display = "block";
			myHeight = this.height;
			selectorHeight = this.selectorHeight;
			this.collapsed = false;
		} else {
			icon = "";
			display = "none";
			myHeight = this.headerHeight;
			selectorHeight = 0;
			this.collapsed = true;
		}

		const eventName = this.collapsed ? "collapse" : "expand";
		const newEventName = this.collapsed ? "minimized" : "maximized";
		this.element.dispatchEvent(new Event(eventName));

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ height: myHeight },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						// this.icon.setAttribute('data-glyph', icon);
					},
				},
			);

			Velocity(
				this.element,
				{ height: selectorHeight },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						this.fireEvent(newEventName);
					},
				},
			);
		} else {
			css(this.element, "display", display);
			// this.icon.setAttribute('data-glyph', icon);
			// Sync the component event into the non-animated path —
			// previously only the Velocity branch fired this, so
			// consumers using `animate: false` never saw "minimized" /
			// "maximized". The legacy DOM event above fires in both
			// branches; the component event now does too.
			this.fireEvent(newEventName);
		}
	}

	config(options = {}) {
		this.animate = options.animate ?? true;
		this.delay = options.delay ?? 300;
		this.title = options.title ?? "";
		this.width = getStyle(this.element, "width");
		this.collapse = options.collapse ?? false;
		this.collapsed = options.collapse ?? true;
		this.class = options.class || false;
		this.headerClass = options.headerClass || false;
	}
}
