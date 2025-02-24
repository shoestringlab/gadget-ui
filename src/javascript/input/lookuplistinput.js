// Author: Robert Munn <robertdmunn@gmail.com>
// Adapted from jQuery UI autocomplete

function LookupListInput(element, options = {}) {
	this.element = element
	this.items = []
	this.config(options)
	this.setIsMultiLine()
	this.addControl()
	this.initSource()
	this.addMenu()
	this.addBindings()
}

LookupListInput.prototype.events = [
	'change',
	'focus',
	'mouseenter',
	'keyup',
	'mouseleave',
	'blur',
	'click',
	'input',
	'keypress',
	'keydown',
	'menuselect',
	'mousedown',
]

LookupListInput.prototype.addControl = function () {
	this.wrapper = document.createElement('div')
	if (this.width) gadgetui.util.setStyle(this.wrapper, 'width', this.width)
	gadgetui.util.addClass(this.wrapper, 'gadgetui-lookuplist-input')

	this.element.parentNode.insertBefore(this.wrapper, this.element)
	this.element.parentNode.removeChild(this.element)
	this.wrapper.appendChild(this.element)
}

LookupListInput.prototype.addMenu = function () {
	const div = document.createElement('div')
	gadgetui.util.addClass(div, 'gadgetui-lookuplist-menu')
	gadgetui.util.setStyle(div, 'display', 'none')
	this.menu = { element: div }
	this.wrapper.appendChild(div)
}

LookupListInput.prototype.initSource = function () {
	if (Array.isArray(this.datasource)) {
		this.source = (request, response) =>
			response(this.filter(this.datasource, request.term))
	} else if (typeof this.datasource === 'string') {
		this.source = (request, response) => {
			if (this.xhr) this.xhr.abort()
			this.xhr = fetch({
				url: this.datasource,
				data: request,
				dataType: 'json',
				success: (data) => response(data),
				error: () => response([]),
			})
		}
	} else {
		this.source = this.datasource
	}
}

LookupListInput.prototype.escapeRegex = function (value) {
	return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

LookupListInput.prototype._filter = function (array, term) {
	const matcher = new RegExp(this.escapeRegex(term), 'i')
	return gadgetui.util.grep(array, (value) =>
		matcher.test(value.label || value.value || value)
	)
}

LookupListInput.prototype.checkForDuplicate = function (item) {
	return this.items.some((existing) => existing.value === item.value)
}

LookupListInput.prototype.makeUnique = function (content) {
	return content.filter((item) => !this.checkForDuplicate(item))
}

LookupListInput.prototype.setIsMultiLine = function () {
	const nodeName = this.element.nodeName.toLowerCase()
	this.isMultiLine =
		nodeName === 'textarea' ||
		(nodeName !== 'input' && this.element.getAttribute('isContentEditable'))
}

LookupListInput.prototype.addBindings = function () {
	const nodeName = this.element.nodeName.toLowerCase()
	this.isTextarea = nodeName === 'textarea'
	this.isInput = nodeName === 'input'
	this.valueMethod = this.isTextarea || this.isInput ? 'value' : 'innerText'
	this.element.setAttribute('autocomplete', 'off')

	let suppressKeyPress, suppressKeyPressRepeat, suppressInput

	this.wrapper.addEventListener('click', () => {
		this.element.focus()
		if (typeof this.fireEvent === 'function') this.fireEvent('click')
	})

	const keyEvents = {
		keydown: (event) => {
			if (this.element.getAttribute('readOnly')) {
				suppressKeyPress = suppressInput = suppressKeyPressRepeat = true
				return
			}
			suppressKeyPress = suppressInput = suppressKeyPressRepeat = false
			const keyCode = gadgetui.keyCode

			switch (event.keyCode) {
				case keyCode.PAGE_UP:
					suppressKeyPress = true
					this._move('previousPage', event)
					break
				case keyCode.PAGE_DOWN:
					suppressKeyPress = true
					this._move('nextPage', event)
					break
				case keyCode.UP:
					suppressKeyPress = true
					this._keyEvent('previous', event)
					break
				case keyCode.DOWN:
					suppressKeyPress = true
					this._keyEvent('next', event)
					break
				case keyCode.ENTER:
					if (this.menu.active) {
						suppressKeyPress = true
						event.preventDefault()
						this.menu.select(event)
					}
					break
				case keyCode.BACKSPACE:
					if (!this.element.value.length && this.items.length) {
						this.remove(this.element.previousSibling)
					}
					break
				case keyCode.TAB:
					if (this.menu.active) this.menu.select(event)
					break
				case keyCode.ESCAPE:
					if (this.menu.element.style.display !== 'none') {
						if (!this.isMultiLine) this._value(this.term)
						this.close(event)
						event.preventDefault()
					}
					break
				default:
					suppressKeyPressRepeat = true
					this._searchTimeout(event)
					break
			}
			if (typeof this.fireEvent === 'function') this.fireEvent('keydown')
		},

		keypress: (event) => {
			if (suppressKeyPress) {
				suppressKeyPress = false
				if (
					!this.isMultiLine ||
					this.menu.element.style.display !== 'none'
				) {
					event.preventDefault()
				}
				return
			}
			if (suppressKeyPressRepeat) return

			const keyCode = gadgetui.keyCode
			switch (event.keyCode) {
				case keyCode.PAGE_UP:
					this._move('previousPage', event)
					break
				case keyCode.PAGE_DOWN:
					this._move('nextPage', event)
					break
				case keyCode.UP:
					this._keyEvent('previous', event)
					break
				case keyCode.DOWN:
					this._keyEvent('next', event)
					break
			}
			if (typeof this.fireEvent === 'function') this.fireEvent('keypress')
		},

		input: (event) => {
			if (suppressInput) {
				suppressInput = false
				event.preventDefault()
				return
			}
			this._searchTimeout(event)
			if (typeof this.fireEvent === 'function') this.fireEvent('input')
		},

		focus: () => {
			this.selectedItem = null
			this.previous = this.element[this.valueMethod]
			if (typeof this.fireEvent === 'function') this.fireEvent('focus')
		},

		blur: (event) => {
			if (this.cancelBlur) {
				delete this.cancelBlur
				return
			}
			clearTimeout(this.searching)
			this.close(event)
			if (typeof this.fireEvent === 'function') this.fireEvent('blur')
		},

		change: () => this.fireEvent('change'),
	}

	Object.entries(keyEvents).forEach(([event, handler]) => {
		this.element.addEventListener(event, handler)
	})

	this.menu.element.addEventListener('mousedown', (event) => {
		event.preventDefault()
		this.cancelBlur = true
		gadgetui.util.delay(() => delete this.cancelBlur)
		if (typeof this.fireEvent === 'function') this.fireEvent('mousedown')
	})

	this.menu.element.addEventListener('menuselect', (event) => {
		const item = event.detail
		const previous = this.previous

		if (this.menu.element !== document.activeElement) {
			this.menu.element.focus()
			this.previous = previous
			gadgetui.util.delay(() => {
				this.previous = previous
				this.selectedItem = item
			})
		}

		this._value(item.value)
		this.term = this._value()
		this.close(event)
		this.selectedItem = item

		if (!this.checkForDuplicate(item)) this.add(item)
		if (typeof this.fireEvent === 'function') this.fireEvent('menuselect')
	})
}

LookupListInput.prototype._renderItem = function (item) {
	const wrapper = document.createElement('div')
	gadgetui.util.addClass(wrapper, 'gadgetui-lookuplist-input-item-wrapper')
	const itemNode = document.createElement('div')
	gadgetui.util.addClass(itemNode, 'gadgetui-lookuplist-input-item')
	itemNode.innerHTML = this.labelRenderer(item)
	wrapper.appendChild(itemNode)
	return wrapper
}

LookupListInput.prototype._renderItemCancel = function (item, wrapper) {
	const css = gadgetui.util.setStyle
	const itemCancel = document.createElement('span')
	const leftOffset =
		gadgetui.util.getNumberValue(gadgetui.util.getStyle(wrapper, 'width')) +
		6

	gadgetui.util.addClass(itemCancel, 'oi')
	itemCancel.setAttribute('data-glyph', 'circle-x')
	css(itemCancel, 'font-size', 12)
	css(itemCancel, 'opacity', '.5')
	css(itemCancel, 'left', leftOffset)
	css(itemCancel, 'position', 'absolute')
	css(itemCancel, 'cursor', 'pointer')
	css(itemCancel, 'top', 3)
	return itemCancel
}

LookupListInput.prototype.add = function (item) {
	const wrapper = this.itemRenderer(item)
	wrapper.setAttribute('data-value', item.value)
	this.wrapper.insertBefore(wrapper, this.element)

	const itemCancel = this.itemCancelRenderer(item, wrapper)
	if (itemCancel) {
		wrapper.appendChild(itemCancel)
		itemCancel.addEventListener('click', () => this.remove(wrapper))
	}

	this.element.value = ''
	this.items.push(item)

	if (this.emitEvents)
		gadgetui.util.trigger(
			this.element,
			'gadgetui-lookuplist-input-add',
			item
		)
	if (this.func) this.func(item, 'add')
	if (this.model) {
		const prop = this.element.getAttribute('gadgetui-bind')
		if (prop) {
			const list = this.model.get(prop) || []
			list.push(item)
			this.model.set(prop, list)
		}
	}
}

LookupListInput.prototype.remove = function (element) {
	const value = element.getAttribute('data-value')
	element.parentNode.removeChild(element)

	const index = this.items.findIndex((item) => item.value === value)
	if (index !== -1) {
		const [removed] = this.items.splice(index, 1)
		if (this.model) {
			const prop = this.element.getAttribute('gadgetui-bind')
			if (prop) {
				const list = this.model.get(prop)
				const listIndex = list.findIndex((obj) => obj.value === value)
				if (listIndex !== -1) {
					list.splice(listIndex, 1)
					if (this.func) this.func(removed, 'remove')
					if (this.emitEvents)
						gadgetui.util.trigger(
							this.element,
							'gadgetui-lookuplist-input-remove',
							removed
						)
					this.model.set(prop, list)
				}
			}
		}
	}
}

LookupListInput.prototype.reset = function () {
	while (
		this.wrapper.firstChild &&
		this.wrapper.firstChild !== this.element
	) {
		this.wrapper.removeChild(this.wrapper.firstChild)
	}
	this.items = []
	if (this.model) {
		const prop = this.element.getAttribute('gadgetui-bind')
		if (prop) this.model.set(prop, [])
	}
}

LookupListInput.prototype.destroy = function () {
	clearTimeout(this.searching)
	this.menu.element.remove()
	if (this.liveRegion) this.liveRegion.remove()
}

LookupListInput.prototype._setOption = function (key, value) {
	this._super(key, value)
	if (key === 'source') this._initSource()
	if (key === 'appendTo') this.menu.element.appendTo(this._appendTo())
	if (key === 'disabled' && value && this.xhr) this.xhr.abort()
}

LookupListInput.prototype._appendTo = function () {
	let element = this.options.appendTo
	if (!element) element = this.element.closest('.ui-front') || document.body
	return element.jquery || element.nodeType
		? $(element)
		: this.document.find(element).eq(0)
}

LookupListInput.prototype._searchTimeout = function (event) {
	clearTimeout(this.searching)
	this.searching = gadgetui.util.delay(() => {
		const termChanged = this.term !== this.element.value
		const menuVisible = this.menu.element.style.display !== 'none'
		const modifierKey =
			event.altKey || event.ctrlKey || event.metaKey || event.shiftKey

		if (termChanged || (!termChanged && !menuVisible && !modifierKey)) {
			this.selectedItem = null
			this.search(null, event)
		}
	}, this.delay)
}

LookupListInput.prototype.search = function (value, event) {
	value = value ?? this.element.value
	this.term = this._value()
	return value.length < this.minLength
		? this.close(event)
		: this._search(value)
}

LookupListInput.prototype._search = function (value) {
	this.pending++
	this.cancelSearch = false
	this.source({ term: value }, this._response())
}

LookupListInput.prototype._response = function () {
	const index = ++this.requestIndex
	return (content) => {
		if (index === this.requestIndex) {
			this.__response(content)
			this.pending--
		}
	}
}

LookupListInput.prototype.__response = function (content) {
	content = this.makeUnique(content)
	if (content?.length) content = this._normalize(content)

	this.element.dispatchEvent(
		new CustomEvent('response', { detail: { content } })
	)
	if (!this.disabled && content?.length && !this.cancelSearch) {
		this._suggest(content)
		this.element.dispatchEvent(new Event('open'))
	} else {
		this._close()
	}
}

LookupListInput.prototype.close = function (event) {
	this.cancelSearch = true
	this._close(event)
}

LookupListInput.prototype._close = function (event) {
	if (this.menu.element.style.display !== 'none') {
		this.menu.element.style.display = 'none'
		this.menu.element.blur()
		this.isNewMenu = true
	}
}

LookupListInput.prototype._normalize = function (items) {
	if (items.length && items[0].label && items[0].value) return items
	return items.map((item) =>
		typeof item === 'string'
			? { label: item, value: item }
			: {
					label: item.label || item.value,
					value: item.value || item.label,
				}
	)
}

LookupListInput.prototype._suggest = function (items) {
	const div = this.menu.element
	while (div.firstChild) div.removeChild(div.firstChild)

	this._renderMenu(items)
	div.style.display = 'block'
	this._resizeMenu()
	this.position.of = this.element
	this.isNewMenu = true
}

LookupListInput.prototype._resizeMenu = function () {
	// No resizing implemented currently
}

LookupListInput.prototype._renderMenu = function (items) {
	const maxItems = Math.min(this.maxSuggestions, items.length)
	for (let i = 0; i < maxItems; i++) this._renderItemData(items[i])
}

LookupListInput.prototype._renderItemData = function (item) {
	const menuItem = this.menuItemRenderer(item)
	menuItem.addEventListener('click', () => {
		this.menu.element.dispatchEvent(
			new CustomEvent('menuselect', { detail: item })
		)
	})
	this.menu.element.appendChild(menuItem)
}

LookupListInput.prototype._renderMenuItem = function (item) {
	const menuItem = document.createElement('div')
	gadgetui.util.addClass(menuItem, 'gadgetui-lookuplist-item')
	menuItem.setAttribute('value', item.value)
	menuItem.innerText = this.labelRenderer(item)
	return menuItem
}

LookupListInput.prototype._renderLabel = function (item) {
	return item.label
}

LookupListInput.prototype._move = function (direction, event) {
	if (this.menu.element.style.display === 'none') {
		this.search(null, event)
		return
	}
	if (
		(this.menu.element.isFirstItem() && /^previous/.test(direction)) ||
		(this.menu.element.isLastItem() && /^next/.test(direction))
	) {
		if (!this.isMultiLine) this._value(this.term)
		this.menu.blur()
		return
	}
	this.menu[direction](event)
}

LookupListInput.prototype.widget = function () {
	return this.menu.element
}

LookupListInput.prototype._value = function (value) {
	if (value !== undefined) this.element[this.valueMethod] = value
	return this.element[this.valueMethod]
}

LookupListInput.prototype._keyEvent = function (keyEvent, event) {
	if (!this.isMultiLine || this.menu.element.style.display !== 'none') {
		this._move(keyEvent, event)
		event.preventDefault()
	}
}

LookupListInput.prototype.config = function (options) {
	this.model =
		this.element.getAttribute('gadgetui-bind') && !options.model
			? gadgetui.model
			: options.model
	this.width = options.width
	this.func = options.func
	this.filter = options.filter || this._filter
	this.labelRenderer = options.labelRenderer || this._renderLabel
	this.itemRenderer = options.itemRenderer || this._renderItem
	this.menuItemRenderer = options.menuItemRenderer || this._renderMenuItem
	this.itemCancelRenderer =
		options.itemCancelRenderer || this._renderItemCancel
	this.emitEvents = options.emitEvents ?? true
	this.datasource = options.datasource ?? (options.lookupList || true)
	this.minLength = options.minLength || 0
	this.disabled = options.disabled || false
	this.maxSuggestions = options.maxSuggestions || 20
	this.position = options.position || {
		my: 'left top',
		at: 'left bottom',
		collision: 'none',
	}
	this.autoFocus = options.autoFocus || false
	this.requestIndex = 0
	this.delay = options.delay || 300 // Added default delay for search timeout
}
