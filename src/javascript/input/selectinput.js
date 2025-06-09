function SelectInput(selector, options = {}) {
	this.selector = selector;
	this.config(options);
	this.setSelectOptions();
	this.setInitialValue(options);
	this.addControl();
	this.addCSS();

	const css = gadgetui.util.setStyle;
	if (this.hideable) {
		css(this.selector, "display", "none");
	} else {
		css(this.label, "display", "none");
		css(this.selector, "display", "inline-block");
	}

	gadgetui.util.bind(this.selector, this.model);
	gadgetui.util.bind(this.label, this.model);
	this.addBindings();
}

SelectInput.prototype.events = [
	"change",
	"focus",
	"mouseenter",
	"mouseleave",
	"blur",
];

SelectInput.prototype.setInitialValue = function (options) {
	const selectedIndex = this.selector.selectedIndex || 0;
	this.value = options.value || {
		id: this.selector.options[selectedIndex].value,
		text: this.selector.options[selectedIndex].innerHTML,
	};
	this.selector.value = this.value.id;
};

SelectInput.prototype.addControl = function () {
	this.wrapper = document.createElement("div");
	this.label = document.createElement("div");

	this.wrapper.classList.add("gadgetui-selectinput-div");
	this.label.classList.add("gadgetui-selectinput-label");
	this.label.setAttribute(
		"gadgetui-bind",
		this.selector.getAttribute("gadgetui-bind") || "",
	);
	this.label.innerHTML = this.value.text;

	this.selector.parentNode.insertBefore(this.wrapper, this.selector);
	this.selector.parentNode.removeChild(this.selector);
	this.wrapper.appendChild(this.selector);
	this.wrapper.insertBefore(this.label, this.selector);
};

SelectInput.prototype.setSelectOptions = function () {
	const bindOptions = this.selector.getAttribute("gadgetui-bind-options");
	if (!bindOptions && !this.dataProvider) return;

	while (this.selector.options.length > 0) this.selector.remove(0);

	const addOption = (value, text) => {
		const opt = document.createElement("option");
		opt.value = value;
		opt.text = text;
		this.selector.add(opt);
	};

	if (bindOptions) {
		const optionsArray = this.model.get(bindOptions);
		optionsArray.forEach((item) => {
			const isObject = typeof item === "object";
			addOption(isObject ? item.id : item, isObject ? item.text : item);
		});
	} else if (this.dataProvider) {
		this.dataProvider.data.forEach((obj) =>
			addOption(obj.id, obj.text || obj.id),
		);
	}
};

SelectInput.prototype.addCSS = function () {
	const css = gadgetui.util.setStyle;
	const style = gadgetui.util.getStyle(this.selector);
	const parentHeight =
		gadgetui.util.getNumberValue(
			gadgetui.util.getStyle(this.selector.parentNode).height,
		) - 2;

	css(this.selector, "min-width", "100px");
	css(this.selector, "font-size", style.fontSize);
	css(this.label, "padding-top", "2px");
	css(this.label, "height", `${parentHeight}px`);
	css(this.label, "margin-left", "9px");

	const ua = navigator.userAgent;
	if (ua.match(/Edge/)) css(this.selector, "margin-left", "5px");
	else if (ua.match(/MSIE/)) {
		css(this.selector, "margin-top", "0px");
		css(this.selector, "margin-left", "5px");
	}
};

SelectInput.prototype.addBindings = function () {
	const css = gadgetui.util.setStyle;

	if (this.hideable) {
		this.label.addEventListener(this.activate, (event) => {
			event.preventDefault();
			css(this.label, "display", "none");
			css(this.selector, "display", "inline-block");
			if (typeof this.fireEvent === "function") this.fireEvent(this.activate);
		});

		this.selector.addEventListener("blur", () => {
			css(this.label, "display", "inline-block");
			css(this.selector, "display", "none");
			if (typeof this.fireEvent === "function") this.fireEvent("blur");
		});

		this.selector.addEventListener("mouseleave", () => {
			if (this.selector !== document.activeElement) {
				css(this.label, "display", "inline-block");
				css(this.selector, "display", "none");
			}
			if (typeof this.fireEvent === "function") this.fireEvent("mouseleave");
		});
	}

	this.selector.addEventListener("change", (ev) => {
		setTimeout(() => {
			const value = ev.target.value || "0";
			const text = ev.target[ev.target.selectedIndex].innerHTML;
			this.label.innerText = text;
			const data = { id: value, text };

			if (this.model && !this.selector.getAttribute("gadgetui-bind")) {
				this.model.set(this.selector.name, data);
			}
			if (this.emitEvents)
				gadgetui.util.trigger(this.selector, "gadgetui-input-change", data);
			if (this.func) this.func(data);
			this.value = data;
		}, 100);

		if (typeof this.fireEvent === "function") this.fireEvent("change");
	});
};

SelectInput.prototype.config = function (options) {
	this.model = options.model;
	this.dataProvider = options.dataProvider;
	this.func = options.func;
	this.emitEvents = options.emitEvents ?? true;
	this.activate = options.activate || "mouseenter";
	this.hideable = options.hideable || false;
};
