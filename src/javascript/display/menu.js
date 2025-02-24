function Menu(element, options = {}) {
	this.element = element
	this.elements = []
	this.config(options)

	if (this.datasource) {
		this.retrieveData()
	} else if (this.data) {
		this.addControl()
		this.addBindings()
	}
}

Menu.prototype.events = ['clicked']

Menu.prototype.retrieveData = function () {
	this.datasource().then((data) => {
		this.data = data
		this.addControl()
	})
}

Menu.prototype.addControl = function () {
	const processItem = (item, parent) => {
		const element = document.createElement('div')
		element.classList.add('gadget-ui-menu-item')
		element.innerText = item.label || ''

		if (item.image?.length) {
			const imgEl = document.createElement('img')
			imgEl.src = item.image
			imgEl.classList.add('gadget-ui-menu-icon')
			element.appendChild(imgEl)
		}

		if (
			item.link &&
			(item.link.length > 0 || typeof item.link === 'function')
		) {
			element.style.cursor = 'pointer'
			element.addEventListener('click', () => {
				if (typeof this.fireEvent === 'function') {
					this.fireEvent('clicked', item)
				}
				typeof item.link === 'function'
					? item.link()
					: window.open(item.link)
			})
		}

		if (item.menuItem) {
			element.appendChild(processMenuItem(item.menuItem, element))
		}
		return element
	}

	const processMenuItem = (menuItemData, parent) => {
		const element = document.createElement('div')
		element.classList.add('gadget-ui-menu-menuItem')
		menuItemData.items.forEach((item) =>
			element.appendChild(processItem(item, element))
		)
		return element
	}

	const generateMenu = (menuData) => {
		const element = document.createElement('div')
		element.classList.add('gadget-ui-menu')
		element.innerText = menuData.label || ''

		if (menuData.image?.length) {
			const imgEl = document.createElement('img')
			imgEl.src = menuData.image
			imgEl.classList.add('gadget-ui-menu-icon')
			element.appendChild(imgEl)
		}

		element.appendChild(processMenuItem(menuData.menuItem, element))
		return element
	}

	this.data.forEach((menu) => {
		const element = generateMenu(menu)
		this.element.appendChild(element)
		this.elements.push(element)
	})
}

Menu.prototype.addBindings = function () {
	const menus = this.element.querySelectorAll('.gadget-ui-menu')

	menus.forEach((mu) => {
		const menuItem = mu.querySelector('.gadget-ui-menu-menuItem')
		const items = menuItem.querySelectorAll('.gadget-ui-menu-item')
		const menuItems = menuItem.querySelectorAll('.gadget-ui-menu-menuItem')

		items.forEach((item) => {
			const mItem = item.querySelector('.gadget-ui-menu-menuItem')

			item.addEventListener('mouseenter', (evt) => {
				if (mItem) mItem.classList.add('gadget-ui-menu-hovering')
				item.classList.add('gadget-ui-menu-selected')
				Array.from(item.parentNode.children).forEach((child) => {
					if (child !== item)
						child.classList.remove('gadget-ui-menu-selected')
				})
				evt.preventDefault()
			})

			item.addEventListener('mouseleave', () => {
				if (mItem) mItem.classList.remove('gadget-ui-menu-hovering')
			})
		})

		mu.addEventListener('mouseenter', () =>
			menuItem.classList.add('gadget-ui-menu-hovering')
		)
		mu.addEventListener('mouseleave', () =>
			menuItem.classList.remove('gadget-ui-menu-hovering')
		)

		menuItems.forEach((mItem) => {
			mItem.addEventListener('mouseenter', () =>
				mItem.classList.add('gadget-ui-menu-hovering')
			)
			mItem.addEventListener('mouseleave', () => {
				if (!mItem.parentNode.classList.contains('selected')) {
					mItem.classList.remove('gadget-ui-menu-hovering')
				}
			})
		})
	})
}

Menu.prototype.destroy = function () {
	this.element.querySelectorAll('.gadget-ui-menu').forEach((menu) => {
		this.element.removeChild(menu)
	})
}

Menu.prototype.config = function (options) {
	this.data = options.data
	this.datasource = options.datasource
}
