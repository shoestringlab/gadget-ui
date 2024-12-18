
function Dialog(element, options) {
	var css = gadgetui.util.setStyle;
	
	if( element !== null ){
		this.element = element;
	}else{
		let dv = document.createElement("div");
		dv.setAttribute( "id", "gadgetui-dialog-" + Math.random());
		if( options.width !== undefined ){
			css(dv, "width", options.width);
		}
		document.querySelector( "body" ).append(dv);
		this.element = dv;
	}

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
