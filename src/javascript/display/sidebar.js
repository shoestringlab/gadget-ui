function Sidebar(selector, options = {}) {
	this.selector = selector
	this.minimized = false
	this.config(options)
	this.addControl()
	this.addBindings(options)
}

Sidebar.prototype.events = ['maximized', 'minimized']

Sidebar.prototype.config = function (options) {
	this.class = options.class || false
	this.featherPath = options.featherPath || '/node_modules/feather-icons'
	this.animate = options.animate ?? true
	this.delay = options.delay || 300
	this.toggleTitle = options.toggleTitle || 'Toggle Sidebar'
}

Sidebar.prototype.addControl = function () {
	this.wrapper = document.createElement('div')
	if (this.class) {
		gadgetui.util.addClass(this.wrapper, this.class)
	}
	gadgetui.util.addClass(this.wrapper, 'gadgetui-sidebar')

	this.span = document.createElement('span')
	this.span.setAttribute('title', this.toggleTitle)
	gadgetui.util.addClass(this.span, 'gadgetui-right-align')
	gadgetui.util.addClass(this.span, 'gadgetui-sidebar-toggle')
	this.span.innerHTML = `
    <svg class="feather" name="chevron">
      <use xlink:href="${this.featherPath}/dist/feather-sprite.svg#chevron-left"/>
    </svg>
  `.trim()

	this.selector.parentNode.insertBefore(this.wrapper, this.selector)
	this.selector.parentNode.removeChild(this.selector)
	this.wrapper.appendChild(this.selector)
	this.wrapper.insertBefore(this.span, this.selector)
	this.width = this.wrapper.offsetWidth
}

Sidebar.prototype.maximize = function () {
	this.minimized = false
	this.setChevron(this.minimized)
	gadgetui.util.removeClass(this.wrapper, 'gadgetui-sidebar-minimized')

	if (typeof Velocity !== 'undefined' && this.animate) {
		Velocity(
			this.wrapper,
			{ width: this.width },
			{
				queue: false,
				duration: this.delay,
				complete: () => {
					gadgetui.util.removeClass(
						this.selector,
						'gadgetui-sidebarContent-minimized'
					)
					if (typeof this.fireEvent === 'function') {
						this.fireEvent('maximized')
					}
				},
			}
		)
	} else {
		gadgetui.util.removeClass(
			this.selector,
			'gadgetui-sidebarContent-minimized'
		)
		if (typeof this.fireEvent === 'function') {
			this.fireEvent('maximized')
		}
	}
}

Sidebar.prototype.minimize = function () {
	this.minimized = true
	this.setChevron(this.minimized)
	gadgetui.util.addClass(this.selector, 'gadgetui-sidebarContent-minimized')

	if (typeof Velocity !== 'undefined' && this.animate) {
		Velocity(
			this.wrapper,
			{ width: 25 },
			{
				queue: false,
				duration: this.delay,
				complete: () => {
					gadgetui.util.addClass(
						this.wrapper,
						'gadgetui-sidebar-minimized'
					)
					if (typeof this.fireEvent === 'function') {
						this.fireEvent('minimized')
					}
				},
			}
		)
	} else {
		gadgetui.util.addClass(this.wrapper, 'gadgetui-sidebar-minimized')
		if (typeof this.fireEvent === 'function') {
			this.fireEvent('minimized')
		}
	}
}

Sidebar.prototype.addBindings = function (options) {
	this.span.addEventListener('click', () => {
		this.minimized ? this.maximize() : this.minimize()
	})

	if (options.minimized) {
		this.minimize()
	}
}

Sidebar.prototype.setChevron = function (minimized) {
	const chevron = minimized ? 'chevron-right' : 'chevron-left'
	const svg = this.wrapper.querySelector('svg')
	svg.innerHTML = `
    <use xlink:href="${this.featherPath}/dist/feather-sprite.svg#${chevron}"/>
  `.trim()
}
