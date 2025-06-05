function Modal(element, options = {}) {
	this.element = element;
	this.config(options);
	this.addControl();
	this.addBindings();
}

Modal.prototype.events = ["opened", "closed"];

Modal.prototype.addControl = function () {
	this.wrapper = document.createElement("div");
	if (this.class) {
		gadgetui.util.addClass(this.wrapper, this.class);
	}
	gadgetui.util.addClass(this.wrapper, "gadgetui-modal");

	this.element.parentNode.insertBefore(this.wrapper, this.element);
	this.element.parentNode.removeChild(this.element);
	this.wrapper.appendChild(this.element);

	const icon = `<img class="${this.featherClass}" src="${this.closeIcon}"/>`;

	gadgetui.util.addClass(this.element, "gadgetui-modalWindow");
	this.element.innerHTML = `
    <span name="close" class="gadgetui-right-align">
      <a name="close">${icon}</a>
    </span>
    ${this.element.innerHTML}
  `.trim();

	if (this.autoOpen) {
		this.open();
	}
};

Modal.prototype.addBindings = function () {
	const close = this.element.querySelector('a[name="close"]');
	close.addEventListener("click", () => this.close());
};

Modal.prototype.open = function () {
	gadgetui.util.addClass(this.wrapper, "gadgetui-showModal");
	if (typeof this.fireEvent === "function") {
		this.fireEvent("opened");
	}
};

Modal.prototype.close = function () {
	gadgetui.util.removeClass(this.wrapper, "gadgetui-showModal");
	if (typeof this.fireEvent === "function") {
		this.fireEvent("closed");
	}
};

Modal.prototype.destroy = function () {
	this.element.parentNode.removeChild(this.element);
	this.wrapper.parentNode.insertBefore(this.element, this.wrapper);
	this.wrapper.parentNode.removeChild(this.wrapper);
	this.element.removeChild(this.element.querySelector(".gadgetui-right-align"));
};

Modal.prototype.config = function (options) {
	this.class = options.class || false;
	this.featherClass = options.featherClass || "feather";
	this.closeIcon =
		options.closeIcon || "/node_modules/feather-icons/dist/icons/x-circle.svg";
	this.autoOpen = options.autoOpen !== false; // Default to true unless explicitly false
};
