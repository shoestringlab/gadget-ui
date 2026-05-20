import { Component } from '../../objects/component.js';
import { getNumberValue, getStyle, textWidth, setStyle, getRelativeParentOffset, draggable, getMaxZIndex, getOffset, buildIconMarkup } from '../gadget-ui.util.js';

export class FloatingPane extends Component {
	constructor(element, options) {
		super();
		this.element = element;
		this.config(options || {});
		this.setup(options);
	}

	// Events fired (call .on(name, handler) to subscribe):
	//   "minimized" / "maximized" — shrinker toggled
	//   "moved"                    — drag completed
	//   "closed"                   — user clicked the X
	//   "removed"                  — destroy() ran (X click, manual destroy(),
	//                                or MutationObserver auto-destroy on
	//                                wrapper removal)
	// (Component#events is the listener dict, not metadata, so this isn't a
	//  runtime declaration — keep it as comment until the base class
	//  separates the two.)

	setup(options) {
		this.setMessage();
		this.addControl();
		this.addHeader();

		if (this.enableShrink) {
			this.maxmin = this.wrapper.querySelector("div.oi[name='maxmin']");
		}

		// Calculate dimensions after header is added
		const paddingPx =
			parseInt(
				getNumberValue(
					getStyle(this.element, "padding"),
				),
				10,
			) * 2;
		const headerHeight =
			getNumberValue(
				getStyle(this.header, "height"),
			) + 6;

		this.minWidth =
			this.title.length > 0
				? textWidth(this.title, this.header.style) + 80
				: 100;

		setStyle(this.element, "width", this.width - paddingPx);
		this.height =
			options?.height ??
			getNumberValue(
				getStyle(this.element, "height"),
			) +
				paddingPx +
				headerHeight +
				10;

		this.addCSS();
		this.height = getStyle(this.wrapper, "height");
		this.relativeOffsetLeft = getRelativeParentOffset(
			this.element,
		).left;
		this.addBindings();
		this._observeForRemoval();
	}

	setMessage() {
		if (this.message) {
			if (this.useHtml) {
				this.element.innerHTML = this.message;
			} else {
				this.element.innerText = this.message;
			}
		}
	}

	addBindings() {
		// Cache the draggable cleanup + each click handler so destroy() can
		// take them back off symmetrically. Inline arrow listeners were the
		// previous pattern but they can't be removed later (every call
		// creates a fresh reference).
		this._dragDestroy = draggable(this.wrapper, this.header);

		this._onDragEnd = (event) => {
			this.top = event.detail.top;
			this.left = event.detail.left;
			this.relativeOffsetLeft = getRelativeParentOffset(
				this.element,
			).left;

			this.fireEvent("moved", event);
		};
		this.wrapper.addEventListener("drag_end", this._onDragEnd);

		if (this.enableShrink) {
			this._onShrinkerClick = (event) => {
				event.stopPropagation();
				this.minimized ? this.expand() : this.minimize();
			};
			this.shrinker.addEventListener("click", this._onShrinkerClick);
		}

		if (this.enableClose) {
			this._onCloserClick = (event) => {
				event.stopPropagation();
				this.close();
			};
			this.closer.addEventListener("click", this._onCloserClick);
		}
	}

	// In portal mode the wrapper outlives the original anchor's normal DOM
	// lifecycle; even outside portal mode, a framework-driven parent
	// re-render can rip the wrapper out from under us without calling
	// close() or destroy(). Either way, watch for the wrapper leaving the
	// DOM and self-destruct so draggable listeners + the observer itself
	// don't leak. (Matches the Menu v12.2.4 auto-destroy pattern.)
	_observeForRemoval() {
		this._observer = new MutationObserver(() => {
			if (!document.contains(this.wrapper)) this.destroy();
		});
		this._observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	close() {
		this.fireEvent("closed");
		this.destroy();
	}

	destroy() {
		if (this._destroyed) return;
		this._destroyed = true;

		if (this._dragDestroy) {
			this._dragDestroy();
			this._dragDestroy = null;
		}
		if (this._onDragEnd && this.wrapper) {
			this.wrapper.removeEventListener("drag_end", this._onDragEnd);
		}
		if (this._onShrinkerClick && this.shrinker) {
			this.shrinker.removeEventListener("click", this._onShrinkerClick);
		}
		if (this._onCloserClick && this.closer) {
			this.closer.removeEventListener("click", this._onCloserClick);
		}
		if (this._observer) {
			this._observer.disconnect();
			this._observer = null;
		}
		if (this.wrapper && this.wrapper.parentNode) {
			this.wrapper.parentNode.removeChild(this.wrapper);
		}

		this.fireEvent("removed");
	}

	addHeader() {
		const css = setStyle;
		this.header = document.createElement("div");
		this.header.innerHTML = this.title;

		this.header.classList.add(
			this.headerClass || "gadget-ui-floatingPane-header",
		);

		if (this.enableShrink) {
			this.shrinker = document.createElement("span");
			this.shrinker.setAttribute("name", "maxmin");
			css(this.shrinker, "position", "absolute");
			css(this.shrinker, "right", "20px");
			css(this.shrinker, "margin-right", ".5em");

			this.shrinker.innerHTML = buildIconMarkup({
				type: this.iconType,
				iconClass: this.iconClass,
				url: this.minimizeIcon,
				viewBox: this.iconViewBox,
			});
			this.header.appendChild(this.shrinker);
		}

		this.wrapper.insertBefore(this.header, this.element);

		if (this.enableClose) {
			const span = document.createElement("span");
			span.setAttribute("name", "closeIcon");

			span.innerHTML = buildIconMarkup({
				type: this.iconType,
				iconClass: this.iconClass,
				url: this.closeIcon,
				viewBox: this.iconViewBox,
			});
			this.header.appendChild(span);

			Object.assign(span.style, {
				right: "3px",
				position: "absolute",
				cursor: "pointer",
				top: "3px",
			});

			this.closer = span;
		}
	}

	addCSS() {
		const css = setStyle;
		const styles = {
			width: this.width,
			"z-index": this.zIndex,
			...(this.backgroundColor && {
				"background-color": this.backgroundColor,
			}),
			...(this.top !== undefined && { top: this.top }),
			...(this.left !== undefined && { left: this.left }),
			...(this.bottom !== undefined && { bottom: this.bottom }),
			...(this.right !== undefined && { right: this.right }),
		};

		Object.entries(styles).forEach(([key, value]) =>
			css(this.wrapper, key, value),
		);
	}

	addControl() {
		const fp = document.createElement("div");
		fp.classList.add(this.class || "gadget-ui-floatingPane");
		fp.draggable = true;

		// portal: true detaches the wrapper from the element's original
		// parent and mounts it on document.body, escaping any
		// `overflow:hidden` / stacking-context ancestor the consumer's
		// view tree imposes. The original element still ends up inside
		// the wrapper either way; the difference is which DOM subtree
		// owns the wrapper.
		if (this.portal) {
			this.element.parentNode.removeChild(this.element);
			document.body.appendChild(fp);
			fp.appendChild(this.element);
		} else {
			this.element.parentNode.insertBefore(fp, this.element);
			this.element.parentNode.removeChild(this.element);
			fp.appendChild(this.element);
		}
		this.wrapper = fp;
	}

	expand() {
		const css = setStyle;
		const offset = getOffset(this.wrapper);
		const parentPaddingLeft = parseInt(
			getNumberValue(
				getStyle(this.wrapper.parentElement, "padding-left"),
			),
			10,
		);
		const icon = buildIconMarkup({
			type: this.iconType,
			iconClass: this.iconClass,
			url: this.minimizeIcon,
			viewBox: this.iconViewBox,
		});

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ width: this.width },
				{ queue: false, duration: 500 },
			);
			Velocity(
				this.element,
				{ height: this.height },
				{
					queue: false,
					duration: 500,
					complete: () => {
						this.shrinker.innerHTML = icon;
						css(this.element, "overflow", "scroll");

						this.fireEvent("maximized");
					},
				},
			);
		} else {
			css(this.wrapper, "width", this.width);
			css(this.element, "height", this.height);
			this.shrinker.innerHTML = icon;
			css(this.element, "overflow", "scroll");

			this.fireEvent("maximized");
		}

		this.minimized = false;
	}

	minimize() {
		const css = setStyle;
		const icon = buildIconMarkup({
			type: this.iconType,
			iconClass: this.iconClass,
			url: this.maximizeIcon,
			viewBox: this.iconViewBox,
		});

		css(this.element, "overflow", "hidden");

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ width: this.minWidth },
				{
					queue: false,
					duration: this.delay,
					complete: () => (this.shrinker.innerHTML = icon),
				},
			);
			Velocity(
				this.element,
				{ height: "50px" },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						this.fireEvent("minimized");
					},
				},
			);
		} else {
			css(this.wrapper, "width", this.minWidth);
			css(this.element, "height", "50px");
			this.shrinker.innerHTML = icon;
			this.fireEvent("minimized");
		}

		this.minimized = true;
	}

	config(options) {
		this.message = options.message;
		this.useHtml = options.useHtml ?? false;
		this.animate = options.animate ?? true;
		this.delay = options.delay ?? 500;
		this.title = options.title || "";
		this.backgroundColor = options.backgroundColor || "";
		this.zIndex = options.zIndex ?? getMaxZIndex() + 1;
		this.width = getStyle(this.element, "width");
		this.top = options.top;
		this.left = options.left;
		this.bottom = options.bottom;
		this.right = options.right;
		this.class = options.class || false;
		this.headerClass = options.headerClass || false;
		this.portal = options.portal === true;
		//this.featherPath = options.featherPath || "/node_modules/feather-icons";
		this.minimized = false;
		this.relativeOffsetLeft = 0;
		this.enableShrink = options.enableShrink ?? true;
		this.enableClose = options.enableClose ?? true;

		this.iconClass = options.iconClass || "feather";
		this.iconType = options.iconType || "img";
		// Coordinate space of the referenced icon symbol (for iconType
		// "svg"). Default matches feather-icons (24×24). Override for
		// other icon sets, e.g. "0 0 16 16" for Bootstrap Icons,
		// "0 0 8 8" for Open Iconic.
		this.iconViewBox = options.iconViewBox || "0 0 24 24";
		this.closeIcon =
			options.closeIcon ||
			"/node_modules/feather-icons/dist/icons/x-circle.svg";
		this.minimizeIcon =
			options.minimizeIcon ||
			"/node_modules/feather-icons/dist/icons/minimize.svg";
		this.maximizeIcon =
			options.maximizeIcon ||
			"/node_modules/feather-icons/dist/icons/maximize.svg";
	}
}
