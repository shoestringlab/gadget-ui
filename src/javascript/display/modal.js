function Modal(element, options) {
	this.element = element;
	this.config(options);

	this.addControl();
	this.addBindings();
}

Modal.prototype.events = ['opened', 'closed'];

Modal.prototype.addControl = function () {
	this.wrapper = document.createElement("div");
	if (this.class) {
		gadgetui.util.addClass(this.wrapper, this.class);
	}
	gadgetui.util.addClass(this.wrapper, "gadgetui-modal");

	this.element.parentNode.insertBefore(this.wrapper, this.element);
	//this.wrapper = this.element.previousSibling;
	this.element.parentNode.removeChild(this.element);
	this.wrapper.appendChild(this.element);
	var icon = "";
	if (this.closeIcon.indexOf('svg') > 0) {
		icon = '<svg class="' + this.featherClass + '"><use xlink:href="' + this.closeIcon + '"/></svg>';
	} else {
		icon = '<img src="' + this.closeIcon + '"/>';
	}
	gadgetui.util.addClass(this.element, "gadgetui-modalWindow");
	this.element.innerHTML = `<span name="close" class="gadgetui-right-align">
              <a name="close">
              ${icon}
              </a>
              </span>` + this.element.innerHTML;
	if (this.autoOpen) {
		this.open();
	}
};

Modal.prototype.addBindings = function () {
	let self = this;
	let close = this.element.querySelector(" a[name='close']");
	close.addEventListener("click", function (event) {
		self.close();
	});
};

Modal.prototype.open = function () {
	gadgetui.util.addClass(this.wrapper, "gadgetui-showModal");
	if (typeof this.fireEvent === 'function') {
		this.fireEvent('opened');
	}
};

Modal.prototype.close = function () {
	gadgetui.util.removeClass(this.wrapper, "gadgetui-showModal");
	if (typeof this.fireEvent === 'function') {
		this.fireEvent('closed');
	}
};

Modal.prototype.destroy = function () {
	// remove the wrapper
	this.element.parentNode.removeChild(this.element);
	this.wrapper.parentNode.insertBefore(this.element, this.wrapper);
	this.wrapper.parentNode.removeChild(this.wrapper);
	// remove the close span
	this.element.removeChild(this.element.querySelector(".gadgetui-right-align"));
};

Modal.prototype.config = function (options) {
	this.class = ((options.class === undefined ? false : options.class));
	this.featherClass = ((options.featherClass === undefined ? 'feather' : options.featherClass));
	//this.featherPath = options.featherPath || "/node_modules/feather-icons";
	this.closeIcon = ((options.closeIcon === undefined ? '/node_modules/feather-icons/dist/feather-sprite.svg#x-circle' : options.closeIcon));
	this.autoOpen = (options.autoOpen === false ? false : true);
};
