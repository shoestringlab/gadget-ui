class CollapsiblePane extends Component {
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

		if (this.collapse) {
			this.toggle();
		}
	}

	events = ["minimized", "maximized"];

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
		const css = gadgetui.util.setStyle;

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
		const css = gadgetui.util.setStyle;
		css(this.wrapper, "width", this.width);
	}

	addBindings() {
		const header = this.wrapper.querySelector(
			this.headerClass
				? `div.${this.headerClass}`
				: "div.gadget-ui-collapsiblePane-header",
		);

		header.addEventListener("click", () => this.toggle());
	}

	toggle() {
		const css = gadgetui.util.setStyle;
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
		}
	}

	config(options = {}) {
		this.animate = options.animate ?? true;
		this.delay = options.delay ?? 300;
		this.title = options.title ?? "";
		this.width = gadgetui.util.getStyle(this.element, "width");
		this.collapse = options.collapse ?? false;
		this.collapsed = options.collapse ?? true;
		this.class = options.class || false;
		this.headerClass = options.headerClass || false;
	}
}
