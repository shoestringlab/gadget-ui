class FloatingPane extends Component {
	constructor(element, options) {
		super();
		this.element = element;
		this.config(options || {});
		this.setup(options);
	}

	//FloatingPane.prototype.events = ["minimized", "maximized", "moved", "closed"];

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
				gadgetui.util.getNumberValue(
					gadgetui.util.getStyle(this.element, "padding"),
				),
				10,
			) * 2;
		const headerHeight =
			gadgetui.util.getNumberValue(
				gadgetui.util.getStyle(this.header, "height"),
			) + 6;

		this.minWidth =
			this.title.length > 0
				? gadgetui.util.textWidth(this.title, this.header.style) + 80
				: 100;

		gadgetui.util.setStyle(this.element, "width", this.width - paddingPx);
		this.height =
			options?.height ??
			gadgetui.util.getNumberValue(
				gadgetui.util.getStyle(this.element, "height"),
			) +
				paddingPx +
				headerHeight +
				10;

		this.addCSS();
		this.height = gadgetui.util.getStyle(this.wrapper, "height");
		this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset(
			this.element,
		).left;
		this.addBindings();
	}

	setMessage() {
		if (this.message) {
			this.element.innerText = this.message;
		}
	}

	addBindings() {
		const dragger = gadgetui.util.draggable(this.wrapper);

		this.wrapper.addEventListener("drag_end", (event) => {
			this.top = event.detail.top;
			this.left = event.detail.left;
			this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset(
				this.element,
			).left;

			this.fireEvent("moved");
		});

		if (this.enableShrink) {
			this.shrinker.addEventListener("click", (event) => {
				event.stopPropagation();
				this.minimized ? this.expand() : this.minimize();
			});
		}

		if (this.enableClose) {
			this.closer.addEventListener("click", (event) => {
				event.stopPropagation();
				this.close();
			});
		}
	}

	close() {
		this.fireEvent("closed");

		this.wrapper.parentNode.removeChild(this.wrapper);
	}

	addHeader() {
		const css = gadgetui.util.setStyle;
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

			const shrinkIcon =
				this.iconType === "img"
					? `<img class="${this.iconClass}" src="${this.minimizeIcon}"/>`
					: `<svg class="${this.iconClass}"><use xlink:href="${this.minimizeIcon}"/></svg>`;

			this.shrinker.innerHTML = shrinkIcon;
			this.header.appendChild(this.shrinker);
		}

		this.wrapper.insertBefore(this.header, this.element);

		if (this.enableClose) {
			const span = document.createElement("span");
			span.setAttribute("name", "closeIcon");

			const icon =
				this.iconType === "img"
					? `<img class="${this.iconClass}" src="${this.closeIcon}"/>`
					: `<svg class="${this.iconClass}"><use xlink:href="${this.closeIcon}"/></svg>`;

			span.innerHTML = icon;
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
		const css = gadgetui.util.setStyle;
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
		this.element.parentNode.insertBefore(fp, this.element);
		this.wrapper = this.element.previousSibling;
		this.element.parentNode.removeChild(this.element);
		fp.appendChild(this.element);
	}

	expand() {
		const css = gadgetui.util.setStyle;
		const offset = gadgetui.util.getOffset(this.wrapper);
		const parentPaddingLeft = parseInt(
			gadgetui.util.getNumberValue(
				gadgetui.util.getStyle(this.wrapper.parentElement, "padding-left"),
			),
			10,
		);
		const icon =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.minimizeIcon}"/>`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.minimizeIcon}"/></svg>`;

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
		const css = gadgetui.util.setStyle;
		const icon =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.maximizeIcon}"/>`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.maximizeIcon}"/></svg>`;

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
		this.animate = options.animate ?? true;
		this.delay = options.delay ?? 500;
		this.title = options.title || "";
		this.backgroundColor = options.backgroundColor || "";
		this.zIndex = options.zIndex ?? gadgetui.util.getMaxZIndex() + 1;
		this.width = gadgetui.util.getStyle(this.element, "width");
		this.top = options.top;
		this.left = options.left;
		this.bottom = options.bottom;
		this.right = options.right;
		this.class = options.class || false;
		this.headerClass = options.headerClass || false;
		//this.featherPath = options.featherPath || "/node_modules/feather-icons";
		this.minimized = false;
		this.relativeOffsetLeft = 0;
		this.enableShrink = options.enableShrink ?? true;
		this.enableClose = options.enableClose ?? true;

		this.iconClass = options.iconClass || "feather";
		this.iconType = options.iconType || "img";
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
