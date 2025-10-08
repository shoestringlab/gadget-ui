class Popover extends Component {
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
		if (this.class) {
			this.element.classList.add(this.class);
		}

		this.element.classList.add("gadgetui-popover");
	}

	addBindings() {
		// No close button, so no bindings needed
	}

	open() {
		this.element.classList.add("gadgetui-showPopover");
		this.fireEvent("opened");
	}

	close() {
		this.element.classList.remove("gadgetui-showPopover");
		this.fireEvent("closed");
	}

	destroy() {
		// this.element.parentNode.removeChild(this.element);
		// this.wrapper.parentNode.insertBefore(this.element, this.wrapper);
		// this.wrapper.parentNode.removeChild(this.wrapper);
		this.fireEvent("removed");
	}

	config(options) {
		this.class = options.class || false;
		this.autoOpen = options.autoOpen !== false; // Default to true unless explicitly false
	}
}
