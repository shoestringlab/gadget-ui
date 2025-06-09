class Dialog extends FloatingPane {
	constructor(element, options = {}) {
		const css = gadgetui.util.setStyle;

		if (element) {
			super(element, options);
		} else {
			const dv = document.createElement("div");
			dv.setAttribute("id", `gadgetui-dialog-${Math.random()}`);
			if (options.width) {
				css(dv, "width", options.width);
			}
			document.body.appendChild(dv);
			super(dv, options);
		}

		this.buttons = options.buttons || [];
		this.addButtons();
	}

	events = ["showPrevious", "showNext"];

	addButtons() {
		const css = gadgetui.util.setStyle;

		this.buttonDiv = document.createElement("div");
		css(this.buttonDiv, "text-align", "center");
		css(this.buttonDiv, "padding", "0.5em");

		this.buttons.forEach((button) => {
			const btn = document.createElement("button");
			btn.classList.add("gadgetui-dialog-button");
			btn.innerHTML = button.label;
			this.buttonDiv.appendChild(btn);

			btn.addEventListener("click", () => {
				if (typeof button.action === "function") {
					button.action();
				}
			});
		});

		this.element.appendChild(this.buttonDiv);
	}

	destroy() {
		super.destroy(); // Call the destroy method of the parent class
		this.element.removeChild(this.buttonDiv); // Remove the button div if necessary
	}
}
