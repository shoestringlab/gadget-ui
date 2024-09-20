function TextInput(selector, options) {
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;

	this.config(options);

	this.setInitialValue();
	this.addControl();
	this.setLineHeight();
	this.setFont();
	//this.setMaxWidth();
	this.setWidth();
	this.addCSS();
	// bind to the model if binding is specified
	gadgetui.util.bind(this.selector, this.model);
	this.addBindings();
}

TextInput.prototype.events = ['change', 'focus', 'mouseenter', 'keyup', 'mouseleave', 'blur'];

TextInput.prototype.addControl = function () {
	if (this.hideable) {
		this.blockSize = gadgetui.util.getStyle(this.selector, "block-size");
		gadgetui.util.setStyle(this.selector, 'block-size', this.blockSize);
		this.selector.classList.add(this.browserHideBorderCSS);
	}
};

TextInput.prototype.setInitialValue = function () {
	var val = this.selector.value,
		ph = this.selector.getAttribute("placeholder");

	if (val.length === 0) {
		if (ph !== null && ph !== undefined && ph.length > 0) {
			val = ph;
		} else {
			val = " ... ";
		}
	}
	this.value = val;
};

TextInput.prototype.setLineHeight = function () {
	var lineHeight = this.selector.offsetHeight;
	this.lineHeight = lineHeight;
};

TextInput.prototype.setFont = function () {
	var style = gadgetui.util.getStyle(this.selector),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
	this.font = font;
};

TextInput.prototype.setWidth = function () {
	this.width = gadgetui.util.textWidth(this.selector.value, this.font) + 10;
	if (this.width === 10) {
		this.width = this.maxWidth;
	}
};

TextInput.prototype.addCSS = function () {
	var style = gadgetui.util.getStyle(this.selector),
		css = gadgetui.util.setStyle;
	// add CSS classes
	gadgetui.util.addClass(this.selector, "gadgetui-textinput");

	if (this.maxWidth > 10 && this.enforceMaxWidth === true) {
		css(this.selector, "max-width", this.maxWidth);
	}
};

TextInput.prototype.setControlWidth = function (text) {
	var textWidth = parseInt(gadgetui.util.textWidth(text, this.font), 10),
		css = gadgetui.util.setStyle;
	if (textWidth < this.minWidth) {
		textWidth = this.minWidth;
	}
	css(this.selector, "width", (textWidth + 30) + "px");
};

TextInput.prototype.addBindings = function () {
	var _this = this;

	this.selector
		.addEventListener("mouseenter", function (event) {
			event.preventDefault();
			if (_this.hideable) {
				this.classList.remove(_this.browserHideBorderCSS);
			}
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('mouseenter');
			}
		});
	this.selector
		.addEventListener("focus", function (event) {
			event.preventDefault();
			if (_this.hideable) {
				this.classList.remove(_this.browserHideBorderCSS);
			}
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('focus');
			}
		});
	this.selector
		.addEventListener("keyup", function (event) {
			if (parseInt(event.keyCode, 10) === 13) {
				this.blur();
			}
			_this.setControlWidth(this.value);
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('keyup');
			}
		});
	this.selector
		.addEventListener("change", function (event) {
			setTimeout(function () {
				var value = event.target.value, style, txtWidth;
				if (value.length === 0 && _this.selector.getAttribute("placeholder") !== undefined) {
					value = _this.selector.getAttribute("placeholder");
				}

				txtWidth = gadgetui.util.textWidth(value, _this.font);

				if (_this.maxWidth < txtWidth) {
					value = gadgetui.util.fitText(value, _this.font, _this.maxWidth);
				}
				if (_this.model !== undefined && _this.selector.getAttribute("gadgetui-bind") === undefined) {
					// if we have specified a model but no data binding, change the model value
					_this.model.set(_this.selector.name, event.target.value);
				}

				if (_this.emitEvents === true) {
					gadgetui.util.trigger(_this.selector, "gadgetui-input-change", { text: event.target.value });
				}

				if (_this.func !== undefined) {
					_this.func({ text: event.target.value });
				}
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('change');
				}
			}, 200);
		});

	if (this.hideable) {
		this.selector
			//.removeEventListener( "mouseleave" )
			.addEventListener("mouseleave", function () {
				var css = gadgetui.util.setStyle;
				if (this !== document.activeElement) {

					this.classList.add(_this.browserHideBorderCSS);
				}
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('mouseleave');
				}
			});
		this.selector
			.addEventListener("blur", function () {
				var css = gadgetui.util.setStyle;
				css(_this.selector, "maxWidth", _this.maxWidth);
				this.classList.add(_this.browserHideBorderCSS);
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('blur');
				}
				//css( _this.label, "maxWidth", _this.maxWidth );
			});
	}
};

TextInput.prototype.config = function (options) {
	options = (options === undefined ? {} : options);
	this.borderColor = ((options.borderColor === undefined) ? "#d0d0d0" : options.borderColor);
	this.useActive = ((options.useActive === undefined) ? false : options.useActive);
	this.model = ((options.model === undefined) ? this.model : options.model);
	this.func = ((options.func === undefined) ? undefined : options.func);
	this.emitEvents = ((options.emitEvents === undefined) ? true : options.emitEvents);
	this.activate = ((options.activate === undefined) ? "mouseenter" : options.activate);
	this.delay = ((options.delay === undefined) ? 10 : options.delay);
	this.minWidth = ((options.minWidth === undefined) ? 100 : options.minWidth);
	this.enforceMaxWidth = (options.enforceMaxWidth === undefined ? false : options.enforceMaxWidth);
	this.hideable = options.hideable || false;
	this.maxWidth = options.maxWidth || gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector.parentNode).width);
	let browser = gadgetui.util.checkBrowser();
	this.browserHideBorderCSS = "gadget-ui-textinput-hideBorder-" + browser;
};
