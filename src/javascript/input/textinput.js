class TextInput extends Component {
	constructor(selector, options = {}) {
		super();
		this.emitEvents = true;
		this.model = gadgetui.model;
		this.selector = selector;

		this.config(options);
		this.setInitialValue();
		this.addControl();
		this.setLineHeight();
		this.setFont();
		this.setWidth();
		gadgetui.util.bind(this.selector, this.model);
		this.addBindings();
	}

	addControl() {
		if (this.hideable) {
			this.blockSize = gadgetui.util.getStyle(this.selector, "block-size");
			gadgetui.util.setStyle(this.selector, "block-size", this.blockSize);
			this.selector.classList.add(this.browserHideBorderCSS);
		}
	}

	setInitialValue() {
		const val = this.selector.value;
		const ph = this.selector.getAttribute("placeholder");
		this.value = val || (ph && ph.length > 0 ? ph : " ... ");
	}

	setLineHeight() {
		this.lineHeight = this.selector.offsetHeight;
	}

	setFont() {
		const style = gadgetui.util.getStyle(this.selector);
		this.font = `${style.fontFamily} ${style.fontSize} ${style.fontWeight} ${style.fontVariant}`;
	}

	setWidth() {
		this.width =
			gadgetui.util.textWidth(this.selector.value, this.font) + 10 ||
			this.maxWidth;
	}

	addCSS() {
		const css = gadgetui.util.setStyle;
		this.selector.classList.add("gadgetui-textinput");

		if (this.maxWidth > 10 && this.enforceMaxWidth) {
			css(this.selector, "max-width", this.maxWidth);
		}
	}

	setControlWidth(text) {
		const textWidth = Math.max(
			parseInt(gadgetui.util.textWidth(text, this.font), 10),
			this.minWidth,
		);
		gadgetui.util.setStyle(this.selector, "width", `${textWidth + 30}px`);
	}

	addBindings() {
		const events = {
			mouseenter: () => {
				if (this.hideable)
					this.selector.classList.remove(this.browserHideBorderCSS);
				this.fireEvent("mouseenter");
			},
			focus: () => {
				if (this.hideable)
					this.selector.classList.remove(this.browserHideBorderCSS);
				this.fireEvent("focus");
			},
			keyup: (event) => {
				if (event.keyCode === 13) this.selector.blur();
				this.setControlWidth(this.selector.value);
				this.fireEvent("keyup", event);
			},
			change: (event) => {
				setTimeout(() => {
					let value =
						event.target.value ||
						this.selector.getAttribute("placeholder") ||
						"";
					const txtWidth = gadgetui.util.textWidth(value, this.font);

					if (this.maxWidth < txtWidth) {
						value = gadgetui.util.fitText(value, this.font, this.maxWidth);
					}
					if (this.model && !this.selector.getAttribute("gadgetui-bind")) {
						this.model.set(this.selector.name, event.target.value);
					}
					if (this.emitEvents) {
						gadgetui.util.trigger(this.selector, "gadgetui-input-change", {
							text: event.target.value,
						});
					}
					if (this.func) this.func({ text: event.target.value });
					this.fireEvent("change", event);
				}, 200);
			},
		};

		Object.entries(events).forEach(([event, handler]) => {
			this.selector.addEventListener(event, (e) => {
				e.preventDefault();
				handler(e);
			});
		});

		if (this.hideable) {
			this.selector.addEventListener("mouseleave", () => {
				if (this.selector !== document.activeElement) {
					this.selector.classList.add(this.browserHideBorderCSS);
				}
				this.fireEvent("mouseleave");
			});

			this.selector.addEventListener("blur", () => {
				gadgetui.util.setStyle(this.selector, "maxWidth", this.maxWidth);
				this.selector.classList.add(this.browserHideBorderCSS);
				this.fireEvent("blur");
			});
		}
	}

	config(options) {
		this.borderColor = options.borderColor || "#d0d0d0";
		this.useActive = options.useActive || false;
		this.model = options.model || this.model;
		this.func = options.func;
		this.emitEvents = options.emitEvents ?? true;
		this.activate = options.activate || "mouseenter";
		this.delay = options.delay || 10;
		this.minWidth = options.minWidth || 100;
		this.enforceMaxWidth = options.enforceMaxWidth || false;
		this.hideable = options.hideable || false;
		this.maxWidth =
			options.maxWidth ||
			gadgetui.util.getNumberValue(
				gadgetui.util.getStyle(this.selector.parentNode).width,
			);
		this.browserHideBorderCSS = `gadget-ui-textinput-hideBorder-${gadgetui.util.checkBrowser()}`;
	}
}
