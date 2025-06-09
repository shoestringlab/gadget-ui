"use strict";

/*
 * author: Robert Munn <robert@robertmunn.com>
 *
 * Copyright (C) 2016 Robert Munn
 *
 * This is free software licensed under the Mozilla Public License 2.0
 *
 * https://www.mozilla.org/en-US/MPL/2.0/
 *
 *
 */

var gadgetui = {
	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38,
	},
};

// save mouse position
// document
// 	.addEventListener( "mousemove", function(ev){
// 		ev = ev || window.event;
// 		gadgetui.mousePosition = gadgetui.util.mouseCoords(ev);
// 	});

gadgetui.model = (() => {
	'use strict'

	const modelStore = new Map()
	const mementoStore = new Map()
	let maxMementos = 20 // Default value

	class BindableObject {
		constructor(data, element) {
			this.data = this.processValue(data)
			this.elements = []
			this.mementos = []
			this.currentMementoIndex = -1
			if (element) {
				this.bind(element)
			}
			this.saveMemento() // Save initial state
		}

		handleEvent(event) {
			if (event.type !== 'change') return

			event.originalSource ??= 'BindableObject.handleEvent[change]'

			for (const { elem, prop } of this.elements) {
				if (
					event.target.name === prop &&
					event.originalSource !== 'BindableObject.updateDomElement'
				) {
					const value = event.target.type.includes('select')
						? {
								id: event.target.value,
								text: event.target.options[
									event.target.selectedIndex
								].textContent,
							}
						: event.target.value

					this.change(value, event, prop)
				}
			}
		}

		change(value, event, property) {
			event.originalSource ??= 'BindableObject.change'
			console.log(`change : Source: ${event.originalSource}`)

			const processedValue = this.processValue(value)

			if (!property) {
				this.data = processedValue
			} else if (typeof this.data === 'object' && this.data !== null) {
				if (!(property in this.data)) {
					throw new Error(
						`Property '${property}' of object is undefined.`
					)
				}
				this.data[property] = processedValue
			} else {
				throw new Error(
					'Attempt to treat a simple value as an object with properties.'
				)
			}

			this.saveMemento()

			this.elements
				.filter(
					({ prop, elem }) =>
						(!property || property === prop) &&
						elem !== event.target
				)
				.forEach(({ elem }) =>
					this.updateDomElement(event, elem, processedValue)
				)
		}

		updateDom(event, value, property) {
			event.originalSource ??= 'BindableObject.updateDom'

			this.elements.forEach(({ elem, prop }) => {
				if (!property) {
					if (typeof value === 'object' && value !== null) {
						if (prop in value) {
							this.updateDomElement(event, elem, value[prop])
						}
					} else {
						this.updateDomElement(event, elem, value)
					}
				} else if (prop === property) {
					this.updateDomElement(event, elem, value)
				}
			})
		}

		updateDomElement(event, element, value) {
			event.originalSource ??= 'BindableObject.updateDomElement'

			const updateOptions = () => {
				element.innerHTML = ''
				const items = Array.isArray(value)
					? value
					: value instanceof Map
						? Array.from(value.entries())
						: [value]

				if (element.tagName === 'SELECT') {
					items.forEach((item, idx) => {
						const opt = document.createElement('option')
						opt.value =
							typeof item === 'object'
								? (item.id ?? item[0])
								: item
						opt.textContent =
							typeof item === 'object'
								? (item.text ?? item[1])
								: item
						element.appendChild(opt)
					})
				} else if (['UL', 'OL'].includes(element.tagName)) {
					items.forEach((item) => {
						const li = document.createElement('li')
						li.textContent =
							typeof item === 'object'
								? (item.text ?? item[1])
								: item
						element.appendChild(li)
					})
				}
			}

			const isInput = ['INPUT', 'TEXTAREA'].includes(element.tagName)
			const isArrayElement = ['OL', 'UL', 'SELECT'].includes(
				element.tagName
			)
			const textElements = [
				'DIV', // Generic container, often contains text
				'SPAN', // Inline container, typically for text styling
				'H1', // Heading level 1
				'H2', // Heading level 2
				'H3', // Heading level 3
				'H4', // Heading level 4
				'H5', // Heading level 5
				'H6', // Heading level 6
				'P', // Paragraph
				'LABEL', // Caption for form elements, displays text
				'BUTTON', // Clickable button, often with text content
				'A', // Anchor (hyperlink), typically contains text
				'STRONG', // Bold text for emphasis
				'EM', // Italic text for emphasis
				'B', // Bold text (presentational)
				'I', // Italic text (presentational)
				'U', // Underlined text
				'SMALL', // Smaller text, often for fine print
				'SUB', // Subscript text
				'SUP', // Superscript text
				'Q', // Short inline quotation
				'BLOCKQUOTE', // Long quotation
				'CITE', // Citation or reference
				'CODE', // Code snippet
				'PRE', // Preformatted text
				'ABBR', // Abbreviation with optional title attribute
				'DFN', // Defining instance of a term
				'SAMP', // Sample output from a program
				'KBD', // Keyboard input
				'VAR', // Variable in programming/math context
				'LI', // List item (in UL or OL)
				'DT', // Term in a description list
				'DD', // Description in a description list
				'TH', // Table header cell
				'TD', // Table data cell
				'CAPTION', // Table caption
				'FIGCAPTION', // Caption for a figure
				'SUMMARY', // Summary for a details element
				'LEGEND', // Caption for a fieldset in a form
				'TITLE', // Document title (displayed in browser tab)
			]
			const isTextElement = textElements.includes(element.tagName)

			if (typeof value === 'object' && value !== null) {
				if (isInput)
					element.value =
						value.id ?? (value instanceof Map ? '' : value[0]) ?? ''
				else if (isArrayElement) updateOptions()
				else if (isTextElement)
					element.textContent =
						value.text ??
						(value instanceof Map ? '' : value[1]) ??
						''
			} else {
				if (isInput) element.value = value ?? ''
				else if (isArrayElement) updateOptions()
				else if (isTextElement) element.textContent = value ?? ''
			}

			if (
				event.originalSource !== 'model.set' &&
				event.originalSource !== 'memento.restore'
			) {
				element.dispatchEvent(
					new Event('change', {
						originalSource: 'model.updateDomElement',
					})
				)
			}
		}

		bind(element, property) {
			const binding = { elem: element, prop: property || '' }
			element.value = property ? this.data[property] : this.data

			element.addEventListener('change', this)
			this.elements.push(binding)
		}

		processValue(value) {
			switch (typeof value) {
				case 'undefined':
				case 'number':
				case 'boolean':
				case 'function':
				case 'symbol':
				case 'string':
					return value
				case 'object':
					if (value === null) return null
					if (value instanceof Map) return new Map(value)
					return JSON.parse(JSON.stringify(value))
				default:
					return value
			}
		}

		saveMemento() {
			// Remove future mementos if we're adding after an undo
			if (this.currentMementoIndex < this.mementos.length - 1) {
				this.mementos.splice(this.currentMementoIndex + 1)
			}

			const memento = this.processValue(this.data)
			this.mementos.push(memento)

			if (this.mementos.length > maxMementos) {
				this.mementos.shift() // Remove oldest memento
			} else {
				this.currentMementoIndex++
			}
		}

		undo() {
			if (this.currentMementoIndex > 0) {
				this.currentMementoIndex--
				this.restoreMemento()
				return true
			}
			return false
		}

		redo() {
			if (this.currentMementoIndex < this.mementos.length - 1) {
				this.currentMementoIndex++
				this.restoreMemento()
				return true
			}
			return false
		}

		rewind() {
			if (this.currentMementoIndex > 0) {
				this.currentMementoIndex = 0
				this.restoreMemento()
				return true
			}
			return false
		}

		fastForward() {
			if (this.currentMementoIndex < this.mementos.length - 1) {
				this.currentMementoIndex = this.mementos.length - 1
				this.restoreMemento()
				return true
			}
			return false
		}

		restoreMemento() {
			this.data = this.processValue(
				this.mementos[this.currentMementoIndex]
			)
			const event = { originalSource: 'memento.restore' }
			this.elements.forEach(({ elem, prop }) => {
				this.updateDomElement(
					event,
					elem,
					prop ? this.data[prop] : this.data
				)
			})
		}
	}

	return {
		BindableObject,

		init(options = {}) {
			maxMementos = options.maxMementos ?? 20
		},

		create(name, value, element) {
			const processedValue = new BindableObject(value).processValue(value)
			const bindable = new BindableObject(processedValue, element)
			modelStore.set(name, bindable)
			mementoStore.set(name, bindable)
		},

		destroy(name) {
			modelStore.delete(name)
			mementoStore.delete(name)
		},

		bind(name, element) {
			const [base, prop] = name.split('.')
			const model = modelStore.get(base)
			if (model) {
				model.bind(element, prop)
			}
		},

		exists(name) {
			return modelStore.has(name)
		},

		get(name) {
			if (!name) {
				console.log('Expected parameter [name] is not defined.')
				return undefined
			}

			const [base, prop] = name.split('.')
			const model = modelStore.get(base)

			if (!model) {
				console.log(`Key '${base}' does not exist in the model.`)
				return undefined
			}

			const value = prop ? model.data[prop] : model.data
			return value instanceof Map ? new Map(value) : value
		},

		set(name, value) {
			if (!name) {
				console.log('Expected parameter [name] is not defined.')
				return
			}

			const [base, prop] = name.split('.')
			const event = { originalSource: 'model.set' }

			if (!modelStore.has(base)) {
				if (!prop) {
					this.create(base, value)
				} else {
					throw new Error(`Object ${base} is not yet initialized.`)
				}
			} else {
				const model = modelStore.get(base)
				const processedValue = model.processValue(value)
				model.change(processedValue, event, prop)
				model.updateDom(event, processedValue, prop)
			}
		},

		undo(name) {
			const model = mementoStore.get(name)
			return model ? model.undo() : false
		},

		redo(name) {
			const model = mementoStore.get(name)
			return model ? model.redo() : false
		},

		rewind(name) {
			const model = mementoStore.get(name)
			return model ? model.rewind() : false
		},

		fastForward(name) {
			const model = mementoStore.get(name)
			return model ? model.fastForward() : false
		},
	}
})()

/*
// Initialize with custom memento limit
model.init({ maxMementos: 50 });

// Create a model
model.create("user", { name: "John" });

// Make changes
model.set("user.name", "Jane");
model.set("user.name", "Bob");

// Undo/redo
model.undo("user"); // Returns to "Jane"
model.undo("user"); // Returns to "John"
model.redo("user"); // Returns to "Jane"

// Rewind/fast forward
model.rewind("user"); // Back to "John"
model.fastForward("user"); // To "Bob"

*/

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callbackfn, thisArg) {
        var O = Object(this),
            lenValue = O.length,
            len = lenValue >>> 0,
            T,
            k,
            Pk,
            kPresent,
            kValue;
 
        if (typeof callbackfn !== 'function') {
            throw new TypeError();
        }
 
        T = thisArg ? thisArg : undefined;
 
        k = 0;
        while (k < len) {
            Pk = k.toString();
            kPresent = O.hasOwnProperty(Pk);
            if (kPresent) {
                kValue = O[Pk];
                callbackfn.call(T, kValue, k, O);
            }
            k += 1;
        }
        return undefined;
    };
}
gadgetui.display = (function() {
	
	function getStyleRuleValue(style, selector, sheet) {
	    var sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
	    for (var i = 0, l = sheets.length; i < l; i++) {
	        var sheet = sheets[i];
	        if( !sheet.cssRules ) { continue; }
	        for (var j = 0, k = sheet.cssRules.length; j < k; j++) {
	            var rule = sheet.cssRules[j];
	            if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
	                return rule.style[style];
	            }
	        }
	    }
	    return null;
	}
class Component {
	constructor() {
		this.events = {};
	}

	// event bindings
	on(event, func) {
		if (this.events[event] === undefined) {
			this.events[event] = [];
		}
		this.events[event].push(func);
		return this;
	}

	off(event) {
		// Clear listeners
		this.events[event] = [];
		return this;
	}

	fireEvent(key, args) {
		if (this.events[key] !== undefined) {
			this.events[key].forEach((func) => {
				func(this, args);
			});
		}
	}

	getAll() {
		return [
			{ name: "on", func: this.on },
			{ name: "off", func: this.off },
			{ name: "fireEvent", func: this.fireEvent },
		];
	}
}

class Bubble extends Component {
	constructor(options = {}) {
		super();
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.configure(options);
		this.bubble = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			arrowPosition: "topleft",
			arrowAngle: 315,
			text: "",
			padding: 10,
			fontSize: this.fontSize,
			fontStyle: this.fontStyle,
			fontWeight: this.fontWeight,
			fontVariant: this.fontVariant,
			font: this.font,
			color: this.color,
			borderWidth: this.borderWidth,
			borderColor: this.borderColor,
			backgroundColor: this.backgroundColor,
			justifyText: this.justifyText,
			lineHeight: this.lineHeight,
			align: this.align,
			vAlign: this.vAlign,
		};
	}

	configure(options = {}) {
		this.color = options.color ?? "#000";
		this.borderWidth = options.borderWidth ?? 1;
		this.borderColor = options.borderColor ?? "#000";
		this.backgroundColor = options.backgroundColor ?? "#f0f0f0";
		this.fontSize = options.fontSize ?? 14;
		this.font = options.font ?? "Arial";
		this.fontStyle = options.fontStyle ?? "";
		this.fontWeight = options.fontWeight ?? 100;
		this.fontVariant = options.fontVariant ?? "";
		this.lineHeight = options.lineHeight ?? null;
		this.align = options.align ?? "center";
		this.vAlign = options.vAlign ?? "middle";
		this.justifyText = options.justifyText ?? false;
	}

	setBubble(x, y, width, height, arrowPosition, length, angle) {
		this.bubble.x = x;
		this.bubble.y = y;
		this.bubble.width = width;
		this.bubble.height = height;
		this.setArrow(arrowPosition, length, angle);
		this.calculateBoundingRect();
		const rect = this.getBoundingClientRect();
		this.canvas.height = rect.height;
		this.canvas.width = rect.width;
		document.body.appendChild(this.canvas);
	}

	setText(text) {
		this.bubble.text = text;
	}

	setPosition(x, y) {
		this.bubble.x = x;
		this.bubble.y = y;
	}

	setArrow(position, length, angle) {
		this.setArrowLength(length);
		this.setArrowPosition(position);
		this.setArrowAngle(angle);
		this.setArrowComponents();
		this.setArrowVector();
	}

	setArrowPosition(position) {
		this.bubble.arrowPosition = position;
		const { x, width, y, height } = this.bubble;

		const positions = {
			top: [x + width / 2, y],
			topright: [x + width, y],
			right: [x + width, y + height / 2],
			bottomright: [x + width, y + height],
			bottom: [x + width / 2, y + height],
			bottomleft: [x, y + height],
			left: [x, y + height / 2],
			topleft: [x, y],
		};

		[this.bubble.arrowX, this.bubble.arrowY] = positions[position] || [x, y];
	}

	setArrowAngle(angle) {
		this.bubble.arrowAngle = angle;
		const angleRanges = {
			top: [280, 360, 0, 80, 0],
			topright: [10, 80, 45],
			right: [10, 170, 90],
			bottomright: [100, 170, 180],
			bottom: [100, 260, 180],
			bottomleft: [190, 260, 225],
			left: [190, 350, 270],
			topleft: [280, 360, 0, 80, 315],
		};

		const range = angleRanges[this.bubble.arrowPosition] || [315];
		const isValid =
			range.length === 3
				? angle >= range[0] && angle <= range[1]
				: (angle >= range[0] && angle <= range[1]) ||
					(angle >= range[2] && angle <= range[3]);

		if (!isValid) {
			console.error(
				`Angle must be within valid range for ${this.bubble.arrowPosition}`,
			);
			this.bubble.arrowAngle = range[range.length - 1];
		}
	}

	setArrowLength(length) {
		this.bubble.arrowLength = length;
	}

	setArrowComponents() {
		const angleInRadians =
			(Math.abs(this.bubble.arrowAngle - 90) * Math.PI) / 180;
		this.bubble.arrowDx = Math.round(
			this.bubble.arrowLength * Math.cos(angleInRadians),
		);
		this.bubble.arrowDy = Math.round(
			this.bubble.arrowLength * Math.sin(angleInRadians),
		);
	}

	setArrowVector() {
		const { arrowX, arrowY, arrowDx, arrowDy, arrowAngle } = this.bubble;

		if (arrowAngle >= 0 && arrowAngle <= 90) {
			this.bubble.arrowEndX = arrowX + arrowDx;
			this.bubble.arrowEndY = arrowY - arrowDy;
		} else {
			this.bubble.arrowEndX = arrowX + arrowDx;
			this.bubble.arrowEndY = arrowY + arrowDy;
		}
	}

	calculateBoundingRect() {
		const { borderWidth } = this.bubble;
		const halfBorder = Math.floor(borderWidth / 2);

		this.bubble.top =
			Math.min(this.bubble.y, this.bubble.arrowEndY) - halfBorder;
		this.bubble.left =
			Math.min(this.bubble.x, this.bubble.arrowEndX) - halfBorder;
		this.bubble.right =
			Math.max(this.bubble.x + this.bubble.width, this.bubble.arrowEndX) +
			halfBorder;
		this.bubble.bottom =
			Math.max(this.bubble.y + this.bubble.height, this.bubble.arrowEndY) +
			halfBorder;
	}

	getBoundingClientRect() {
		return {
			top: this.bubble.top,
			left: this.bubble.left,
			bottom: this.bubble.bottom,
			right: this.bubble.right,
			height: this.bubble.bottom - this.bubble.top,
			width: this.bubble.right - this.bubble.left,
		};
	}

	render() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.fillStyle = this.bubble.backgroundColor;
		this.ctx.strokeStyle = this.bubble.borderColor;
		this.ctx.lineWidth = this.bubble.borderWidth;

		const bubbleX = this.bubble.x;
		const bubbleY = this.bubble.y;

		this.ctx.beginPath();
		this.ctx.moveTo(bubbleX, bubbleY);
		this.ctx.lineTo(bubbleX, bubbleY + this.bubble.height);
		this.ctx.lineTo(bubbleX + this.bubble.width, bubbleY + this.bubble.height);
		this.ctx.lineTo(bubbleX + this.bubble.width, bubbleY);
		this.ctx.lineTo(bubbleX, bubbleY);
		this.ctx.closePath();

		this.ctx.moveTo(this.bubble.arrowX, this.bubble.arrowY);
		this.ctx.lineTo(this.bubble.arrowEndX, this.bubble.arrowEndY);
		this.ctx.fill();
		this.ctx.stroke();

		this.ctx.fillStyle = this.bubble.color;
		const config = {
			x: bubbleX + this.bubble.padding,
			y: bubbleY + this.bubble.padding,
			width:
				this.bubble.width -
				this.bubble.padding * 2 -
				this.bubble.borderWidth * 2,
			height:
				this.bubble.height -
				this.bubble.padding * 2 -
				this.bubble.borderWidth * 2,
			fontSize: this.bubble.fontSize,
			justify: this.bubble.justifyText,
			align: this.bubble.align,
			vAlign: this.bubble.vAlign,
			font: this.bubble.font,
			fontStyle: this.bubble.fontStyle,
			fontWeight: this.bubble.fontWeight,
			fontVariant: this.bubble.fontVariant,
			lineHeight: this.bubble.lineHeight,
		};
		gadgetui.util.drawText(this.ctx, this.bubble.text, config);
	}

	attachToElement(selector, position) {
		const element = selector;
		if (!element) return;

		const rect = element.getBoundingClientRect();
		const canvasRect = this.canvas.getBoundingClientRect();

		const positions = {
			top: [rect.left + rect.width / 2, rect.top],
			topright: [rect.right, -this.bubble.padding],
			right: [rect.right, rect.top / 2 + rect.height / 2],
			bottomright: [rect.right, rect.bottom],
			bottom: [rect.left + rect.width / 2, rect.bottom],
			bottomleft: [rect.left - canvasRect.width, rect.bottom],
			left: [rect.left - canvasRect.width, rect.top - rect.height / 2],
			topleft: [rect.left - canvasRect.width, rect.top - canvasRect.height],
		};

		const [left, top] = positions[position] || [0, 0];
		this.canvas.style.left = `${left}px`;
		this.canvas.style.top = `${top}px`;
		this.canvas.style.position = "absolute";
	}

	destroy() {
		document.body.removeChild(this.canvas);
	}
}

class CollapsiblePane extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);

		this.addControl();
		this.addCSS();
		this.addHeader();

		this.icon = this.wrapper.querySelector("div.oi");
		this.addBindings();

		this.height = this.wrapper.offsetHeight;
		this.headerHeight = this.header.offsetHeight;
		this.selectorHeight = this.element.offsetHeight;

		if (this.collapse) {
			this.toggle();
		}
	}

	events = ["minimized", "maximized"];

	addControl() {
		const pane = document.createElement("div");

		if (this.class) {
			pane.classList.add(this.class);
		}
		pane.classList.add("gadget-ui-collapsiblePane");

		this.element.parentNode.insertBefore(pane, this.element);
		this.wrapper = this.element.previousSibling;
		this.element.parentNode.removeChild(this.element);
		pane.appendChild(this.element);
	}

	addHeader() {
		const header = document.createElement("div");
		const css = gadgetui.util.setStyle;

		header.classList.add("gadget-ui-collapsiblePane-header");
		if (this.headerClass) {
			header.classList.add(this.headerClass);
		}
		header.innerHTML = this.title;

		this.wrapper.insertBefore(header, this.element);
		this.header = this.wrapper.querySelector(
			this.headerClass
				? `div.${this.headerClass}`
				: "div.gadget-ui-collapsiblePane-header",
		);

		const div = document.createElement("div");
		this.header.appendChild(div);
	}

	addCSS() {
		const css = gadgetui.util.setStyle;
		css(this.wrapper, "width", this.width);
		css(this.wrapper, "overflow", "hidden");
	}

	addBindings() {
		const header = this.wrapper.querySelector(
			this.headerClass
				? `div.${this.headerClass}`
				: "div.gadget-ui-collapsiblePane-header",
		);

		header.addEventListener("click", () => this.toggle());
	}

	toggle() {
		const css = gadgetui.util.setStyle;
		let icon, display, myHeight, selectorHeight;

		if (this.collapsed) {
			icon = "";
			display = "block";
			myHeight = this.height;
			selectorHeight = this.selectorHeight;
			this.collapsed = false;
		} else {
			icon = "";
			display = "none";
			myHeight = this.headerHeight;
			selectorHeight = 0;
			this.collapsed = true;
		}

		const eventName = this.collapsed ? "collapse" : "expand";
		const newEventName = this.collapsed ? "minimized" : "maximized";
		this.element.dispatchEvent(new Event(eventName));

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ height: myHeight },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						// this.icon.setAttribute('data-glyph', icon);
					},
				},
			);

			Velocity(
				this.element,
				{ height: selectorHeight },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						if (typeof this.fireEvent === "function") {
							this.fireEvent(newEventName);
						}
					},
				},
			);
		} else {
			css(this.element, "display", display);
			// this.icon.setAttribute('data-glyph', icon);
		}
	}

	config(options = {}) {
		this.animate = options.animate ?? true;
		this.delay = options.delay ?? 300;
		this.title = options.title ?? "";
		this.width = gadgetui.util.getStyle(this.element, "width");
		this.collapse = options.collapse ?? false;
		this.collapsed = options.collapse ?? true;
		this.class = options.class || false;
		this.headerClass = options.headerClass || false;
	}
}

function FileUploadWrapper(file, element) {
	const id = gadgetui.util.Id()
	const options = {
		id: id,
		filename: file.name,
		width: gadgetui.util.getStyle(element, 'width'),
	}
	const bindings = gadgetui.objects.EventBindings.getAll()

	this.file = file
	this.id = id
	this.progressbar = new gadgetui.display.ProgressBar(element, options)
	this.progressbar.render()

	bindings.forEach((binding) => {
		this[binding.name] = binding.func
	})
}

FileUploadWrapper.prototype.events = ['uploadComplete', 'uploadAborted']

FileUploadWrapper.prototype.completeUpload = function (fileItem) {
	const finish = () => {
		this.progressbar.destroy()
		this.fireEvent('uploadComplete', fileItem)
	}
	setTimeout(finish, 1000)
}

FileUploadWrapper.prototype.abortUpload = function (fileItem) {
	const aborted = () => {
		this.progressbar.destroy()
		this.fireEvent('uploadAborted', fileItem)
	}
	setTimeout(aborted, 1000)
}

class FloatingPane extends Component {
	constructor(element, options) {
		super();
		this.element = element;
		this.config(options || {});
		this.setup(options);
	}

	//FloatingPane.prototype.events = ["minimized", "maximized", "moved", "closed"];

	setup(options) {
		this.setMessage();
		this.addControl();
		this.addHeader();

		if (this.enableShrink) {
			this.maxmin = this.wrapper.querySelector("div.oi[name='maxmin']");
		}

		// Calculate dimensions after header is added
		const paddingPx =
			parseInt(
				gadgetui.util.getNumberValue(
					gadgetui.util.getStyle(this.element, "padding"),
				),
				10,
			) * 2;
		const headerHeight =
			gadgetui.util.getNumberValue(
				gadgetui.util.getStyle(this.header, "height"),
			) + 6;

		this.minWidth =
			this.title.length > 0
				? gadgetui.util.textWidth(this.title, this.header.style) + 80
				: 100;

		gadgetui.util.setStyle(this.element, "width", this.width - paddingPx);
		this.height =
			options?.height ??
			gadgetui.util.getNumberValue(
				gadgetui.util.getStyle(this.element, "height"),
			) +
				paddingPx +
				headerHeight +
				10;

		this.addCSS();
		this.height = gadgetui.util.getStyle(this.wrapper, "height");
		this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset(
			this.element,
		).left;
		this.addBindings();
	}

	setMessage() {
		if (this.message) {
			this.element.innerText = this.message;
		}
	}

	addBindings() {
		const dragger = gadgetui.util.draggable(this.wrapper);

		this.wrapper.addEventListener("drag_end", (event) => {
			this.top = event.detail.top;
			this.left = event.detail.left;
			this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset(
				this.element,
			).left;

			if (typeof this.fireEvent === "function") {
				this.fireEvent("moved");
			}
		});

		if (this.enableShrink) {
			this.shrinker.addEventListener("click", (event) => {
				event.stopPropagation();
				this.minimized ? this.expand() : this.minimize();
			});
		}

		if (this.enableClose) {
			this.closer.addEventListener("click", (event) => {
				event.stopPropagation();
				this.close();
			});
		}
	}

	close() {
		if (typeof this.fireEvent === "function") {
			this.fireEvent("closed");
		}
		this.wrapper.parentNode.removeChild(this.wrapper);
	}

	addHeader() {
		const css = gadgetui.util.setStyle;
		this.header = document.createElement("div");
		this.header.innerHTML = this.title;

		this.header.classList.add(
			this.headerClass || "gadget-ui-floatingPane-header",
		);

		if (this.enableShrink) {
			this.shrinker = document.createElement("span");
			this.shrinker.setAttribute("name", "maxmin");
			css(this.shrinker, "position", "absolute");
			css(this.shrinker, "right", "20px");
			css(this.shrinker, "margin-right", ".5em");

			const shrinkIcon =
				this.iconType === "img"
					? `<img class="${this.iconClass}" src="${this.minimizeIcon}"/>`
					: `<svg class="${this.iconClass}"><use xlink:href="${this.minimizeIcon}"/></svg>`;

			this.shrinker.innerHTML = shrinkIcon;
			this.header.appendChild(this.shrinker);
		}

		this.wrapper.insertBefore(this.header, this.element);

		if (this.enableClose) {
			const span = document.createElement("span");
			span.setAttribute("name", "closeIcon");

			const icon =
				this.iconType === "img"
					? `<img class="${this.iconClass}" src="${this.closeIcon}"/>`
					: `<svg class="${this.iconClass}"><use xlink:href="${this.closeIcon}"/></svg>`;

			span.innerHTML = icon;
			this.header.appendChild(span);

			Object.assign(span.style, {
				right: "3px",
				position: "absolute",
				cursor: "pointer",
				top: "3px",
			});

			this.closer = span;
		}
	}

	addCSS() {
		const css = gadgetui.util.setStyle;
		const styles = {
			width: this.width,
			"z-index": this.zIndex,
			...(this.backgroundColor && {
				"background-color": this.backgroundColor,
			}),
			...(this.top !== undefined && { top: this.top }),
			...(this.left !== undefined && { left: this.left }),
			...(this.bottom !== undefined && { bottom: this.bottom }),
			...(this.right !== undefined && { right: this.right }),
		};

		Object.entries(styles).forEach(([key, value]) =>
			css(this.wrapper, key, value),
		);
	}

	addControl() {
		const fp = document.createElement("div");
		fp.classList.add(this.class || "gadget-ui-floatingPane");

		fp.draggable = true;
		this.element.parentNode.insertBefore(fp, this.element);
		this.wrapper = this.element.previousSibling;
		this.element.parentNode.removeChild(this.element);
		fp.appendChild(this.element);
	}

	expand() {
		const css = gadgetui.util.setStyle;
		const offset = gadgetui.util.getOffset(this.wrapper);
		const parentPaddingLeft = parseInt(
			gadgetui.util.getNumberValue(
				gadgetui.util.getStyle(this.wrapper.parentElement, "padding-left"),
			),
			10,
		);
		const icon =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.minimizeIcon}"/>`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.minimizeIcon}"/></svg>`;

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ width: this.width },
				{ queue: false, duration: 500 },
			);
			Velocity(
				this.element,
				{ height: this.height },
				{
					queue: false,
					duration: 500,
					complete: () => {
						this.shrinker.innerHTML = icon;
						css(this.element, "overflow", "scroll");
						if (typeof this.fireEvent === "function") {
							this.fireEvent("maximized");
						}
					},
				},
			);
		} else {
			css(this.wrapper, "width", this.width);
			css(this.element, "height", this.height);
			this.shrinker.innerHTML = icon;
			css(this.element, "overflow", "scroll");
			if (typeof this.fireEvent === "function") {
				this.fireEvent("maximized");
			}
		}

		this.minimized = false;
	}

	minimize() {
		const css = gadgetui.util.setStyle;
		const icon =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.maximizeIcon}"/>`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.maximizeIcon}"/></svg>`;

		css(this.element, "overflow", "hidden");

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ width: this.minWidth },
				{
					queue: false,
					duration: this.delay,
					complete: () => (this.shrinker.innerHTML = icon),
				},
			);
			Velocity(
				this.element,
				{ height: "50px" },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						if (typeof this.fireEvent === "function") {
							this.fireEvent("minimized");
						}
					},
				},
			);
		} else {
			css(this.wrapper, "width", this.minWidth);
			css(this.element, "height", "50px");
			this.shrinker.innerHTML = icon;
			if (typeof this.fireEvent === "function") {
				this.fireEvent("minimized");
			}
		}

		this.minimized = true;
	}

	config(options) {
		this.message = options.message;
		this.animate = options.animate ?? true;
		this.delay = options.delay ?? 500;
		this.title = options.title || "";
		this.backgroundColor = options.backgroundColor || "";
		this.zIndex = options.zIndex ?? gadgetui.util.getMaxZIndex() + 1;
		this.width = gadgetui.util.getStyle(this.element, "width");
		this.top = options.top;
		this.left = options.left;
		this.bottom = options.bottom;
		this.right = options.right;
		this.class = options.class || false;
		this.headerClass = options.headerClass || false;
		//this.featherPath = options.featherPath || "/node_modules/feather-icons";
		this.minimized = false;
		this.relativeOffsetLeft = 0;
		this.enableShrink = options.enableShrink ?? true;
		this.enableClose = options.enableClose ?? true;

		this.iconClass = options.iconClass || "feather";
		this.iconType = options.iconType || "img";
		this.closeIcon =
			options.closeIcon ||
			"/node_modules/feather-icons/dist/icons/x-circle.svg";
		this.minimizeIcon =
			options.minimizeIcon ||
			"/node_modules/feather-icons/dist/icons/minimize.svg";
		this.maximizeIcon =
			options.maximizeIcon ||
			"/node_modules/feather-icons/dist/icons/maximize.svg";
	}
}

class Dialog extends FloatingPane {
	constructor(element, options = {}) {
		const css = gadgetui.util.setStyle;

		if (element) {
			super(element, options);
		} else {
			const dv = document.createElement("div");
			dv.setAttribute("id", `gadgetui-dialog-${Math.random()}`);
			if (options.width) {
				css(dv, "width", options.width);
			}
			document.body.appendChild(dv);
			super(dv, options);
		}

		this.buttons = options.buttons || [];
		this.addButtons();
	}

	events = ["showPrevious", "showNext"];

	addButtons() {
		const css = gadgetui.util.setStyle;

		this.buttonDiv = document.createElement("div");
		css(this.buttonDiv, "text-align", "center");
		css(this.buttonDiv, "padding", "0.5em");

		this.buttons.forEach((button) => {
			const btn = document.createElement("button");
			btn.classList.add("gadgetui-dialog-button");
			btn.innerHTML = button.label;
			this.buttonDiv.appendChild(btn);

			btn.addEventListener("click", () => {
				if (typeof button.action === "function") {
					button.action();
				}
			});
		});

		this.element.appendChild(this.buttonDiv);
	}

	destroy() {
		super.destroy(); // Call the destroy method of the parent class
		this.element.removeChild(this.buttonDiv); // Remove the button div if necessary
	}
}

class Lightbox extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);
		this.addControl();
		this.setImage();
	}

	events = ["showPrevious", "showNext"];

	config(options = {}) {
		this.images = options.images || [];
		this.currentIndex = 0;
		this.time = options.time || 3000;
		this.enableModal = options.enableModal ?? true;
		this.leftIcon =
			options.leftIcon ||
			"/node_modules/feather-icons/dist/icons/chevron-left.svg";
		this.rightIcon =
			options.rightIcon ||
			"/node_modules/feather-icons/dist/icons/chevron-right.svg";
		this.iconClass = options.iconClass || "feather";
		this.iconType = options.iconType || "img";
	}

	addControl() {
		this.element.classList.add("gadgetui-lightbox");

		this.imageContainer = document.createElement("div");
		this.imageContainer.classList.add("gadgetui-lightbox-image-container");
		this.imageTag = document.createElement("img");
		this.imageTag.setAttribute("name", "image");
		this.imageTag.classList.add("gadgetui-lightbox-image");
		this.imageContainer.appendChild(this.imageTag);

		this.transitionImageTag = document.createElement("img");
		this.transitionImageTag.setAttribute("name", "transitionImage");
		this.transitionImageTag.classList.add("gadgetui-lightbox-image");
		this.transitionImageTag.classList.add("gadgetui-lightbox-transitionimage");
		this.transitionImageTag.classList.add("gadgetui-hidden");
		this.imageContainer.appendChild(this.transitionImageTag);

		this.spanPrevious = document.createElement("span");
		this.spanNext = document.createElement("span");
		this.spanPrevious.classList.add("gadgetui-lightbox-previousControl");
		this.spanNext.classList.add("gadgetui-lightbox-nextControl");
		this.spanPrevious.innerHTML =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.leftIcon}" alt="Previous">`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.leftIcon}"/></svg>`;
		this.spanNext.innerHTML =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.rightIcon}" alt="Next">`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.rightIcon}"/></svg>`;

		this.element.appendChild(this.spanPrevious);
		this.element.appendChild(this.imageContainer);
		this.element.appendChild(this.spanNext);

		this.spanPrevious.addEventListener("click", () => this.prevImage());
		this.spanNext.addEventListener("click", () => this.nextImage());

		if (this.enableModal) {
			this.modal = document.createElement("div");
			this.modal.classList.add("gadgetui-lightbox-modal");
			this.modal.classList.add("gadgetui-hidden");

			this.modalImageContainer = document.createElement("div");
			this.modalImageContainer.classList.add(
				"gadgetui-lightbox-modal-imagecontainer",
			);
			this.modalImageTag = document.createElement("img");
			this.modalImageTag.classList.add("gadgetui-lightbox-image");
			this.modalImageContainer.appendChild(this.modalImageTag);

			this.modal.appendChild(this.modalImageContainer);
			document.body.appendChild(this.modal);

			this.imageContainer.addEventListener("click", () => {
				this.setModalImage();
				this.element.classList.add("gadgetui-hidden");
				this.modal.classList.remove("gadgetui-hidden");
				this.stopAnimation();
			});

			this.modal.addEventListener("click", () => {
				this.modal.classList.add("gadgetui-hidden");
				this.element.classList.remove("gadgetui-hidden");
				this.animate();
			});
		}
	}

	nextImage() {
		this.currentIndex = (this.currentIndex + 1) % this.images.length;
		this.updateImage(true);
		this.fireEvent("showNext", { currentIndex: this.currentIndex });
	}

	prevImage() {
		this.currentIndex =
			(this.currentIndex - 1 + this.images.length) % this.images.length;
		this.updateImage(false);
		this.fireEvent("showPrevious", { currentIndex: this.currentIndex });
	}

	setImage() {
		this.imageTag.src = this.images[this.currentIndex];
		this.imageTag.alt = `Image ${this.currentIndex + 1}`;
	}

	updateImage(isNext = true) {
		const newSrc = this.images[this.currentIndex];
		const newAlt = `Image ${this.currentIndex + 1}`;

		// Set up transition image
		this.transitionImageTag.src = newSrc;
		this.transitionImageTag.alt = newAlt;

		// Remove hidden class and reset any previous animation classes
		this.transitionImageTag.classList.remove("gadgetui-hidden");
		this.transitionImageTag.classList.remove(
			"gadgetui-slide-left",
			"gadgetui-slide-right",
			"gadgetui-slide-in",
		);

		// Apply slide direction
		const directionClass = isNext
			? "gadgetui-slide-left"
			: "gadgetui-slide-right";
		this.transitionImageTag.classList.add(directionClass);

		// After transition ends, update main image and reset transition image
		const handleTransitionEnd = () => {
			// Update main image
			this.imageTag.src = newSrc;
			this.imageTag.alt = newAlt;

			// Reset transition image
			this.transitionImageTag.classList.add("gadgetui-hidden");
			this.transitionImageTag.classList.remove(
				"gadgetui-slide-left",
				"gadgetui-slide-right",
				"gadgetui-slide-in",
			);

			// Remove event listener
			this.transitionImageTag.removeEventListener(
				"transitionend",
				handleTransitionEnd,
			);
		};

		this.transitionImageTag.addEventListener(
			"transitionend",
			handleTransitionEnd,
		);

		// Trigger animation
		requestAnimationFrame(() => {
			this.transitionImageTag.offsetWidth; // Force reflow
			this.transitionImageTag.classList.add("gadgetui-slide-in");
		});
	}

	animate() {
		this.interval = setInterval(() => this.nextImage(), this.time);
	}

	stopAnimation() {
		clearInterval(this.interval);
	}

	setModalImage() {
		this.modalImageTag.src = this.images[this.currentIndex];
		this.modalImageTag.alt = `Image ${this.currentIndex + 1}`;
	}
}

class Menu extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.elements = [];
		this.config(options);

		if (this.datasource) {
			this.retrieveData();
		} else if (this.data) {
			this.addControl();
			this.addBindings();
		}
	}

	//events = ["clicked"];

	retrieveData() {
		this.datasource().then((data) => {
			this.data = data;
			this.addControl();
		});
	}

	addControl() {
		const processItem = (item, parent) => {
			const element = document.createElement("div");
			element.classList.add("gadget-ui-menu-item");
			element.innerText = item.label || "";

			if (item.image?.length) {
				const imgEl = document.createElement("img");
				imgEl.src = item.image;
				imgEl.classList.add("gadget-ui-menu-icon");
				element.appendChild(imgEl);
			}

			if (
				item.link &&
				(item.link.length > 0 || typeof item.link === "function")
			) {
				element.style.cursor = "pointer";
				element.addEventListener("click", () => {
					if (typeof this.fireEvent === "function") {
						this.fireEvent("clicked", item);
					}
					typeof item.link === "function"
						? item.link()
						: window.open(item.link);
				});
			}

			if (item.menuItem) {
				element.appendChild(processMenuItem(item.menuItem, element));
			}
			return element;
		};

		const processMenuItem = (menuItemData, parent) => {
			const element = document.createElement("div");
			element.classList.add("gadget-ui-menu-menuItem");
			menuItemData.items.forEach((item) =>
				element.appendChild(processItem(item, element)),
			);
			return element;
		};

		const generateMenu = (menuData) => {
			const element = document.createElement("div");
			element.classList.add("gadget-ui-menu");
			element.innerText = menuData.label || "";

			if (menuData.image?.length) {
				const imgEl = document.createElement("img");
				imgEl.src = menuData.image;
				imgEl.classList.add("gadget-ui-menu-icon");
				element.appendChild(imgEl);
			}

			element.appendChild(processMenuItem(menuData.menuItem, element));
			return element;
		};

		this.data.forEach((menu) => {
			const element = generateMenu(menu);
			this.element.appendChild(element);
			this.elements.push(element);
		});
	}

	addBindings() {
		const menus = this.element.querySelectorAll(".gadget-ui-menu");
		const activateEvent = this.options.menuActivate || "mouseenter";
		const deactivateEvent = activateEvent === "click" ? "click" : "mouseleave";

		document.addEventListener("click", (evt) => {
			if (!this.element.contains(evt.target)) {
				this.close();
			}
		});

		menus.forEach((mu) => {
			const menuItem = mu.querySelector(".gadget-ui-menu-menuItem");
			const items = menuItem.querySelectorAll(".gadget-ui-menu-item");
			const menuItems = menuItem.querySelectorAll(".gadget-ui-menu-menuItem");

			items.forEach((item) => {
				const mItem = item.querySelector(".gadget-ui-menu-menuItem");

				item.addEventListener(activateEvent, (evt) => {
					if (mItem) mItem.classList.add("gadget-ui-menu-hovering");
					item.classList.add("gadget-ui-menu-selected");
					Array.from(item.parentNode.children).forEach((child) => {
						if (child !== item)
							child.classList.remove("gadget-ui-menu-selected");
					});
					evt.preventDefault();
				});

				if (activateEvent === "mouseenter") {
					item.addEventListener("mouseleave", () => {
						if (mItem) mItem.classList.remove("gadget-ui-menu-hovering");
					});
				}
			});

			mu.addEventListener(activateEvent, () =>
				menuItem.classList.add("gadget-ui-menu-hovering"),
			);

			if (activateEvent === "mouseenter") {
				mu.addEventListener("mouseleave", () =>
					menuItem.classList.remove("gadget-ui-menu-hovering"),
				);
			}

			menuItems.forEach((mItem) => {
				mItem.addEventListener(activateEvent, () =>
					mItem.classList.add("gadget-ui-menu-hovering"),
				);
				if (activateEvent === "mouseenter") {
					mItem.addEventListener("mouseleave", () => {
						if (!mItem.parentNode.classList.contains("selected")) {
							mItem.classList.remove("gadget-ui-menu-hovering");
						}
					});
				}
			});
		});
	}

	close() {
		this.elements.forEach((menu) => {
			const menuItem = menu.querySelector(".gadget-ui-menu-menuItem");
			if (menuItem) {
				menuItem.classList.remove("gadget-ui-menu-hovering");
			}
		});
	}

	destroy() {
		this.element.querySelectorAll(".gadget-ui-menu").forEach((menu) => {
			this.element.removeChild(menu);
		});
	}

	config(options) {
		this.datasource = options.datasource;
		this.data = options.data || [];
		this.options = options;
	}
}

class Modal extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.config(options);
		this.addControl();
		this.addBindings();

		if (this.autoOpen) {
			this.open();
		}
	}

	events = ["opened", "closed"];

	addControl() {
		this.wrapper = document.createElement("div");
		if (this.class) {
			this.wrapper.classList.add(this.class);
		}
		this.wrapper.classList.add("gadgetui-modal");

		this.element.parentNode.insertBefore(this.wrapper, this.element);
		this.element.parentNode.removeChild(this.element);
		this.wrapper.appendChild(this.element);

		const icon =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.closeIcon}"/>`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.closeIcon}"/></svg>`;

		this.element.classList.add("gadgetui-modalWindow");
		this.element.innerHTML = `
    <span name="close" class="gadgetui-right-align">
      <a name="close">${icon}</a>
    </span>
    ${this.element.innerHTML}
  `.trim();
	}

	addBindings() {
		const close = this.element.querySelector('a[name="close"]');
		close.addEventListener("click", () => this.close());
	}

	open() {
		this.wrapper.classList.add("gadgetui-showModal");
		this.fireEvent("opened");
	}

	close() {
		this.wrapper.classList.remove("gadgetui-showModal");
		this.fireEvent("closed");
	}

	destroy() {
		this.element.parentNode.removeChild(this.element);
		this.wrapper.parentNode.insertBefore(this.element, this.wrapper);
		this.wrapper.parentNode.removeChild(this.wrapper);
		this.element.removeChild(
			this.element.querySelector(".gadgetui-right-align"),
		);
	}

	config(options) {
		this.class = options.class || false;
		this.iconClass = options.iconClass || "feather";
		this.closeIcon =
			options.closeIcon ||
			"/node_modules/feather-icons/dist/icons/x-circle.svg";
		this.autoOpen = options.autoOpen !== false; // Default to true unless explicitly false
		this.iconType = options.iconType || "img";
	}
}


class ProgressBar extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.configure(options);
		this.render();
	}

	events = ["start", "updatePercent", "update"];

	configure(options) {
		this.id = options.id;
		this.label = options.label || "";
		this.width = options.width;
		this.percent = 0;
	}

	render() {
		const css = gadgetui.util.setStyle;

		const pbDiv = document.createElement("div");
		pbDiv.setAttribute("name", `progressbox_${this.id}`);
		pbDiv.classList.add("gadgetui-progressbar-progressbox");

		const fileDiv = document.createElement("div");
		fileDiv.setAttribute("name", "label");
		fileDiv.classList.add("gadgetui-progressbar-label");
		fileDiv.innerText = ` ${this.label} `;

		const pbarDiv = document.createElement("div");
		pbarDiv.classList.add("gadget-ui-progressbar");
		pbarDiv.setAttribute("name", `progressbar_${this.id}`);

		const statusDiv = document.createElement("div");
		statusDiv.setAttribute("name", "statustxt");
		statusDiv.classList.add("gadgetui-progressbar-statustxt");
		statusDiv.innerHTML = "0%"; // Fixed typo from innertText to innerHTML

		pbDiv.appendChild(fileDiv);
		pbDiv.appendChild(pbarDiv);
		pbDiv.appendChild(statusDiv);
		this.element.appendChild(pbDiv);

		this.progressbox = this.element.querySelector(
			`div[name='progressbox_${this.id}']`,
		);
		this.progressbar = this.element.querySelector(
			`div[name='progressbar_${this.id}']`,
		);
		this.statustxt = this.element.querySelector(`div[name='statustxt']`);

		css(pbarDiv, { width: "0%" });
	}

	start() {
		const css = gadgetui.util.setStyle;
		css(this.progressbar, "width", "0%");
		this.statustxt.innerHTML = "0%";
		this.fireEvent("start");
	}

	updatePercent(percent) {
		const css = gadgetui.util.setStyle;
		this.percent = percent;
		const percentage = `${percent}%`;
		css(this.progressbar, "width", percentage);
		this.statustxt.innerHTML = percentage;
		this.fireEvent("updatePercent", { percent });
	}

	update(text) {
		this.statustxt.innerHTML = text;
		this.fireEvent("update", { text });
	}

	destroy() {
		if (this.progressbox && this.progressbox.parentNode) {
			this.progressbox.parentNode.removeChild(this.progressbox);
		}
	}
}

class Sidebar extends Component {
	constructor(selector, options = {}) {
		super();
		this.selector = selector;
		this.minimized = false;
		this.config(options);
		this.addControl();
		this.addBindings(options);
	}

	events = ["maximized", "minimized"];

	config(options) {
		this.class = options.class || false;
		this.animate = options.animate ?? true;
		this.delay = options.delay || 300;
		this.toggleTitle = options.toggleTitle || "Toggle Sidebar";
		this.iconClass = options.iconClass || "feather";
		this.iconType = options.iconType || "img";
		this.leftIcon =
			options.leftIcon ||
			"/node_modules/feather-icons/dist/icons/chevron-left.svg";
		this.rightIcon =
			options.rightIcon ||
			"/node_modules/feather-icons/dist/icons/chevron-right.svg";
	}

	addControl() {
		this.wrapper = document.createElement("div");
		if (this.class) {
			this.wrapper.classList.add(this.class);
		}
		this.wrapper.classList.add("gadgetui-sidebar");

		this.span = document.createElement("span");
		this.span.setAttribute("title", this.toggleTitle);
		this.span.classList.add("gadgetui-right-align");
		this.span.classList.add("gadgetui-sidebar-toggle");

		this.span.innerHTML =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${this.leftIcon}">`
				: `<svg class="${this.iconClass}"><use xlink:href="${this.leftIcon}"/></svg>`;

		this.selector.parentNode.insertBefore(this.wrapper, this.selector);
		this.selector.parentNode.removeChild(this.selector);
		this.wrapper.appendChild(this.selector);
		this.wrapper.insertBefore(this.span, this.selector);
		this.width = this.wrapper.offsetWidth;
	}

	maximize() {
		this.minimized = false;
		this.setChevron(this.minimized);
		this.wrapper.classList.remove("gadgetui-sidebar-minimized");

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ width: this.width },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						gadgetui.util.removeClass(
							this.selector,
							"gadgetui-sidebarContent-minimized",
						);
						this.fireEvent("maximized");
					},
				},
			);
		} else {
			gadgetui.util.removeClass(
				this.selector,
				"gadgetui-sidebarContent-minimized",
			);
			this.fireEvent("maximized");
		}
	}

	minimize() {
		this.minimized = true;
		this.setChevron(this.minimized);
		this.selector.classList.add("gadgetui-sidebarContent-minimized");

		if (typeof Velocity !== "undefined" && this.animate) {
			Velocity(
				this.wrapper,
				{ width: 25 },
				{
					queue: false,
					duration: this.delay,
					complete: () => {
						this.wrapper.classList.add("gadgetui-sidebar-minimized");
						this.fireEvent("minimized");
					},
				},
			);
		} else {
			this.wrapper.classList.add("gadgetui-sidebar-minimized");
			this.fireEvent("minimized");
		}
	}

	addBindings(options) {
		this.span.addEventListener("click", () => {
			this.minimized ? this.maximize() : this.minimize();
		});

		if (options.minimized) {
			this.minimize();
		}
	}

	setChevron(minimized) {
		const chevron = minimized ? this.rightIcon : this.leftIcon;
		const svg = this.wrapper.querySelector("span");

		svg.innerHTML =
			this.iconType === "img"
				? `<img class="${this.iconClass}" src="${chevron}">`
				: `<svg class="${this.iconClass}"><use xlink:href="${chevron}"/></svg>`;
	}

	destroy() {
		// Implement cleanup logic if necessary
	}
}

class Tabs extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.tabsDiv = this.element.querySelector("div");
		this.config(options);
		this.addControl();
	}

	config(options) {
		this.direction = options.direction || "horizontal";
		this.tabContentDivIds = [];
		this.tabs = [];
		this.activeTab = null;
	}

	events = ["tabSelected"]; // Default value

	addControl() {
		const dir = this.direction === "vertical" ? "v" : "h";
		this.tabsDiv.classList.add(`gadget-ui-tabs-${dir}`);
		this.tabs = Array.from(this.tabsDiv.querySelectorAll("div"));

		let activeSet = false;
		this.tabs.forEach((tab) => {
			tab.classList.add(`gadget-ui-tab-${dir}`);
			const tabId = tab.getAttribute("data-tab");
			this.tabContentDivIds.push(tabId);
			this.element.querySelector(`div[name='${tabId}']`).style.display = "none";

			if (!activeSet) {
				activeSet = true;
				this.setActiveTab(tabId);
			}

			tab.addEventListener("click", () => this.setActiveTab(tabId));
		});

		this.element.querySelector(
			`div[name='${this.tabContentDivIds[0]}']`,
		).style.display = "block";
	}

	setActiveTab(activeTab) {
		const dir = this.direction === "vertical" ? "v" : "h";

		this.tabContentDivIds.forEach((tabId) => {
			const display = tabId === activeTab ? "block" : "none";
			this.element.querySelector(`div[name='${tabId}']`).style.display =
				display;
		});

		this.tabs.forEach((tab) => {
			const tabId = tab.getAttribute("data-tab");
			const className = `gadget-ui-tab-${dir}-active`;
			if (tabId === activeTab) {
				tab.classList.add(className);
			} else {
				tab.classList.remove(className);
			}
		});

		this.activeTab = activeTab;

		if (typeof this.fireEvent === "function") {
			this.fireEvent("tabSelected", { activeTab });
		}
	}

	destroy() {
		// Implement cleanup logic if necessary
	}
}


	return{
		Bubble : Bubble,
		CollapsiblePane: CollapsiblePane,
		Dialog: Dialog,
		FileUploadWrapper: FileUploadWrapper,
		FloatingPane: FloatingPane,
		Menu: Menu,
		Lightbox: Lightbox,
		Modal: Modal,
		ProgressBar: ProgressBar,
		Sidebar: Sidebar,
		Tabs: Tabs
	};
}());

gadgetui.input = (function() {
	
	
function ComboBox(element, options) {
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

ComboBox.prototype.events = [
	"change",
	"click",
	"focus",
	"mouseenter",
	"keyup",
	"mouseleave",
	"blur",
];

ComboBox.prototype.addControl = function () {
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
};

ComboBox.prototype.addCSS = function () {
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
};

ComboBox.prototype.setSelectOptions = function () {
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
};

ComboBox.prototype.find = function (text) {
	var ix;
	for (ix = 0; ix < this.dataProvider.data.length; ix++) {
		if (this.dataProvider.data[ix].text === text) {
			return this.dataProvider.data[ix].id;
		}
	}
	return;
};

ComboBox.prototype.getText = function (id) {
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
};

ComboBox.prototype.showLabel = function () {
	var css = gadgetui.util.setStyle;
	css(this.label, "display", "inline-block");
	css(this.selectWrapper, "display", "none");
	css(this.inputWrapper, "display", "none");
};

ComboBox.prototype.addBehaviors = function (obj) {
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
		var idx = event.target.selectedIndex >= 0 ? event.target.selectedIndex : 0;
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
};

ComboBox.prototype.handleInput = function (inputText) {
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
};

ComboBox.prototype.triggerSelectChange = function () {
	console.log("select change");
	var ev = new Event("change", {
		view: window,
		bubbles: true,
		cancelable: true,
	});
	this.element.dispatchEvent(ev);
};

ComboBox.prototype.setSaveFunc = function () {
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
};

ComboBox.prototype.setStartingValues = function () {
	this.dataProvider.data === undefined
		? this.dataProvider.refresh()
		: this.setControls();
};

ComboBox.prototype.setControls = function () {
	console.log(this);
	this.setSelectOptions();
	this.setValue(this.id);
	this.triggerSelectChange();
};

ComboBox.prototype.setValue = function (id) {
	var text = this.getText(id);
	console.log("setting id:" + id);
	this.id = text === undefined ? this.newOption.id : id;
	text = text === undefined ? this.newOption.text : text;
	this.text = text;
	this.label.innerText = this.text;
	this.element.value = this.id;
};

ComboBox.prototype.setDataProviderRefresh = function () {
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
};

ComboBox.prototype.config = function (options) {
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
	this.borderWidth = gadgetui.util.getStyle(this.element, "border-width") || 1;
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
};

// Author: Robert Munn <robertdmunn@gmail.com>

function FileUploader(element, options = {}) {
	this.element = element;
	this.droppedFiles = [];
	this.configure(options);
	this.render(options.title);
	this.setEventHandlers();
	this.setDimensions();
	this.token = this.useTokens && sessionStorage ? sessionStorage.token : null;
}

FileUploader.prototype.events = [
	"uploadComplete",
	"uploadStart",
	"show",
	"dragover",
	"dragstart",
	"dragenter",
	"dragleave",
	"drop",
];

FileUploader.prototype.render = function (title = "") {
	const css = gadgetui.util.setStyle;
	const uploadClass =
		`gadgetui-fileuploader-uploadIcon ${this.uploadClass || ""}`.trim();
	const icon = this.uploadIcon.includes(".svg")
		? `<svg name="gadgetui-fileuploader-uploadIcon" class="${uploadClass}"><use xlink:href="${this.uploadIcon}"/></svg>`
		: `<img name="gadgetui-fileuploader-uploadIcon" class="${uploadClass}" src="${this.uploadIcon}">`;

	this.element.innerHTML = `
    <div class="gadgetui-fileuploader-wrapper">
      <div name="gadgetui-fileuploader-dropzone" class="gadgetui-fileuploader-dropzone">
        <div name="gadgetui-fileuploader-filedisplay" class="gadgetui-fileuploader-filedisplay" style="display:none;"></div>
        <div class="gadgetui-fileuploader-dropmessage" name="gadgetui-fileuploader-dropMessageDiv">${this.dropMessage}</div>
      </div>
      <div class="buttons full">
        <div class="gadgetui-fileuploader-fileUpload" name="gadgetui-fileuploader-fileUpload">
          <label>${icon}<input type="file" name="gadgetui-fileuploader-fileselect" class="gadgetui-fileuploader-upload" title=""></label>
        </div>
      </div>
    </div>
  `.trim();

	if (!this.showUploadButton)
		css(
			this.element.querySelector(
				'input[name="gadgetui-fileuploader-fileselect"]',
			),
			"display",
			"none",
		);
	if (!this.showDropZone)
		css(
			this.element.querySelector('div[name="gadgetui-fileuploader-dropzone"]'),
			"display",
			"none",
		);
	if (!this.showUploadIcon) {
		const iconSelector = this.element.querySelector(
			'[name="gadgetui-fileuploader-uploadIcon"]',
		);
		if (iconSelector) css(iconSelector, "display", "none");
	}

	this.renderDropZone();
};

FileUploader.prototype.configure = function (options) {
	this.message = options.message;
	this.tags = options.tags || "";
	this.uploadURI = options.uploadURI;
	this.onUploadComplete = options.onUploadComplete;
	this.willGenerateThumbnails = options.willGenerateThumbnails ?? false;
	this.showUploadButton = options.showUploadButton ?? true;
	this.showDropZone = options.showDropZone ?? true;
	this.uploadIcon =
		options.uploadIcon ||
		"/node_modules/feather-icons/dist/feather-sprite.svg#image";
	this.uploadClass = options.uploadClass || "";
	this.showUploadIcon = !!(options.uploadIcon && options.showUploadIcon);
	this.addFileMessage = options.addFileMessage || "Add a File";
	this.dropMessage = options.dropMessage || "Drop Files Here";
	this.uploadErrorMessage = options.uploadErrorMessage || "Upload error.";
	this.useTokens = options.useTokens ?? false;
	this.tokenType = options.tokenType ?? "access_token"; // old default is 'X-Token' for backward compatibility
};

FileUploader.prototype.setDimensions = function () {
	const css = gadgetui.util.setStyle;
	const dropzone = this.element.querySelector(
		".gadgetui-fileuploader-dropzone",
	);
	const filedisplay = this.element.querySelector(
		".gadgetui-fileuploader-filedisplay",
	);
	const buttons = this.element.querySelector(".buttons");
	// Height and width calculations could be added here if needed
};

FileUploader.prototype.setEventHandlers = function () {
	this.element
		.querySelector('input[name="gadgetui-fileuploader-fileselect"]')
		.addEventListener("change", (evt) => {
			const dropzone = this.element.querySelector(
				'div[name="gadgetui-fileuploader-dropzone"]',
			);
			const filedisplay = this.element.querySelector(
				'div[name="gadgetui-fileuploader-filedisplay"]',
			);
			this.processUpload(evt, evt.target.files, dropzone, filedisplay);
		});
};

FileUploader.prototype.renderDropZone = function () {
	const dropzone = this.element.querySelector(
		'div[name="gadgetui-fileuploader-dropzone"]',
	);
	const filedisplay = this.element.querySelector(
		'div[name="gadgetui-fileuploader-filedisplay"]',
	);

	this.element.addEventListener("dragstart", (ev) => {
		ev.dataTransfer.setData("text", "data");
		ev.dataTransfer.effectAllowed = "copy";
		if (typeof this.fireEvent === "function") this.fireEvent("dragstart");
	});

	dropzone.addEventListener("dragenter", (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
		dropzone.classList.add("highlighted");
		if (typeof this.fireEvent === "function") this.fireEvent("dragenter");
	});

	dropzone.addEventListener("dragleave", (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
		dropzone.classList.remove("highlighted");
		if (typeof this.fireEvent === "function") this.fireEvent("dragleave");
	});

	dropzone.addEventListener("dragover", (ev) => {
		this.handleDragOver(ev);
		ev.dataTransfer.dropEffect = "copy";
		if (typeof this.fireEvent === "function") this.fireEvent("dragover");
	});

	dropzone.addEventListener("drop", (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
		if (typeof this.fireEvent === "function") this.fireEvent("drop");
		this.processUpload(ev, ev.dataTransfer.files, dropzone, filedisplay);
	});
};

FileUploader.prototype.processUpload = function (
	event,
	files,
	dropzone,
	filedisplay,
) {
	const css = gadgetui.util.setStyle;
	this.uploadingFiles = [];
	css(filedisplay, "display", "inline");

	Array.from(files).forEach((file) => {
		const wrappedFile = gadgetui.objects.Constructor(
			gadgetui.display.FileUploadWrapper,
			[file, filedisplay, true],
		);
		this.uploadingFiles.push(wrappedFile);
		wrappedFile.on("uploadComplete", (fileWrapper) => {
			const index = this.uploadingFiles.findIndex(
				(f) => f.id === fileWrapper.id,
			);
			if (index !== -1) this.uploadingFiles.splice(index, 1);
			if (!this.uploadingFiles.length) {
				if (this.showDropZone) this.show("dropzone");
				this.setDimensions();
			}
			if (typeof this.fireEvent === "function")
				this.fireEvent("uploadComplete");
		});
	});

	dropzone.classList.remove("highlighted");
	this.handleFileSelect(this.uploadingFiles, event);
};

FileUploader.prototype.handleFileSelect = function (wrappedFiles, evt) {
	evt.preventDefault();
	evt.stopPropagation();
	this.willGenerateThumbnails
		? this.generateThumbnails(wrappedFiles)
		: this.upload(wrappedFiles);
};

FileUploader.prototype.generateThumbnails = function (wrappedFiles) {
	this.upload(wrappedFiles); // Placeholder for future thumbnail generation
};

FileUploader.prototype.upload = function (wrappedFiles) {
	wrappedFiles.forEach((wrappedFile) => {
		if (typeof this.fireEvent === "function") this.fireEvent("uploadStart");
		wrappedFile.progressbar.start();
	});
	this.uploadFile(wrappedFiles);
};

FileUploader.prototype.uploadFile = function (wrappedFiles) {
	wrappedFiles.forEach((wrappedFile) => {
		const blob = wrappedFile.file;
		const BYTES_PER_CHUNK = 1024 * 1024; // 1MB chunks
		const parts = Math.ceil(blob.size / BYTES_PER_CHUNK);
		const chunks = [];
		let start = 0;

		while (start < blob.size) {
			const end = Math.min(start + BYTES_PER_CHUNK, blob.size);
			chunks.push(blob.slice(start, end)); // Modern slice method
			start = end;
		}

		this.uploadChunk(wrappedFile, chunks, 1, parts);
	});
};

FileUploader.prototype.uploadChunk = function (
	wrappedFile,
	chunks,
	filepart,
	parts,
) {
	const xhr = new XMLHttpRequest();
	const tags = this.tags;

	xhr.onreadystatechange = () => {
		if (xhr.readyState !== 4) return;

		if (xhr.status !== 200) {
			this.handleUploadError(xhr, {}, wrappedFile);
		} else {
			if (this.useTokens && sessionStorage) {
				if (this.tokenType === "X-Token") {
					this.token = xhr.getResponseHeader("X-Token");
				} else {
					this.token = xhr.getResponseHeader("access_token");
				}

				sessionStorage.token = this.token;
			}

			if (filepart <= parts) {
				wrappedFile.progressbar.updatePercent(
					Math.round((filepart / parts) * 100),
				);
			}

			if (filepart < parts) {
				wrappedFile.id = xhr.getResponseHeader("X-Id");
				this.uploadChunk(wrappedFile, chunks, filepart + 1, parts);
			} else {
				let json;
				try {
					json = { data: JSON.parse(xhr.response) };
				} catch (e) {
					json = {};
					this.handleUploadError(xhr, json, wrappedFile);
					return;
				}
				if (json.data) this.handleUploadResponse(json, wrappedFile);
				else this.handleUploadError(xhr, json, wrappedFile);
			}
		}
	};

	xhr.open("POST", this.uploadURI, true);
	xhr.setRequestHeader("X-Tags", tags);
	xhr.setRequestHeader("X-Id", wrappedFile.id || "");
	xhr.setRequestHeader("X-FileName", wrappedFile.file.name);
	xhr.setRequestHeader("X-FileSize", wrappedFile.file.size);
	xhr.setRequestHeader("X-FilePart", filepart);
	xhr.setRequestHeader("X-Parts", parts);
	if (this.useTokens && this.token)
		if (this.tokenType === "X-Token") {
			xhr.setRequestHeader("X-Token", this.token);
		} else {
			xhr.setRequestHeader("Authorization", "Bearer " + this.token);
		}
	xhr.setRequestHeader(
		"X-MimeType",
		wrappedFile.file.type || "application/octet-stream",
	);
	xhr.setRequestHeader("X-HasTile", !!wrappedFile.tile?.length);
	xhr.setRequestHeader("Content-Type", "application/octet-stream");
	xhr.send(chunks[filepart - 1]);
};

FileUploader.prototype.handleUploadResponse = function (json, wrappedFile) {
	const fileItem = gadgetui.objects.Constructor(
		gadgetui.objects.FileItem,
		[
			{
				mimetype: json.data.mimetype,
				fileid: json.data.fileId,
				filename: json.data.filename,
				filesize: json.data.filesize,
				tags: json.data.tags,
				created: json.data.created,
				createdStr: json.data.created,
				disabled: json.data.disabled,
				path: json.data.path,
			},
		],
		false,
	);

	wrappedFile.completeUpload(fileItem);
	if (this.onUploadComplete) this.onUploadComplete(fileItem);
};

FileUploader.prototype.handleUploadError = function (xhr, json, wrappedFile) {
	wrappedFile.progressbar.progressbox.innerText = this.uploadErrorMessage;
	wrappedFile.abortUpload(wrappedFile);
};

FileUploader.prototype.show = function (name) {
	const css = gadgetui.util.setStyle;
	const dropzone = this.element.querySelector(
		".gadgetui-fileuploader-dropzone",
	);
	const filedisplay = this.element.querySelector(
		".gadgetui-fileuploader-filedisplay",
	);

	if (name === "dropzone") {
		css(dropzone, "display", "table-cell");
		css(filedisplay, "display", "none");
	} else {
		css(filedisplay, "display", "table-cell");
		css(dropzone, "display", "none");
	}
};

FileUploader.prototype.handleDragOver = function (evt) {
	evt.preventDefault();
	evt.stopPropagation();
	evt.dataTransfer.dropEffect = "copy";
};

// Author: Robert Munn <robertdmunn@gmail.com>
// Adapted from jQuery UI autocomplete

function LookupListInput(element, options = {}) {
	this.element = element;
	this.items = [];
	this.config(options);
	this.setIsMultiLine();
	this.addControl();
	this.initSource();
	this.addMenu();
	this.addBindings();
}

LookupListInput.prototype.events = [
	"change",
	"focus",
	"mouseenter",
	"keyup",
	"mouseleave",
	"blur",
	"click",
	"input",
	"keypress",
	"keydown",
	"menuselect",
	"mousedown",
	"response",
];

LookupListInput.prototype.addControl = function () {
	this.wrapper = document.createElement("div");
	if (this.width) gadgetui.util.setStyle(this.wrapper, "width", this.width);
	gadgetui.util.addClass(this.wrapper, "gadgetui-lookuplist-input");

	this.element.parentNode.insertBefore(this.wrapper, this.element);
	this.element.parentNode.removeChild(this.element);
	this.wrapper.appendChild(this.element);
};

LookupListInput.prototype.addMenu = function () {
	const div = document.createElement("div");
	gadgetui.util.addClass(div, "gadgetui-lookuplist-menu");
	gadgetui.util.setStyle(div, "display", "none");
	this.menu = { element: div };
	this.wrapper.appendChild(div);
};

LookupListInput.prototype.initSource = function () {
	if (Array.isArray(this.datasource)) {
		this.source = (request, response) =>
			response(this.filter(this.datasource, request.term));
	} else if (typeof this.datasource === "string") {
		this.source = (request, response) => {
			if (this.xhr) this.xhr.abort();
			this.xhr = fetch({
				url: this.datasource,
				data: request,
				dataType: "json",
				success: (data) => response(data),
				error: () => response([]),
			});
		};
	} else {
		this.source = this.datasource;
	}
};

LookupListInput.prototype.escapeRegex = function (value) {
	return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

LookupListInput.prototype._filter = function (array, term) {
	const matcher = new RegExp(this.escapeRegex(term), "i");
	return gadgetui.util.grep(array, (value) =>
		matcher.test(value.label || value.value || value),
	);
};

LookupListInput.prototype.checkForDuplicate = function (item) {
	return this.items.some((existing) => existing.value === item.value);
};

LookupListInput.prototype.makeUnique = function (content) {
	return content.filter((item) => !this.checkForDuplicate(item));
};

LookupListInput.prototype.setIsMultiLine = function () {
	const nodeName = this.element.nodeName.toLowerCase();
	this.isMultiLine =
		nodeName === "textarea" ||
		(nodeName !== "input" && this.element.getAttribute("isContentEditable"));
};

LookupListInput.prototype.addBindings = function () {
	const nodeName = this.element.nodeName.toLowerCase();
	this.isTextarea = nodeName === "textarea";
	this.isInput = nodeName === "input";
	this.valueMethod = this.isTextarea || this.isInput ? "value" : "innerText";
	this.element.setAttribute("autocomplete", "off");

	let suppressKeyPress, suppressKeyPressRepeat, suppressInput;

	this.wrapper.addEventListener("click", () => {
		this.element.focus();
		if (typeof this.fireEvent === "function") this.fireEvent("click");
	});

	const keyEvents = {
		keydown: (event) => {
			if (this.element.getAttribute("readOnly")) {
				suppressKeyPress = suppressInput = suppressKeyPressRepeat = true;
				return;
			}
			suppressKeyPress = suppressInput = suppressKeyPressRepeat = false;
			const keyCode = gadgetui.keyCode;

			switch (event.keyCode) {
				case keyCode.PAGE_UP:
					suppressKeyPress = true;
					this._move("previousPage", event);
					break;
				case keyCode.PAGE_DOWN:
					suppressKeyPress = true;
					this._move("nextPage", event);
					break;
				case keyCode.UP:
					suppressKeyPress = true;
					this._keyEvent("previous", event);
					break;
				case keyCode.DOWN:
					suppressKeyPress = true;
					this._keyEvent("next", event);
					break;
				case keyCode.ENTER:
					if (this.menu.active) {
						suppressKeyPress = true;
						event.preventDefault();
						this.menu.select(event);
					}
					break;
				case keyCode.BACKSPACE:
					if (!this.element.value.length && this.items.length) {
						this.remove(this.element.previousSibling);
					}
					break;
				case keyCode.TAB:
					if (this.menu.active) this.menu.select(event);
					break;
				case keyCode.ESCAPE:
					if (this.menu.element.style.display !== "none") {
						if (!this.isMultiLine) this._value(this.term);
						this.close(event);
						event.preventDefault();
					}
					break;
				default:
					suppressKeyPressRepeat = true;
					this._searchTimeout(event);
					break;
			}
			if (typeof this.fireEvent === "function") this.fireEvent("keydown");
		},

		keypress: (event) => {
			if (suppressKeyPress) {
				suppressKeyPress = false;
				if (!this.isMultiLine || this.menu.element.style.display !== "none") {
					event.preventDefault();
				}
				return;
			}
			if (suppressKeyPressRepeat) return;

			const keyCode = gadgetui.keyCode;
			switch (event.keyCode) {
				case keyCode.PAGE_UP:
					this._move("previousPage", event);
					break;
				case keyCode.PAGE_DOWN:
					this._move("nextPage", event);
					break;
				case keyCode.UP:
					this._keyEvent("previous", event);
					break;
				case keyCode.DOWN:
					this._keyEvent("next", event);
					break;
			}
			if (typeof this.fireEvent === "function") this.fireEvent("keypress");
		},

		input: (event) => {
			if (suppressInput) {
				suppressInput = false;
				event.preventDefault();
				return;
			}
			this._searchTimeout(event);
			if (typeof this.fireEvent === "function") this.fireEvent("input");
		},

		focus: () => {
			this.selectedItem = null;
			this.previous = this.element[this.valueMethod];
			if (typeof this.fireEvent === "function") this.fireEvent("focus");
		},

		blur: (event) => {
			if (this.cancelBlur) {
				delete this.cancelBlur;
				return;
			}
			clearTimeout(this.searching);
			this.close(event);
			if (typeof this.fireEvent === "function") this.fireEvent("blur");
		},

		change: () => this.fireEvent("change"),
	};

	Object.entries(keyEvents).forEach(([event, handler]) => {
		this.element.addEventListener(event, handler);
	});

	this.menu.element.addEventListener("mousedown", (event) => {
		event.preventDefault();
		this.cancelBlur = true;
		gadgetui.util.delay(() => delete this.cancelBlur);
		if (typeof this.fireEvent === "function") this.fireEvent("mousedown");
	});

	this.menu.element.addEventListener("menuselect", (event) => {
		const item = event.detail;
		const previous = this.previous;

		if (this.menu.element !== document.activeElement) {
			this.menu.element.focus();
			this.previous = previous;
			gadgetui.util.delay(() => {
				this.previous = previous;
				this.selectedItem = item;
			});
		}

		this._value(item.value);
		this.term = this._value();
		this.close(event);
		this.selectedItem = item;

		if (!this.checkForDuplicate(item)) this.add(item);
		if (typeof this.fireEvent === "function") this.fireEvent("menuselect");
	});
};

LookupListInput.prototype._renderItem = function (item) {
	const wrapper = document.createElement("div");
	gadgetui.util.addClass(wrapper, "gadgetui-lookuplist-input-item-wrapper");
	const itemNode = document.createElement("div");
	gadgetui.util.addClass(itemNode, "gadgetui-lookuplist-input-item");
	itemNode.innerHTML = this.labelRenderer(item);
	wrapper.appendChild(itemNode);
	return wrapper;
};

LookupListInput.prototype._renderItemCancel = function (item, wrapper) {
	const css = gadgetui.util.setStyle;
	const itemCancel = document.createElement("span");
	const leftOffset =
		gadgetui.util.getNumberValue(gadgetui.util.getStyle(wrapper, "width")) + 6;

	gadgetui.util.addClass(itemCancel, "oi");
	itemCancel.setAttribute("data-glyph", "circle-x");
	css(itemCancel, "font-size", 12);
	css(itemCancel, "opacity", ".5");
	css(itemCancel, "left", leftOffset);
	css(itemCancel, "position", "absolute");
	css(itemCancel, "cursor", "pointer");
	css(itemCancel, "top", 3);
	return itemCancel;
};

LookupListInput.prototype.add = function (item) {
	const wrapper = this.itemRenderer(item);
	wrapper.setAttribute("data-value", item.value);
	this.wrapper.insertBefore(wrapper, this.element);

	const itemCancel = this.itemCancelRenderer(item, wrapper);
	if (itemCancel) {
		wrapper.appendChild(itemCancel);
		itemCancel.addEventListener("click", () => this.remove(wrapper));
	}

	this.element.value = "";
	this.items.push(item);

	if (this.emitEvents)
		gadgetui.util.trigger(this.element, "gadgetui-lookuplist-input-add", item);
	if (this.func) this.func(item, "add");
	if (this.model) {
		const prop = this.element.getAttribute("gadgetui-bind");
		if (prop) {
			const list = this.model.get(prop) || [];
			list.push(item);
			this.model.set(prop, list);
		}
	}
};

LookupListInput.prototype.remove = function (element) {
	const value = element.getAttribute("data-value");
	element.parentNode.removeChild(element);

	const index = this.items.findIndex((item) => item.value === value);
	if (index !== -1) {
		const [removed] = this.items.splice(index, 1);
		if (this.model) {
			const prop = this.element.getAttribute("gadgetui-bind");
			if (prop) {
				const list = this.model.get(prop);
				const listIndex = list.findIndex((obj) => obj.value === value);
				if (listIndex !== -1) {
					list.splice(listIndex, 1);
					if (this.func) this.func(removed, "remove");
					if (this.emitEvents)
						gadgetui.util.trigger(
							this.element,
							"gadgetui-lookuplist-input-remove",
							removed,
						);
					this.model.set(prop, list);
				}
			}
		}
	}
};

LookupListInput.prototype.reset = function () {
	while (this.wrapper.firstChild && this.wrapper.firstChild !== this.element) {
		this.wrapper.removeChild(this.wrapper.firstChild);
	}
	this.items = [];
	if (this.model) {
		const prop = this.element.getAttribute("gadgetui-bind");
		if (prop) this.model.set(prop, []);
	}
};

LookupListInput.prototype.destroy = function () {
	clearTimeout(this.searching);
	this.menu.element.remove();
	if (this.liveRegion) this.liveRegion.remove();
};

LookupListInput.prototype._setOption = function (key, value) {
	this._super(key, value);
	if (key === "source") this._initSource();
	if (key === "appendTo") this.menu.element.appendTo(this._appendTo());
	if (key === "disabled" && value && this.xhr) this.xhr.abort();
};

LookupListInput.prototype._appendTo = function () {
	let element = this.options.appendTo;
	if (!element) element = this.element.closest(".ui-front") || document.body;
	return element.jquery || element.nodeType
		? $(element)
		: this.document.find(element).eq(0);
};

LookupListInput.prototype._searchTimeout = function (event) {
	clearTimeout(this.searching);
	this.searching = gadgetui.util.delay(() => {
		const termChanged = this.term !== this.element.value;
		const menuVisible = this.menu.element.style.display !== "none";
		const modifierKey =
			event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

		if (termChanged || (!termChanged && !menuVisible && !modifierKey)) {
			this.selectedItem = null;
			this.search(null, event);
		}
	}, this.delay);
};

LookupListInput.prototype.search = function (value, event) {
	value = value ?? this.element.value;
	this.term = this._value();
	return value.length < this.minLength
		? this.close(event)
		: this._search(value);
};

LookupListInput.prototype._search = function (value) {
	this.pending++;
	this.cancelSearch = false;
	this.source({ term: value }, this._response());
};

LookupListInput.prototype._response = function () {
	const index = ++this.requestIndex;
	return (content) => {
		if (index === this.requestIndex) {
			this.__response(content);
			this.pending--;
		}
	};
};

LookupListInput.prototype.__response = function (content) {
	content = this.makeUnique(content);
	if (content?.length) content = this._normalize(content);

	this.element.dispatchEvent(
		new CustomEvent("response", { detail: { content } }),
	);
	// response event
	if (typeof this.fireEvent === "function") this.fireEvent("response", content);

	if (
		!this.disabled &&
		content?.length &&
		!this.cancelSearch &&
		!this.suppressSuggestions
	) {
		this._suggest(content);
		this.element.dispatchEvent(new Event("open"));
	} else {
		this._close();
	}
};

LookupListInput.prototype.close = function (event) {
	this.cancelSearch = true;
	this._close(event);
};

LookupListInput.prototype._close = function (event) {
	if (this.menu.element.style.display !== "none") {
		this.menu.element.style.display = "none";
		this.menu.element.blur();
		this.isNewMenu = true;
	}
};

LookupListInput.prototype._normalize = function (items) {
	if (items.length && items[0].label && items[0].value) return items;
	return items.map((item) =>
		typeof item === "string"
			? { label: item, value: item }
			: {
					label: item.label || item.value,
					value: item.value || item.label,
				},
	);
};

LookupListInput.prototype._suggest = function (items) {
	const div = this.menu.element;
	while (div.firstChild) div.removeChild(div.firstChild);

	this._renderMenu(items);
	div.style.display = "block";
	this._resizeMenu();
	this.position.of = this.element;
	this.isNewMenu = true;
};

LookupListInput.prototype._resizeMenu = function () {
	// No resizing implemented currently
};

LookupListInput.prototype._renderMenu = function (items) {
	const maxItems = Math.min(this.maxSuggestions, items.length);
	for (let i = 0; i < maxItems; i++) this._renderItemData(items[i]);
};

LookupListInput.prototype._renderItemData = function (item) {
	const menuItem = this.menuItemRenderer(item);
	menuItem.addEventListener("click", () => {
		this.menu.element.dispatchEvent(
			new CustomEvent("menuselect", { detail: item }),
		);
	});
	this.menu.element.appendChild(menuItem);
};

LookupListInput.prototype._renderMenuItem = function (item) {
	const menuItem = document.createElement("div");
	gadgetui.util.addClass(menuItem, "gadgetui-lookuplist-item");
	menuItem.setAttribute("value", item.value);
	menuItem.innerText = this.labelRenderer(item);
	return menuItem;
};

LookupListInput.prototype._renderLabel = function (item) {
	return item.label;
};

LookupListInput.prototype._move = function (direction, event) {
	if (this.menu.element.style.display === "none") {
		this.search(null, event);
		return;
	}
	if (
		(this.menu.element.isFirstItem() && /^previous/.test(direction)) ||
		(this.menu.element.isLastItem() && /^next/.test(direction))
	) {
		if (!this.isMultiLine) this._value(this.term);
		this.menu.blur();
		return;
	}
	this.menu[direction](event);
};

LookupListInput.prototype.widget = function () {
	return this.menu.element;
};

LookupListInput.prototype._value = function (value) {
	if (value !== undefined) this.element[this.valueMethod] = value;
	return this.element[this.valueMethod];
};

LookupListInput.prototype._keyEvent = function (keyEvent, event) {
	if (!this.isMultiLine || this.menu.element.style.display !== "none") {
		this._move(keyEvent, event);
		event.preventDefault();
	}
};

LookupListInput.prototype.config = function (options) {
	this.model =
		this.element.getAttribute("gadgetui-bind") && !options.model
			? gadgetui.model
			: options.model;
	this.width = options.width;
	this.func = options.func;
	this.filter = options.filter || this._filter;
	this.labelRenderer = options.labelRenderer || this._renderLabel;
	this.itemRenderer = options.itemRenderer || this._renderItem;
	this.menuItemRenderer = options.menuItemRenderer || this._renderMenuItem;
	this.itemCancelRenderer =
		options.itemCancelRenderer || this._renderItemCancel;
	this.emitEvents = options.emitEvents ?? true;
	this.datasource = options.datasource ?? (options.lookupList || true);
	this.minLength = options.minLength || 0;
	this.disabled = options.disabled || false;
	this.maxSuggestions = options.maxSuggestions || 20;
	this.position = options.position || {
		my: "left top",
		at: "left bottom",
		collision: "none",
	};
	this.suppressSuggestions = options.suppressSuggestions || false;
	this.autoFocus = options.autoFocus || false;
	this.requestIndex = 0;
	this.delay = options.delay || 300; // Added default delay for search timeout
};

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

function TextInput(selector, options = {}) {
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.selector = selector;

	this.config(options);
	this.setInitialValue();
	this.addControl();
	this.setLineHeight();
	this.setFont();
	this.setWidth();
	this.addCSS();
	gadgetui.util.bind(this.selector, this.model);
	this.addBindings();
}

TextInput.prototype.events = [
	"change",
	"focus",
	"mouseenter",
	"keyup",
	"mouseleave",
	"blur",
];

TextInput.prototype.addControl = function () {
	if (this.hideable) {
		this.blockSize = gadgetui.util.getStyle(this.selector, "block-size");
		gadgetui.util.setStyle(this.selector, "block-size", this.blockSize);
		this.selector.classList.add(this.browserHideBorderCSS);
	}
};

TextInput.prototype.setInitialValue = function () {
	const val = this.selector.value;
	const ph = this.selector.getAttribute("placeholder");
	this.value = val || (ph && ph.length > 0 ? ph : " ... ");
};

TextInput.prototype.setLineHeight = function () {
	this.lineHeight = this.selector.offsetHeight;
};

TextInput.prototype.setFont = function () {
	const style = gadgetui.util.getStyle(this.selector);
	this.font = `${style.fontFamily} ${style.fontSize} ${style.fontWeight} ${style.fontVariant}`;
};

TextInput.prototype.setWidth = function () {
	this.width =
		gadgetui.util.textWidth(this.selector.value, this.font) + 10 ||
		this.maxWidth;
};

TextInput.prototype.addCSS = function () {
	const css = gadgetui.util.setStyle;
	this.selector.classList.add("gadgetui-textinput");

	if (this.maxWidth > 10 && this.enforceMaxWidth) {
		css(this.selector, "max-width", this.maxWidth);
	}
};

TextInput.prototype.setControlWidth = function (text) {
	const textWidth = Math.max(
		parseInt(gadgetui.util.textWidth(text, this.font), 10),
		this.minWidth,
	);
	gadgetui.util.setStyle(this.selector, "width", `${textWidth + 30}px`);
};

TextInput.prototype.addBindings = function () {
	const events = {
		mouseenter: () => {
			if (this.hideable)
				this.selector.classList.remove(this.browserHideBorderCSS);
			if (typeof this.fireEvent === "function") this.fireEvent("mouseenter");
		},
		focus: () => {
			if (this.hideable)
				this.selector.classList.remove(this.browserHideBorderCSS);
			if (typeof this.fireEvent === "function") this.fireEvent("focus");
		},
		keyup: (event) => {
			if (event.keyCode === 13) this.selector.blur();
			this.setControlWidth(this.selector.value);
			if (typeof this.fireEvent === "function") this.fireEvent("keyup");
		},
		change: (event) => {
			setTimeout(() => {
				let value =
					event.target.value || this.selector.getAttribute("placeholder") || "";
				const txtWidth = gadgetui.util.textWidth(value, this.font);

				if (this.maxWidth < txtWidth) {
					value = gadgetui.util.fitText(value, this.font, this.maxWidth);
				}
				if (this.model && !this.selector.getAttribute("gadgetui-bind")) {
					this.model.set(this.selector.name, event.target.value);
				}
				if (this.emitEvents) {
					gadgetui.util.trigger(this.selector, "gadgetui-input-change", {
						text: event.target.value,
					});
				}
				if (this.func) this.func({ text: event.target.value });
				if (typeof this.fireEvent === "function") this.fireEvent("change");
			}, 200);
		},
	};

	Object.entries(events).forEach(([event, handler]) => {
		this.selector.addEventListener(event, (e) => {
			e.preventDefault();
			handler(e);
		});
	});

	if (this.hideable) {
		this.selector.addEventListener("mouseleave", () => {
			if (this.selector !== document.activeElement) {
				this.selector.classList.add(this.browserHideBorderCSS);
			}
			if (typeof this.fireEvent === "function") this.fireEvent("mouseleave");
		});

		this.selector.addEventListener("blur", () => {
			gadgetui.util.setStyle(this.selector, "maxWidth", this.maxWidth);
			this.selector.classList.add(this.browserHideBorderCSS);
			if (typeof this.fireEvent === "function") this.fireEvent("blur");
		});
	}
};

TextInput.prototype.config = function (options) {
	this.borderColor = options.borderColor || "#d0d0d0";
	this.useActive = options.useActive || false;
	this.model = options.model || this.model;
	this.func = options.func;
	this.emitEvents = options.emitEvents ?? true;
	this.activate = options.activate || "mouseenter";
	this.delay = options.delay || 10;
	this.minWidth = options.minWidth || 100;
	this.enforceMaxWidth = options.enforceMaxWidth || false;
	this.hideable = options.hideable || false;
	this.maxWidth =
		options.maxWidth ||
		gadgetui.util.getNumberValue(
			gadgetui.util.getStyle(this.selector.parentNode).width,
		);
	this.browserHideBorderCSS = `gadget-ui-textinput-hideBorder-${gadgetui.util.checkBrowser()}`;
};

function Toggle(options) {
	this.configure(options)
	this.create()
}

Toggle.prototype.events = ['changed']

Toggle.prototype.configure = function (options) {
	this.selector = options.selector
	this.parentSelector = options.parentSelector
	this.shape = options.shape === undefined ? 'square' : options.shape
	this.value = parseInt(options.initialValue, 10) === 1 ? 1 : 0
}

Toggle.prototype.create = function () {
	this.element
	if (this.selector !== undefined) {
		this.element = document.querySelector(this.selector)
	} else {
		let ele = document.createElement('input')
		ele.type = 'range'
		ele.min = 0
		ele.max = 1
		let parent = document.querySelector(this.parentSelector)
		parent.appendChild(ele)
		this.element = ele
	}
	this.element.value = this.value
	this.element.classList.add('gadget-ui-toggle')
	if (this.shape === 'round') {
		this.element.classList.add('gadget-ui-toggle-round')
	}

	if (this.value === 0) {
		this.element.classList.add('gadget-ui-toggle-off')
	}
	this.element.addEventListener(
		'click',
		function () {
			if (this.value === 1) {
				this.value = 0
				this.element.classList.add('gadget-ui-toggle-off')
			} else {
				this.value = 1
				this.element.classList.remove('gadget-ui-toggle-off')
			}
			this.element.value = this.value
			if (typeof this.fireEvent === 'function') {
				this.fireEvent('changed')
			}

			// event.currentTarget.css.backgroundColor='#ccc';
		}.bind(this)
	)
}


	return{
		FileUploader: FileUploader,
		TextInput: TextInput,
		SelectInput: SelectInput,
		ComboBox: ComboBox,
		LookupListInput: LookupListInput,
		Toggle: Toggle
	};
}());

gadgetui.objects = (function() {

function Constructor(constructor, args, addBindings) {
  var ix, returnedObj, obj, bindings;

  if (addBindings === true) {
    bindings = EventBindings.getAll();
    for (ix = 0; ix < bindings.length; ix++) {
      if (constructor.prototype[bindings[ix].name] === undefined) {
        constructor.prototype[bindings[ix].name] = bindings[ix].func;
      }
    }
  }

  // construct the object
  obj = Object.create(constructor.prototype);
  returnedObj = constructor.apply(obj, args);
  if (returnedObj === undefined) {
    returnedObj = obj;
  }

  if (addBindings === true) {
    // create specified event list from prototype
    returnedObj.events = {};
    for (ix = 0; ix < constructor.prototype.events.length; ix++) {
      returnedObj.events[constructor.prototype.events[ix]] = [];
    }
  }

  return returnedObj;
}

var EventBindings = {
	on: function (event, func) {
		if (this.events[event] === undefined) {
			this.events[event] = [];
		}
		this.events[event].push(func);
		return this;
	},

	off: function (event) {
		// clear listeners
		this.events[event] = [];
		return this;
	},

	fireEvent: function (key, args) {
		var _this = this;
		if (this.events[key] !== undefined) {
			this.events[key].forEach(function (func) {
				func(_this, args);
			});
		}
	},

	getAll: function () {
		return [
			{ name: "on", func: this.on },
			{ name: "off", func: this.off },
			{ name: "fireEvent", func: this.fireEvent }
		];
	}
};

function FileItem(args) {
  this.set(args);
}

FileItem.prototype.set = function(args) {
  // filename, size
  this.fileid = args.fileid !== undefined ? args.fileid : "";
  this.filename = args.filename !== undefined ? args.filename : "";
  if (args.filename !== undefined) {
    this.filenameabbr = args.filename.substr(0, 25);
    if (args.filename.length > 25) {
      this.filenameabbr = this.filenameabbr + "...";
    }
  } else {
    this.filenameabbr = "";
  }

  this.filesize = args.filesize !== undefined ? args.filesize : "";
  this.tags = args.tags !== undefined ? args.tags : "";
  this.path = args.path !== undefined ? args.path : "";
  this.created = args.created !== undefined ? args.created : "";
  this.createdStr = args.created !== undefined ? args.createdStr : "";
  this.disabled = args.disabled !== undefined ? args.disabled : 0;
  this.mimetype =
    args.mimetype !== undefined ? args.mimetype : "application/x-unknown";
  this.tile = args.tile !== undefined ? args.tile : "";
};


	return{

    Constructor: Constructor,
	  EventBindings: EventBindings,
    FileItem: FileItem
	};
}());

gadgetui.util = (function () {
	// canvas-txt code
	const C = {
		debug: !1,
		align: "center",
		vAlign: "middle",
		fontSize: 14,
		fontWeight: "",
		fontStyle: "",
		fontVariant: "",
		font: "Arial",
		lineHeight: null,
		justify: !1,
	};

	const W = " ";

	return {
		split: function (val) {
			return val.split(/,\s*/);
		},
		extractLast: function (term) {
			return this.split(term).pop();
		},
		getNumberValue: function (pixelValue) {
			return isNaN(Number(pixelValue))
				? Number(pixelValue.substring(0, pixelValue.length - 2))
				: pixelValue;
		},

		checkBrowser: function () {
			// Opera 8.0+
			var isOpera =
				(!!window.opr && !!opr.addons) ||
				!!window.opera ||
				navigator.userAgent.indexOf(" OPR/") >= 0;

			// Firefox 1.0+
			var isFirefox = typeof InstallTrigger !== "undefined";

			// Safari 3.0+ "[object HTMLElementConstructor]"
			var isSafari =
				/constructor/i.test(window.HTMLElement) ||
				(function (p) {
					return p.toString() === "[object SafariRemoteNotification]";
				})(
					!window["safari"] ||
						(typeof safari !== "undefined" && safari.pushNotification),
				);

			// Internet Explorer 6-11
			var isIE = /*@cc_on!@*/ false || !!document.documentMode;

			// Edge 20+
			var isEdge = !isIE && !!window.StyleMedia;

			// Chrome 1 - 79
			var isChrome =
				!!window.chrome &&
				(!!window.chrome.webstore || !!window.chrome.runtime);

			// Edge (based on chromium) detection
			var isEdgeChromium = isChrome && navigator.userAgent.indexOf("Edg") != -1;

			// Blink engine detection
			var isBlink = (isChrome || isOpera) && !!window.CSS;

			let browser = "generic";
			if (isOpera) browser = "opera";
			if (isFirefox) browser = "firefox";
			if (isSafari) browser = "safari";
			if (isIE) browser = "ie";
			if (isEdge) browser = "edge";
			if (isChrome) browser = "chrome";
			if (isEdgeChromium) browser = "edgechromium";
			if (isBlink) browser = "blink";

			return browser;
		},

		getOffset: function (selector) {
			var rect = selector.getBoundingClientRect();

			return {
				top: rect.top + document.body.scrollTop,
				left: rect.left + document.body.scrollLeft,
			};
		},
		// http://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/
		// getParentsUntil - MIT License
		getParentsUntil: function (elem, parent, selector) {
			var parents = [];
			if (parent) {
				var parentType = parent.charAt(0);
			}
			if (selector) {
				var selectorType = selector.charAt(0);
			}

			// Get matches
			for (; elem && elem !== document; elem = elem.parentNode) {
				// Check if parent has been reached
				if (parent) {
					// If parent is a class
					if (parentType === ".") {
						if (elem.classList.contains(parent.substr(1))) {
							break;
						}
					}

					// If parent is an ID
					if (parentType === "#") {
						if (elem.id === parent.substr(1)) {
							break;
						}
					}

					// If parent is a data attribute
					if (parentType === "[") {
						if (elem.hasAttribute(parent.substr(1, parent.length - 1))) {
							break;
						}
					}

					// If parent is a tag
					if (elem.tagName.toLowerCase() === parent) {
						break;
					}
				}

				if (selector) {
					// If selector is a class
					if (selectorType === ".") {
						if (elem.classList.contains(selector.substr(1))) {
							parents.push(elem);
						}
					}

					// If selector is an ID
					if (selectorType === "#") {
						if (elem.id === selector.substr(1)) {
							parents.push(elem);
						}
					}

					// If selector is a data attribute
					if (selectorType === "[") {
						if (elem.hasAttribute(selector.substr(1, selector.length - 1))) {
							parents.push(elem);
						}
					}

					// If selector is a tag
					if (elem.tagName.toLowerCase() === selector) {
						parents.push(elem);
					}
				} else {
					parents.push(elem);
				}
			}

			// Return parents if any exist
			if (parents.length === 0) {
				return null;
			} else {
				return parents;
			}
		},
		getRelativeParentOffset: function (selector) {
			var i,
				offset,
				parents = gadgetui.util.getParentsUntil(selector, "body"),
				relativeOffsetLeft = 0,
				relativeOffsetTop = 0;

			for (i = 0; i < parents.length; i++) {
				if (parents[i].style.position === "relative") {
					offset = gadgetui.util.getOffset(parents[i]);
					// set the largest offset values of the ancestors
					if (offset.left > relativeOffsetLeft) {
						relativeOffsetLeft = offset.left;
					}

					if (offset.top > relativeOffsetTop) {
						relativeOffsetTop = offset.top;
					}
				}
			}
			return {
				left: relativeOffsetLeft,
				top: relativeOffsetTop,
			};
		},
		Id: function () {
			return (Math.random() * 100).toString().replace(/\./g, "");
		},
		bind: function (selector, model) {
			var bindVar = selector.getAttribute("gadgetui-bind");

			// if binding was specified, make it so
			if (bindVar !== undefined && bindVar !== null && model !== undefined) {
				model.bind(bindVar, selector);
			}
		},
		/*
		 * encode : function( input, options ){ var result, canon = true, encode =
		 * true, encodeType = 'html'; if( options !== undefined ){ canon = (
		 * options.canon === undefined ? true : options.canon ); encode = (
		 * options.encode === undefined ? true : options.encode ); //enum
		 * (html|css|attr|js|url) encodeType = ( options.encodeType ===
		 * undefined ? "html" : options.encodeType ); } if( canon ){ result =
		 * $.encoder.canonicalize( input ); } if( encode ){ switch( encodeType ){
		 * case "html": result = $.encoder.encodeForHTML( result ); break; case
		 * "css": result = $.encoder.encodeForCSS( result ); break; case "attr":
		 * result = $.encoder.encodeForHTMLAttribute( result ); break; case
		 * "js": result = $.encoder.encodeForJavascript( result ); break; case
		 * "url": result = $.encoder.encodeForURL( result ); break; }
		 *  } return result; },
		 */
		mouseCoords: function (ev) {
			// from
			// http://www.webreference.com/programming/javascript/mk/column2/
			if (ev.pageX || ev.pageY) {
				return {
					x: ev.pageX,
					y: ev.pageY,
				};
			}
			return {
				x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
				y: ev.clientY + document.body.scrollTop - document.body.clientTop,
			};
		},
		mouseWithin: function (selector, coords) {
			var rect = selector.getBoundingClientRect();
			return coords.x >= rect.left &&
				coords.x <= rect.right &&
				coords.y >= rect.top &&
				coords.y <= rect.bottom
				? true
				: false;
		},
		getStyle: function (el, prop) {
			if (window.getComputedStyle !== undefined) {
				if (prop !== undefined) {
					return window.getComputedStyle(el, null).getPropertyValue(prop);
				} else {
					return window.getComputedStyle(el, null);
				}
			} else {
				if (prop !== undefined) {
					return el.currentStyle[prop];
				} else {
					return el.currentStyle;
				}
			}
		},
		//https://jsfiddle.net/tovic/Xcb8d/
		//author: Taufik Nurrohman
		// code belongs to author
		// no license enforced
		draggable: function (selector) {
			var selected = null, // Object of the element to be moved
				x_pos = 0,
				y_pos = 0, // Stores x & y coordinates of the mouse pointer
				x_elem = 0,
				y_elem = 0; // Stores top, left values (edge) of the element

			// Will be called when user starts dragging an element
			function _drag_init(elem) {
				// Store the object of the element which needs to be moved
				selected = elem;
				x_elem = x_pos - selected.offsetLeft;
				y_elem = y_pos - selected.offsetTop;
			}

			// Will be called when user dragging an element
			function _move_elem(e) {
				x_pos = document.all ? window.event.clientX : e.pageX;
				y_pos = document.all ? window.event.clientY : e.pageY;
				if (selected !== null) {
					selected.style.left = x_pos - x_elem + "px";
					selected.style.top = y_pos - y_elem + "px";
				}
			}

			// Destroy the object when we are done
			function _destroy(event) {
				console.log(event);
				var myEvent = new CustomEvent("drag_end", {
					detail: {
						top: gadgetui.util.getStyle(selector, "top"),
						left: gadgetui.util.getStyle(selector, "left"),
					},
				});

				// Trigger it!
				selector.dispatchEvent(myEvent);
				selected = null;
			}

			// Bind the functions...
			selector.onmousedown = function () {
				_drag_init(this);
				return false;
			};

			document.onmousemove = _move_elem;
			document.onmouseup = _destroy;
		},

		textWidth: function (text, style) {
			// http://stackoverflow.com/questions/1582534/calculating-text-width-with-jquery
			// based on edsioufi's solution
			if (!gadgetui.util.textWidthEl) {
				gadgetui.util.textWidthEl = document.createElement("div");
				gadgetui.util.textWidthEl.setAttribute("id", "gadgetui-textWidth");
				gadgetui.util.textWidthEl.setAttribute("style", "display: none;");
				document.body.appendChild(gadgetui.util.textWidthEl);
			}
			// gadgetui.util.fakeEl = $('<span
			// id="gadgetui-textWidth">').appendTo(document.body);

			// var width, htmlText = text || selector.value ||
			// selector.innerHTML;
			var width,
				htmlText = text;
			if (htmlText.length > 0) {
				// htmlText =
				// gadgetui.util.TextWidth.fakeEl.text(htmlText).html();
				// //encode to Html
				gadgetui.util.textWidthEl.innerText = htmlText;
				if (htmlText === undefined) {
					htmlText = "";
				} else {
					htmlText = htmlText.replace(/\s/g, "&nbsp;"); // replace
					// trailing
					// and
					// leading
					// spaces
				}
			}
			gadgetui.util.textWidthEl.innertText = htmlText;
			// gadgetui.util.textWidthEl.style.font = font;
			// gadgetui.util.textWidthEl.html( htmlText ).style.font = font;
			// gadgetui.util.textWidthEl.html(htmlText).css('font', font ||
			// $.fn.css('font'));
			gadgetui.util.textWidthEl.style.fontFamily = style.fontFamily;
			gadgetui.util.textWidthEl.style.fontSize = style.fontSize;
			gadgetui.util.textWidthEl.style.fontWeight = style.fontWeight;
			gadgetui.util.textWidthEl.style.fontVariant = style.fontVariant;
			gadgetui.util.textWidthEl.style.display = "inline";

			width = gadgetui.util.textWidthEl.offsetWidth;
			gadgetui.util.textWidthEl.style.display = "none";
			return width;
		},

		fitText: function (text, style, width) {
			var midpoint,
				txtWidth = gadgetui.util.TextWidth(text, style),
				ellipsisWidth = gadgetui.util.TextWidth("...", style);
			if (txtWidth < width) {
				return text;
			} else {
				midpoint = Math.floor(text.length / 2) - 1;
				while (txtWidth + ellipsisWidth >= width) {
					text =
						text.slice(0, midpoint) + text.slice(midpoint + 1, text.length);

					midpoint = Math.floor(text.length / 2) - 1;
					txtWidth = gadgetui.util.TextWidth(text, font);
				}
				midpoint = Math.floor(text.length / 2) - 1;
				text =
					text.slice(0, midpoint) + "..." + text.slice(midpoint, text.length);

				// remove spaces around the ellipsis
				while (text.substring(midpoint - 1, midpoint) === " ") {
					text =
						text.slice(0, midpoint - 1) + text.slice(midpoint, text.length);
					midpoint = midpoint - 1;
				}

				while (text.substring(midpoint + 3, midpoint + 4) === " ") {
					text =
						text.slice(0, midpoint + 3) + text.slice(midpoint + 4, text.length);
					midpoint = midpoint - 1;
				}
				return text;
			}
		},

		createElement: function (tagName) {
			var el = document.createElement(tagName);
			el.setAttribute("style", "");
			return el;
		},

		addStyle: function (element, style) {
			var estyles = element.getAttribute("style"),
				currentStyles = estyles !== null ? estyles : "";
			element.setAttribute("style", currentStyles + " " + style + ";");
		},

		isNumeric: function (num) {
			return !isNaN(parseFloat(num)) && isFinite(num);
		},

		setStyle: function (element, style, value) {
			var newStyles,
				estyles = element.getAttribute("style"),
				currentStyles = estyles !== null ? estyles : "",
				str = "(" + style + ")+ *\\:[^\\;]*\\;",
				re = new RegExp(str, "g");
			// find styles in the style string
			// ([\w\-]+)+ *\:[^\;]*\;

			// assume
			if (gadgetui.util.isNumeric(value) === true) {
				// don't modify properties that accept a straight numeric value
				switch (style) {
					case "opacity":
					case "z-index":
					case "font-weight":
						break;
					default:
						value = value + "px";
				}
			}

			if (currentStyles.search(re) >= 0) {
				newStyles = currentStyles.replace(re, style + ": " + value + ";");
			} else {
				newStyles = currentStyles + " " + style + ": " + value + ";";
			}
			element.setAttribute("style", newStyles);
		},
		encode: function (str) {
			return str;
		},

		trigger: function (selector, eventType, data) {
			selector.dispatchEvent(
				new CustomEvent(eventType, {
					detail: data,
				}),
			);
		},
		getMaxZIndex: function () {
			var elems = document.querySelectorAll("*");
			var highest = 0;
			for (var ix = 0; ix < elems.length; ix++) {
				var zindex = gadgetui.util.getStyle(elems[ix], "z-index");
				if (zindex > highest && zindex != "auto") {
					highest = zindex;
				}
			}
			return highest;
		},
		// copied from jQuery core, re-distributed per MIT License
		grep: function (elems, callback, invert) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;

			// Go through the array, only saving the items
			// _this pass the validator function
			for (; i < length; i++) {
				callbackInverse = !callback(elems[i], i);
				if (callbackInverse !== callbackExpect) {
					matches.push(elems[i]);
				}
			}

			return matches;
		},
		delay: function (handler, delay) {
			function handlerProxy() {
				return handler.apply(instance, arguments);
			}
			var instance = this;
			return setTimeout(handlerProxy, delay || 0);
		},
		contains: function (child, parent) {
			var node = child.parentNode;
			while (node != null) {
				if (node == parent) {
					return true;
				}
				node = node.parentNode;
			}
			return false;
		},

		// code below for drawing multi-line text on a canvas adapted from  https://github.com/geongeorge/Canvas-Txt

		/* 		MIT License

		Copyright (c) 2022 Geon George

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.

		*/
		/*
 		drawText(ctx,text, config)
		splitText({ ctx, text, justify, width }
		getTextHeight({ ctx, text, style })
 		*/

		B: function ({ ctx: e, line: c, spaceWidth: p, spaceChar: n, width: a }) {
			const i = c.trim(),
				o = i.split(/\s+/),
				s = o.length - 1;
			if (s === 0) return i;
			const m = e.measureText(o.join("")).width,
				d = (a - m) / p,
				b = Math.floor(d / s);
			if (d < 1) return i;
			const r = n.repeat(b);
			return o.join(r);
		},

		splitText: function ({ ctx: e, text: c, justify: p, width: n }) {
			const a = /* @__PURE__ */ new Map(),
				i = (r) => {
					let g = a.get(r);
					return g !== void 0 || ((g = e.measureText(r).width), a.set(r, g)), g;
				};
			let o = [],
				s = c.split(`
		  `);
			const m = p ? i(W) : 0;
			let d = 0,
				b = 0;
			for (const r of s) {
				let g = i(r);
				const y = r.length;
				if (g <= n) {
					o.push(r);
					continue;
				}
				let h = r,
					t,
					f,
					l = "";
				for (; g > n; ) {
					if ((d++, (t = b), (f = t === 0 ? 0 : i(r.substring(0, t))), f < n))
						for (
							;
							f < n && t < y && (t++, (f = i(h.substring(0, t))), t !== y);

						);
					else if (f > n)
						for (
							;
							f > n &&
							((t = Math.max(1, t - 1)),
							(f = i(h.substring(0, t))),
							!(t === 0 || t === 1));

						);
					if (((b = Math.round(b + (t - b) / d)), t--, t > 0)) {
						let u = t;
						if (h.substring(u, u + 1) != " ") {
							for (; h.substring(u, u + 1) != " " && u >= 0; ) u--;
							u > 0 && (t = u);
						}
					}
					t === 0 && (t = 1),
						(l = h.substring(0, t)),
						(l = p
							? gadgetui.util.B({
									ctx: e,
									line: l,
									spaceWidth: m,
									spaceChar: W,
									width: n,
								})
							: l),
						o.push(l),
						(h = h.substring(t)),
						(g = i(h));
				}
				g > 0 &&
					((l = p
						? gadgetui.util.B({
								ctx: e,
								line: h,
								spaceWidth: m,
								spaceChar: W,
								width: n,
							})
						: h),
					o.push(l));
			}
			return o;
		},
		getTextHeight: function ({ ctx: e, text: c, style: p }) {
			const n = e.textBaseline,
				a = e.font;
			(e.textBaseline = "bottom"), (e.font = p);
			const { actualBoundingBoxAscent: i } = e.measureText(c);
			return (e.textBaseline = n), (e.font = a), i;
		},

		drawText: function (e, c, p) {
			const { width: n, height: a, x: i, y: o } = p,
				s = { ...C, ...p };
			if (n <= 0 || a <= 0 || s.fontSize <= 0) return { height: 0 };
			const m = i + n,
				d = o + a,
				{
					fontStyle: b,
					fontVariant: r,
					fontWeight: g,
					fontSize: y,
					font: h,
				} = s,
				t = `${b} ${r} ${g} ${y}px ${h}`;
			e.font = t;
			let f = o + a / 2 + s.fontSize / 2,
				l;
			s.align === "right"
				? ((l = m), (e.textAlign = "right"))
				: s.align === "left"
					? ((l = i), (e.textAlign = "left"))
					: ((l = i + n / 2), (e.textAlign = "center"));
			const u = gadgetui.util.splitText({
					ctx: e,
					text: c,
					justify: s.justify,
					width: n,
				}),
				S = s.lineHeight
					? s.lineHeight
					: gadgetui.util.getTextHeight({ ctx: e, text: "M", style: t }),
				v = S * (u.length - 1),
				P = v / 2;
			let A = o;
			if (
				(s.vAlign === "top"
					? ((e.textBaseline = "top"), (f = o))
					: s.vAlign === "bottom"
						? ((e.textBaseline = "bottom"), (f = d - v), (A = d))
						: ((e.textBaseline = "bottom"), (A = o + a / 2), (f -= P)),
				u.forEach((T) => {
					(T = T.trim()), e.fillText(T, l, f), (f += S);
				}),
				s.debug)
			) {
				const T = "#0C8CE9";
				(e.lineWidth = 1),
					(e.strokeStyle = T),
					e.strokeRect(i, o, n, a),
					(e.lineWidth = 1),
					(e.strokeStyle = T),
					e.beginPath(),
					e.moveTo(l, o),
					e.lineTo(l, d),
					e.stroke(),
					(e.strokeStyle = T),
					e.beginPath(),
					e.moveTo(i, A),
					e.lineTo(m, A),
					e.stroke();
			}
			return { height: v + S };
		},
	};
})();

//# sourceMappingURL=gadget-ui.js.map