
function Dialog(selector, options) {

	this.selector = selector;
	if (options !== undefined) {
		this.config(options);
		this.buttons = (options.buttons !== undefined ? options.buttons : []);
	}

	this.setup(options);

	this.addButtons();
}

Dialog.prototype = FloatingPane.prototype;

Dialog.prototype.addButtons = function () {
	var self = this;
	var css = gadgetui.util.setStyle;
	this.buttonDiv = document.createElement("div");
	css(this.buttonDiv, "text-align", "center");
	css(this.buttonDiv, "padding", ".5em");
	this.buttons.forEach(function (button) {
		var btn = document.createElement("button");
		btn.innerText = button.label;
		css(btn, "margin", ".5em");
		btn.addEventListener("click", button.click);
		self.buttonDiv.appendChild(btn);
	});
	this.wrapper.appendChild(this.buttonDiv);
}
