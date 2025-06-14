class Toggle extends Component {
	constructor(options) {
		super();
		this.configure(options);
		this.create();
	}

	configure(options) {
		this.selector = options.selector;
		this.parentSelector = options.parentSelector;
		this.shape = options.shape === undefined ? "square" : options.shape;
		this.value = parseInt(options.initialValue, 10) === 1 ? 1 : 0;
	}

	create() {
		if (this.selector !== undefined) {
			this.element = document.querySelector(this.selector);
		} else {
			const ele = document.createElement("input");
			ele.type = "range";
			ele.min = 0;
			ele.max = 1;
			const parent = document.querySelector(this.parentSelector);
			parent.appendChild(ele);
			this.element = ele;
		}
		this.element.value = this.value;
		this.element.classList.add("gadget-ui-toggle");
		if (this.shape === "round") {
			this.element.classList.add("gadget-ui-toggle-round");
		}

		if (this.value === 0) {
			this.element.classList.add("gadget-ui-toggle-off");
		}
		this.element.addEventListener(
			"click",
			function () {
				if (this.value === 1) {
					this.value = 0;
					this.element.classList.add("gadget-ui-toggle-off");
				} else {
					this.value = 1;
					this.element.classList.remove("gadget-ui-toggle-off");
				}
				this.element.value = this.value;
				this.fireEvent("changed");

				// event.currentTarget.css.backgroundColor='#ccc';
			}.bind(this),
		);
	}
}
