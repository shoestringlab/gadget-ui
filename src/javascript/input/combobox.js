class ComboBox extends Component {
	constructor(element, options) {
		super();
		this.emitEvents = true;
		this.model = gadgetui.model;
		this.func = undefined; // Initialized to avoid undefined property
		this.element = element;

		this.config(options);
		this.setSaveFunc();
		this.setDataProviderRefresh();
		this.addControl();
		this.addCSS();
		gadgetui.util.bind(this.element, this.model);
		gadgetui.util.bind(this.label, this.model);
		this.addBehaviors();
		this.setStartingValues();
	}

	// events = [
	// 	"change",
	// 	"click",
	// 	"focus",
	// 	"mouseenter",
	// 	"keyup",
	// 	"mouseleave",
	// 	"blur",
	// ];

	addControl() {
		var css = gadgetui.util.setStyle;
		this.comboBox = gadgetui.util.createElement("div");
		this.input = gadgetui.util.createElement("input");
		this.label = gadgetui.util.createElement("div");
		this.inputWrapper = gadgetui.util.createElement("div");
		this.selectWrapper = gadgetui.util.createElement("div");

		this.comboBox.classList.add("gadgetui-combobox");
		this.input.classList.add("gadgetui-combobox-input");
		this.label.classList.add("gadgetui-combobox-label");
		this.inputWrapper.classList.add("gadgetui-combobox-inputwrapper");

		this.selectWrapper.classList.add("gadgetui-combobox-selectwrapper");

		this.element.parentNode.insertBefore(this.comboBox, this.element);
		this.element.parentNode.removeChild(this.element);
		this.comboBox.appendChild(this.label);
		this.selectWrapper.appendChild(this.element);
		this.comboBox.appendChild(this.selectWrapper);
		this.inputWrapper.appendChild(this.input);
		this.comboBox.appendChild(this.inputWrapper);
		this.label.setAttribute("data-id", this.id);
		this.label.setAttribute(
			"gadgetui-bind",
			this.element.getAttribute("gadgetui-bind"),
		);
		this.label.innerHTML = this.text;
		this.input.setAttribute("placeholder", this.newOption.text);
		this.input.setAttribute("type", "text");
		this.input.setAttribute("name", "custom");

		css(this.comboBox, "opacity", ".0");
	}

	addCSS() {
		var css = gadgetui.util.setStyle;
		this.element.classList.add("gadgetui-combobox-select");
		css(this.element, "width", this.width);
		css(this.element, "border", 0);
		css(this.element, "display", "inline");
		css(this.comboBox, "position", "relative");

		var styles = gadgetui.util.getStyle(this.element),
			inputWidth = this.element.clientWidth,
			inputWidthAdjusted,
			inputLeftOffset = 0,
			selectMarginTop = 0,
			selectLeftPadding = 0,
			leftOffset = 0,
			inputWrapperTop = this.borderWidth,
			inputLeftMargin,
			leftPosition;

		leftPosition = gadgetui.util.getNumberValue(this.borderWidth) + 4;

		if (this.borderRadius > 5) {
			selectLeftPadding = this.borderRadius - 5;
			leftPosition =
				gadgetui.util.getNumberValue(leftPosition) +
				gadgetui.util.getNumberValue(selectLeftPadding);
		}
		inputLeftMargin = leftPosition;
		inputWidthAdjusted =
			inputWidth -
			this.arrowWidth -
			gadgetui.util.getNumberValue(this.borderRadius) -
			4;
		console.log(navigator.userAgent);
		if (
			navigator.userAgent.match(/(Safari)/) &&
			!navigator.userAgent.match(/(Chrome)/)
		) {
			inputWrapperTop = this.borderWidth - 2;
			selectLeftPadding = selectLeftPadding < 4 ? 4 : this.borderRadius - 1;
			selectMarginTop = 1;
		} else if (navigator.userAgent.match(/Edge/)) {
			selectLeftPadding = selectLeftPadding < 1 ? 1 : this.borderRadius - 4;
			inputLeftMargin--;
		} else if (navigator.userAgent.match(/MSIE/)) {
			selectLeftPadding = selectLeftPadding < 1 ? 1 : this.borderRadius - 4;
		} else if (navigator.userAgent.match(/Trident/)) {
			selectLeftPadding = selectLeftPadding < 2 ? 2 : this.borderRadius - 3;
		} else if (navigator.userAgent.match(/Chrome/)) {
			selectLeftPadding = selectLeftPadding < 4 ? 4 : this.borderRadius - 1;
			selectMarginTop = 1;
		}

		css(this.element, "margin-top", selectMarginTop);
		css(this.element, "padding-left", selectLeftPadding);
		css(this.inputWrapper, "top", inputWrapperTop);
		css(this.inputWrapper, "left", leftOffset);
		css(this.input, "width", inputWidthAdjusted);
		css(this.input, "font-size", styles.fontSize);
		css(this.comboBox, "font-size", styles.fontSize);
		css(this.label, "left", leftPosition);
		css(this.label, "font-family", styles.fontFamily);
		css(this.label, "font-size", styles.fontSize);
		css(this.label, "font-weight", styles.fontWeight);

		if (navigator.userAgent.match(/Firefox/)) {
			if (this.scaleIconHeight === true) {
				css(
					this.selectWrapper,
					"background-size",
					this.arrowWidth + "px " + inputHeight + "px",
				);
			}
		}
		css(this.element, "-webkit-appearance", "none");
		css(this.element, "-moz-appearance", "window");

		if (this.scaleIconHeight === true) {
			css(
				this.element,
				"background-size",
				this.arrowWidth + "px " + inputHeight + "px",
			);
		}

		css(this.comboBox, "opacity", 1);

		if (this.hideable) {
			css(this.inputWrapper, "display", "none");
			css(this.selectWrapper, "display", "none");
		} else {
			css(this.selectWrapper, "display", "inline");
			css(this.label, "display", "none");
			if (this.element.selectedIndex <= 0) {
				css(this.inputWrapper, "display", "inline");
			}
		}
	}

	setSelectOptions() {
		var _this = this,
			id,
			text,
			option;

		while (_this.element.options.length > 0) {
			_this.element.remove(0);
		}
		option = gadgetui.util.createElement("option");
		option.value = _this.newOption.id;
		option.text = _this.newOption.text;
		_this.element.add(option);

		this.dataProvider.data.forEach(function (obj) {
			id = obj.id;
			text = obj.text;
			if (text === undefined) {
				text = id;
			}
			option = gadgetui.util.createElement("option");
			option.value = id;
			option.text = text;
			_this.element.add(option);
		});
	}

	find(text) {
		var ix;
		for (ix = 0; ix < this.dataProvider.data.length; ix++) {
			if (this.dataProvider.data[ix].text === text) {
				return this.dataProvider.data[ix].id;
			}
		}
		return;
	}

	getText(id) {
		var ix,
			compId = parseInt(id, 10);
		if (isNaN(compId) === true) {
			compId = id;
		}
		for (ix = 0; ix < this.dataProvider.data.length; ix++) {
			if (this.dataProvider.data[ix].id === compId) {
				return this.dataProvider.data[ix].text;
			}
		}
		return;
	}

	showLabel() {
		var css = gadgetui.util.setStyle;
		css(this.label, "display", "inline-block");
		css(this.selectWrapper, "display", "none");
		css(this.inputWrapper, "display", "none");
	}

	addBehaviors(obj) {
		var _this = this;
		if (this.hideable) {
			this.comboBox.addEventListener(this.activate, function () {
				setTimeout(function () {
					if (_this.label.style.display != "none") {
						console.log("combo mouseenter ");
						_this.selectWrapper.style.display = "inline";
						_this.label.style.display = "none";
						if (_this.element.selectedIndex <= 0) {
							_this.inputWrapper.style.display = "inline";
						}
					}
				}, _this.delay);
			});
			this.comboBox.addEventListener("mouseleave", function () {
				console.log("combo mouseleave ");
				if (
					_this.element != document.activeElement &&
					_this.input != document.activeElement
				) {
					_this.showLabel();
				}
				if (typeof _this.fireEvent === "function") {
					_this.fireEvent("mouseleave");
				}
			});
		}
		_this.input.addEventListener("click", function (e) {
			console.log("input click ");
			if (typeof _this.fireEvent === "function") {
				_this.fireEvent("click");
			}
		});
		_this.input.addEventListener("keyup", function (event) {
			console.log("input keyup");
			if (event.which === 13) {
				var inputText = gadgetui.util.encode(_this.input.value);
				_this.handleInput(inputText);
			}
			if (typeof _this.fireEvent === "function") {
				_this.fireEvent("keyup");
			}
		});
		if (this.hideable) {
			_this.input.addEventListener("blur", function () {
				console.log("input blur");
				if (
					gadgetui.util.mouseWithin(_this.element, gadgetui.mousePosition) ===
					true
				) {
					_this.inputWrapper.style.display = "none";
					_this.element.focus();
				} else {
					_this.showLabel();
				}
				if (typeof _this.fireEvent === "function") {
					_this.fireEvent("blur");
				}
			});
		}
		if (this.hideable) {
			this.element.addEventListener("mouseenter", function (ev) {
				_this.element.style.display = "inline";
				if (typeof _this.fireEvent === "function") {
					_this.fireEvent("mouseenter");
				}
			});
		}
		this.element.addEventListener("click", function (ev) {
			console.log("select click");
			ev.stopPropagation();
			if (typeof _this.fireEvent === "function") {
				_this.fireEvent("click");
			}
		});
		this.element.addEventListener("change", function (event) {
			var idx =
				event.target.selectedIndex >= 0 ? event.target.selectedIndex : 0;
			if (parseInt(event.target[idx].value, 10) !== parseInt(_this.id, 10)) {
				console.log("select change");
				if (event.target.selectedIndex > 0) {
					_this.inputWrapper.style.display = "none";
					_this.setValue(event.target[event.target.selectedIndex].value);
				} else {
					_this.inputWrapper.style.display = "block";
					_this.setValue(_this.newOption.value);
					_this.input.focus();
				}
				gadgetui.util.trigger(_this.element, "gadgetui-combobox-change", {
					id: event.target[event.target.selectedIndex].value,
					text: event.target[event.target.selectedIndex].innerHTML,
				});
				if (typeof _this.fireEvent === "function") {
					_this.fireEvent("change");
				}
			}
		});
		if (this.hideable) {
			this.element.addEventListener("blur", function (event) {
				console.log("select blur ");
				event.stopPropagation();
				setTimeout(function () {
					if (_this.input !== document.activeElement) {
						_this.showLabel();
					}
				}, 200);
				if (typeof _this.fireEvent === "function") {
					_this.fireEvent("blur");
				}
			});
		}
	}

	handleInput(inputText) {
		var id = this.find(inputText),
			css = gadgetui.util.setStyle;
		if (id !== undefined) {
			this.element.value = id;
			this.label.innerText = inputText;
			this.element.focus();
			this.input.value = "";
			css(this.inputWrapper, "display", "none");
		} else if (id === undefined && inputText.length > 0) {
			this.save(inputText);
		}
	}

	triggerSelectChange() {
		console.log("select change");
		var ev = new Event("change", {
			view: window,
			bubbles: true,
			cancelable: true,
		});
		this.element.dispatchEvent(ev);
	}

	setSaveFunc() {
		var _this = this;

		if (this.save !== undefined) {
			var save = this.save;
			this.save = function (text) {
				var _this = this,
					func,
					promise,
					args = [text],
					value = this.find(text);
				if (value === undefined) {
					console.log("save: " + text);

					promise = new Promise(function (resolve, reject) {
						args.push(resolve);
						args.push(reject);
						func = save.apply(_this, args);
						console.log(func);
					});
					promise.then(function (value) {
						function callback() {
							gadgetui.util.trigger(_this.element, "gadgetui-combobox-save", {
								id: value,
								text: text,
							});
							_this.input.value = "";
							_this.inputWrapper.style.display = "none";
							_this.id = value;
							_this.dataProvider.refresh();
						}
						if (_this.animate === true && typeof Velocity !== "undefined") {
							Velocity(
								_this.selectWrapper,
								{
									boxShadow: "0 0 15px " + _this.glowColor,
									borderColor: _this.glowColor,
								},
								_this.animateDelay / 2,
								function () {
									_this.selectWrapper.style.borderColor = _this.glowColor;
								},
							);
							Velocity(
								_this.selectWrapper,
								{
									boxShadow: 0,
									borderColor: _this.borderColor,
								},
								_this.animateDelay / 2,
								callback,
							);
						} else {
							callback();
						}
					});
					promise["catch"](function (message) {
						_this.input.value = "";
						_this.inputWrapper.hide();
						console.log(message);
						_this.dataProvider.refresh();
					});
				}
				return func;
			};
		}
	}

	setStartingValues() {
		this.dataProvider.data === undefined
			? this.dataProvider.refresh()
			: this.setControls();
	}

	setControls() {
		console.log(this);
		this.setSelectOptions();
		this.setValue(this.id);
		this.triggerSelectChange();
	}

	setValue(id) {
		var text = this.getText(id);
		console.log("setting id:" + id);
		this.id = text === undefined ? this.newOption.id : id;
		text = text === undefined ? this.newOption.text : text;
		this.text = text;
		this.label.innerText = this.text;
		this.element.value = this.id;
	}

	setDataProviderRefresh() {
		var _this = this,
			promise,
			refresh = this.dataProvider.refresh,
			func;
		this.dataProvider.refresh = function () {
			var scope = this;
			if (refresh !== undefined) {
				promise = new Promise(function (resolve, reject) {
					var args = [scope, resolve, reject];
					func = refresh.apply(this, args);
				});
				promise.then(function () {
					gadgetui.util.trigger(_this.element, "gadgetui-combobox-refresh");
					_this.setControls();
				});
				promise["catch"](function (message) {
					console.log("message");
					_this.setControls();
				});
			}
			return func;
		};
	}

	config(options) {
		options = options === undefined ? {} : options;
		this.model = options.model === undefined ? this.model : options.model;
		this.emitEvents =
			options.emitEvents === undefined ? true : options.emitEvents;
		this.dataProvider =
			options.dataProvider === undefined ? undefined : options.dataProvider;
		this.save = options.save === undefined ? undefined : options.save;
		this.activate =
			options.activate === undefined ? "mouseenter" : options.activate;
		this.delay = options.delay === undefined ? 10 : options.delay;
		this.borderWidth =
			gadgetui.util.getStyle(this.element, "border-width") || 1;
		this.borderRadius =
			gadgetui.util.getStyle(this.element, "border-radius") || 5;
		this.borderColor =
			gadgetui.util.getStyle(this.element, "border-color") || "silver";
		this.arrowWidth = options.arrowWidth || 25;
		this.width = options.width === undefined ? 150 : options.width;
		this.newOption =
			options.newOption === undefined
				? { text: "...", id: 0 }
				: options.newOption;
		this.id = options.id === undefined ? this.newOption.id : options.id;
		this.scaleIconHeight =
			options.scaleIconHeight === undefined ? false : options.scaleIconHeight;
		this.animate = options.animate === undefined ? true : options.animate;
		this.glowColor =
			options.glowColor === undefined ? "rgb(82, 168, 236)" : options.glowColor;
		this.animateDelay =
			options.animateDelay === undefined ? 500 : options.animateDelay;
		this.border =
			this.borderWidth + "px " + this.borderStyle + " " + this.borderColor;
		this.saveBorder =
			this.borderWidth + "px " + this.borderStyle + " " + this.glowColor;
		this.hideable = options.hideable || false;
	}
}
