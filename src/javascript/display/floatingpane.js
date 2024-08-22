function FloatingPane(selector, options) {
	this.selector = selector;
	if (options !== undefined) {
		this.config(options);
	}

	this.setup(options);
}

FloatingPane.prototype.events = ['minimized', 'maximized', 'moved', 'closed'];

FloatingPane.prototype.setup = function (options) {
	this.setMessage();
	this.addControl();
	this.addHeader();
	if (this.enableShrink) {
		this.maxmin = this.wrapper.querySelector("div.oi[name='maxmin']");
	}
	// need to be computed after header is done
	this.minWidth = (this.title.length > 0 ? gadgetui.util.textWidth(this.title, this.header.style) + 80 : 100);
	var paddingPx = (parseInt(gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "padding")), 10) * 2);
	// 6 px is padding + border of header
	var headerHeight = gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.header, "height")) + 6;
	//set height by setting width on selector to get content height at that width
	gadgetui.util.setStyle(this.selector, "width", this.width - paddingPx);
	this.height = (options.height === undefined ? gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "height")) + paddingPx + headerHeight + 10 : options.height);

	this.addCSS();

	// now set height to computed height of control _this has been created
	this.height = gadgetui.util.getStyle(this.wrapper, "height");

	this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset(this.selector).left;
	this.addBindings();
	/* 	if( this.enableShrink ){
			this.minimize();
			this.expand();
		} */
};

FloatingPane.prototype.setMessage = function () {
	if (this.message !== undefined) {
		this.selector.innerText = this.message;
	}
}

FloatingPane.prototype.addBindings = function () {
	var dragger = gadgetui.util.draggable(this.wrapper);

	this.wrapper.addEventListener("drag_end", function (event) {
		this.top = event.detail.top;
		this.left = event.detail.left;
		this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset(this.selector).left;

		if (typeof this.fireEvent === 'function') {
			this.fireEvent('moved');
		}
	}.bind(this));

	if (this.enableShrink) {
		this.shrinker.addEventListener("click", function (event) {
			event.stopPropagation();
			if (this.minimized) {
				this.expand();
			} else {
				this.minimize();
			}
		}.bind(this));
	}
	if (this.enableClose) {
		this.closer.addEventListener("click", function (event) {
			event.stopPropagation();
			this.close();
		}.bind(this));
	}
};

FloatingPane.prototype.close = function () {
	if (typeof this.fireEvent === 'function') {
		this.fireEvent('closed');
	}
	this.wrapper.parentNode.removeChild(this.wrapper);

};

FloatingPane.prototype.addHeader = function () {
	var css = gadgetui.util.setStyle;
	this.header = document.createElement("div");
	this.header.innerHTML = this.title;
	if (this.headerClass) {
		gadgetui.util.addClass(header, this.headerClass);
	}
	gadgetui.util.addClass(this.header, 'gadget-ui-floatingPane-header');


	if (this.enableShrink) {
		this.shrinker = document.createElement("span");
		this.shrinker.setAttribute("name", "maxmin");
		css(this.shrinker, "float", "left");
		css(this.shrinker, "margin-right", ".5em");
		var shrinkIcon = `<svg class="feather">
								<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#minimize"/>
								</svg>`;
		this.shrinker.innerHTML = shrinkIcon;
		this.header.insertBefore(this.shrinker, undefined);
		this.wrapper.insertBefore(this.header, this.selector);
		this.header.appendChild(this.shrinker);
	} else {
		this.wrapper.insertBefore(this.header, this.selector);
	}

	if (this.enableClose) {
		var span = document.createElement("span");
		span.setAttribute("name", "closeIcon");
		css(span, "float", "right");
		var icon = `<svg class="feather">
								<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#x-circle"/>
								</svg>`;
		span.innerHTML = icon;
		this.header.appendChild(span);
		css(span, "right", "3px");
		css(span, "position", "absolute");
		css(span, "cursor", "pointer");
		css(span, "top", "3px");
		this.closer = span;
	}
};

FloatingPane.prototype.addCSS = function () {
	var css = gadgetui.util.setStyle;
	//copy width from selector
	css(this.wrapper, "width", this.width);
	css(this.wrapper, "z-index", this.zIndex);
	if (this.top !== undefined) css(this.wrapper, "top", this.top);
	if (this.left !== undefined) css(this.wrapper, "left", this.left);
	if (this.bottom !== undefined) css(this.wrapper, "bottom", this.bottom);
	if (this.right !== undefined) css(this.wrapper, "right", this.right);
};

FloatingPane.prototype.addControl = function () {
	var fp = document.createElement("div");
	if (this.class) {
		gadgetui.util.addClass(fp, this.class);
	}
	gadgetui.util.addClass(fp, "gadget-ui-floatingPane");

	fp.draggable = true;
	this.selector.parentNode.insertBefore(fp, this.selector);
	this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild(this.selector);
	fp.appendChild(this.selector);

};

FloatingPane.prototype.expand = function () {
	// when minimizing and expanding, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position

	var _this = this,
		css = gadgetui.util.setStyle,
		offset = gadgetui.util.getOffset(this.wrapper),
		parentPaddingLeft = parseInt(gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.wrapper.parentElement, "padding-left")), 10),
		lx = parseInt(new Number(offset.left), 10) - this.relativeOffsetLeft - parentPaddingLeft;

	//width = parseInt( gadgetui.util.getNumberValue( this.width ), 10 );
	var icon = `<svg class="feather">
								<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#minimize"/>
								</svg>`;
	if (typeof Velocity != 'undefined' && this.animate) {

		Velocity(this.wrapper, {
			width: this.width
		}, { queue: false, duration: 500 }, function () {
			// Animation complete.
		});

		Velocity(this.selector, {
			height: this.height
		}, {
			queue: false, duration: 500, complete: function () {
				_this.shrinker.innerHTML = icon;
				css(_this.selector, "overflow", "scroll");
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('maximized');
				}
			}
		});
	} else {
		css(this.wrapper, "width", this.width);
		css(this.selector, "height", this.height);
		this.shrinker.innerHTML = icon;
		css(this.selector, "overflow", "scroll");
		if (typeof this.fireEvent === 'function') {
			this.fireEvent('maximized');
		}
	}

	this.minimized = false;
};

FloatingPane.prototype.minimize = function () {
	// when minimizing and maximizing, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position

	var _this = this,
		css = gadgetui.util.setStyle,
		offset = gadgetui.util.getOffset(this.wrapper),
		parentPaddingLeft = parseInt(gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.wrapper.parentElement, "padding-left")), 10),
		lx = parseInt(new Number(offset.left), 10) - this.relativeOffsetLeft - parentPaddingLeft,
		width = parseInt(gadgetui.util.getNumberValue(this.width), 10);

	css(this.selector, "overflow", "hidden");
	var icon = `<svg class="feather">
							<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#maximize"/>
							</svg>`;
	if (typeof Velocity != 'undefined' && this.animate) {

		Velocity(this.wrapper, {
			width: _this.minWidth
		}, {
			queue: false, duration: _this.delay, complete: function () {
				//_this.icon.setAttribute( "data-glyph", "fullscreen-enter" );
				_this.shrinker.innerHTML = icon;
			}
		});

		Velocity(this.selector, {
			height: "50px"
		}, { queue: false, duration: _this.delay }, function () {
			// Animation complete.
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('minimized');
			}
		});
	} else {
		css(this.wrapper, "width", this.minWidth);
		css(this.selector, "height", "50px");
		this.shrinker.innerHTML = icon;
		if (typeof this.fireEvent === 'function') {
			this.fireEvent('minimized');
		}
	}
	this.minimized = true;
};

FloatingPane.prototype.config = function (options) {
	options = (options === undefined ? {} : options);
	this.message = (options.message === undefined ? undefined : options.message);
	this.animate = ((options.animate === undefined) ? true : options.animate);
	this.delay = ((options.delay === undefined ? 500 : options.delay));
	this.title = (options.title === undefined ? "" : options.title);
	this.zIndex = (options.zIndex === undefined ? gadgetui.util.getMaxZIndex() + 1 : options.zIndex);
	this.width = gadgetui.util.getStyle(this.selector, "width");
	this.top = (options.top === undefined ? undefined : options.top);
	this.left = (options.left === undefined ? undefined : options.left);
	this.bottom = (options.bottom === undefined ? undefined : options.bottom);
	this.right = (options.right === undefined ? undefined : options.right);
	this.class = ((options.class === undefined ? false : options.class));
	this.headerClass = ((options.headerClass === undefined ? false : options.headerClass));
	this.featherPath = options.featherPath || "/node_modules/feather-icons";
	this.minimized = false;
	this.relativeOffsetLeft = 0;
	this.enableShrink = (options.enableShrink !== undefined ? options.enableShrink : true);
	this.enableClose = (options.enableClose !== undefined ? options.enableClose : true);
};
