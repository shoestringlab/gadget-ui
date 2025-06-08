class Sidebar extends Component {
	constructor(selector, options = {}) {
		super();
		this.selector = selector;
		this.minimized = false;
		this.config(options);
		this.addControl();
		this.addBindings(options);
	}

	events = ["maximized", "minimized"];

	config(options) {
		this.class = options.class || false;
		this.animate = options.animate ?? true;
		this.delay = options.delay || 300;
		this.toggleTitle = options.toggleTitle || "Toggle Sidebar";
		this.iconClass = options.iconClass || "feather";
		this.iconType = options.iconType || "img";
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
			gadgetui.util.addClass(this.wrapper, this.class);
		}
		gadgetui.util.addClass(this.wrapper, "gadgetui-sidebar");

		this.span = document.createElement("span");
		this.span.setAttribute("title", this.toggleTitle);
		gadgetui.util.addClass(this.span, "gadgetui-right-align");
		gadgetui.util.addClass(this.span, "gadgetui-sidebar-toggle");

		this.span.innerHTML =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.leftIcon}">`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.leftIcon}"/></svg>`;

		this.selector.parentNode.insertBefore(this.wrapper, this.selector);
		this.selector.parentNode.removeChild(this.selector);
		this.wrapper.appendChild(this.selector);
		this.wrapper.insertBefore(this.span, this.selector);
		this.width = this.wrapper.offsetWidth;
	}

	maximize() {
		this.minimized = false;
		this.setChevron(this.minimized);
		gadgetui.util.removeClass(this.wrapper, "gadgetui-sidebar-minimized");

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ width: this.width },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						gadgetui.util.removeClass(
							this.selector,
							"gadgetui-sidebarContent-minimized",
						);
						this.fireEvent("maximized");
					},
				},
			);
		} else {
			gadgetui.util.removeClass(
				this.selector,
				"gadgetui-sidebarContent-minimized",
			);
			this.fireEvent("maximized");
		}
	}

	minimize() {
		this.minimized = true;
		this.setChevron(this.minimized);
		gadgetui.util.addClass(this.selector, "gadgetui-sidebarContent-minimized");

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ width: 25 },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						gadgetui.util.addClass(this.wrapper, "gadgetui-sidebar-minimized");
						this.fireEvent("minimized");
					},
				},
			);
		} else {
			gadgetui.util.addClass(this.wrapper, "gadgetui-sidebar-minimized");
			this.fireEvent("minimized");
		}
	}

	addBindings(options) {
		this.span.addEventListener("click", () => {
			this.minimized ? this.maximize() : this.minimize();
		});

		if (options.minimized) {
			this.minimize();
		}
	}

	setChevron(minimized) {
		const chevron = minimized ? this.rightIcon : this.leftIcon;
		const svg = this.wrapper.querySelector("span");

		svg.innerHTML =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${chevron}">`
				: `<svg class="${this.iconClass}"><use xlink:href="${chevron}"/></svg>`;
	}

	destroy() {
		// Implement cleanup logic if necessary
	}
}
