import { Component } from '../../objects/component.js';
import { buildIconMarkup } from '../gadget-ui.util.js';

export class Sidebar extends Component {
	constructor(selector, options = {}) {
		super();
		this.selector = selector;
		this.minimized = false;
		this.config(options);
		this.addControl();
		this.addBindings(options);
		this._observeForRemoval();
	}

	// Events fired (call .on(name, handler) to subscribe):
	//   "minimized" / "maximized" — toggle completed (or constructor's
	//                               initial `minimized: true` ran)
	//   "removed"                 — destroy() ran (manual destroy(), or
	//                               MutationObserver auto-destroy on
	//                               wrapper removal)
	// (Previous `events = ["maximized","minimized"]` class field
	//  overwrote Component's `this.events` listener dict with an array
	//  — removed.)

	config(options) {
		this.class = options.class || false;
		this.animate = options.animate ?? true;
		this.delay = options.delay || 300;
		this.toggleTitle = options.toggleTitle || "Toggle Sidebar";
		this.iconClass = options.iconClass || "feather";
		this.iconType = options.iconType || "img";
		// Coordinate space of the referenced icon symbol (for iconType
		// "svg"). Default matches feather-icons. Override for other
		// icon sets — see FloatingPane.config() for examples.
		this.iconViewBox = options.iconViewBox || "0 0 24 24";
		this.leftIcon =
			options.leftIcon ||
			"/node_modules/feather-icons/dist/icons/chevron-left.svg";
		this.rightIcon =
			options.rightIcon ||
			"/node_modules/feather-icons/dist/icons/chevron-right.svg";
	}

	addControl() {
		this.wrapper = document.createElement("div");
		if (this.class) {
			this.wrapper.classList.add(this.class);
		}
		this.wrapper.classList.add("gadgetui-sidebar");

		this.span = document.createElement("span");
		this.span.setAttribute("title", this.toggleTitle);
		this.span.classList.add("gadgetui-right-align");
		this.span.classList.add("gadgetui-sidebar-toggle");

		this.span.innerHTML = buildIconMarkup({
			type: this.iconType,
			iconClass: this.iconClass,
			url: this.leftIcon,
			viewBox: this.iconViewBox,
		});

		this.selector.parentNode.insertBefore(this.wrapper, this.selector);
		this.selector.parentNode.removeChild(this.selector);
		this.wrapper.appendChild(this.selector);
		this.wrapper.insertBefore(this.span, this.selector);
		this.width = this.wrapper.offsetWidth;
	}

	maximize() {
		this.minimized = false;
		this.setChevron(this.minimized);
		this.wrapper.classList.remove("gadgetui-sidebar-minimized");

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ width: this.width },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						this.selector.classList.remove("gadgetui-sidebarContent-minimized");
						this.fireEvent("maximized");
					},
				},
			);
		} else {
			this.selector.classList.remove("gadgetui-sidebarContent-minimized");
			this.fireEvent("maximized");
		}
	}

	minimize() {
		this.minimized = true;
		this.setChevron(this.minimized);
		this.selector.classList.add("gadgetui-sidebarContent-minimized");

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ width: 25 },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						this.wrapper.classList.add("gadgetui-sidebar-minimized");
						this.fireEvent("minimized");
					},
				},
			);
		} else {
			this.wrapper.classList.add("gadgetui-sidebar-minimized");
			this.fireEvent("minimized");
		}
	}

	addBindings(options) {
		// Store the bound handler so destroy() can detach it
		// symmetrically. An inline arrow (the previous pattern) can't be
		// removed later because each call creates a fresh ref.
		this._onToggleClick = () => {
			this.minimized ? this.maximize() : this.minimize();
		};
		this.span.addEventListener("click", this._onToggleClick);

		if (options.minimized) {
			this.minimize();
		}
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

	setChevron(minimized) {
		const chevron = minimized ? this.rightIcon : this.leftIcon;
		const svg = this.wrapper.querySelector("span");

		svg.innerHTML = buildIconMarkup({
			type: this.iconType,
			iconClass: this.iconClass,
			url: chevron,
			viewBox: this.iconViewBox,
		});
	}

	destroy() {
		if (this._destroyed) return;
		this._destroyed = true;

		if (this._observer) {
			this._observer.disconnect();
			this._observer = null;
		}
		if (this.span && this._onToggleClick) {
			this.span.removeEventListener("click", this._onToggleClick);
		}

		// Unwrap the selector: pop it back out of the wrapper and into
		// the wrapper's spot in the parent, then drop the wrapper (which
		// takes the toggle span with it). Leaves the consumer's element
		// where it started so they can re-instantiate or repurpose it.
		const wrapperParent = this.wrapper && this.wrapper.parentNode;
		if (wrapperParent && this.selector) {
			wrapperParent.insertBefore(this.selector, this.wrapper);
		}
		if (wrapperParent) {
			wrapperParent.removeChild(this.wrapper);
		}

		this.fireEvent("removed");
	}
}
