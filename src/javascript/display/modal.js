class Modal extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);
		this.addControl();
		this.addBindings();

		if (this.autoOpen) {
			this.open();
		}
	}

	events = ["opened", "closed"];

	addControl() {
		this.wrapper = document.createElement("div");
		if (this.class) {
			this.wrapper.classList.add(this.class);
		}
		this.wrapper.classList.add("gadgetui-modal");

		this.element.parentNode.insertBefore(this.wrapper, this.element);
		this.element.parentNode.removeChild(this.element);
		this.wrapper.appendChild(this.element);

		const icon =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.closeIcon}"/>`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.closeIcon}"/></svg>`;

		this.element.classList.add("gadgetui-modalWindow");
		this.element.innerHTML = `
    <span name="close" class="gadgetui-right-align">
      <a name="close">${icon}</a>
    </span>
    ${this.element.innerHTML}
  `.trim();
	}

	addBindings() {
		const close = this.element.querySelector('a[name="close"]');
		close.addEventListener("click", (event) => {
			event.stopPropagation();
			event.preventDefault();
			this.close();
		});
	}

	open() {
		this.wrapper.classList.add("gadgetui-showModal");
		this.fireEvent("opened");
	}

	close() {
		this.wrapper.classList.remove("gadgetui-showModal");
		this.fireEvent("closed");
	}

	destroy() {
		this.element.parentNode.removeChild(this.element);
		this.wrapper.parentNode.insertBefore(this.element, this.wrapper);
		this.wrapper.parentNode.removeChild(this.wrapper);
		this.element.removeChild(
			this.element.querySelector(".gadgetui-right-align"),
		);
		this.fireEvent("removed");
	}

	config(options) {
		this.class = options.class || false;
		this.iconClass = options.iconClass || "feather";
		this.closeIcon =
			options.closeIcon ||
			"/node_modules/feather-icons/dist/icons/x-circle.svg";
		this.autoOpen = options.autoOpen !== false; // Default to true unless explicitly false
		this.iconType = options.iconType || "img";
	}
}
