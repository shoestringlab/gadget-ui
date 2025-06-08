function Dialog(element, options = {}) {
	const css = gadgetui.util.setStyle;

	if (element) {
		this.element = element;
	} else {
		const dv = document.createElement("div");
		dv.setAttribute("id", `gadgetui-dialog-${Math.random()}`);
		if (options.width) {
			css(dv, "width", options.width);
		}
		document.body.appendChild(dv);
		this.element = dv;
	}

	this.config(options);
	this.buttons = options.buttons || [];
	this.setup(options);
	this.addButtons();
}

Dialog.prototype = FloatingPane.prototype;

Dialog.prototype.addButtons = function () {
	const css = gadgetui.util.setStyle;

	this.buttonDiv = document.createElement("div");
	css(this.buttonDiv, "text-align", "center");
	css(this.buttonDiv, "padding", "0.5em");

	this.buttons.forEach((button) => {
		const btn = document.createElement("button");
		btn.innerText = button.label;
		css(btn, "margin", "0.5em");
		btn.addEventListener("click", button.click);
		this.buttonDiv.appendChild(btn);
	});

	this.wrapper.appendChild(this.buttonDiv);
};
