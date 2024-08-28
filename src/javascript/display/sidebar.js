
function Sidebar(selector, options) {
	this.selector = selector;
	this.minimized = false;
	this.config(options);
	this.addControl();
	this.addBindings(options);
}

Sidebar.prototype.events = ['maximized', 'minimized'];

Sidebar.prototype.config = function (options) {
	this.class = ((options.class === undefined ? false : options.class));
	this.featherPath = options.featherPath || "/node_modules/feather-icons";
	this.animate = ((options.animate === undefined) ? true : options.animate);
	this.delay = ((options.delay === undefined ? 300 : options.delay));
	this.toggleTitle = ((options.toggleTitle === undefined ? "Toggle Sidebar" : options.toggleTitle)); 
};

Sidebar.prototype.addControl = function () {
	this.wrapper = document.createElement("div");
	if (this.class) {
		gadgetui.util.addClass(this.wrapper, this.class);
	}
	gadgetui.util.addClass(this.wrapper, "gadgetui-sidebar");

	this.span = document.createElement("span");
	this.span.setAttribute("title", this.toggleTitle );
	gadgetui.util.addClass(this.span, "gadgetui-right-align");
	gadgetui.util.addClass(this.span, "gadgetui-sidebar-toggle");
	this.span.innerHTML = `<svg class="feather" name="chevron">
      <use xlink:href="${this.featherPath}/dist/feather-sprite.svg#chevron-left"/>
    </svg>`;

	this.selector.parentNode.insertBefore(this.wrapper, this.selector);
	this.selector.parentNode.removeChild(this.selector);
	this.wrapper.appendChild(this.selector);
	this.wrapper.insertBefore(this.span, this.selector);
	this.width = this.wrapper.offsetWidth;
};

Sidebar.prototype.maximize = function () {
	let self = this;
	self.minimized = false;
	self.setChevron(self.minimized);
	gadgetui.util.removeClass(self.wrapper, "gadgetui-sidebar-minimized");

	if (typeof Velocity != 'undefined' && this.animate) {
		Velocity(self.wrapper, {
			width: self.width
		}, {
			queue: false, duration: self.delay, complete: function () {
				//_this.icon.setAttribute( "data-glyph", icon );
				gadgetui.util.removeClass(self.selector, "gadgetui-sidebarContent-minimized");
				if (typeof self.fireEvent === 'function') {
					self.fireEvent('maximized');
				}
			}
		});
	} else {
		gadgetui.util.removeClass(self.selector, "gadgetui-sidebarContent-minimized");
		if (typeof self.fireEvent === 'function') {
			self.fireEvent('maximized');
		}
	}

}

Sidebar.prototype.minimize = function () {
	let self = this;
	self.minimized = true;
	self.setChevron(self.minimized);
	gadgetui.util.addClass(self.selector, "gadgetui-sidebarContent-minimized");
	if (typeof Velocity != 'undefined' && self.animate) {

		Velocity(self.wrapper, {
			width: 25
		}, {
			queue: false, duration: self.delay, complete: function () {
				//_this.icon.setAttribute( "data-glyph", icon );
				gadgetui.util.addClass(self.wrapper, "gadgetui-sidebar-minimized");
				if (typeof self.fireEvent === 'function') {
					self.fireEvent('minimized');
				}
			}
		});
	} else {
		gadgetui.util.addClass(self.wrapper, "gadgetui-sidebar-minimized");
		if (typeof self.fireEvent === 'function') {
			self.fireEvent('minimized');
		}
	}
}

Sidebar.prototype.addBindings = function (options) {
	let self = this;

	this.span.addEventListener("click", function (event) {
		if (self.minimized) {
			self.maximize();

		} else {
			self.minimize();
		}
	});

	if (options.minimized) {
		self.minimize();
	}
};

Sidebar.prototype.setChevron = function (minimized) {
	let chevron = (minimized ? "chevron-right" : "chevron-left");
	let svg = this.wrapper.querySelector("svg");
	svg.innerHTML = `<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#${chevron}"/>`;
}
