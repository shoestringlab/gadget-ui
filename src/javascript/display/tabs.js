function Tabs(element, options = {}) {
	this.element = element
	this.tabsDiv = this.element.querySelector('div')
	this.config(options)
	this.addControl()
}

Tabs.prototype.config = function (options) {
	this.direction = options.direction || 'horizontal'
	this.tabContentDivIds = []
	this.tabs = []
	this.activeTab = null
}

Tabs.prototype.events = ['tabSelected']

Tabs.prototype.addControl = function () {
	const dir = this.direction === 'vertical' ? 'v' : 'h'
	this.tabsDiv.classList.add(`gadget-ui-tabs-${dir}`)
	this.tabs = Array.from(this.tabsDiv.querySelectorAll('div'))

	let activeSet = false
	this.tabs.forEach((tab) => {
		tab.classList.add(`gadget-ui-tab-${dir}`)
		const tabId = tab.getAttribute('data-tab')
		this.tabContentDivIds.push(tabId)
		this.element.querySelector(`div[name='${tabId}']`).style.display =
			'none'

		if (!activeSet) {
			activeSet = true
			this.setActiveTab(tabId)
		}

		tab.addEventListener('click', () => this.setActiveTab(tabId))
	})

	this.element.querySelector(
		`div[name='${this.tabContentDivIds[0]}']`
	).style.display = 'block'
}

Tabs.prototype.setActiveTab = function (activeTab) {
	const dir = this.direction === 'vertical' ? 'v' : 'h'

	this.tabContentDivIds.forEach((tabId) => {
		const display = tabId === activeTab ? 'block' : 'none'
		this.element.querySelector(`div[name='${tabId}']`).style.display =
			display
	})

	this.tabs.forEach((tab) => {
		const tabId = tab.getAttribute('data-tab')
		const className = `gadget-ui-tab-${dir}-active`
		if (tabId === activeTab) {
			tab.classList.add(className)
		} else {
			tab.classList.remove(className)
		}
	})

	this.activeTab = activeTab
	if (
		typeof this.fireEvent === 'function' &&
		this.events.includes('tabSelected')
	) {
		this.fireEvent('tabSelected', activeTab)
	}
}
