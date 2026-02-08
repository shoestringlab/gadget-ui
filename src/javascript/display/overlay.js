class Overlay extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);
		this.addControl();
		this.addBindings();

		// Show overlay by default after initialization
		if (this.autoShow) {
			this.show();
		}
	}

	events = ["shown", "hidden", "destroyed", "contentChanged"];

	config(options = {}) {
		this.backgroundColor = options.backgroundColor || "rgba(0, 0, 0, 0.5)";
		this.class = options.class || false;
		this.autoShow = options.autoShow !== false;
		this.clickThrough = options.clickThrough || false;
		this.zIndexOffset = options.zIndexOffset || 1;
		this.content = options.content || "";
		this.size = options.size || null;
		this.position = options.position || null; // 'top', 'left', 'right', 'bottom', or null
	}

	addControl() {
		const rect = this.element.getBoundingClientRect();

		this.overlayElement = document.createElement("div");
		this.overlayElement.classList.add("gadgetui-overlay");

		if (this.class) {
			this.overlayElement.classList.add(this.class);
		}

		const { width, height, top, left } = this.calculateSizeAndPosition(rect);

		Object.assign(this.overlayElement.style, {
			position: "absolute",
			top: `${top}px`,
			left: `${left}px`,
			width: `${width}px`,
			height: `${height}px`,
			backgroundColor: this.backgroundColor,
			zIndex: this.getMaxZIndex() + this.zIndexOffset,
			pointerEvents: this.clickThrough ? "none" : "auto",
		});

		if (!this.autoShow) {
			this.overlayElement.classList.add("gadgetui-hidden");
		}

		if (this.content) {
			this.overlayElement.innerHTML = this.content;
		}

		document.body.appendChild(this.overlayElement);

		this.lastRect = rect;
		this.setupResizeObserver();
		this.setupScrollListener();
	}

	setupResizeObserver() {
		if (typeof ResizeObserver !== "undefined") {
			this.resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const rect = entry.target.getBoundingClientRect();
					this.updateOverlayPosition(rect);
				}
			});
			this.resizeObserver.observe(this.element);
		}
	}

	setupScrollListener() {
		this.scrollHandler = () => {
			const rect = this.element.getBoundingClientRect();
			this.updateOverlayPosition(rect);
		};
		window.addEventListener("scroll", this.scrollHandler, true);
	}

	updateOverlayPosition(rect) {
		if (!this.overlayElement) return;

		// Only update if position or size actually changed
		if (
			rect.top !== this.lastRect.top ||
			rect.left !== this.lastRect.left ||
			rect.width !== this.lastRect.width ||
			rect.height !== this.lastRect.height
		) {
			const { width, height, top, left } = this.calculateSizeAndPosition(rect);

			Object.assign(this.overlayElement.style, {
				top: `${top}px`,
				left: `${left}px`,
				width: `${width}px`,
				height: `${height}px`,
			});

			this.lastRect = { ...rect }; // shallow copy
		}
	}

	getMaxZIndex() {
		let max = 0;
		const all = document.querySelectorAll("*");
		for (const el of all) {
			const z = parseInt(window.getComputedStyle(el).zIndex, 10);
			if (!isNaN(z) && z > max) max = z;
		}
		return max;
	}

	addBindings() {
		if (!this.overlayElement) return;

		if (!this.clickThrough) {
			this.overlayElement.addEventListener("click", (e) => {
				this.fireEvent("click", { originalEvent: e });
			});
		}

		this.overlayElement.addEventListener("mouseenter", (e) => {
			this.fireEvent("mouseenter", { originalEvent: e });
		});

		this.overlayElement.addEventListener("mouseleave", (e) => {
			this.fireEvent("mouseleave", { originalEvent: e });
		});
	}

	show() {
		if (this.overlayElement) {
			this.overlayElement.classList.remove("gadgetui-hidden");
			this.fireEvent("shown");
		}
	}

	hide() {
		if (this.overlayElement) {
			this.overlayElement.classList.add("gadgetui-hidden");
			this.fireEvent("hidden");
		}
	}

	destroy() {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}
		if (this.scrollHandler) {
			window.removeEventListener("scroll", this.scrollHandler, true);
		}
		if (this.overlayElement?.parentNode) {
			this.overlayElement.parentNode.removeChild(this.overlayElement);
		}

		this.overlayElement = null;
		this.lastRect = null;
		this.resizeObserver = null;
		this.scrollHandler = null;

		this.fireEvent("destroyed");
	}

	isVisible() {
		return (
			!!this.overlayElement &&
			!this.overlayElement.classList.contains("gadgetui-hidden")
		);
	}

	calculateSizeAndPosition(rect) {
		const scrollTop = window.scrollY;
		const scrollLeft = window.scrollX;

		const elementTop = rect.top + scrollTop;
		const elementLeft = rect.left + scrollLeft;
		const elementBottom = rect.bottom + scrollTop;
		const elementRight = rect.right + scrollLeft;

		// ── Step 1: Determine base region and full-dimension constraints ──
		let baseWidth, baseHeight, baseTop, baseLeft;

		if (!this.position) {
			// Full overlay
			baseWidth = rect.width;
			baseHeight = rect.height;
			baseTop = elementTop;
			baseLeft = elementLeft;
		} else {
			switch (this.position.toLowerCase()) {
				case "top":
					baseWidth = rect.width; // always full width
					baseHeight = rect.height / 2; // default: top half
					baseTop = elementTop;
					baseLeft = elementLeft;
					break;

				case "bottom":
					baseWidth = rect.width; // always full width
					baseHeight = rect.height / 2; // default: bottom half
					baseTop = elementTop + rect.height / 2;
					baseLeft = elementLeft;
					break;

				case "left":
					baseWidth = rect.width / 2; // default: left half
					baseHeight = rect.height; // always full height
					baseTop = elementTop;
					baseLeft = elementLeft;
					break;

				case "right":
					baseWidth = rect.width / 2; // default: right half
					baseHeight = rect.height; // always full height
					baseTop = elementTop;
					baseLeft = elementLeft + rect.width / 2;
					break;

				default:
					// fallback to full
					baseWidth = rect.width;
					baseHeight = rect.height;
					baseTop = elementTop;
					baseLeft = elementLeft;
			}
		}

		// ── Step 2: Apply custom size ─────────────────────────────────────
		let finalWidth = baseWidth;
		let finalHeight = baseHeight;

		if (this.size) {
			if (
				typeof this.size === "object" &&
				this.size.width !== undefined &&
				this.size.height !== undefined
			) {
				// User provided both dimensions → use them directly (overrides full-width/height rule)
				finalWidth = this.parseSizeValue(this.size.width, rect.width);
				finalHeight = this.parseSizeValue(this.size.height, rect.height);
			} else {
				// Single value or partial spec → apply to the "variable" dimension
				const sizeVal = this.parseSizeValue(
					this.size,
					Math.min(baseWidth, baseHeight),
				);

				if (this.position === "top" || this.position === "bottom") {
					// For top/bottom → size affects height, width stays full
					finalHeight = sizeVal;
					finalWidth = rect.width;
				} else if (this.position === "left" || this.position === "right") {
					// For left/right → size affects width, height stays full
					finalWidth = sizeVal;
					finalHeight = rect.height;
				} else {
					// fallback: square
					finalWidth = finalHeight = sizeVal;
				}
			}
		}

		// ── Step 3: Center the overlay inside the base region ─────────────
		const top = baseTop + (baseHeight - finalHeight) / 2;
		const left = baseLeft + (baseWidth - finalWidth) / 2;

		return { width: finalWidth, height: finalHeight, top, left };
	}

	parseSizeValue(value, referenceSize) {
		if (typeof value === "string" && value.endsWith("%")) {
			const pct = parseFloat(value) / 100;
			return referenceSize * pct;
		}
		if (typeof value === "number") {
			return value;
		}
		if (typeof value === "string") {
			// Try to parse "120px", "3em", etc.
			const num = parseFloat(value);
			return isNaN(num) ? referenceSize : num;
		}
		return referenceSize; // safest fallback
	}

	updateStyle(styles) {
		if (this.overlayElement) {
			Object.assign(this.overlayElement.style, styles);
		}
	}

	setContent(htmlContent) {
		this.content = htmlContent;
		if (this.overlayElement) {
			this.overlayElement.innerHTML = this.content;
			this.fireEvent("contentChanged", { content: this.content });
		}
	}

	getContent() {
		return this.content;
	}

	updateSizeAndPosition(size, position) {
		this.size = size;
		this.position = position;

		if (this.overlayElement) {
			const rect = this.element.getBoundingClientRect();
			const pos = this.calculateSizeAndPosition(rect);
			this.updateStyle({
				width: `${pos.width}px`,
				height: `${pos.height}px`,
				top: `${pos.top}px`,
				left: `${pos.left}px`,
			});
		}
	}
}
