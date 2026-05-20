var gadgetui = (function () {
	'use strict';

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

	// canvas-txt code
	const C = {
		debug: false,
		align: "center",
		vAlign: "middle",
		fontSize: 14,
		fontWeight: "",
		fontStyle: "",
		fontVariant: "",
		font: "Arial",
		lineHeight: null,
		justify: false,
	};

	const W = " ";


	var keyCode = {
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
	};

	var mousePosition;

	function setMousePosition(pos) {
		mousePosition = pos;
	}

	function split(val) {
		return val.split(/,\s*/);
	}

	function extractLast(term) {
		return split(term).pop();
	}

	function getNumberValue(pixelValue) {
		return isNaN(Number(pixelValue))
			? Number(pixelValue.substring(0, pixelValue.length - 2))
			: pixelValue;
	}

	function checkBrowser() {
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
		var isIE = /*@cc_on!@*/ !!document.documentMode;

		// Edge 20+
		var isEdge = !isIE && !!window.StyleMedia;

		// Chrome 1 - 79
		var isChrome =
			!!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

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
	}

	function getOffset(selector) {
		var rect = selector.getBoundingClientRect();

		return {
			top: rect.top + document.body.scrollTop,
			left: rect.left + document.body.scrollLeft,
		};
	}

	// http://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/
	// getParentsUntil - MIT License
	function getParentsUntil(elem, parent, selector) {
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
	}

	function getRelativeParentOffset(selector) {
		var i,
			offset,
			parents = getParentsUntil(selector, "body"),
			relativeOffsetLeft = 0,
			relativeOffsetTop = 0;

		for (i = 0; i < parents.length; i++) {
			if (parents[i].style.position === "relative") {
				offset = getOffset(parents[i]);
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
	}

	function Id() {
		return (Math.random() * 100).toString().replace(/\./g, "");
	}

	function bind(selector, model) {
		var bindVar = selector.getAttribute("gadgetui-bind");

		// if binding was specified, make it so
		if (bindVar !== undefined && bindVar !== null && model !== undefined) {
			model.bind(bindVar, selector);
		}
	}

	function mouseCoords(ev) {
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
	}

	function mouseWithin(selector, coords) {
		var rect = selector.getBoundingClientRect();
		return coords.x >= rect.left &&
			coords.x <= rect.right &&
			coords.y >= rect.top &&
			coords.y <= rect.bottom
			? true
			: false;
	}

	function getStyle(el, prop) {
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
	}

	//https://jsfiddle.net/tovic/Xcb8d/
	//author: Taufik Nurrohman
	// code belongs to author
	// no license enforced
	function draggable(selector, handle) {
		var selected = null, // Object of the element to be moved
			x_pos = 0,
			y_pos = 0, // Stores x & y coordinates of the mouse pointer
			x_elem = 0,
			y_elem = 0; // Stores top, left values (edge) of the element

		function _drag_init(elem) {
			selected = elem;
			x_elem = x_pos - selected.offsetLeft;
			y_elem = y_pos - selected.offsetTop;
		}

		function _move_elem(e) {
			x_pos = document.all ? window.event.clientX : e.pageX;
			y_pos = document.all ? window.event.clientY : e.pageY;
			if (selected !== null) {
				selected.style.left = x_pos - x_elem + "px";
				selected.style.top = y_pos - y_elem + "px";
			}
		}

		function _drag_end() {
			// Only fire when a drag was actually in progress — otherwise every
			// document mouseup (random clicks anywhere on the page) would emit
			// a drag_end event.
			if (selected === null) return;
			var myEvent = new CustomEvent("drag_end", {
				detail: {
					top: getStyle(selector, "top"),
					left: getStyle(selector, "left"),
				},
			});
			selector.dispatchEvent(myEvent);
			selected = null;
		}

		const dragTarget = handle || selector;

		function _drag_start(e) {
			// If a handle is specified, allow interaction with form elements
			// inside it instead of starting a drag.
			if (handle) {
				const target = e.target;
				if (
					target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.tagName === "SELECT" ||
					target.tagName === "BUTTON"
				) {
					return;
				}
			}
			_drag_init(selector);
			e.preventDefault();
		}

		// addEventListener (not DOM-Level-0 .onmousedown) so multiple
		// draggable() instances coexist without clobbering each other's
		// document-level handlers, AND so we can hand back a destroy()
		// that does symmetric removeEventListener cleanup.
		dragTarget.addEventListener("mousedown", _drag_start);
		document.addEventListener("mousemove", _move_elem);
		document.addEventListener("mouseup", _drag_end);

		return function destroyDraggable() {
			dragTarget.removeEventListener("mousedown", _drag_start);
			document.removeEventListener("mousemove", _move_elem);
			document.removeEventListener("mouseup", _drag_end);
		};
	}

	function parseFont(font) {
		// Parse a font string like "fontFamily fontSize fontWeight fontVariant"
		// where fontFamily may contain commas (e.g. "-apple-system, Roboto, sans-serif 16px 400 normal").
		// Extract the first font family name and the trailing size/weight/variant tokens.
		var parts = font.trim().split(/\s+/);
		var fontFamily = "";
		var fontSize = "";
		var fontWeight = "";
		var fontVariant = "";

		// Walk tokens: font-family names may contain commas; size/weight/variant do not.
		// Strategy: collect tokens until we find one that looks like a CSS length (fontSize).
		var i = 0;
		var familyParts = [];
		while (i < parts.length) {
			if (/^\d/.test(parts[i]) || /^\.?\d/.test(parts[i])) {
				break;
			}
			familyParts.push(parts[i]);
			i++;
		}
		// Use only the first font family from the list
		fontFamily = familyParts.join(" ").split(",")[0].replace(/["']/g, "").trim();
		if (i < parts.length) fontSize = parts[i++];
		if (i < parts.length) fontWeight = parts[i++];
		if (i < parts.length) fontVariant = parts[i++];

		return {
			fontFamily: fontFamily,
			fontSize: fontSize,
			fontWeight: fontWeight,
			fontVariant: fontVariant,
		};
	}

	var measureFrame;
	var measureDiv;

	function getMeasureDiv() {
		if (measureDiv) return measureDiv;

		// Create an offscreen iframe to isolate measurements from page styles
		measureFrame = document.createElement("iframe");
		measureFrame.setAttribute("aria-hidden", "true");
		measureFrame.style.cssText =
			"position:fixed;left:-9999px;top:-9999px;width:0;height:0;border:none;visibility:hidden;";
		document.body.appendChild(measureFrame);

		var doc = measureFrame.contentDocument || measureFrame.contentWindow.document;
		doc.open();
		doc.write("<!doctype html><html><head></head><body></body></html>");
		doc.close();

		measureDiv = doc.createElement("div");
		measureDiv.id = "gadgetui-textWidth";
		measureDiv.style.cssText = "display:inline;white-space:nowrap;position:absolute;visibility:hidden;";
		doc.body.appendChild(measureDiv);

		return measureDiv;
	}

	function textWidth(text, style) {
		var el = getMeasureDiv();

		if (typeof style === "string") {
			style = parseFont(style);
		}

		var htmlText = text || "";
		if (htmlText.length > 0) {
			htmlText = htmlText.replace(/\s/g, "\u00a0"); // preserve spaces for measurement
		}

		el.innerText = htmlText;
		el.style.fontFamily = style.fontFamily || "";
		el.style.fontSize = style.fontSize || "";
		el.style.fontWeight = style.fontWeight || "";
		el.style.fontVariant = style.fontVariant || "";

		return el.offsetWidth;
	}

	function fitText(text, style, width) {
		var midpoint,
			txtWidth = textWidth(text, style),
			ellipsisWidth = textWidth("...", style);
		if (txtWidth < width) {
			return text;
		} else {
			midpoint = Math.floor(text.length / 2) - 1;
			while (txtWidth + ellipsisWidth >= width) {
				text = text.slice(0, midpoint) + text.slice(midpoint + 1, text.length);

				midpoint = Math.floor(text.length / 2) - 1;
				txtWidth = textWidth(text, style);
			}
			midpoint = Math.floor(text.length / 2) - 1;
			text = text.slice(0, midpoint) + "..." + text.slice(midpoint, text.length);

			// remove spaces around the ellipsis
			while (text.substring(midpoint - 1, midpoint) === " ") {
				text = text.slice(0, midpoint - 1) + text.slice(midpoint, text.length);
				midpoint = midpoint - 1;
			}

			while (text.substring(midpoint + 3, midpoint + 4) === " ") {
				text =
					text.slice(0, midpoint + 3) + text.slice(midpoint + 4, text.length);
				midpoint = midpoint - 1;
			}
			return text;
		}
	}

	function createElement(tagName) {
		var el = document.createElement(tagName);
		el.setAttribute("style", "");
		return el;
	}

	function addStyle(element, style) {
		var estyles = element.getAttribute("style"),
			currentStyles = estyles !== null ? estyles : "";
		element.setAttribute("style", currentStyles + " " + style + ";");
	}

	function isNumeric(num) {
		return !isNaN(parseFloat(num)) && isFinite(num);
	}

	function setStyle(element, style, value) {
		var newStyles,
			estyles = element.getAttribute("style"),
			currentStyles = estyles !== null ? estyles : "",
			str = "(" + style + ")+ *\\:[^\\;]*\\;",
			re = new RegExp(str, "g");

		// assume
		if (isNumeric(value) === true) {
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
	}

	function encode(str) {
		return str;
	}

	function trigger(selector, eventType, data) {
		selector.dispatchEvent(
			new CustomEvent(eventType, {
				detail: data,
			}),
		);
	}

	function getMaxZIndex() {
		var elems = document.querySelectorAll("*");
		var highest = 0;
		for (var ix = 0; ix < elems.length; ix++) {
			var zindex = getStyle(elems[ix], "z-index");
			if (zindex > highest && zindex != "auto") {
				highest = zindex;
			}
		}
		return highest;
	}

	// copied from jQuery core, re-distributed per MIT License
	function grep(elems, callback, invert) {
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
	}

	function delay(handler, delay) {
		function handlerProxy() {
			return handler.apply(instance, arguments);
		}
		var instance = this;
		return setTimeout(handlerProxy, delay || 0);
	}

	// Shared inline-icon markup builder. Used by every display component
	// that lets consumers pass an icon URL + iconType ("img" | "svg"):
	// FloatingPane (and its Dialog subclass), Modal, Lightbox, Sidebar.
	//
	// Why a helper: the "img" branch is trivial, but the "svg" branch has
	// three load-bearing attributes that all four components need to get
	// right — width, height, and viewBox. Without explicit width/height
	// the browser falls back to ~300×150 (giant icon). Without viewBox the
	// <use>'d symbol draws at its natural coordinate size and gets clipped
	// against the outer frame. Getting any one of them wrong was the
	// 12.3.1/12.3.2/12.3.3 chain of bug fixes — centralizing here means
	// the next fix lands in one place.
	//
	// Params:
	//   type      — "img" | "svg" (component's `iconType` option)
	//   iconClass — class to put on the rendered element (defaults to "feather")
	//   url       — image src or SVG symbol reference
	//   viewBox   — SVG coordinate space, defaults to "0 0 24 24" (feather-icons);
	//               override for other icon sets (e.g. "0 0 16 16" Bootstrap Icons)
	//   alt       — optional alt text for img mode (Lightbox uses "Previous"/"Next")
	//   width     — defaults to 16; rarely needs to be overridden
	//   height    — defaults to 16
	function buildIconMarkup$1({
		type,
		iconClass,
		url,
		viewBox = "0 0 24 24",
		alt,
		width = 16,
		height = 16,
	}) {
		if (type === "img") {
			const altAttr = alt ? ` alt="${alt}"` : "";
			return `<img class="${iconClass}" src="${url}"${altAttr}/>`;
		}
		return `<svg class="${iconClass}" width="${width}" height="${height}" viewBox="${viewBox}"><use xlink:href="${url}"/></svg>`;
	}

	function contains(child, parent) {
		var node = child.parentNode;
		while (node != null) {
			if (node == parent) {
				return true;
			}
			node = node.parentNode;
		}
		return false;
	}

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

	function B({ ctx: e, line: c, spaceWidth: p, spaceChar: n, width: a }) {
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
	}

	function splitText({ ctx: e, text: c, justify: p, width: n }) {
		const a = /* @__PURE__ */ new Map(),
			i = (r) => {
				let g = a.get(r);
				return (g !== void 0 || ((g = e.measureText(r).width), a.set(r, g)), g);
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
					for (; f < n && t < y && (t++, (f = i(h.substring(0, t))), t !== y); );
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
				(t === 0 && (t = 1),
					(l = h.substring(0, t)),
					(l = p
						? B({
								ctx: e,
								line: l,
								spaceWidth: m,
								spaceChar: W,
								width: n,
							})
						: l),
					o.push(l),
					(h = h.substring(t)),
					(g = i(h)));
			}
			g > 0 &&
				((l = p
					? B({
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
	}

	function getTextHeight({ ctx: e, text: c, style: p }) {
		const n = e.textBaseline,
			a = e.font;
		((e.textBaseline = "bottom"), (e.font = p));
		const { actualBoundingBoxAscent: i } = e.measureText(c);
		return ((e.textBaseline = n), (e.font = a), i);
	}

	function drawText(e, c, p) {
		const { width: n, height: a, x: i, y: o } = p,
			s = { ...C, ...p };
		if (n <= 0 || a <= 0 || s.fontSize <= 0) return { height: 0 };
		const m = i + n,
			d = o + a,
			{ fontStyle: b, fontVariant: r, fontWeight: g, fontSize: y, font: h } = s,
			t = `${b} ${r} ${g} ${y}px ${h}`;
		e.font = t;
		let f = o + a / 2 + s.fontSize / 2,
			l;
		s.align === "right"
			? ((l = m), (e.textAlign = "right"))
			: s.align === "left"
				? ((l = i), (e.textAlign = "left"))
				: ((l = i + n / 2), (e.textAlign = "center"));
		const u = splitText({
				ctx: e,
				text: c,
				justify: s.justify,
				width: n,
			}),
			S = s.lineHeight
				? s.lineHeight
				: getTextHeight({ ctx: e, text: "M", style: t }),
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
				((T = T.trim()), e.fillText(T, l, f), (f += S));
			}),
			s.debug)
		) {
			const T = "#0C8CE9";
			((e.lineWidth = 1),
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
				e.stroke());
		}
		return { height: v + S };
	}

	var util = /*#__PURE__*/Object.freeze({
		__proto__: null,
		B: B,
		Id: Id,
		addStyle: addStyle,
		bind: bind,
		buildIconMarkup: buildIconMarkup$1,
		checkBrowser: checkBrowser,
		contains: contains,
		createElement: createElement,
		delay: delay,
		draggable: draggable,
		drawText: drawText,
		encode: encode,
		extractLast: extractLast,
		fitText: fitText,
		getMaxZIndex: getMaxZIndex,
		getNumberValue: getNumberValue,
		getOffset: getOffset,
		getParentsUntil: getParentsUntil,
		getRelativeParentOffset: getRelativeParentOffset,
		getStyle: getStyle,
		getTextHeight: getTextHeight,
		grep: grep,
		isNumeric: isNumeric,
		keyCode: keyCode,
		mouseCoords: mouseCoords,
		get mousePosition () { return mousePosition; },
		mouseWithin: mouseWithin,
		parseFont: parseFont,
		setMousePosition: setMousePosition,
		setStyle: setStyle,
		split: split,
		splitText: splitText,
		textWidth: textWidth,
		trigger: trigger
	});

	class Bubble extends Component {
		constructor(options = {}) {
			super();
			this.canvas = document.createElement("canvas");
			this.ctx = this.canvas.getContext("2d");
			this.configure(options);
			this._attachedElement = null;
			this._attachedPosition = null;
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

		// Events fired (call .on(name, handler) to subscribe):
		//   "removed" — destroy() ran (manual destroy(), or MutationObserver
		//               auto-destroy on attached-element removal)
		// Visuals are canvas-based, so theming is via the constructor options
		// (color, borderColor, backgroundColor, font*) rather than CSS tokens.

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
			drawText(this.ctx, this.bubble.text, config);
		}

		attachToElement(selector, position) {
			if (!selector) return;
			this._attachedElement = selector;
			this._attachedPosition = position;
			this._positionToAttached();
			this._setupAttachmentTracking();
		}

		// Compute and apply the canvas position relative to the attached
		// element. Called once on attachToElement() and re-called on every
		// scroll/resize so the bubble follows the anchor instead of drifting.
		// `position: fixed` makes the math straightforward — getBoundingClientRect
		// already returns viewport coords, which fixed-positioning consumes
		// directly. The previous `position: absolute` plus viewport-relative
		// coords was the source of the scroll-drift bug.
		_positionToAttached() {
			const element = this._attachedElement;
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

			const [left, top] = positions[this._attachedPosition] || [0, 0];
			this.canvas.style.left = `${left}px`;
			this.canvas.style.top = `${top}px`;
			this.canvas.style.position = "fixed";
		}

		// Wire scroll/resize follow + auto-destroy on anchor removal. Only
		// runs when attachToElement was called — Bubble also supports
		// stand-alone setBubble(x, y, ...) positioning where these don't
		// apply. Idempotent so repeated attachToElement calls don't stack
		// listeners.
		_setupAttachmentTracking() {
			if (this._attachmentTracking) return;
			this._attachmentTracking = true;

			// Capture phase so we catch scroll events from nested scrollable
			// containers (those don't bubble to window).
			this._onScroll = () => this._positionToAttached();
			window.addEventListener("scroll", this._onScroll, {
				passive: true,
				capture: true,
			});
			this._onResize = () => this._positionToAttached();
			window.addEventListener("resize", this._onResize, { passive: true });

			this._observer = new MutationObserver(() => {
				if (!document.contains(this._attachedElement)) this.destroy();
			});
			this._observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		destroy() {
			if (this._destroyed) return;
			this._destroyed = true;

			if (this._onScroll) {
				window.removeEventListener("scroll", this._onScroll, {
					capture: true,
				});
				this._onScroll = null;
			}
			if (this._onResize) {
				window.removeEventListener("resize", this._onResize);
				this._onResize = null;
			}
			if (this._observer) {
				this._observer.disconnect();
				this._observer = null;
			}
			if (this.canvas && this.canvas.parentNode) {
				this.canvas.parentNode.removeChild(this.canvas);
			}

			this.fireEvent("removed");
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

			this._observeForRemoval();

			if (this.collapse) {
				this.toggle();
			}
		}

		// Events fired (call .on(name, handler) to subscribe):
		//   "minimized" / "maximized" — toggle() completed; component event
		//   "removed"                 — destroy() ran (manual destroy(), or
		//                               MutationObserver auto-destroy on
		//                               wrapper removal)
		// Legacy DOM events (kept for back-compat — also fired on toggle):
		//   element.dispatchEvent(new Event("collapse")) — before collapsing
		//   element.dispatchEvent(new Event("expand"))   — before expanding
		// (Previous `events = ["minimized","maximized"]` class field
		//  overwrote Component's `this.events` listener dict with an array
		//  — removed.)

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
			const css = setStyle;
			css(this.wrapper, "width", this.width);
		}

		addBindings() {
			const header = this.wrapper.querySelector(
				this.headerClass
					? `div.${this.headerClass}`
					: "div.gadget-ui-collapsiblePane-header",
			);

			// Store the bound handler so destroy() can detach it
			// symmetrically. An inline arrow (the previous pattern) can't be
			// removed later because each call creates a fresh ref.
			this._onHeaderClick = () => this.toggle();
			header.addEventListener("click", this._onHeaderClick);
			this._headerEl = header;
		}

		// Auto-destroy when the wrapper leaves the DOM (e.g. consumer's
		// framework re-renders the view without calling destroy()). Same
		// pattern as Modal / Popover / FloatingPane / etc.
		_observeForRemoval() {
			this._observer = new MutationObserver(() => {
				if (!document.contains(this.wrapper)) this.destroy();
			});
			this._observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		destroy() {
			if (this._destroyed) return;
			this._destroyed = true;

			if (this._observer) {
				this._observer.disconnect();
				this._observer = null;
			}
			if (this._headerEl && this._onHeaderClick) {
				this._headerEl.removeEventListener("click", this._onHeaderClick);
			}
			if (this.wrapper && this.wrapper.parentNode) {
				this.wrapper.parentNode.removeChild(this.wrapper);
			}

			this.fireEvent("removed");
		}

		toggle() {
			const css = setStyle;
			let display, myHeight, selectorHeight;

			if (this.collapsed) {
				display = "block";
				myHeight = this.height;
				selectorHeight = this.selectorHeight;
				this.collapsed = false;
			} else {
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
							this.fireEvent(newEventName);
						},
					},
				);
			} else {
				css(this.element, "display", display);
				// this.icon.setAttribute('data-glyph', icon);
				// Sync the component event into the non-animated path —
				// previously only the Velocity branch fired this, so
				// consumers using `animate: false` never saw "minimized" /
				// "maximized". The legacy DOM event above fires in both
				// branches; the component event now does too.
				this.fireEvent(newEventName);
			}
		}

		config(options = {}) {
			this.animate = options.animate ?? true;
			this.delay = options.delay ?? 300;
			this.title = options.title ?? "";
			this.width = getStyle(this.element, "width");
			this.collapse = options.collapse ?? false;
			this.collapsed = options.collapse ?? true;
			this.class = options.class || false;
			this.headerClass = options.headerClass || false;
		}
	}

	class FloatingPane extends Component {
		constructor(element, options) {
			super();
			this.element = element;
			this.config(options || {});
			this.setup(options);
		}

		// Events fired (call .on(name, handler) to subscribe):
		//   "minimized" / "maximized" — shrinker toggled
		//   "moved"                    — drag completed
		//   "closed"                   — user clicked the X
		//   "removed"                  — destroy() ran (X click, manual destroy(),
		//                                or MutationObserver auto-destroy on
		//                                wrapper removal)
		// (Component#events is the listener dict, not metadata, so this isn't a
		//  runtime declaration — keep it as comment until the base class
		//  separates the two.)

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
					getNumberValue(
						getStyle(this.element, "padding"),
					),
					10,
				) * 2;
			const headerHeight =
				getNumberValue(
					getStyle(this.header, "height"),
				) + 6;

			this.minWidth =
				this.title.length > 0
					? textWidth(this.title, this.header.style) + 80
					: 100;

			setStyle(this.element, "width", this.width - paddingPx);
			this.height =
				options?.height ??
				getNumberValue(
					getStyle(this.element, "height"),
				) +
					paddingPx +
					headerHeight +
					10;

			this.addCSS();
			this.height = getStyle(this.wrapper, "height");
			this.relativeOffsetLeft = getRelativeParentOffset(
				this.element,
			).left;
			this.addBindings();
			this._observeForRemoval();
		}

		setMessage() {
			if (this.message) {
				if (this.useHtml) {
					this.element.innerHTML = this.message;
				} else {
					this.element.innerText = this.message;
				}
			}
		}

		addBindings() {
			// Cache the draggable cleanup + each click handler so destroy() can
			// take them back off symmetrically. Inline arrow listeners were the
			// previous pattern but they can't be removed later (every call
			// creates a fresh reference).
			this._dragDestroy = draggable(this.wrapper, this.header);

			this._onDragEnd = (event) => {
				this.top = event.detail.top;
				this.left = event.detail.left;
				this.relativeOffsetLeft = getRelativeParentOffset(
					this.element,
				).left;

				this.fireEvent("moved", event);
			};
			this.wrapper.addEventListener("drag_end", this._onDragEnd);

			if (this.enableShrink) {
				this._onShrinkerClick = (event) => {
					event.stopPropagation();
					this.minimized ? this.expand() : this.minimize();
				};
				this.shrinker.addEventListener("click", this._onShrinkerClick);
			}

			if (this.enableClose) {
				this._onCloserClick = (event) => {
					event.stopPropagation();
					this.close();
				};
				this.closer.addEventListener("click", this._onCloserClick);
			}
		}

		// In portal mode the wrapper outlives the original anchor's normal DOM
		// lifecycle; even outside portal mode, a framework-driven parent
		// re-render can rip the wrapper out from under us without calling
		// close() or destroy(). Either way, watch for the wrapper leaving the
		// DOM and self-destruct so draggable listeners + the observer itself
		// don't leak. (Matches the Menu v12.2.4 auto-destroy pattern.)
		_observeForRemoval() {
			this._observer = new MutationObserver(() => {
				if (!document.contains(this.wrapper)) this.destroy();
			});
			this._observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		close() {
			this.fireEvent("closed");
			this.destroy();
		}

		destroy() {
			if (this._destroyed) return;
			this._destroyed = true;

			if (this._dragDestroy) {
				this._dragDestroy();
				this._dragDestroy = null;
			}
			if (this._onDragEnd && this.wrapper) {
				this.wrapper.removeEventListener("drag_end", this._onDragEnd);
			}
			if (this._onShrinkerClick && this.shrinker) {
				this.shrinker.removeEventListener("click", this._onShrinkerClick);
			}
			if (this._onCloserClick && this.closer) {
				this.closer.removeEventListener("click", this._onCloserClick);
			}
			if (this._observer) {
				this._observer.disconnect();
				this._observer = null;
			}
			if (this.wrapper && this.wrapper.parentNode) {
				this.wrapper.parentNode.removeChild(this.wrapper);
			}

			this.fireEvent("removed");
		}

		addHeader() {
			const css = setStyle;
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

				this.shrinker.innerHTML = buildIconMarkup$1({
					type: this.iconType,
					iconClass: this.iconClass,
					url: this.minimizeIcon,
					viewBox: this.iconViewBox,
				});
				this.header.appendChild(this.shrinker);
			}

			this.wrapper.insertBefore(this.header, this.element);

			if (this.enableClose) {
				const span = document.createElement("span");
				span.setAttribute("name", "closeIcon");

				span.innerHTML = buildIconMarkup$1({
					type: this.iconType,
					iconClass: this.iconClass,
					url: this.closeIcon,
					viewBox: this.iconViewBox,
				});
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
			const css = setStyle;
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

			// portal: true detaches the wrapper from the element's original
			// parent and mounts it on document.body, escaping any
			// `overflow:hidden` / stacking-context ancestor the consumer's
			// view tree imposes. The original element still ends up inside
			// the wrapper either way; the difference is which DOM subtree
			// owns the wrapper.
			if (this.portal) {
				this.element.parentNode.removeChild(this.element);
				document.body.appendChild(fp);
				fp.appendChild(this.element);
			} else {
				this.element.parentNode.insertBefore(fp, this.element);
				this.element.parentNode.removeChild(this.element);
				fp.appendChild(this.element);
			}
			this.wrapper = fp;
		}

		expand() {
			const css = setStyle;
			getOffset(this.wrapper);
			parseInt(
				getNumberValue(
					getStyle(this.wrapper.parentElement, "padding-left"),
				),
				10,
			);
			const icon = buildIconMarkup$1({
				type: this.iconType,
				iconClass: this.iconClass,
				url: this.minimizeIcon,
				viewBox: this.iconViewBox,
			});

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

							this.fireEvent("maximized");
						},
					},
				);
			} else {
				css(this.wrapper, "width", this.width);
				css(this.element, "height", this.height);
				this.shrinker.innerHTML = icon;
				css(this.element, "overflow", "scroll");

				this.fireEvent("maximized");
			}

			this.minimized = false;
		}

		minimize() {
			const css = setStyle;
			const icon = buildIconMarkup$1({
				type: this.iconType,
				iconClass: this.iconClass,
				url: this.maximizeIcon,
				viewBox: this.iconViewBox,
			});

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
							this.fireEvent("minimized");
						},
					},
				);
			} else {
				css(this.wrapper, "width", this.minWidth);
				css(this.element, "height", "50px");
				this.shrinker.innerHTML = icon;
				this.fireEvent("minimized");
			}

			this.minimized = true;
		}

		config(options) {
			this.message = options.message;
			this.useHtml = options.useHtml ?? false;
			this.animate = options.animate ?? true;
			this.delay = options.delay ?? 500;
			this.title = options.title || "";
			this.backgroundColor = options.backgroundColor || "";
			this.zIndex = options.zIndex ?? getMaxZIndex() + 1;
			this.width = getStyle(this.element, "width");
			this.top = options.top;
			this.left = options.left;
			this.bottom = options.bottom;
			this.right = options.right;
			this.class = options.class || false;
			this.headerClass = options.headerClass || false;
			this.portal = options.portal === true;
			//this.featherPath = options.featherPath || "/node_modules/feather-icons";
			this.minimized = false;
			this.relativeOffsetLeft = 0;
			this.enableShrink = options.enableShrink ?? true;
			this.enableClose = options.enableClose ?? true;

			this.iconClass = options.iconClass || "feather";
			this.iconType = options.iconType || "img";
			// Coordinate space of the referenced icon symbol (for iconType
			// "svg"). Default matches feather-icons (24×24). Override for
			// other icon sets, e.g. "0 0 16 16" for Bootstrap Icons,
			// "0 0 8 8" for Open Iconic.
			this.iconViewBox = options.iconViewBox || "0 0 24 24";
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
			const css = setStyle;

			if (element) {
				// Asymmetry fix (12.3.1): apply options.width to the
				// caller-provided element too, mirroring the auto-create
				// branch below. FloatingPane.config() reads
				// `this.width = getStyle(this.element, "width")` rather than
				// honoring options.width directly — so without this set,
				// the wrapper sizes to whatever computed width the host
				// element naturally has (often the body width on a
				// freshly-appended div), and the options.width passed by
				// the caller is silently dropped. Gating on `if (options.width)`
				// keeps existing consumers who only pass an element and
				// expect their element's own CSS to drive width unaffected.
				if (options.width) {
					css(element, "width", options.width);
				}
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

		// Events fired (inherited from FloatingPane): "minimized", "maximized",
		// "moved", "closed", "removed". The previous `events = ["showPrevious",
		// "showNext"]` declaration was a stale copy-paste from Lightbox; Dialog
		// has never fired those. Removed to avoid misleading consumers and to
		// stop overwriting Component's `this.events` listener dict.

		addButtons() {
			this.buttonDiv = document.createElement("div");
			this.buttonDiv.classList.add("gadgetui-dialog-buttons");

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
			// If the caller provided their own element, leave it clean (no
			// residual buttonDiv) so it can be reused after destroy. When
			// Dialog created the element itself the whole subtree is about
			// to be detached anyway — this is a no-op but safe.
			if (this.buttonDiv && this.buttonDiv.parentNode) {
				this.buttonDiv.parentNode.removeChild(this.buttonDiv);
			}
			super.destroy();
		}
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

	class ProgressBar extends Component {
		constructor(element, options = {}) {
			super();
			this.element = element;
			this.configure(options);
			this.render();
			this._observeForRemoval();
		}

		// Events fired (call .on(name, handler) to subscribe):
		//   "start"         — start() called; bar reset to 0%
		//   "updatePercent" — updatePercent(p) called; args: { percent }
		//   "update"        — update(text) called; args: { text }
		//   "removed"       — destroy() ran (manual destroy(), or
		//                     MutationObserver auto-destroy on progressbox
		//                     removal from the DOM)

		configure(options) {
			this.id = options.id;
			this.label = options.label || "";
			this.width = options.width;
			this.percent = 0;
		}

		render() {
			const css = setStyle;

			const pbDiv = document.createElement("div");
			pbDiv.setAttribute("name", `progressbox_${this.id}`);
			pbDiv.classList.add("gadgetui-progressbar-progressbox");

			const fileDiv = document.createElement("div");
			fileDiv.setAttribute("name", "label");
			fileDiv.classList.add("gadgetui-progressbar-label");
			fileDiv.innerText = ` ${this.label} `;

			// Create bar container (track background)
			const barContainer = document.createElement("div");
			barContainer.classList.add("gadgetui-progressbar-container");

			// Create progress bar fill
			const pbarDiv = document.createElement("div");
			pbarDiv.classList.add("gadget-ui-progressbar");
			pbarDiv.setAttribute("name", `progressbar_${this.id}`);

			// Create status text (overlaid on bar)
			const statusDiv = document.createElement("div");
			statusDiv.setAttribute("name", "statustxt");
			statusDiv.classList.add("gadgetui-progressbar-statustxt");
			statusDiv.innerHTML = "0%";

			// Assemble the structure
			barContainer.appendChild(pbarDiv);
			barContainer.appendChild(statusDiv);

			pbDiv.appendChild(fileDiv);
			pbDiv.appendChild(barContainer);
			this.element.appendChild(pbDiv);

			this.progressbox = this.element.querySelector(
				`div[name='progressbox_${this.id}']`,
			);
			this.progressbar = this.element.querySelector(
				`div[name='progressbar_${this.id}']`,
			);
			this.statustxt = this.element.querySelector(`div[name='statustxt']`);

			css(pbarDiv, "width", "0%");
		}

		start() {
			const css = setStyle;
			css(this.progressbar, "width", "0%");
			this.statustxt.innerHTML = "0%";
			this.fireEvent("start");
		}

		updatePercent(percent) {
			const css = setStyle;
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

		// Auto-destroy when the progressbox is detached from the DOM (e.g.
		// the consumer's view unmounts without calling destroy()). Cheap
		// safety net so the JS instance + observer don't keep the detached
		// subtree alive. Same pattern as Modal / Popover / FloatingPane.
		_observeForRemoval() {
			this._observer = new MutationObserver(() => {
				if (!document.contains(this.progressbox)) this.destroy();
			});
			this._observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		destroy() {
			if (this._destroyed) return;
			this._destroyed = true;

			if (this._observer) {
				this._observer.disconnect();
				this._observer = null;
			}
			if (this.progressbox && this.progressbox.parentNode) {
				this.progressbox.parentNode.removeChild(this.progressbox);
			}
			this.fireEvent("removed");
		}
	}

	function FileUploadWrapper(file, element, key = "") {
		const id = Id();
		const options = {
			id: id,
			key: key,
			filename: file.name,
			width: getStyle(element, "width"),
		};
		const bindings = EventBindings.getAll();

		this.file = file;
		this.id = id;
		this.key = key;
		this.progressbar = new ProgressBar(element, options);
		this.progressbar.render();

		bindings.forEach((binding) => {
			this[binding.name] = binding.func;
		});
	}

	FileUploadWrapper.prototype.events = ["uploadComplete", "uploadAborted"];

	FileUploadWrapper.prototype.completeUpload = function (fileItem) {
		const finish = () => {
			this.progressbar.destroy();
			this.fireEvent("uploadComplete", fileItem);
		};
		setTimeout(finish, 1000);
	};

	FileUploadWrapper.prototype.abortUpload = function (fileItem) {
		const aborted = () => {
			this.progressbar.destroy();
			this.fireEvent("uploadAborted", fileItem);
		};
		setTimeout(aborted, 1000);
	};

	class Lightbox extends Component {
		constructor(element, options = {}) {
			super();
			this.element = element;
			this.config(options);
			this.addControl();
			this.setImage();
			this._observeForRemoval();
		}

		// Events fired (call .on(name, handler) to subscribe):
		//   "showPrevious" — prevImage() called; args: { currentIndex }
		//   "showNext"     — nextImage() called; args: { currentIndex }
		//   "removed"      — destroy() ran (manual destroy(), or
		//                    MutationObserver auto-destroy on element removal)
		// (Previous `events = ["showPrevious","showNext","close","destroy"]`
		//  class field overwrote Component's `this.events` listener dict
		//  with an array; "close" and "destroy" were never fired anyway —
		//  destroy now fires "removed" to match the pattern across components.)

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
			// Coordinate space of the referenced icon symbol (for iconType
			// "svg"). Default matches feather-icons. Override for other
			// icon sets — see FloatingPane.config() for examples.
			this.iconViewBox = options.iconViewBox || "0 0 24 24";
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
			this.spanPrevious.innerHTML = buildIconMarkup({
				type: this.iconType,
				iconClass: this.iconClass,
				url: this.leftIcon,
				viewBox: this.iconViewBox,
				alt: "Previous",
			});
			this.spanNext.innerHTML = buildIconMarkup({
				type: this.iconType,
				iconClass: this.iconClass,
				url: this.rightIcon,
				viewBox: this.iconViewBox,
				alt: "Next",
			});

			this.element.appendChild(this.spanPrevious);
			this.element.appendChild(this.imageContainer);
			this.element.appendChild(this.spanNext);

			// Store each click handler as an instance prop so destroy() can
			// removeEventListener with the same reference. Previously the
			// `destroy()` calls passed fresh arrow functions, which never
			// matched the originally-bound ones — listeners actually leaked
			// every time. This is the real bug fix in the Lightbox pass.
			this._onPrevClick = () => this.prevImage();
			this.spanPrevious.addEventListener("click", this._onPrevClick);
			this._onNextClick = () => this.nextImage();
			this.spanNext.addEventListener("click", this._onNextClick);

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

				this._onContainerClick = () => {
					this.setModalImage();
					this.element.classList.add("gadgetui-hidden");
					this.modal.classList.remove("gadgetui-hidden");
					this.stopAnimation();
				};
				this.imageContainer.addEventListener("click", this._onContainerClick);

				this._onModalClick = () => {
					this.modal.classList.add("gadgetui-hidden");
					this.element.classList.remove("gadgetui-hidden");
					this.animate();
				};
				this.modal.addEventListener("click", this._onModalClick);
			}
		}

		// Auto-destroy when the lightbox element leaves the DOM (e.g. the
		// consumer's view unmounts). Without this, the modal portaled to
		// document.body would orphan plus the setInterval from animate()
		// would keep firing. Same pattern as Modal / Popover / FloatingPane.
		_observeForRemoval() {
			this._observer = new MutationObserver(() => {
				if (!document.contains(this.element)) this.destroy();
			});
			this._observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
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

		destroy() {
			if (this._destroyed) return;
			this._destroyed = true;

			if (this._observer) {
				this._observer.disconnect();
				this._observer = null;
			}

			// Stop the slideshow interval before tearing down listeners so
			// it can't fire one more nextImage() into a half-destroyed view.
			this.stopAnimation();

			// Remove listeners using the cached refs so removeEventListener
			// actually matches what was bound (the prior version passed
			// fresh arrows here — silent no-ops).
			if (this._onPrevClick) {
				this.spanPrevious.removeEventListener("click", this._onPrevClick);
			}
			if (this._onNextClick) {
				this.spanNext.removeEventListener("click", this._onNextClick);
			}
			if (this._onContainerClick) {
				this.imageContainer.removeEventListener(
					"click",
					this._onContainerClick,
				);
			}
			if (this._onModalClick && this.modal) {
				this.modal.removeEventListener("click", this._onModalClick);
			}

			if (this.element.parentNode) {
				this.element.parentNode.removeChild(this.element);
			}
			if (this.modal && this.modal.parentNode) {
				this.modal.parentNode.removeChild(this.modal);
			}

			this.fireEvent("removed");
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

	  regenerate(data = null) {
	    // Remove existing menu elements
	    this.destroy();

	    // If data is provided, use it; otherwise, if datasource exists, call it
	    if (data !== null) {
	      this.data = data;
	      this.addControl();
	      this.addBindings();
	    } else if (this.datasource) {
	      this.retrieveData();
	    } else {
	      // No new data and no datasource - do nothing
	      return;
	    }
	  }

	  addControl() {
	    const processItem = (item, parent) => {
	      const element = document.createElement("div");
	      element.classList.add("gadget-ui-menu-item");
	      element.innerText = item.label || "";
	      if (item.dataId?.length) {
	        element.setAttribute("data-id", item.dataId);
	      }

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
	        element.addEventListener("click", (evt) => {
	          this.fireEvent("clicked", item);
	          this.close();

	          typeof item.link === "function"
	            ? item.link(evt)
	            : window.open(item.link);
	        });
	      }

	      if (item.menuItem) {
	        element.appendChild(processMenuItem(item.menuItem));
	      }
	      return element;
	    };

	    const processMenuItem = (menuItemData, parent) => {
	      const element = document.createElement("div");
	      element.classList.add("gadget-ui-menu-menuItem");
	      menuItemData.items.forEach((item) =>
	        element.appendChild(processItem(item)),
	      );
	      return element;
	    };

	    const generateMenu = (menuData) => {
	      const menuEl = document.createElement("div");
	      menuEl.classList.add("gadget-ui-menu");
	      menuEl.innerText = menuData.label || "";

	      if (menuData.image?.length) {
	        const imgEl = document.createElement("img");
	        imgEl.src = menuData.image;
	        imgEl.classList.add("gadget-ui-menu-icon");
	        menuEl.appendChild(imgEl);
	      }

	      const dropdownEl = processMenuItem(menuData.menuItem);

	      if (this.portal) {
	        // Top-level dropdown moves to body; nested submenus stay inside it
	        // (they don't have the stacking problem once the root is out).
	        if (this.dropdownClass) dropdownEl.classList.add(this.dropdownClass);
	        dropdownEl.classList.add("gadget-ui-menu-portaled");
	        document.body.appendChild(dropdownEl);
	        this.portaledDropdowns.push(dropdownEl);
	        menuEl._dropdownEl = dropdownEl;
	      } else {
	        menuEl.appendChild(dropdownEl);
	      }
	      return menuEl;
	    };

	    this.data.forEach((menu) => {
	      const element = generateMenu(menu);
	      this.element.appendChild(element);
	      this.elements.push(element);
	    });

	    if (this.portal) this._observeAnchor();
	  }

	  addBindings() {
	    const menus = this.element.querySelectorAll(".gadget-ui-menu");
	    const isTouchDevice =
	      "ontouchstart" in window || navigator.maxTouchPoints > 0;
	    const activateEvent =
	      this.options.menuActivate || (isTouchDevice ? "click" : "mouseenter");

	    document.addEventListener("click", (evt) => {
	      if (this.element.contains(evt.target)) return;
	      if (this.portaledDropdowns.some((d) => d.contains(evt.target))) return;
	      this.close();
	    });

	    // Track the last clicked item for position updates
	    let lastClickedItem = null;

	    menus.forEach((mu) => {
	      const menuItem = this._dropdownFor(mu);
	      const items = menuItem.querySelectorAll(".gadget-ui-menu-item");
	      const menuItems = menuItem.querySelectorAll(".gadget-ui-menu-menuItem");

	      items.forEach((item) => {
	        const mItem = item.querySelector(".gadget-ui-menu-menuItem");

	        item.addEventListener(activateEvent, (evt) => {
	          evt.stopPropagation();
	          if (mItem) {
	            mItem.classList.add("gadget-ui-menu-hovering");
	            this._alignTopToTrigger(mItem, item);
	            lastClickedItem = item;
	          }
	          item.classList.add("gadget-ui-menu-selected");
	          Array.from(item.parentNode.children).forEach((child) => {
	            if (child !== item)
	              child.classList.remove("gadget-ui-menu-selected");
	          });
	          evt.preventDefault();
	        });

	        if (activateEvent === "mouseenter") {
	          item.addEventListener("mouseleave", (evt) => {
	            evt.stopPropagation();
	            if (mItem) mItem.classList.remove("gadget-ui-menu-hovering");
	          });
	        }
	      });

	      mu.addEventListener(activateEvent, (evt) => {
	        evt.stopPropagation();
	        // Toggle menu on click
	        if (
	          activateEvent === "click" &&
	          menuItem.classList.contains("gadget-ui-menu-hovering")
	        ) {
	          menuItem.classList.remove("gadget-ui-menu-hovering");
	          this.fireEvent("menuClosed", this);
	        } else {
	          // Add the hovering class before positioning so _positionPortaled
	          // can measure the dropdown for right-align mode (offsetWidth is 0
	          // on display:none). Browser doesn't paint between sync ops, so no
	          // visible flash at the pre-position location.
	          menuItem.classList.add("gadget-ui-menu-hovering");
	          if (this.portal) this._positionPortaled(mu, menuItem);
	          this.fireEvent("menuOpened", this);
	        }
	      });

	      if (activateEvent === "mouseenter") {
	        if (this.portal) {
	          // The portaled dropdown is on document.body, not a descendant of
	          // the toggle, so mouseleave fires as soon as the cursor crosses
	          // the gap between them. Grace timer + bridge handlers on the
	          // dropdown let the cursor traverse without losing the menu.
	          let closeTimer = null;
	          const scheduleClose = () => {
	            clearTimeout(closeTimer);
	            closeTimer = setTimeout(() => {
	              menuItem.classList.remove("gadget-ui-menu-hovering");
	              this.fireEvent("menuClosed", this);
	            }, 150);
	          };
	          const cancelClose = () => {
	            clearTimeout(closeTimer);
	            closeTimer = null;
	          };
	          mu.addEventListener("mouseleave", (evt) => {
	            evt.stopPropagation();
	            scheduleClose();
	          });
	          mu.addEventListener("mouseenter", cancelClose);
	          menuItem.addEventListener("mouseenter", cancelClose);
	          menuItem.addEventListener("mouseleave", (evt) => {
	            evt.stopPropagation();
	            scheduleClose();
	          });
	        } else {
	          mu.addEventListener("mouseleave", (evt) => {
	            evt.stopPropagation();
	            menuItem.classList.remove("gadget-ui-menu-hovering");
	            this.fireEvent("menuClosed", this);
	          });
	        }
	      }

	      menuItems.forEach((mItem) => {
	        mItem.addEventListener(activateEvent, (evt) => {
	          evt.stopPropagation();
	          mItem.classList.add("gadget-ui-menu-hovering");
	        });
	        if (activateEvent === "mouseenter") {
	          mItem.addEventListener("mouseleave", (evt) => {
	            evt.stopPropagation();
	            if (!mItem.parentNode.classList.contains("selected")) {
	              mItem.classList.remove("gadget-ui-menu-hovering");
	            }
	          });
	        }
	      });
	    });

	    // Reposition open dropdowns to follow their triggers on scroll. Capture
	    // phase so we receive scroll events from nested scrollable containers
	    // (those don't bubble to window). Both portaled top-level dropdowns and
	    // any open submenu need updating.
	    window.addEventListener(
	      "scroll",
	      () => {
	        if (this.portal) {
	          this.elements.forEach((mu) => {
	            const dd = this._dropdownFor(mu);
	            if (dd && dd.classList.contains("gadget-ui-menu-hovering")) {
	              this._positionPortaled(mu, dd);
	            }
	          });
	        }
	        if (lastClickedItem) {
	          const submenu = lastClickedItem.querySelector(
	            ":scope > .gadget-ui-menu-menuItem",
	          );
	          if (
	            submenu &&
	            submenu.classList.contains("gadget-ui-menu-hovering")
	          ) {
	            this._alignTopToTrigger(submenu, lastClickedItem);
	          }
	        }
	      },
	      { passive: true, capture: true },
	    );
	  }

	  close() {
	    this.elements.forEach((menu) => {
	      const menuItem = this._dropdownFor(menu);
	      if (menuItem) {
	        menuItem.classList.remove("gadget-ui-menu-hovering");
	        this.fireEvent("menuClosed", this);
	      }
	    });
	  }

	  destroy() {
	    this.element.querySelectorAll(".gadget-ui-menu").forEach((menu) => {
	      this.element.removeChild(menu);
	    });
	    this.portaledDropdowns.forEach((d) => d.remove());
	    this.portaledDropdowns = [];
	    if (this.observer) {
	      this.observer.disconnect();
	      this.observer = null;
	    }
	    this.elements = [];
	    this.fireEvent("menuRemoved", this);
	  }

	  config(options) {
	    this.datasource = options.datasource;
	    this.data = options.data || [];
	    this.options = options;
	    // Portal mode: render the dropdown(s) on document.body instead of
	    // nested inside the anchor. Avoids stacking-context and overflow-clip
	    // problems caused by ancestors. Default off — opt-in to preserve
	    // existing consumer DOM and CSS expectations.
	    this.portal = !!options.portal;
	    this.dropdownClass = options.dropdownClass || "";
	    // Horizontal alignment of portaled dropdowns relative to the trigger.
	    // "left" (default) puts the dropdown's left edge at the trigger's left;
	    // "right" puts the dropdown's right edge at the trigger's right (useful
	    // when the trigger sits near the right side of a panel and a left-aligned
	    // dropdown would overflow into adjacent UI).
	    this.dropdownAlign = options.dropdownAlign === "right" ? "right" : "left";
	    this.portaledDropdowns = [];
	    this.observer = null;
	  }

	  // Find the dropdown element associated with a top-level toggle, regardless
	  // of whether it lives inside the toggle or on document.body.
	  _dropdownFor(menuToggle) {
	    return this.portal
	      ? menuToggle._dropdownEl
	      : menuToggle.querySelector(".gadget-ui-menu-menuItem");
	  }

	  // Position a portaled dropdown to its trigger's bounding rect. position:fixed
	  // is set inline so the dropdown follows the trigger across scroll without
	  // requiring CSS coordination from the consumer. dropdownAlign controls
	  // which edge anchors to which: "left" aligns left-to-left (default),
	  // "right" aligns right-to-right and requires the dropdown to be visible
	  // (display:block) for offsetWidth to be measurable — the open handler
	  // adds the hovering class before calling this.
	  _positionPortaled(menuToggle, dropdownEl) {
	    const rect = menuToggle.getBoundingClientRect();
	    dropdownEl.style.position = "fixed";
	    dropdownEl.style.top = rect.bottom + "px";
	    if (this.dropdownAlign === "right") {
	      dropdownEl.style.left = rect.right - dropdownEl.offsetWidth + "px";
	    } else {
	      dropdownEl.style.left = rect.left + "px";
	    }
	  }

	  // Position an absolutely-positioned target so its first menu item visually
	  // aligns with the trigger. Four things to handle:
	  //   1. style.top is interpreted relative to the offsetParent's padding
	  //      edge, not the viewport — subtract the offsetParent's viewport top
	  //      to convert.
	  //   2. getBoundingClientRect returns the border edge, not the padding edge,
	  //      so further subtract the offsetParent's border-top width (clientTop).
	  //      Without this, each level of nesting drifts down by one border width.
	  //   3. The target's border + first-child padding push the first item below
	  //      the target's outer top by some pixels. Compensate so the first item
	  //      lines up with the trigger rather than the outer border. Without this,
	  //      every level of nesting compounds the offset and submenus stagger.
	  //   4. The CSS rule `.gadget-ui-menu-item > .gadget-ui-menu-menuItem` sets
	  //      `margin-top: -1.3em`, intended as a layout hint for the original
	  //      static positioning. Now that JS owns the position, neutralize the
	  //      margin so it doesn't fight us.
	  _alignTopToTrigger(target, trigger) {
	    target.style.marginTop = "0";
	    const triggerRect = trigger.getBoundingClientRect();
	    const targetRect = target.getBoundingClientRect();
	    const first = target.firstElementChild;
	    const firstChildOffset = first
	      ? first.getBoundingClientRect().top - targetRect.top
	      : 0;
	    const op = target.offsetParent;
	    const opTop = op ? op.getBoundingClientRect().top : 0;
	    const opBorderTop = op ? op.clientTop : 0;
	    target.style.top =
	      triggerRect.top - opTop - opBorderTop - firstChildOffset + "px";
	  }

	  // In portal mode, the dropdown outlives the anchor's normal DOM lifecycle.
	  // Watch for the anchor leaving the DOM (e.g. parent re-render in a
	  // framework-driven UI) and self-destruct so portaled dropdowns and listeners
	  // don't leak.
	  _observeAnchor() {
	    this.observer = new MutationObserver(() => {
	      if (!document.contains(this.element)) this.destroy();
	    });
	    this.observer.observe(document.body, { childList: true, subtree: true });
	  }
	}

	class Modal extends Component {
		constructor(element, options = {}) {
			super();
			this.element = element;
			this.config(options);
			this.addControl();
			this.addBindings();
			this._observeForRemoval();

			if (this.autoOpen) {
				this.open();
			}
		}

		// Events fired (call .on(name, handler) to subscribe):
		//   "opened"  — open() was called (or autoOpen at construction)
		//   "closed"  — close() was called
		//   "removed" — destroy() ran (manual destroy() or MutationObserver
		//               auto-destroy on wrapper / original-parent removal)
		// (Previous `events = ["opened","closed"]` class field overwrote
		//  Component's `this.events` listener dict with an array — removed.)

		addControl() {
			this.wrapper = document.createElement("div");
			if (this.class) {
				this.wrapper.classList.add(this.class);
			}
			this.wrapper.classList.add("gadgetui-modal");

			// Remember the element's original location so destroy() can put
			// it (sans injected close button) back where it came from.
			this._originalParent = this.element.parentNode;
			this._originalNextSibling = this.element.nextSibling;

			// portal: true mounts the wrapper on document.body so the modal
			// escapes any transformed / `overflow:hidden` ancestor that would
			// otherwise constrain its `position:fixed` containing block or
			// clip its visual coverage. Element is moved into the wrapper
			// either way; the difference is where the wrapper lives.
			if (this.portal) {
				document.body.appendChild(this.wrapper);
			} else {
				this.element.parentNode.insertBefore(this.wrapper, this.element);
			}
			this.element.parentNode.removeChild(this.element);
			this.wrapper.appendChild(this.element);

			const icon = buildIconMarkup$1({
				type: this.iconType,
				iconClass: this.iconClass,
				url: this.closeIcon,
				viewBox: this.iconViewBox,
			});

			this.element.classList.add("gadgetui-modalWindow");
			this.element.innerHTML = `
    <span name="close" class="gadgetui-right-align">
      <a name="close">${icon}</a>
    </span>
    ${this.element.innerHTML}
  `.trim();
		}

		addBindings() {
			// Cache the close click handler so destroy() can remove it
			// symmetrically. An inline arrow listener (the previous pattern)
			// can't be removed later because each call creates a fresh ref.
			const close = this.element.querySelector('a[name="close"]');
			this._onCloseClick = (event) => {
				event.stopPropagation();
				event.preventDefault();
				this.close();
			};
			close.addEventListener("click", this._onCloseClick);
		}

		// Auto-destroy when either the wrapper or the element's original
		// parent leaves the DOM — covers framework re-renders that rip the
		// modal (non-portal) or its controlling view (portal) without going
		// through close(). Matches the Menu v12.2.4 / FloatingPane pattern.
		_observeForRemoval() {
			this._observer = new MutationObserver(() => {
				const wrapperGone = !document.contains(this.wrapper);
				const anchorGone =
					this._originalParent &&
					!document.contains(this._originalParent);
				if (wrapperGone || anchorGone) this.destroy();
			});
			this._observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
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
			if (this._destroyed) return;
			this._destroyed = true;

			if (this._observer) {
				this._observer.disconnect();
				this._observer = null;
			}

			const closeAnchor = this.element.querySelector('a[name="close"]');
			if (closeAnchor && this._onCloseClick) {
				closeAnchor.removeEventListener("click", this._onCloseClick);
			}

			// Pull element out of the wrapper, strip the injected close
			// button so the consumer's element is clean, then put it back in
			// its original DOM location. If the original parent has since
			// been removed (framework re-render → MutationObserver triggered
			// us), the element ends up orphaned in the detached parent —
			// that's the consumer's reference to manage.
			if (this.element.parentNode) {
				this.element.parentNode.removeChild(this.element);
			}
			const closeSpan = this.element.querySelector(".gadgetui-right-align");
			if (closeSpan) this.element.removeChild(closeSpan);
			if (this._originalParent) {
				if (this._originalNextSibling) {
					this._originalParent.insertBefore(
						this.element,
						this._originalNextSibling,
					);
				} else {
					this._originalParent.appendChild(this.element);
				}
			}
			if (this.wrapper && this.wrapper.parentNode) {
				this.wrapper.parentNode.removeChild(this.wrapper);
			}

			this.fireEvent("removed");
		}

		config(options) {
			this.class = options.class || false;
			this.iconClass = options.iconClass || "feather";
			this.closeIcon =
				options.closeIcon ||
				"/node_modules/feather-icons/dist/icons/x-circle.svg";
			this.autoOpen = options.autoOpen !== false; // Default to true unless explicitly false
			this.iconType = options.iconType || "img";
			// Coordinate space of the referenced icon symbol (for iconType
			// "svg"). Default matches feather-icons. Override for other
			// icon sets — see FloatingPane.config() for examples.
			this.iconViewBox = options.iconViewBox || "0 0 24 24";
			this.portal = options.portal === true;
		}
	}

	class Overlay extends Component {
		constructor(element, options = {}) {
			super();
			this.element = element;
			this.config(options);
			this.addControl();
			this.addBindings();
			this._observeForRemoval();

			// Show overlay by default after initialization
			if (this.autoShow) {
				this.show();
			}
		}

		// Events fired (call .on(name, handler) to subscribe):
		//   "shown"          — show() called
		//   "hidden"         — hide() called
		//   "contentChanged" — setContent() called; args: { content }
		//   "click"          — overlay clicked (only when !clickThrough);
		//                      args: { originalEvent }
		//   "mouseenter"     — args: { originalEvent }
		//   "mouseleave"     — args: { originalEvent }
		//   "removed"        — destroy() ran (manual destroy(), or
		//                      MutationObserver auto-destroy on anchor removal)
		// (Previous `events = ["shown","hidden","destroyed","contentChanged"]`
		//  class field overwrote Component's `this.events` listener dict AND
		//  was out of sync with what's actually fired — removed. "destroyed"
		//  renamed to "removed" to match the pattern across components.)

		config(options = {}) {
			// Track whether the consumer explicitly passed a backgroundColor.
			// When they didn't, we leave the inline `background-color` off
			// entirely so the CSS rule's `var(--gadget-ui-overlay-bg)` can
			// drive it — that's what makes the new token themeable without
			// requiring `!important` from consumer CSS.
			this.backgroundColor = options.backgroundColor;
			this.class = options.class || false;
			this.autoShow = options.autoShow !== false;
			this.clickThrough = options.clickThrough || false;
			this.zIndexOffset = options.zIndexOffset || 1;
			this.content = options.content || "";
			this.size = options.size || null;
			this.position = options.position || null; // 'top', 'left', 'right', 'bottom', or null
			// portal: true mounts the overlay on document.body instead of
			// the anchor's parent. Escapes any `overflow:hidden` /
			// stacking-context / transformed-ancestor problem the consumer's
			// view tree imposes. Position/size still track the anchor via
			// ResizeObserver + scroll listener.
			this.portal = options.portal === true;
		}

		addControl() {
			const rect = this.element.getBoundingClientRect();

			this.overlayElement = document.createElement("div");
			this.overlayElement.classList.add("gadgetui-overlay");

			if (this.class) {
				this.overlayElement.classList.add(this.class);
			}

			const { width, height, top, left } = this.calculateSizeAndPosition(rect);

			const s = this.overlayElement.style;
			s.setProperty("position", "absolute", "important");
			s.setProperty("top", `${top}px`, "important");
			s.setProperty("left", `${left}px`, "important");
			s.setProperty("width", `${width}px`, "important");
			s.setProperty("height", `${height}px`, "important");
			// Only set background-color inline when the consumer explicitly
			// passed it — otherwise let the CSS rule's
			// `var(--gadget-ui-overlay-bg)` take over. Inline beats class
			// without `!important`, so doing this unconditionally would
			// prevent themers from overriding the default.
			if (this.backgroundColor !== undefined) {
				s.setProperty("background-color", this.backgroundColor);
			}
			s.setProperty("z-index", String(this.getMaxZIndex() + this.zIndexOffset));
			s.setProperty("pointer-events", this.clickThrough ? "none" : "auto");

			if (!this.autoShow) {
				this.overlayElement.classList.add("gadgetui-hidden");
			}

			if (this.content) {
				this.overlayElement.innerHTML = this.content;
			}

			if (this.portal) {
				document.body.appendChild(this.overlayElement);
			} else {
				this.element.parentNode.appendChild(this.overlayElement);
			}

			this.lastRect = rect;
			this.setupResizeObserver();
			this.setupScrollListener();
		}

		setupResizeObserver() {
			if (typeof ResizeObserver !== "undefined") {
				this.resizeObserver = new ResizeObserver((entries) => {
					for (const entry of entries) {
						const rect = entry.target.getBoundingClientRect();
						this.updateOverlayPosition(rect);
					}
				});
				this.resizeObserver.observe(this.element);
			}
		}

		setupScrollListener() {
			this.scrollHandler = () => {
				const rect = this.element.getBoundingClientRect();
				this.updateOverlayPosition(rect);
			};
			window.addEventListener("scroll", this.scrollHandler, true);
		}

		updateOverlayPosition(rect) {
			if (!this.overlayElement) return;

			// Only update if position or size actually changed
			if (
				rect.top !== this.lastRect.top ||
				rect.left !== this.lastRect.left ||
				rect.width !== this.lastRect.width ||
				rect.height !== this.lastRect.height
			) {
				const { width, height, top, left } = this.calculateSizeAndPosition(rect);

				const s = this.overlayElement.style;
				s.setProperty("top", `${top}px`, "important");
				s.setProperty("left", `${left}px`, "important");
				s.setProperty("width", `${width}px`, "important");
				s.setProperty("height", `${height}px`, "important");

				this.lastRect = { ...rect }; // shallow copy
			}
		}

		getMaxZIndex() {
			let max = 0;
			const all = document.querySelectorAll("*");
			for (const el of all) {
				const z = parseInt(window.getComputedStyle(el).zIndex, 10);
				if (!isNaN(z) && z > max) max = z;
			}
			return max;
		}

		addBindings() {
			if (!this.overlayElement) return;

			// Cache each listener as an instance prop so destroy() can
			// removeEventListener with the same reference. (When portaled to
			// body, the overlay can outlive the anchor's normal DOM
			// lifecycle, so symmetric cleanup matters more than in the
			// non-portal case where the listeners would die with the DOM.)
			if (!this.clickThrough) {
				this._onClick = (e) => {
					this.fireEvent("click", { originalEvent: e });
				};
				this.overlayElement.addEventListener("click", this._onClick);
			}

			this._onMouseEnter = (e) => {
				this.fireEvent("mouseenter", { originalEvent: e });
			};
			this.overlayElement.addEventListener("mouseenter", this._onMouseEnter);

			this._onMouseLeave = (e) => {
				this.fireEvent("mouseleave", { originalEvent: e });
			};
			this.overlayElement.addEventListener("mouseleave", this._onMouseLeave);
		}

		// Auto-destroy when the anchor leaves the DOM. Important: under
		// portal mode the overlay lives on document.body, so it would
		// otherwise outlive its anchor when a framework re-renders the
		// consumer's view. Even without portal, the anchor's removal is
		// what should trigger cleanup (the overlay tracks the anchor's
		// rect, not its own). Same pattern as the other components.
		_observeForRemoval() {
			this._observer = new MutationObserver(() => {
				if (!document.contains(this.element)) this.destroy();
			});
			this._observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		show() {
			if (this.overlayElement) {
				this.overlayElement.classList.remove("gadgetui-hidden");
				this.fireEvent("shown");
			}
		}

		hide() {
			if (this.overlayElement) {
				this.overlayElement.classList.add("gadgetui-hidden");
				this.fireEvent("hidden");
			}
		}

		destroy() {
			if (this._destroyed) return;
			this._destroyed = true;

			if (this._observer) {
				this._observer.disconnect();
				this._observer = null;
			}
			if (this.resizeObserver) {
				this.resizeObserver.disconnect();
			}
			if (this.scrollHandler) {
				window.removeEventListener("scroll", this.scrollHandler, true);
			}
			if (this.overlayElement) {
				if (this._onClick) {
					this.overlayElement.removeEventListener("click", this._onClick);
				}
				if (this._onMouseEnter) {
					this.overlayElement.removeEventListener(
						"mouseenter",
						this._onMouseEnter,
					);
				}
				if (this._onMouseLeave) {
					this.overlayElement.removeEventListener(
						"mouseleave",
						this._onMouseLeave,
					);
				}
				if (this.overlayElement.parentNode) {
					this.overlayElement.parentNode.removeChild(this.overlayElement);
				}
			}

			this.overlayElement = null;
			this.lastRect = null;
			this.resizeObserver = null;
			this.scrollHandler = null;

			this.fireEvent("removed");
		}

		isVisible() {
			return (
				!!this.overlayElement &&
				!this.overlayElement.classList.contains("gadgetui-hidden")
			);
		}

		calculateSizeAndPosition(rect) {
			const scrollTop = window.scrollY;
			const scrollLeft = window.scrollX;

			const elementTop = rect.top + scrollTop;
			const elementLeft = rect.left + scrollLeft;
			rect.bottom + scrollTop;
			rect.right + scrollLeft;

			// ── Step 1: Determine base region and full-dimension constraints ──
			let baseWidth, baseHeight, baseTop, baseLeft;

			if (!this.position) {
				// Full overlay
				baseWidth = rect.width;
				baseHeight = rect.height;
				baseTop = elementTop;
				baseLeft = elementLeft;
			} else {
				switch (this.position.toLowerCase()) {
					case "top":
						baseWidth = rect.width; // always full width
						baseHeight = rect.height / 2; // default: top half
						baseTop = elementTop;
						baseLeft = elementLeft;
						break;

					case "bottom":
						baseWidth = rect.width; // always full width
						baseHeight = rect.height / 2; // default: bottom half
						baseTop = elementTop + rect.height / 2;
						baseLeft = elementLeft;
						break;

					case "left":
						baseWidth = rect.width / 2; // default: left half
						baseHeight = rect.height; // always full height
						baseTop = elementTop;
						baseLeft = elementLeft;
						break;

					case "right":
						baseWidth = rect.width / 2; // default: right half
						baseHeight = rect.height; // always full height
						baseTop = elementTop;
						baseLeft = elementLeft + rect.width / 2;
						break;

					default:
						// fallback to full
						baseWidth = rect.width;
						baseHeight = rect.height;
						baseTop = elementTop;
						baseLeft = elementLeft;
				}
			}

			// ── Step 2: Apply custom size ─────────────────────────────────────
			let finalWidth = baseWidth;
			let finalHeight = baseHeight;

			if (this.size) {
				if (
					typeof this.size === "object" &&
					this.size.width !== undefined &&
					this.size.height !== undefined
				) {
					// User provided both dimensions → use them directly (overrides full-width/height rule)
					finalWidth = this.parseSizeValue(this.size.width, rect.width);
					finalHeight = this.parseSizeValue(this.size.height, rect.height);
				} else {
					// Single value or partial spec → apply to the "variable" dimension
					const sizeVal = this.parseSizeValue(
						this.size,
						Math.min(baseWidth, baseHeight),
					);

					if (this.position === "top" || this.position === "bottom") {
						// For top/bottom → size affects height, width stays full
						finalHeight = sizeVal;
						finalWidth = rect.width;
					} else if (this.position === "left" || this.position === "right") {
						// For left/right → size affects width, height stays full
						finalWidth = sizeVal;
						finalHeight = rect.height;
					} else {
						// fallback: square
						finalWidth = finalHeight = sizeVal;
					}
				}
			}

			// ── Step 3: Center the overlay inside the base region ─────────────
			const top = baseTop + (baseHeight - finalHeight) / 2;
			const left = baseLeft + (baseWidth - finalWidth) / 2;

			return { width: finalWidth, height: finalHeight, top, left };
		}

		parseSizeValue(value, referenceSize) {
			if (typeof value === "string" && value.endsWith("%")) {
				const pct = parseFloat(value) / 100;
				return referenceSize * pct;
			}
			if (typeof value === "number") {
				return value;
			}
			if (typeof value === "string") {
				// Try to parse "120px", "3em", etc.
				const num = parseFloat(value);
				return isNaN(num) ? referenceSize : num;
			}
			return referenceSize; // safest fallback
		}

		updateStyle(styles) {
			if (this.overlayElement) {
				Object.assign(this.overlayElement.style, styles);
			}
		}

		setContent(htmlContent) {
			this.content = htmlContent;
			if (this.overlayElement) {
				this.overlayElement.innerHTML = this.content;
				this.fireEvent("contentChanged", { content: this.content });
			}
		}

		getContent() {
			return this.content;
		}

		updateSizeAndPosition(size, position) {
			this.size = size;
			this.position = position;

			if (this.overlayElement) {
				const rect = this.element.getBoundingClientRect();
				const pos = this.calculateSizeAndPosition(rect);
				const s = this.overlayElement.style;
				s.setProperty("top", `${pos.top}px`, "important");
				s.setProperty("left", `${pos.left}px`, "important");
				s.setProperty("width", `${pos.width}px`, "important");
				s.setProperty("height", `${pos.height}px`, "important");
			}
		}
	}

	class Popover extends Component {
		constructor(element, options = {}) {
			super();
			this.element = element;
			this.config(options);
			this.addControl();
			this.addBindings();
			this._observeForRemoval();

			if (this.autoOpen) {
				this.open();
			}
		}

		// Events fired (call .on(name, handler) to subscribe):
		//   "opened"  — open() was called (or autoOpen at construction)
		//   "closed"  — close() was called
		//   "removed" — destroy() ran (manual destroy(), or MutationObserver
		//               auto-destroy on element / anchor removal)
		// (Previous `events = ["opened","closed"]` class field overwrote
		//  Component's `this.events` listener dict with an array — removed.)

		addControl() {
			if (this.class) {
				this.element.classList.add(this.class);
			}
			this.element.classList.add("gadgetui-popover");

			// Track the element's original DOM location so portal-mode
			// destroy can return it to where the consumer put it.
			this._originalParent = this.element.parentNode;
			this._originalNextSibling = this.element.nextSibling;

			// portal: true detaches the element from its current parent and
			// mounts it on document.body. Escapes any `overflow:hidden` /
			// stacking-context / transformed-ancestor problem the consumer's
			// view tree imposes. Without portal, the element stays where the
			// consumer placed it.
			if (this.portal && this.element.parentNode) {
				this.element.parentNode.removeChild(this.element);
				document.body.appendChild(this.element);
			}
		}

		addBindings() {
			// Only need scroll/resize repositioning when we're driving
			// position from an anchor's rect. The no-anchor default uses
			// static CSS (top:100px; left:50%) which doesn't care about
			// viewport changes.
			if (!this.anchor) return;

			// Capture phase so we catch scrolls from nested scrollable
			// containers (those don't bubble to window). Matches Menu's
			// pattern for portaled dropdowns.
			this._onScroll = () => this._positionRelativeToAnchor();
			window.addEventListener("scroll", this._onScroll, {
				passive: true,
				capture: true,
			});
			this._onResize = () => this._positionRelativeToAnchor();
			window.addEventListener("resize", this._onResize, { passive: true });
		}

		// Auto-destroy when either the popover element or the anchor leaves
		// the DOM (e.g. framework re-render of the controlling view). Same
		// pattern as Modal / FloatingPane.
		_observeForRemoval() {
			this._observer = new MutationObserver(() => {
				const elGone = !document.contains(this.element);
				const anchorGone = this.anchor && !document.contains(this.anchor);
				if (elGone || anchorGone) this.destroy();
			});
			this._observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		// Position the popover relative to its anchor's viewport rect.
		// Overrides the CSS defaults (position:absolute; top:100px; left:50%;
		// transform:translateX(-5%)) via inline styles. Requires the popover
		// to be visible — offsetWidth/Height are 0 while visibility:hidden,
		// so open() calls this after applying the .gadgetui-showPopover class.
		_positionRelativeToAnchor() {
			if (!this.anchor) return;
			const rect = this.anchor.getBoundingClientRect();
			const el = this.element;
			el.style.position = "fixed";
			el.style.transform = "none";
			if (this.placement === "top") {
				el.style.top = rect.top - el.offsetHeight + "px";
			} else {
				el.style.top = rect.bottom + "px";
			}
			if (this.align === "right") {
				el.style.left = rect.right - el.offsetWidth + "px";
			} else if (this.align === "center") {
				el.style.left =
					rect.left + (rect.width - el.offsetWidth) / 2 + "px";
			} else {
				el.style.left = rect.left + "px";
			}
		}

		open() {
			this.element.classList.add("gadgetui-showPopover");
			// Position after the show-class flips visibility, so
			// offsetWidth/Height are measurable.
			if (this.anchor) this._positionRelativeToAnchor();
			this.fireEvent("opened");
		}

		close() {
			this.element.classList.remove("gadgetui-showPopover");
			this.fireEvent("closed");
		}

		destroy() {
			if (this._destroyed) return;
			this._destroyed = true;

			if (this._observer) {
				this._observer.disconnect();
				this._observer = null;
			}
			if (this._onScroll) {
				window.removeEventListener("scroll", this._onScroll, {
					capture: true,
				});
				this._onScroll = null;
			}
			if (this._onResize) {
				window.removeEventListener("resize", this._onResize);
				this._onResize = null;
			}

			if (this.element && this.element.parentNode) {
				this.element.parentNode.removeChild(this.element);
			}
			// Return the element to its original DOM location for consumer
			// reuse (only meaningful in portal mode — without portal, the
			// element was never moved). If the original parent has since
			// been removed (framework re-render → MutationObserver triggered
			// us), the element ends up orphaned in that detached parent.
			if (this.portal && this._originalParent) {
				if (this._originalNextSibling) {
					this._originalParent.insertBefore(
						this.element,
						this._originalNextSibling,
					);
				} else {
					this._originalParent.appendChild(this.element);
				}
			}

			this.fireEvent("removed");
		}

		config(options) {
			this.class = options.class || false;
			this.autoOpen = options.autoOpen !== false; // Default to true unless explicitly false
			// Optional anchor-relative positioning. Without `anchor`, the
			// popover uses the CSS placeholder defaults (top:100px etc.) for
			// back-compat with pre-12.3.0 callers.
			this.anchor = options.anchor || null;
			this.placement = options.placement === "top" ? "top" : "bottom";
			this.align = ["left", "right", "center"].includes(options.align)
				? options.align
				: "left";
			this.portal = options.portal === true;
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
			this._observeForRemoval();
		}

		// Events fired (call .on(name, handler) to subscribe):
		//   "minimized" / "maximized" — toggle completed (or constructor's
		//                               initial `minimized: true` ran)
		//   "removed"                 — destroy() ran (manual destroy(), or
		//                               MutationObserver auto-destroy on
		//                               wrapper removal)
		// (Previous `events = ["maximized","minimized"]` class field
		//  overwrote Component's `this.events` listener dict with an array
		//  — removed.)

		config(options) {
			this.class = options.class || false;
			this.animate = options.animate ?? true;
			this.delay = options.delay || 300;
			this.toggleTitle = options.toggleTitle || "Toggle Sidebar";
			this.iconClass = options.iconClass || "feather";
			this.iconType = options.iconType || "img";
			// Coordinate space of the referenced icon symbol (for iconType
			// "svg"). Default matches feather-icons. Override for other
			// icon sets — see FloatingPane.config() for examples.
			this.iconViewBox = options.iconViewBox || "0 0 24 24";
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

			this.span.innerHTML = buildIconMarkup$1({
				type: this.iconType,
				iconClass: this.iconClass,
				url: this.leftIcon,
				viewBox: this.iconViewBox,
			});

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
							this.selector.classList.remove("gadgetui-sidebarContent-minimized");
							this.fireEvent("maximized");
						},
					},
				);
			} else {
				this.selector.classList.remove("gadgetui-sidebarContent-minimized");
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
			// Store the bound handler so destroy() can detach it
			// symmetrically. An inline arrow (the previous pattern) can't be
			// removed later because each call creates a fresh ref.
			this._onToggleClick = () => {
				this.minimized ? this.maximize() : this.minimize();
			};
			this.span.addEventListener("click", this._onToggleClick);

			if (options.minimized) {
				this.minimize();
			}
		}

		// Auto-destroy when the wrapper leaves the DOM (e.g. consumer's
		// framework re-renders the view without calling destroy()). Same
		// pattern as Modal / Popover / FloatingPane / etc.
		_observeForRemoval() {
			this._observer = new MutationObserver(() => {
				if (!document.contains(this.wrapper)) this.destroy();
			});
			this._observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		setChevron(minimized) {
			const chevron = minimized ? this.rightIcon : this.leftIcon;
			const svg = this.wrapper.querySelector("span");

			svg.innerHTML = buildIconMarkup$1({
				type: this.iconType,
				iconClass: this.iconClass,
				url: chevron,
				viewBox: this.iconViewBox,
			});
		}

		destroy() {
			if (this._destroyed) return;
			this._destroyed = true;

			if (this._observer) {
				this._observer.disconnect();
				this._observer = null;
			}
			if (this.span && this._onToggleClick) {
				this.span.removeEventListener("click", this._onToggleClick);
			}

			// Unwrap the selector: pop it back out of the wrapper and into
			// the wrapper's spot in the parent, then drop the wrapper (which
			// takes the toggle span with it). Leaves the consumer's element
			// where it started so they can re-instantiate or repurpose it.
			const wrapperParent = this.wrapper && this.wrapper.parentNode;
			if (wrapperParent && this.selector) {
				wrapperParent.insertBefore(this.selector, this.wrapper);
			}
			if (wrapperParent) {
				wrapperParent.removeChild(this.wrapper);
			}

			this.fireEvent("removed");
		}
	}

	class Tabs extends Component {
		constructor(element, options = {}) {
			super();
			this.element = element;
			this.tabsDiv = this.element.querySelector("div");
			this.config(options);
			this.addControl();
			this._observeForRemoval();
		}

		config(options) {
			this.direction = options.direction || "horizontal";
			this.tabContentDivIds = [];
			this.tabs = [];
			this.activeTab = null;
			// { tab: HTMLElement, handler: fn }[] — used by destroy() to
			// detach the click listeners we attached in addControl.
			this._tabClickBindings = [];
		}

		// Events fired (call .on(name, handler) to subscribe):
		//   "tabSelected" — setActiveTab() called; args: { activeTab }
		//   "removed"     — destroy() ran (manual destroy(), or
		//                   MutationObserver auto-destroy on tabsDiv removal)
		// (Previous `events = ["tabSelected"]` class field overwrote
		//  Component's `this.events` listener dict with an array — removed.)

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

				// Store the bound handler so destroy() can detach it
				// symmetrically. An inline arrow (the previous pattern)
				// can't be removed later because each call creates a fresh
				// reference.
				const handler = () => this.setActiveTab(tabId);
				tab.addEventListener("click", handler);
				this._tabClickBindings.push({ tab, handler });
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
					tab.classList.remove(`gadget-ui-tab-${dir}`);
				} else {
					tab.classList.add(`gadget-ui-tab-${dir}`);
					tab.classList.remove(className);
				}
			});

			this.activeTab = activeTab;

			this.fireEvent("tabSelected", { activeTab });
		}

		// Auto-destroy when the tabsDiv leaves the DOM (e.g. consumer's
		// framework re-renders the view without calling destroy()). Same
		// pattern as Modal / Popover / FloatingPane / ProgressBar.
		_observeForRemoval() {
			this._observer = new MutationObserver(() => {
				if (!document.contains(this.tabsDiv)) this.destroy();
			});
			this._observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		destroy() {
			if (this._destroyed) return;
			this._destroyed = true;

			if (this._observer) {
				this._observer.disconnect();
				this._observer = null;
			}

			// Detach the click listeners we attached in addControl.
			this._tabClickBindings.forEach(({ tab, handler }) => {
				tab.removeEventListener("click", handler);
			});
			this._tabClickBindings = [];

			// Reset the inline `display` styles we set on the content divs
			// so the consumer's CSS regains control. tabsDiv stays in the
			// DOM — Tabs doesn't own that element, it just decorates it.
			const dir = this.direction === "vertical" ? "v" : "h";
			this.tabContentDivIds.forEach((tabId) => {
				const contentDiv = this.element.querySelector(
					`div[name='${tabId}']`,
				);
				if (contentDiv) contentDiv.style.display = "";
			});

			// Strip the classes we added so the consumer's element can be
			// reused cleanly (e.g. for a fresh Tabs instance).
			if (this.tabsDiv) {
				this.tabsDiv.classList.remove(`gadget-ui-tabs-${dir}`);
			}
			this.tabs.forEach((tab) => {
				tab.classList.remove(`gadget-ui-tab-${dir}`);
				tab.classList.remove(`gadget-ui-tab-${dir}-active`);
			});

			this.fireEvent("removed");
		}
	}

	const modelStore = new Map();
	const mementoStore = new Map();
	let maxMementos = 20; // Default value

		class BindableObject {
			constructor(data, element) {
				this.data = this.processValue(data);
				this.elements = [];
				this.mementos = [];
				this.currentMementoIndex = -1;
				if (element) {
					this.bind(element);
				}
				this.saveMemento(); // Save initial state
			}

			handleEvent(event) {
				if (event.type !== "change") return;

				event.originalSource ??= "BindableObject.handleEvent[change]";

				for (const { elem, prop } of this.elements) {
					if (
						event.target.name === prop &&
						event.originalSource !== "BindableObject.updateDomElement"
					) {
						const value = event.target.type.includes("select")
							? {
									id: event.target.value,
									text: event.target.options[event.target.selectedIndex]
										.textContent,
								}
							: event.target.value;

						this.change(value, event, prop);
					}
				}
			}

			change(value, event, property) {
				event.originalSource ??= "BindableObject.change";
				console.log(`change : Source: ${event.originalSource}`);

				const processedValue = this.processValue(value);

				if (!property) {
					this.data = processedValue;
				} else if (typeof this.data === "object" && this.data !== null) {
					if (!(property in this.data)) {
						throw new Error(`Property '${property}' of object is undefined.`);
					}
					this.data[property] = processedValue;
				} else {
					throw new Error(
						"Attempt to treat a simple value as an object with properties.",
					);
				}

				this.saveMemento();

				this.elements
					.filter(
						({ prop, elem }) =>
							(!property || property === prop) && elem !== event.target,
					)
					.forEach(({ elem }) =>
						this.updateDomElement(event, elem, processedValue),
					);
			}

			updateDom(event, value, property) {
				event.originalSource ??= "BindableObject.updateDom";

				this.elements.forEach(({ elem, prop }) => {
					if (!property) {
						if (typeof value === "object" && value !== null) {
							if (prop in value) {
								this.updateDomElement(event, elem, value[prop]);
							}
						} else {
							this.updateDomElement(event, elem, value);
						}
					} else if (prop === property) {
						this.updateDomElement(event, elem, value);
					}
				});
			}

			updateDomElement(event, element, value) {
				event.originalSource ??= "BindableObject.updateDomElement";

				const updateOptions = () => {
					element.innerHTML = "";
					const items = Array.isArray(value)
						? value
						: value instanceof Map
							? Array.from(value.entries())
							: [value];

					if (element.tagName === "SELECT") {
						items.forEach((item, idx) => {
							const opt = document.createElement("option");
							opt.value = typeof item === "object" ? (item.id ?? item[0]) : item;
							opt.textContent =
								typeof item === "object" ? (item.text ?? item[1]) : item;
							element.appendChild(opt);
						});
					} else if (["UL", "OL"].includes(element.tagName)) {
						items.forEach((item) => {
							const li = document.createElement("li");
							li.textContent =
								typeof item === "object" ? (item.text ?? item[1]) : item;
							element.appendChild(li);
						});
					}
				};

				const isInput = ["INPUT", "TEXTAREA"].includes(element.tagName);
				const isArrayElement = ["OL", "UL", "SELECT"].includes(element.tagName);
				const textElements = [
					"DIV", // Generic container, often contains text
					"SPAN", // Inline container, typically for text styling
					"H1", // Heading level 1
					"H2", // Heading level 2
					"H3", // Heading level 3
					"H4", // Heading level 4
					"H5", // Heading level 5
					"H6", // Heading level 6
					"P", // Paragraph
					"LABEL", // Caption for form elements, displays text
					"BUTTON", // Clickable button, often with text content
					"A", // Anchor (hyperlink), typically contains text
					"STRONG", // Bold text for emphasis
					"EM", // Italic text for emphasis
					"B", // Bold text (presentational)
					"I", // Italic text (presentational)
					"U", // Underlined text
					"SMALL", // Smaller text, often for fine print
					"SUB", // Subscript text
					"SUP", // Superscript text
					"Q", // Short inline quotation
					"BLOCKQUOTE", // Long quotation
					"CITE", // Citation or reference
					"CODE", // Code snippet
					"PRE", // Preformatted text
					"ABBR", // Abbreviation with optional title attribute
					"DFN", // Defining instance of a term
					"SAMP", // Sample output from a program
					"KBD", // Keyboard input
					"VAR", // Variable in programming/math context
					"LI", // List item (in UL or OL)
					"DT", // Term in a description list
					"DD", // Description in a description list
					"TH", // Table header cell
					"TD", // Table data cell
					"CAPTION", // Table caption
					"FIGCAPTION", // Caption for a figure
					"SUMMARY", // Summary for a details element
					"LEGEND", // Caption for a fieldset in a form
					"TITLE", // Document title (displayed in browser tab)
				];
				const isTextElement = textElements.includes(element.tagName);

				if (typeof value === "object" && value !== null) {
					if (isInput)
						element.value =
							value.id ?? (value instanceof Map ? "" : value[0]) ?? "";
					else if (isArrayElement) updateOptions();
					else if (isTextElement)
						element.textContent =
							value.text ?? (value instanceof Map ? "" : value[1]) ?? "";
				} else {
					if (isInput) element.value = value ?? "";
					else if (isArrayElement) updateOptions();
					else if (isTextElement) element.textContent = value ?? "";
				}

				if (
					event.originalSource !== "model.set" &&
					event.originalSource !== "memento.restore"
				) {
					element.dispatchEvent(
						new Event("change", {
							originalSource: "model.updateDomElement",
						}),
					);
				}
			}

			bind(element, property) {
				const binding = { elem: element, prop: property || "" };
				element.value = property ? this.data[property] : this.data;

				element.addEventListener("change", this);
				this.elements.push(binding);
			}

			processValue(value) {
				switch (typeof value) {
					case "undefined":
					case "number":
					case "boolean":
					case "function":
					case "symbol":
					case "string":
						return value;
					case "object":
						if (value === null) return null;
						if (value instanceof Map) return new Map(value);
						return JSON.parse(JSON.stringify(value));
					default:
						return value;
				}
			}

			saveMemento() {
				// Remove future mementos if we're adding after an undo
				if (this.currentMementoIndex < this.mementos.length - 1) {
					this.mementos.splice(this.currentMementoIndex + 1);
				}

				const memento = this.processValue(this.data);
				this.mementos.push(memento);

				if (this.mementos.length > maxMementos) {
					this.mementos.shift(); // Remove oldest memento
				} else {
					this.currentMementoIndex++;
				}
			}

			undo() {
				if (this.currentMementoIndex > 0) {
					this.currentMementoIndex--;
					this.restoreMemento();
					return true;
				}
				return false;
			}

			redo() {
				if (this.currentMementoIndex < this.mementos.length - 1) {
					this.currentMementoIndex++;
					this.restoreMemento();
					return true;
				}
				return false;
			}

			rewind() {
				if (this.currentMementoIndex > 0) {
					this.currentMementoIndex = 0;
					this.restoreMemento();
					return true;
				}
				return false;
			}

			fastForward() {
				if (this.currentMementoIndex < this.mementos.length - 1) {
					this.currentMementoIndex = this.mementos.length - 1;
					this.restoreMemento();
					return true;
				}
				return false;
			}

			restoreMemento() {
				this.data = this.processValue(this.mementos[this.currentMementoIndex]);
				const event = { originalSource: "memento.restore" };
				this.elements.forEach(({ elem, prop }) => {
					this.updateDomElement(event, elem, prop ? this.data[prop] : this.data);
				});
			}
		}

	const model = {
		BindableObject,

		init(options = {}) {
				maxMementos = options.maxMementos ?? 20;
			},

			create(name, value, element) {
				const processedValue = new BindableObject(value).processValue(value);
				const bindable = new BindableObject(processedValue, element);
				modelStore.set(name, bindable);
				mementoStore.set(name, bindable);
			},

			destroy(name) {
				modelStore.delete(name);
				mementoStore.delete(name);
			},

			bind(name, element) {
				const [base, prop] = name.split(".");
				const model = modelStore.get(base);
				if (model) {
					model.bind(element, prop);
				}
			},

			exists(name) {
				return modelStore.has(name);
			},

			get(name) {
				if (!name) {
					console.log("Expected parameter [name] is not defined.");
					return undefined;
				}

				const [base, prop] = name.split(".");
				const model = modelStore.get(base);

				if (!model) {
					console.log(`Key '${base}' does not exist in the model.`);
					return undefined;
				}

				const value = prop ? model.data[prop] : model.data;
				return value instanceof Map ? new Map(value) : value;
			},

			set(name, value) {
				if (!name) {
					console.log("Expected parameter [name] is not defined.");
					return;
				}

				const [base, prop] = name.split(".");
				const event = { originalSource: "model.set" };

				if (!modelStore.has(base)) {
					if (!prop) {
						this.create(base, value);
					} else {
						throw new Error(`Object ${base} is not yet initialized.`);
					}
				} else {
					const model = modelStore.get(base);
					const processedValue = model.processValue(value);
					model.change(processedValue, event, prop);
					model.updateDom(event, processedValue, prop);
				}
			},

			undo(name) {
				const model = mementoStore.get(name);
				return model ? model.undo() : false;
			},

			redo(name) {
				const model = mementoStore.get(name);
				return model ? model.redo() : false;
			},

			rewind(name) {
				const model = mementoStore.get(name);
				return model ? model.rewind() : false;
			},

			fastForward(name) {
				const model = mementoStore.get(name);
				return model ? model.fastForward() : false;
			},
	};

	/**
	 * Autosuggest Component
	 *
	 * Provides autocomplete/autosuggest functionality with multiple display options.
	 *
	 * Usage Examples:
	 *
	 * 1. Standard usage with existing element:
	 *    const autosuggest = new Autosuggest(inputElement, {
	 *      datasource: ['apple', 'banana', 'orange'],
	 *      minLength: 2
	 *    });
	 *
	 * 2. Create element dynamically at cursor position:
	 *    const autosuggest = new Autosuggest(null, {
	 *      createAtCursor: true,
	 *      elementType: 'span', // or 'div', default is 'span'
	 *      datasource: async (request) => {
	 *        // fetch suggestions
	 *        return ['suggestion1', 'suggestion2'];
	 *      }
	 *    });
	 *
	 * 3. Use Popover for displaying suggestions:
	 *    const autosuggest = new Autosuggest(inputElement, {
	 *      usePopover: true,
	 *      popoverOptions: { class: 'custom-popover' },
	 *      datasource: ['option1', 'option2']
	 *    });
	 *
	 * 4. Combine both features:
	 *    const autosuggest = new Autosuggest(null, {
	 *      createAtCursor: true,
	 *      elementType: 'span',
	 *      usePopover: true,
	 *      datasource: myDataSource
	 *    });
	 */

	class Autosuggest extends Component {
		constructor(element, options = {}) {
			super();
			this.items = [];
			this.events = [
				"added",
				"removed",
				"change",
				"focus",
				"blur",
				"keydown",
				"keypress",
				"input",
				"mousedown",
				"menuselect",
				"response",
				"click",
			];
			this.config(options);

			// Handle dynamic element creation at cursor position
			if (this.createAtCursor) {
				this.cursorPosition = this.createElementAtCursor();
				if (!this.cursorPosition) {
					throw new Error("Cannot create element at cursor: no selection found");
				}
				this.element = this.cursorPosition.element;
			} else {
				// Use provided element
				this.element = element;
				if (!this.element) {
					throw new Error("Element is required when createAtCursor is false");
				}
			}

			this.setIsMultiLine();
			this.addControl();
			this.initSource();
			this.addMenu();
			this.addBindings();
		}

		addControl() {
			this.wrapper = document.createElement("div");
			if (this.width) setStyle(this.wrapper, "width", this.width);
			this.wrapper.classList.add("gadgetui-autosuggest-input");

			if (this.createAtCursor && this.cursorPosition) {
				// Insert at cursor position
				const range = this.cursorPosition.range;
				range.commonAncestorContainer;

				// Insert the element at cursor position
				this.wrapper.appendChild(this.element);
				range.insertNode(this.wrapper);

				// Move cursor to inside the new element
				const newRange = document.createRange();
				newRange.selectNodeContents(this.element);
				newRange.collapse(false);
				const selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(newRange);
			} else {
				// Original behavior - wrap existing element
				this.element.parentNode.insertBefore(this.wrapper, this.element);
				this.element.parentNode.removeChild(this.element);
				this.wrapper.appendChild(this.element);
			}
		}

		createElementAtCursor() {
			const selection = window.getSelection();
			if (!selection.rangeCount) return null;

			const range = selection.getRangeAt(0);

			// Create the input element
			const element = document.createElement(this.elementType);
			element.setAttribute("contenteditable", "true");
			element.classList.add("gadgetui-autosuggest-dynamic");

			// Store cursor position info
			return {
				element: element,
				range: range,
				selection: selection,
			};
		}

		addMenu() {
			const div = document.createElement("div");
			div.classList.add("gadgetui-autosuggest-menu");
			setStyle(div, "display", "none");

			if (this.usePopover) {
				// Use Popover component for displaying suggestions
				const popoverOptions = {
					...this.popoverOptions,
					autoOpen: false, // We'll control opening manually
				};
				this.popover = new Popover(div, popoverOptions);
				this.menu = { element: div, popover: this.popover };
			} else {
				// Use simple div
				this.menu = { element: div };
			}

			this.wrapper.appendChild(div);
		}

		initSource() {
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
			} else if (
				typeof this.datasource === "function" &&
				this.datasource.constructor.name === "AsyncFunction"
			) {
				// Handle async function datasource
				this.source = async (request, response) => {
					try {
						const result = await this.datasource(request);
						response(result);
					} catch (error) {
						console.error("Error in async datasource:", error);
						response([]);
					}
				};
			} else {
				this.source = this.datasource;
			}
		}

		escapeRegex(value) {
			return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
		}

		_filter(array, term) {
			const matcher = new RegExp(this.escapeRegex(term), "i");
			return grep(array, (value) =>
				matcher.test(value.label || value.value || value),
			);
		}

		checkForDuplicate(item) {
			return this.items.some((existing) => existing === item);
		}

		setIsMultiLine() {
			const nodeName = this.element.nodeName.toLowerCase();
			this.isMultiLine =
				nodeName === "textarea" ||
				(nodeName !== "input" &&
					(this.element.isContentEditable ||
						this.element.getAttribute("contenteditable") === "true"));
		}

		addBindings() {
			const nodeName = this.element.nodeName.toLowerCase();
			this.isTextarea = nodeName === "textarea";
			this.isInput = nodeName === "input";
			this.valueMethod = this.isTextarea || this.isInput ? "value" : "innerHTML";
			this.element.setAttribute("autocomplete", "off");

			let suppressKeyPress, suppressKeyPressRepeat, suppressInput;

			this.wrapper.addEventListener("click", (event) => {
				this.element.focus();
				this.fireEvent("click", event);
			});

			const keyEvents = {
				keydown: (event) => {
					if (this.element.getAttribute("readOnly")) {
						suppressKeyPress = suppressInput = suppressKeyPressRepeat = true;
						return;
					}
					suppressKeyPress = suppressInput = suppressKeyPressRepeat = false;


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
								this._menuSelect(event);
							}
							break;
						case keyCode.BACKSPACE:
							if (!this.element.value.length && this.items.length) {
								this.remove(this.element.previousSibling);
							}
							break;
						case keyCode.TAB:
							if (this.menu.active) this._menuSelect(event);
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
					this.fireEvent("keydown", event);
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
					this.fireEvent("keypress", event);
				},

				input: (event) => {
					if (suppressInput) {
						suppressInput = false;
						event.preventDefault();
						return;
					}
					this._searchTimeout(event);
					this.fireEvent("input", event);
				},

				focus: (event) => {
					this.selectedItem = null;
					this.previous = this.element[this.valueMethod];
					this.fireEvent("focus", event);
				},

				blur: (event) => {
					if (this.cancelBlur) {
						delete this.cancelBlur;
						return;
					}
					clearTimeout(this.searching);
					this.close(event);
					this.fireEvent("blur", event);
				},

				change: (event) => this.fireEvent("change", event),
			};

			Object.entries(keyEvents).forEach(([event, handler]) => {
				this.element.addEventListener(event, handler);
			});

			this.menu.element.addEventListener("mousedown", (event) => {
				event.preventDefault();
				this.cancelBlur = true;
				delay(() => delete this.cancelBlur);
				this.fireEvent("mousedown", event);
			});

			this.menu.element.addEventListener("menuselect", (event) => {
				const item = event.detail;
				const previous = this.previous;

				if (this.menu.element !== document.activeElement) {
					this.menu.element.focus();
					this.previous = previous;
					delay(() => {
						this.previous = previous;
						this.selectedItem = item;
					});
				}

				this._value(item.value);
				this.term = this._value();
				this.close(event);
				this.selectedItem = item;

				//if (!this.checkForDuplicate(item))
				this.handler(item);
				this.fireEvent("menuselect", event);
			});
		}

		_renderItem(item) {
			const wrapper = document.createElement("div");
			wrapper.classList.add("gadgetui-autosuggest-input-item-wrapper");
			const itemNode = document.createElement("div");
			itemNode.classList.add("gadgetui-autosuggest-input-item");
			itemNode.innerHTML = this.labelRenderer(item);
			wrapper.appendChild(itemNode);
			return wrapper;
		}

		_renderItemCancel(item, wrapper) {
			const css = setStyle;
			const itemCancel = document.createElement("span");
			const leftOffset =
				getNumberValue(getStyle(wrapper, "width")) +
				6;

			itemCancel.classList.add("oi");
			itemCancel.setAttribute("data-glyph", "circle-x");

			css(itemCancel, "opacity", ".5");
			css(itemCancel, "left", leftOffset);
			css(itemCancel, "position", "absolute");
			css(itemCancel, "cursor", "pointer");
			css(itemCancel, "top", 3);
			return itemCancel;
		}

		reset() {
			while (
				this.wrapper.firstChild &&
				this.wrapper.firstChild !== this.element
			) {
				this.wrapper.removeChild(this.wrapper.firstChild);
			}
			this.items = [];
			if (this.model) {
				const prop = this.element.getAttribute("gadgetui-bind");
				if (prop) this.model.set(prop, []);
			}
		}

		destroy() {
			clearTimeout(this.searching);

			// Clean up popover if it exists
			if (this.usePopover && this.menu.popover) {
				this.menu.popover.destroy();
			}

			this.menu.element.remove();
			if (this.liveRegion) this.liveRegion.remove();

			// If element was dynamically created at cursor, remove the wrapper
			if (this.createAtCursor && this.wrapper && this.wrapper.parentNode) {
				// Get any text content before removing
				const content = this.element.textContent || "";
				// Create a text node to replace the wrapper
				if (content) {
					const textNode = document.createTextNode(content);
					this.wrapper.parentNode.replaceChild(textNode, this.wrapper);
				} else {
					this.wrapper.parentNode.removeChild(this.wrapper);
				}
			}
		}

		_setOption(key, value) {
			this._super(key, value);
			if (key === "source") this._initSource();
			if (key === "appendTo") this.menu.element.appendTo(this._appendTo());
			if (key === "disabled" && value && this.xhr) this.xhr.abort();
		}

		_appendTo() {
			let element = this.options.appendTo;
			if (!element) element = this.element.closest(".ui-front") || document.body;
			return element.jquery || element.nodeType
				? $(element)
				: this.document.find(element).eq(0);
		}

		_searchTimeout(event) {
			clearTimeout(this.searching);
			this.searching = delay(() => {
				const termChanged = this.term !== this.element.value;
				const menuVisible = this.menu.element.style.display !== "none";
				const modifierKey =
					event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

				if (termChanged || (!termChanged && !menuVisible && !modifierKey)) {
					this.selectedItem = null;
					this.search(null, event);
				}
			}, this.delay);
		}

		search(value, event) {
			value = value ?? this._value();
			this.term = this._value();
			return value.length < this.minLength
				? this.close(event)
				: this._search(value);
		}

		// Public method to manually show all suggestions
		showAll() {
			this.term = this._value();
			this._search(this.term || "");
		}

		_search(value) {
			this.pending++;
			this.cancelSearch = false;
			this.source({ term: value }, this._response());
		}

		_response() {
			const index = ++this.requestIndex;
			return (content) => {
				if (index === this.requestIndex) {
					this.__response(content);
					this.pending--;
				}
			};
		}

		__response(content) {
			// Only normalize if no custom renderers are provided
			const shouldNormalize =
				!this.labelRenderer || this.labelRenderer === this._renderLabel;
			if (shouldNormalize && content?.length) {
				content = this._normalize(content);
			}

			this.element.dispatchEvent(
				new CustomEvent("response", { detail: { content } }),
			);
			// response event

			this.fireEvent("response", content);

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
		}

		close(event) {
			this.cancelSearch = true;
			this._close(event);
		}

		_close() {
			if (this.menu.element.style.display !== "none") {
				if (this.usePopover && this.menu.popover) {
					// Use Popover to close the menu
					this.menu.popover.close();
				}
				this.menu.element.style.display = "none";
				this.menu.element.blur();
				this.isNewMenu = true;
			}
		}

		_normalize(items) {
			if (items.length && items[0].label && items[0].value) return items;
			return items.map((item) =>
				typeof item === "string"
					? { label: item, value: item }
					: {
							label: item.label || item.value,
							value: item.value || item.label,
						},
			);
		}

		_suggest(items) {
			const div = this.menu.element;
			while (div.firstChild) div.removeChild(div.firstChild);

			this._renderMenu(items);

			if (this.usePopover && this.menu.popover) {
				// Use Popover to show the menu
				div.style.display = "block";
				this.menu.popover.open();
			} else {
				// Standard display
				div.style.display = "block";
			}

			this._resizeMenu();
			this.position.of = this.element;
			this.isNewMenu = true;
		}

		_resizeMenu() {
			// No resizing implemented currently
		}

		_renderMenu(items) {
			const maxItems = Math.min(this.maxSuggestions, items.length);
			this.currentItems = []; // Store items for keyboard selection
			for (let i = 0; i < maxItems; i++) {
				this.currentItems.push(items[i]);
				this._renderItemData(items[i]);
			}
		}

		_renderItemData(item) {
			const menuItem = this.menuItemRenderer(item);
			menuItem.addEventListener("click", () => {
				this.menu.element.dispatchEvent(
					new CustomEvent("menuselect", { detail: item }),
				);
			});
			this.menu.element.appendChild(menuItem);
		}

		_renderMenuItem(item) {
			const menuItem = document.createElement("div");
			menuItem.classList.add("gadgetui-autosuggest-item");
			menuItem.setAttribute("value", item.value);
			menuItem.innerText = this.labelRenderer(item);
			return menuItem;
		}

		_renderLabel(item) {
			return item.label;
		}

		_menuNext() {
			const items = this.menu.element.querySelectorAll(
				".gadgetui-autosuggest-item",
			);
			if (items.length === 0) return;

			let currentIndex = -1;
			items.forEach((item, index) => {
				if (item.classList.contains("ui-state-focus")) {
					currentIndex = index;
					item.classList.remove("ui-state-focus");
				}
			});

			const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
			items[nextIndex].classList.add("ui-state-focus");
			this.menu.active = items[nextIndex];
		}

		_menuPrevious() {
			const items = this.menu.element.querySelectorAll(
				".gadgetui-autosuggest-item",
			);
			if (items.length === 0) return;

			let currentIndex = -1;
			items.forEach((item, index) => {
				if (item.classList.contains("ui-state-focus")) {
					currentIndex = index;
					item.classList.remove("ui-state-focus");
				}
			});

			const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
			items[prevIndex].classList.add("ui-state-focus");
			this.menu.active = items[prevIndex];
		}

		_menuNextPage() {
			// For simplicity, jump 5 items or to the end
			const items = this.menu.element.querySelectorAll(
				".gadgetui-autosuggest-item",
			);
			if (items.length === 0) return;

			let currentIndex = -1;
			items.forEach((item, index) => {
				if (item.classList.contains("ui-state-focus")) {
					currentIndex = index;
					item.classList.remove("ui-state-focus");
				}
			});

			const nextIndex = Math.min(currentIndex + 5, items.length - 1);
			items[nextIndex].classList.add("ui-state-focus");
			this.menu.active = items[nextIndex];
		}

		_menuPreviousPage() {
			// For simplicity, jump 5 items or to the beginning
			const items = this.menu.element.querySelectorAll(
				".gadgetui-autosuggest-item",
			);
			if (items.length === 0) return;

			let currentIndex = -1;
			items.forEach((item, index) => {
				if (item.classList.contains("ui-state-focus")) {
					currentIndex = index;
					item.classList.remove("ui-state-focus");
				}
			});

			const prevIndex = Math.max(currentIndex - 5, 0);
			items[prevIndex].classList.add("ui-state-focus");
			this.menu.active = items[prevIndex];
		}

		_menuBlur() {
			const items = this.menu.element.querySelectorAll(
				".gadgetui-autosuggest-item",
			);
			items.forEach((item) => item.classList.remove("ui-state-focus"));
			this.menu.active = null;
		}

		_menuSelect(event) {
			if (!this.menu.active) return;

			// Find the item data associated with the active menu item
			const items = this.menu.element.querySelectorAll(
				".gadgetui-autosuggest-item",
			);
			let selectedIndex = -1;
			items.forEach((item, index) => {
				if (item === this.menu.active) {
					selectedIndex = index;
				}
			});

			if (
				selectedIndex >= 0 &&
				this.currentItems &&
				this.currentItems[selectedIndex]
			) {
				const item = this.currentItems[selectedIndex];
				this.menu.element.dispatchEvent(
					new CustomEvent("menuselect", { detail: item }),
				);
			}
		}

		_move(direction, event) {
			if (this.menu.element.style.display === "none") {
				this.search(null, event);
				return;
			}

			const items = this.menu.element.querySelectorAll(
				".gadgetui-autosuggest-item",
			);
			if (items.length === 0) return;

			let isFirstItem = false;
			let isLastItem = false;

			// Check if first item is selected
			if (items.length > 0 && items[0].classList.contains("ui-state-focus")) {
				isFirstItem = true;
			}

			// Check if last item is selected
			if (
				items.length > 0 &&
				items[items.length - 1].classList.contains("ui-state-focus")
			) {
				isLastItem = true;
			}

			if (
				(isFirstItem && /^previous/.test(direction)) ||
				(isLastItem && /^next/.test(direction))
			) {
				if (!this.isMultiLine) this._value(this.term);
				this._menuBlur();
				return;
			}

			// Call the appropriate menu navigation method
			switch (direction) {
				case "next":
					this._menuNext();
					break;
				case "previous":
					this._menuPrevious();
					break;
				case "nextPage":
					this._menuNextPage();
					break;
				case "previousPage":
					this._menuPreviousPage();
					break;
			}
		}

		widget() {
			return this.menu.element;
		}

		_value(value) {
			if (value !== undefined) this.element[this.valueMethod] = value;
			return this.element[this.valueMethod];
		}

		_keyEvent(keyEvent, event) {
			if (!this.isMultiLine || this.menu.element.style.display !== "none") {
				this._move(keyEvent, event);
				event.preventDefault();
			}
		}

		config(options) {
			this.model =
				this?.element &&
				this.element.getAttribute("gadgetui-bind") &&
				!options.model
					? model
					: options.model;
			this.width = options.width;
			this.handler = options.handler;
			this.filter = options.filter || this._filter;
			this.labelRenderer = options.labelRenderer || this._renderLabel;
			this.menuItemRenderer = options.menuItemRenderer || this._renderMenuItem;
			this.itemCancelRenderer =
				options.itemCancelRenderer || this._renderItemCancel;
			this.emitEvents = options.emitEvents ?? true;
			this.datasource = options.datasource ?? (options.data || true);
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

			// New options for dynamic element creation and Popover
			this.createAtCursor = options.createAtCursor || false;
			this.elementType = options.elementType || "span"; // Type of element to create (span, div, etc.)
			this.usePopover = options.usePopover || false;
			this.popoverOptions = options.popoverOptions || {};
		}
	}

	class ComboBox extends Component {
		constructor(element, options) {
			super();
			this.emitEvents = true;
			this.model = model;
			this.func = undefined; // Initialized to avoid undefined property
			this.element = element;

			this.config(options);
			this.setSaveFunc();
			this.setDataProviderRefresh();
			this.addControl();
			this.addCSS();
			bind(this.element, this.model);
			bind(this.label, this.model);
			this.addBehaviors();
			this.setStartingValues();
		}

		addControl() {
			this.comboBox = createElement("div");
			this.input = createElement("input");
			this.label = createElement("div");
			this.inputWrapper = createElement("div");
			this.selectWrapper = createElement("div");

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

			//css(this.comboBox, "opacity", ".0");
		}

		addCSS() {
			var css = setStyle;
			this.element.classList.add("gadgetui-combobox-select");
			css(this.element, "width", this.width);

			getStyle(this.element);
				var inputWidth = this.element.clientWidth,
				inputWidthAdjusted,
				selectMarginTop = 0,
				selectLeftPadding = 0,
				leftOffset = 0,
				inputWrapperTop = this.borderWidth,
				leftPosition;

			leftPosition = getNumberValue(this.borderWidth) + 4;

			if (this.borderRadius > 5) {
				selectLeftPadding = this.borderRadius - 5;
				leftPosition =
					getNumberValue(leftPosition) +
					getNumberValue(selectLeftPadding);
			}
			inputWidthAdjusted =
				inputWidth -
				this.arrowWidth -
				getNumberValue(this.borderRadius) -
				4;
			if (
				navigator.userAgent.match(/(Safari)/) &&
				!navigator.userAgent.match(/(Chrome)/)
			) {
				inputWrapperTop = this.borderWidth - 2;
				selectLeftPadding = selectLeftPadding < 4 ? 4 : this.borderRadius - 1;
				selectMarginTop = 1;
			} else if (navigator.userAgent.match(/Edge/)) {
				selectLeftPadding = selectLeftPadding < 1 ? 1 : this.borderRadius - 4;
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
			css(this.label, "left", leftPosition);

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
			var id, text, option;

			while (this.element.options.length > 0) {
				this.element.remove(0);
			}
			option = createElement("option");
			option.value = this.newOption.id;
			option.text = this.newOption.text;
			this.element.add(option);

			this.dataProvider.data.forEach((obj) => {
				id = obj.id;
				text = obj.text;
				if (text === undefined) {
					text = id;
				}
				option = createElement("option");
				option.value = id;
				option.text = text;
				this.element.add(option);
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
			var css = setStyle;
			css(this.label, "display", "inline-block");
			css(this.selectWrapper, "display", "none");
			css(this.inputWrapper, "display", "none");
		}

		addBehaviors(obj) {
			if (this.hideable) {
				this.comboBox.addEventListener(this.activate, () => {
					setTimeout(() => {
						if (this.label.style.display != "none") {
							this.selectWrapper.style.display = "inline";
							this.label.style.display = "none";
							if (this.element.selectedIndex <= 0) {
								this.inputWrapper.style.display = "inline";
							}
						}
					}, this.delay);
				});
				this.comboBox.addEventListener("mouseleave", () => {
					if (
						this.element != document.activeElement &&
						this.input != document.activeElement
					) {
						this.showLabel();
					}
					if (typeof this.fireEvent === "function") {
						this.fireEvent("mouseleave");
					}
				});
			}
			this.input.addEventListener("click", (e) => {
				if (typeof this.fireEvent === "function") {
					this.fireEvent("click", e);
				}
			});
			this.input.addEventListener("keyup", (event) => {
				if (event.which === 13) {
					var inputText = encode(this.input.value);
					this.handleInput(inputText);
				}
				if (typeof this.fireEvent === "function") {
					this.fireEvent("keyup", event);
				}
			});
			if (this.hideable) {
				this.input.addEventListener("blur", () => {
					if (
						mouseWithin(this.element, mousePosition) ===
						true
					) {
						this.inputWrapper.style.display = "none";
						this.element.focus();
					} else {
						this.showLabel();
					}
					if (typeof this.fireEvent === "function") {
						this.fireEvent("blur");
					}
				});
			}
			if (this.hideable) {
				this.element.addEventListener("mouseenter", (ev) => {
					this.element.style.display = "inline";
					if (typeof this.fireEvent === "function") {
						this.fireEvent("mouseenter", ev);
					}
				});
			}
			this.element.addEventListener("click", (ev) => {
				ev.stopPropagation();
				if (typeof this.fireEvent === "function") {
					this.fireEvent("click", ev);
				}
			});
			this.element.addEventListener("change", (event) => {
				var idx =
					event.target.selectedIndex >= 0 ? event.target.selectedIndex : 0;
				if (parseInt(event.target[idx].value, 10) !== parseInt(this.id, 10)) {
					if (event.target.selectedIndex > 0) {
						this.inputWrapper.style.display = "none";
						this.setValue(event.target[event.target.selectedIndex].value);
					} else {
						this.inputWrapper.style.display = "block";
						this.setValue(this.newOption.value);
						this.input.focus();
					}
					trigger(this.element, "gadgetui-combobox-change", {
						id: event.target[event.target.selectedIndex].value,
						text: event.target[event.target.selectedIndex].innerHTML,
					});
					if (typeof this.fireEvent === "function") {
						this.fireEvent("change", event);
					}
				}
			});
			if (this.hideable) {
				this.element.addEventListener("blur", (event) => {
					event.stopPropagation();
					setTimeout(() => {
						if (this.input !== document.activeElement) {
							this.showLabel();
						}
					}, 200);
					if (typeof this.fireEvent === "function") {
						this.fireEvent("blur", event);
					}
				});
			}
		}

		handleInput(inputText) {
			var id = this.find(inputText),
				css = setStyle;
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
			var ev = new Event("change", {
				view: window,
				bubbles: true,
				cancelable: true,
			});
			this.element.dispatchEvent(ev);
		}

		setSaveFunc() {

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
								// trigger save event if we're triggering events
								if (_this.emitEvents === true) {
									trigger(_this.element, "gadgetui-combobox-save", {
										id: value,
										text: text,
									});
								}
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
			this.setSelectOptions();
			this.setValue(this.id);
			this.triggerSelectChange();
		}

		setValue(id) {
			var text = this.getText(id);

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
						trigger(_this.element, "gadgetui-combobox-refresh");
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
				getStyle(this.element, "border-width") || 1;
			this.borderRadius =
				getStyle(this.element, "border-radius") || 5;
			this.borderColor =
				getStyle(this.element, "border-color") || "silver";
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

	class FileUploader extends Component {
		constructor(element, options = {}) {
			super();
			this.element = element;
			this.droppedFiles = [];
			this.configure(options);
			this.render(options.title);
			this.setEventHandlers();
			this.setDimensions();
			this.token = this.useTokens && sessionStorage ? sessionStorage.token : null;
		}

		render(title = "") {
			const css = setStyle;
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
          <div class="gadgetui-fileuploader-fileUpload" name="gadgetui-fileuploader-fileUpload" title="${this.addFileMessage}">
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
					this.element.querySelector(
						'div[name="gadgetui-fileuploader-dropzone"]',
					),
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
		}

		configure(options) {
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
			this.allowedFileTypes = options.allowedFileTypes || null; // New option for file type restrictions
			this.allowedExtensions = options.allowedExtensions || null; // New option for file extension restrictions
			this.invalidFileTypeMessage =
				options.invalidFileTypeMessage ||
				"Invalid file type. Please select a valid file.";
			this.maxFileSize = options.maxFileSize || null; // New option for global file size limit
			this.maxFileSizeByType = options.maxFileSizeByType || null; // New option for file type specific limits
			this.fileSizeExceededMessage =
				options.fileSizeExceededMessage ||
				"File size exceeds the maximum allowed limit.";
			this.beforeUpload = options.beforeUpload || null;
			this.headers = options.headers || [];
			this.withCredentials = options.withCredentials ?? false;
			this.makeDropZoneClickable = options.makeDropZoneClickable ?? false;
		}

		setDimensions() {
			this.element.querySelector(
				".gadgetui-fileuploader-dropzone",
			);
			this.element.querySelector(
				".gadgetui-fileuploader-filedisplay",
			);
			this.element.querySelector(".buttons");
			// Height and width calculations could be added here if needed
		}

		setEventHandlers() {
			this.element
				.querySelector('input[name="gadgetui-fileuploader-fileselect"]')
				.addEventListener("change", async (evt) => {
					const dropzone = this.element.querySelector(
						'div[name="gadgetui-fileuploader-dropzone"]',
					);
					const filedisplay = this.element.querySelector(
						'div[name="gadgetui-fileuploader-filedisplay"]',
					);
					let files;
					// Run beforeUpload callback if it exists
					if (this.beforeUpload && typeof this.beforeUpload === "function") {
						files = await this.beforeUpload(evt.target.files);
					} else {
						files = Array.from(evt.target.files);
					}

					this.processUpload(evt, files, dropzone, filedisplay);
				});
		}

		renderDropZone() {
			const dropzone = this.element.querySelector(
				'div[name="gadgetui-fileuploader-dropzone"]',
			);
			const filedisplay = this.element.querySelector(
				'div[name="gadgetui-fileuploader-filedisplay"]',
			);

			this.element.addEventListener("dragstart", (ev) => {
				ev.dataTransfer.setData("text", "data");
				ev.dataTransfer.effectAllowed = "copy";
				this.fireEvent("dragstart", ev);
			});

			dropzone.addEventListener("dragenter", (ev) => {
				ev.preventDefault();
				ev.stopPropagation();
				dropzone.classList.add("highlighted");
				this.fireEvent("dragenter", ev);
			});

			dropzone.addEventListener("dragleave", (ev) => {
				ev.preventDefault();
				ev.stopPropagation();
				dropzone.classList.remove("highlighted");
				this.fireEvent("dragleave", ev);
			});

			dropzone.addEventListener("dragover", (ev) => {
				this.handleDragOver(ev);
				ev.dataTransfer.dropEffect = "copy";
				this.fireEvent("dragover", ev);
			});

			if (this.showDropZone && this.makeDropZoneClickable) {
				dropzone.style.cursor = "pointer";
				dropzone.addEventListener("click", (ev) => {
					this.element
						.querySelector('input[name="gadgetui-fileuploader-fileselect"]')
						.click();
				});
			}

			dropzone.addEventListener("drop", async (ev) => {
				ev.preventDefault();
				ev.stopPropagation();
				this.fireEvent("drop", ev);

				let files;
				// Run beforeUpload callback if it exists
				if (this.beforeUpload && typeof this.beforeUpload === "function") {
					files = await this.beforeUpload(ev.dataTransfer.files);
				} else {
					files = Array.from(ev.target.files);
				}

				this.processUpload(ev, files, dropzone, filedisplay);
			});
		}

		processUpload(event, files, dropzone, filedisplay) {
			const css = setStyle;
			this.uploadingFiles = [];
			css(filedisplay, "display", "inline");

			files.forEach((file) => {
				// Validate file type before processing
				if (!this.validateFileType(file)) {
					this.handleInvalidFileType(file);
					return;
				}

				// Validate file size before processing
				if (!this.validateFileSize(file)) {
					this.handleFileSizeExceeded(file);
					return;
				}

				const wrappedFile = new FileUploadWrapper(file, filedisplay);

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

					this.fireEvent("uploadComplete");
				});
			});

			dropzone.classList.remove("highlighted");
			this.handleFileSelect(this.uploadingFiles, event);
		}

		validateFileType(file) {
			// If no restrictions are set, allow all files
			if (!this.allowedFileTypes && !this.allowedExtensions) {
				return true;
			}

			// Check file extension if allowedExtensions is specified
			if (this.allowedExtensions) {
				const fileExtension = file.name.split(".").pop().toLowerCase();
				if (Array.isArray(this.allowedExtensions)) {
					if (!this.allowedExtensions.includes(fileExtension)) {
						return false;
					}
				} else {
					// If it's a string, check if it matches the extension
					if (this.allowedExtensions !== fileExtension) {
						return false;
					}
				}
			}

			// Check MIME type if allowedFileTypes is specified
			if (this.allowedFileTypes) {
				if (Array.isArray(this.allowedFileTypes)) {
					if (!this.allowedFileTypes.includes(file.type)) {
						return false;
					}
				} else {
					// If it's a string, check if it matches the MIME type
					if (this.allowedFileTypes !== file.type) {
						return false;
					}
				}
			}

			return true;
		}

		handleInvalidFileType(file) {
			// Show error message for invalid file types
			const errorMessage = this.invalidFileTypeMessage;

			// Create an error display element or use existing one
			const errorDiv = document.createElement("div");
			errorDiv.className = "gadgetui-fileuploader-error";
			errorDiv.innerText = `${errorMessage} (${file.name})`;

			// Add the error message to the file display area
			const filedisplay = this.element.querySelector(
				".gadgetui-fileuploader-filedisplay",
			);
			filedisplay.appendChild(errorDiv);

			// Fire an event for invalid file type
			this.fireEvent("invalidFileType", { file: file, message: errorMessage });
		}

		validateFileSize(file) {
			// If no size limits are set, allow all files
			if (!this.maxFileSize && !this.maxFileSizeByType) {
				return true;
			}

			// Check global file size limit if set
			if (this.maxFileSize && file.size > this.maxFileSize) {
				return false;
			}

			// Check file type specific limits if set
			if (this.maxFileSizeByType) {
				// Find the appropriate limit for this file type
				let limit = null;

				// If maxFileSizeByType is an array of objects with type and size properties
				if (Array.isArray(this.maxFileSizeByType)) {
					const fileTypeConfig = this.maxFileSizeByType.find(
						(config) =>
							config.type === file.type ||
							(config.extensions &&
								config.extensions.includes(
									file.name.split(".").pop().toLowerCase(),
								)),
					);
					limit = fileTypeConfig ? fileTypeConfig.size : null;
				}
				// If maxFileSizeByType is an object mapping MIME types to limits
				else if (typeof this.maxFileSizeByType === "object") {
					limit =
						this.maxFileSizeByType[file.type] ||
						this.maxFileSizeByType[file.name.split(".").pop().toLowerCase()] ||
						null;
				}

				if (limit && file.size > limit) {
					return false;
				}
			}

			return true;
		}

		handleFileSizeExceeded(file) {
			// Show error message for files exceeding size limits
			const errorMessage = this.fileSizeExceededMessage;

			// Create an error display element or use existing one
			const errorDiv = document.createElement("div");
			errorDiv.className = "gadgetui-fileuploader-error";
			errorDiv.innerText = `${errorMessage} (${file.name})`;

			// Add the error message to the file display area
			const filedisplay = this.element.querySelector(
				".gadgetui-fileuploader-filedisplay",
			);
			filedisplay.appendChild(errorDiv);

			// Fire an event for file size exceeded
			this.fireEvent("fileSizeExceeded", { file: file, message: errorMessage });
		}

		handleFileSelect(wrappedFiles, evt) {
			evt.preventDefault();
			evt.stopPropagation();

			// Filter out invalid files from the upload list
			const validFiles = wrappedFiles.filter(
				(file) => file.isValid !== false && file.sizeValid !== false,
			);

			this.willGenerateThumbnails
				? this.generateThumbnails(validFiles)
				: this.upload(validFiles);
		}

		generateThumbnails(wrappedFiles) {
			this.upload(wrappedFiles); // Placeholder for future thumbnail generation
		}

		upload(wrappedFiles) {
			// Filter out invalid files from the upload list
			const validFiles = wrappedFiles.filter(
				(file) => file.isValid !== false && file.sizeValid !== false,
			);

			if (validFiles.length === 0) {
				// If no valid files, don't start upload process
				this.fireEvent("uploadComplete");
				return;
			}

			validFiles.forEach((wrappedFile) => {
				this.fireEvent("uploadStart");
				wrappedFile.progressbar.start();
			});
			this.uploadFile(validFiles);
		}

		uploadFile(wrappedFiles) {
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
		}

		uploadChunk(wrappedFile, chunks, filepart, parts) {
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
						wrappedFile.key = xhr.getResponseHeader("X-Key");
						this.uploadChunk(wrappedFile, chunks, filepart + 1, parts);
					} else {
						let json;
						try {
							// In your upload handling function around lines 426-434:
							if (xhr.status >= 200 && xhr.status < 300) {
								json = { data: JSON.parse(xhr.response) };
							} else {
								// Error case - call error handler
								this.handleUploadError(xhr, json, wrappedFile);
							}
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
			xhr.withCredentials = this.withCredentials;
			xhr.setRequestHeader("X-Tags", tags);
			xhr.setRequestHeader("X-Id", wrappedFile.id || "");
			xhr.setRequestHeader("X-Key", wrappedFile.key || "");
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
			// add custom headers
			if (this.headers.length) {
				this.headers.forEach((header) => {
					// Skip invalid / empty entries
					if (header?.label && header?.value != null) {
						xhr.setRequestHeader(header.label, header.value);
					}
				});
			}

			xhr.send(chunks[filepart - 1]);
		}

		handleUploadResponse(json, wrappedFile) {
			const fileItem = Constructor(
				FileItem,
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
		}

		handleUploadError(xhr, json, wrappedFile) {
			wrappedFile.progressbar.progressbox.innerText = this.uploadErrorMessage;
			wrappedFile.abortUpload(wrappedFile);
			this.fireEvent("uploaderror", {
				xhr: xhr,
				json: json,
				wrappedFile: wrappedFile,
			});
		}

		show(name) {
			const css = setStyle;
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
		}

		handleDragOver(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			evt.dataTransfer.dropEffect = "copy";
		}
	}

	class LookupListInput extends Component {
		constructor(element, options = {}) {
			super();
			this.element = element;
			this.items = [];
			this.events = [
				"added",
				"removed",
				"change",
				"focus",
				"blur",
				"keydown",
				"keypress",
				"input",
				"mousedown",
				"menuselect",
				"response",
				"click",
			];
			this.config(options);
			this.setIsMultiLine();
			this.addControl();
			this.initSource();
			this.addMenu();
			this.addBindings();
		}

		addControl() {
			this.wrapper = document.createElement("div");
			if (this.width) {
				setStyle(this.wrapper, "width", this.width);
				setStyle(this.element, "width", this.width);
			}
			this.wrapper.classList.add("gadgetui-lookuplist-input");

			this.element.parentNode.insertBefore(this.wrapper, this.element);
			this.element.parentNode.removeChild(this.element);
			this.wrapper.appendChild(this.element);
		}

		addMenu() {
			const div = document.createElement("div");
			div.classList.add("gadgetui-lookuplist-menu");
			setStyle(div, "display", "none");
			this.menu = { element: div };
			this.wrapper.appendChild(div);
		}

		initSource() {
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
			} else if (
				typeof this.datasource === "function" &&
				this.datasource.constructor.name === "AsyncFunction"
			) {
				// Handle async function datasource
				this.source = async (request, response) => {
					try {
						const result = await this.datasource(request);
						response(result);
					} catch (error) {
						console.error("Error in async datasource:", error);
						response([]);
					}
				};
			} else {
				this.source = this.datasource;
			}
		}

		escapeRegex(value) {
			return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
		}

		_filter(array, term) {
			const matcher = new RegExp(this.escapeRegex(term), "i");
			return grep(array, (value) =>
				matcher.test(value.label || value.value || value),
			);
		}

		checkForDuplicate(item) {
			return this.items.some((existing) => existing === item);
		}

		setIsMultiLine() {
			const nodeName = this.element.nodeName.toLowerCase();
			this.isMultiLine =
				nodeName === "textarea" ||
				(nodeName !== "input" && this.element.getAttribute("isContentEditable"));
		}

		addBindings() {
			const nodeName = this.element.nodeName.toLowerCase();
			this.isTextarea = nodeName === "textarea";
			this.isInput = nodeName === "input";
			this.valueMethod = this.isTextarea || this.isInput ? "value" : "innerText";
			this.element.setAttribute("autocomplete", "off");

			let suppressKeyPress, suppressKeyPressRepeat, suppressInput;

			this.wrapper.addEventListener("click", () => {
				this.element.focus();
				this.fireEvent("click");
			});

			const keyEvents = {
				keydown: (event) => {
					if (this.element.getAttribute("readOnly")) {
						suppressKeyPress = suppressInput = suppressKeyPressRepeat = true;
						return;
					}
					suppressKeyPress = suppressInput = suppressKeyPressRepeat = false;


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
					this.fireEvent("keydown", event);
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
					this.fireEvent("keypress", event);
				},

				input: (event) => {
					if (suppressInput) {
						suppressInput = false;
						event.preventDefault();
						return;
					}
					this._searchTimeout(event);
					this.fireEvent("input", event);
				},

				focus: () => {
					this.selectedItem = null;
					this.previous = this.element[this.valueMethod];
					this.fireEvent("focus");
				},

				blur: (event) => {
					if (this.cancelBlur) {
						delete this.cancelBlur;
						return;
					}
					clearTimeout(this.searching);
					this.close(event);
					this.fireEvent("blur", event);
				},

				change: () => this.fireEvent("change"),
			};

			Object.entries(keyEvents).forEach(([event, handler]) => {
				this.element.addEventListener(event, handler);
			});

			this.menu.element.addEventListener("mousedown", (event) => {
				event.preventDefault();
				this.cancelBlur = true;
				delay(() => delete this.cancelBlur);
				this.fireEvent("mousedown", event);
			});

			this.menu.element.addEventListener("menuselect", (event) => {
				const item = event.detail;
				const previous = this.previous;

				if (this.menu.element !== document.activeElement) {
					this.menu.element.focus();
					this.previous = previous;
					delay(() => {
						this.previous = previous;
						this.selectedItem = item;
					});
				}

				this._value(item.value);
				this.term = this._value();
				this.close(event);
				this.selectedItem = item;

				//if (!this.checkForDuplicate(item))
				this.add(item);
				this.fireEvent("menuselect", event);
			});
		}

		_renderItem(item) {
			const wrapper = document.createElement("div");
			wrapper.classList.add("gadgetui-lookuplist-input-item-wrapper");
			const itemNode = document.createElement("div");
			itemNode.classList.add("gadgetui-lookuplist-input-item");
			itemNode.innerHTML = this.labelRenderer(item);
			wrapper.appendChild(itemNode);
			return wrapper;
		}

		_renderItemCancel(item, wrapper) {
			const css = setStyle;
			const itemCancel = document.createElement("span");
			const leftOffset =
				getNumberValue(getStyle(wrapper, "width")) +
				6;

			itemCancel.classList.add("oi");
			itemCancel.setAttribute("data-glyph", "circle-x");

			css(itemCancel, "opacity", ".5");
			css(itemCancel, "left", leftOffset);
			css(itemCancel, "position", "absolute");
			css(itemCancel, "cursor", "pointer");
			css(itemCancel, "top", 3);
			return itemCancel;
		}

		add(item) {
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

			this.fireEvent("added");
			if (this.emitEvents)
				trigger(
					this.element,
					"gadgetui-lookuplist-input-add",
					item,
				);
			if (this.func) this.func(item, "add");
			if (this.model) {
				const prop = this.element.getAttribute("gadgetui-bind");
				if (prop) {
					const list = this.model.get(prop) || [];
					list.push(item);
					this.model.set(prop, list);
				}
			}
		}

		remove(element) {
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
								trigger(
									this.element,
									"gadgetui-lookuplist-input-remove",
									removed,
								);
							this.model.set(prop, list);
						}
					}
				}
				this.fireEvent("removed");
			}
		}

		reset() {
			while (
				this.wrapper.firstChild &&
				this.wrapper.firstChild !== this.element
			) {
				this.wrapper.removeChild(this.wrapper.firstChild);
			}
			this.items = [];
			if (this.model) {
				const prop = this.element.getAttribute("gadgetui-bind");
				if (prop) this.model.set(prop, []);
			}
		}

		destroy() {
			clearTimeout(this.searching);
			this.menu.element.remove();
			if (this.liveRegion) this.liveRegion.remove();
		}

		_setOption(key, value) {
			this._super(key, value);
			if (key === "source") this._initSource();
			if (key === "appendTo") this.menu.element.appendTo(this._appendTo());
			if (key === "disabled" && value && this.xhr) this.xhr.abort();
		}

		_appendTo() {
			let element = this.options.appendTo;
			if (!element) element = this.element.closest(".ui-front") || document.body;
			return element.jquery || element.nodeType
				? $(element)
				: this.document.find(element).eq(0);
		}

		_searchTimeout(event) {
			clearTimeout(this.searching);
			this.searching = delay(() => {
				const termChanged = this.term !== this.element.value;
				const menuVisible = this.menu.element.style.display !== "none";
				const modifierKey =
					event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

				if (termChanged || (!termChanged && !menuVisible && !modifierKey)) {
					this.selectedItem = null;
					this.search(null, event);
				}
			}, this.delay);
		}

		search(value, event) {
			value = value ?? this.element.value;
			this.term = this._value();
			return value.length < this.minLength
				? this.close(event)
				: this._search(value);
		}

		_search(value) {
			this.pending++;
			this.cancelSearch = false;
			this.source({ term: value }, this._response());
		}

		_response() {
			const index = ++this.requestIndex;
			return (content) => {
				if (index === this.requestIndex) {
					this.__response(content);
					this.pending--;
				}
			};
		}

		__response(content) {
			// Only normalize if no custom renderers are provided
			const shouldNormalize =
				!this.labelRenderer || this.labelRenderer === this._renderLabel;
			if (shouldNormalize && content?.length) {
				content = this._normalize(content);
			}

			this.element.dispatchEvent(
				new CustomEvent("response", { detail: { content } }),
			);
			// response event

			this.fireEvent("response", content);

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
		}

		close(event) {
			this.cancelSearch = true;
			this._close(event);
		}

		_close() {
			if (this.menu.element.style.display !== "none") {
				this.menu.element.style.display = "none";
				this.menu.element.blur();
				this.isNewMenu = true;
			}
		}

		_normalize(items) {
			if (items.length && items[0].label && items[0].value) return items;
			return items.map((item) =>
				typeof item === "string"
					? { label: item, value: item }
					: {
							label: item.label || item.value,
							value: item.value || item.label,
						},
			);
		}

		_suggest(items) {
			const div = this.menu.element;
			while (div.firstChild) div.removeChild(div.firstChild);

			this._renderMenu(items);
			div.style.display = "block";
			this._resizeMenu();
			this.position.of = this.element;
			this.isNewMenu = true;
		}

		_resizeMenu() {
			// No resizing implemented currently
		}

		_renderMenu(items) {
			const maxItems = Math.min(this.maxSuggestions, items.length);
			for (let i = 0; i < maxItems; i++) this._renderItemData(items[i]);
		}

		_renderItemData(item) {
			const menuItem = this.menuItemRenderer(item);
			menuItem.addEventListener("click", () => {
				this.menu.element.dispatchEvent(
					new CustomEvent("menuselect", { detail: item }),
				);
			});
			this.menu.element.appendChild(menuItem);
		}

		_renderMenuItem(item) {
			const menuItem = document.createElement("div");
			menuItem.classList.add("gadgetui-lookuplist-item");
			menuItem.setAttribute("value", item.value);
			menuItem.innerText = this.labelRenderer(item);
			return menuItem;
		}

		_renderLabel(item) {
			return item.label;
		}

		_move(direction, event) {
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
		}

		widget() {
			return this.menu.element;
		}

		_value(value) {
			if (value !== undefined) this.element[this.valueMethod] = value;
			return this.element[this.valueMethod];
		}

		_keyEvent(keyEvent, event) {
			if (!this.isMultiLine || this.menu.element.style.display !== "none") {
				this._move(keyEvent, event);
				event.preventDefault();
			}
		}

		config(options) {
			this.model =
				this.element.getAttribute("gadgetui-bind") && !options.model
					? model
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
		}
	}

	class SelectInput extends Component {
	  constructor(selector, options = {}) {
	    super();
	    this.selector = selector;
	    this.config(options);
	    this.setSelectOptions();
	    this.setInitialValue(options);
	    this.addControl();
	    this.addCSS();

	    const css = setStyle;
	    if (this.hideable) {
	      css(this.selector, "display", "none");
	    } else {
	      css(this.label, "display", "none");
	      css(this.selector, "display", "inline-block");
	    }

	    bind(this.selector, this.model);
	    bind(this.label, this.model);
	    this.addBindings();
	  }

	  //events = ["change", "focus", "mouseenter", "mouseleave", "blur"];

	  setInitialValue(options) {
	    const selectedIndex = this.selector.selectedIndex || 0;
	    this.value = options.value || {
	      id: this.selector.options[selectedIndex].value,
	      text: this.selector.options[selectedIndex].innerHTML,
	    };
	    this.selector.value = this.value.id;
	  }

	  addControl() {
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
	  }

	  setSelectOptions() {
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
	  }

	  addCSS() {
	    const css = setStyle;
	    getStyle(this.selector);
	    const parentHeight =
	      getNumberValue(getStyle(this.selector.parentNode).height) - 2;

	    css(this.selector, "min-width", this.minWidth);
	    css(this.label, "padding-top", this.labelPaddingTop);
	    css(this.label, "height", `${parentHeight}px`);
	    css(this.label, "margin-left", this.labelMarginLeft);

	    const ua = navigator.userAgent;
	    if (ua.match(/Edge/))
	      css(this.selector, "margin-left", this.selectorMarginLeft);
	    else if (ua.match(/MSIE/)) {
	      css(this.selector, "margin-top", this.selectorMarginTop);
	      css(this.selector, "margin-left", this.selectorMarginLeft);
	    }
	  }

	  addBindings() {
	    const css = setStyle;

	    if (this.hideable) {
	      this.label.addEventListener(this.activate, (event) => {
	        event.preventDefault();
	        css(this.label, "display", "none");
	        css(this.selector, "display", "inline-block");
	        this.fireEvent(this.activate, event);
	      });

	      this.selector.addEventListener("blur", () => {
	        css(this.label, "display", "inline-block");
	        css(this.selector, "display", "none");
	        this.fireEvent("blur");
	      });

	      this.selector.addEventListener("mouseleave", () => {
	        if (this.selector !== document.activeElement) {
	          css(this.label, "display", "inline-block");
	          css(this.selector, "display", "none");
	        }
	        this.fireEvent("mouseleave");
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
	          trigger(this.selector, "gadgetui-input-change", data);
	        if (this.func) this.func(data);
	        this.value = data;
	      }, 100);

	      this.fireEvent("change", ev);
	    });
	  }

	  config(options) {
	    this.model = options.model;
	    this.dataProvider = options.dataProvider;
	    this.func = options.func;
	    this.emitEvents = options.emitEvents ?? true;
	    this.activate = options.activate || "mouseenter";
	    this.hideable = options.hideable || false;
	    // CSS options with defaults
	    this.minWidth = options.minWidth || "100px";
	    this.labelPaddingTop = options.labelPaddingTop || "2px";
	    this.labelMarginLeft = options.labelMarginLeft || "9px";
	    this.selectorMarginLeft = options.selectorMarginLeft || "5px";
	    this.selectorMarginTop = options.selectorMarginTop || "0px";
	  }
	}

	class TextInput extends Component {
	  constructor(selector, options = {}) {
	    super();
	    this.emitEvents = true;
	    this.model = model;
	    this.selector = selector;

	    this.config(options);
	    this.setInitialValue();
	    this.addControl();
	    this.setLineHeight();
	    this.setFont();
	    this.setWidth();
	    bind(this.selector, this.model);
	    this.addBindings();
	    if (this.shrinkToFit) {
	      this.setControlWidth(this.value);
	    }
	  }

	  addControl() {
	    if (this.hideable) {
	      this.blockSize = getStyle(this.selector, "block-size");
	      setStyle(this.selector, "block-size", this.blockSize);
	      this.selector.classList.add(this.browserHideInputCSS);
	    }
	  }

	  setInitialValue() {
	    const val = this.selector.value;
	    const ph = this.selector.getAttribute("placeholder");
	    this.value = val || (ph && ph.length > 0 ? ph : " ... ");
	  }

	  setLineHeight() {
	    this.lineHeight = this.selector.offsetHeight;
	  }

	  setFont() {
	    const style = getStyle(this.selector);
	    this.font = `${style.fontFamily} ${style.fontSize} ${style.fontWeight} ${style.fontVariant}`;
	  }

	  setWidth() {
	    this.width =
	      textWidth(this.selector.value, this.font) + 10 || this.maxWidth;
	  }

	  addCSS() {
	    const css = setStyle;
	    this.selector.classList.add("gadgetui-textinput");

	    if (this.maxWidth > 10 && this.enforceMaxWidth) {
	      css(this.selector, "max-width", this.maxWidth);
	    }
	  }

	  setControlWidth(text) {
	    const tW = Math.max(
	      parseInt(textWidth(text, this.font), 10),
	      this.minWidth,
	    );
	    setStyle(this.selector, "width", `${tW + this.widthPadding}px`);
	  }

	  addBindings() {
	    const events = {
	      mouseenter: () => {
	        if (this.hideable)
	          this.selector.classList.remove(this.browserHideInputCSS);
	        this.fireEvent("mouseenter");
	      },
	      focus: () => {
	        if (this.hideable)
	          this.selector.classList.remove(this.browserHideInputCSS);
	        this.fireEvent("focus");
	      },
	      keyup: (event) => {
	        if (event.keyCode === 13) this.selector.blur();
	        this.setControlWidth(this.selector.value);
	        this.fireEvent("keyup", event);
	      },
	      change: (event) => {
	        setTimeout(() => {
	          let value =
	            event.target.value ||
	            this.selector.getAttribute("placeholder") ||
	            "";
	          const txtWidth = textWidth(value, this.font);

	          if (this.maxWidth < txtWidth) {
	            value = fitText(value, this.font, this.maxWidth);
	          }
	          if (this.model && !this.selector.getAttribute("gadgetui-bind")) {
	            this.model.set(this.selector.name, event.target.value);
	          }
	          if (this.emitEvents) {
	            trigger(this.selector, "gadgetui-input-change", {
	              text: event.target.value,
	            });
	          }
	          if (this.func) this.func({ text: event.target.value });
	          this.fireEvent("change", event);
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
	          this.selector.classList.add(this.browserHideInputCSS);
	        }
	        this.fireEvent("mouseleave");
	      });

	      this.selector.addEventListener("blur", () => {
	        setStyle(this.selector, "max-width", this.maxWidth);
	        this.selector.classList.add(this.browserHideInputCSS);
	        this.fireEvent("blur");
	      });
	    }
	  }

	  config(options) {
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
	    this.shrinkToFit = options.shrinkToFit || false;
	    this.widthPadding = options.widthPadding || 50;
	    this.maxWidth =
	      options.maxWidth ||
	      getNumberValue(getStyle(this.selector.parentNode).width);
	    this.browserHideInputCSS = `gadget-ui-textinput-hideInput-${checkBrowser()}`;
	  }
	}

	class Toggle extends Component {
		constructor(options) {
			super();
			this.configure(options);
			this.create();
		}

		configure(options) {
			this.selector = options.selector;
			this.parentSelector = options.parentSelector;
			this.shape = options.shape === undefined ? "square" : options.shape;
			this.value = parseInt(options.initialValue, 10) === 1 ? 1 : 0;
		}

		create() {
			if (this.selector !== undefined) {
				this.element = document.querySelector(this.selector);
			} else {
				const ele = document.createElement("input");
				ele.type = "range";
				ele.min = 0;
				ele.max = 1;
				const parent = document.querySelector(this.parentSelector);
				parent.appendChild(ele);
				this.element = ele;
			}
			this.element.value = this.value;
			this.element.classList.add("gadget-ui-toggle");
			if (this.shape === "round") {
				this.element.classList.add("gadget-ui-toggle-round");
			}

			if (this.value === 0) {
				this.element.classList.add("gadget-ui-toggle-off");
			}
			this.element.addEventListener(
				"click",
				function () {
					if (this.value === 1) {
						this.value = 0;
						this.element.classList.add("gadget-ui-toggle-off");
					} else {
						this.value = 1;
						this.element.classList.remove("gadget-ui-toggle-off");
					}
					this.element.value = this.value;
					this.fireEvent("changed");

					// event.currentTarget.css.backgroundColor='#ccc';
				}.bind(this),
			);
		}
	}

	// Display components

	// Namespaced export for backward compatibility
	const gadgetui = {
		display: {
			Bubble,
			CollapsiblePane,
			Dialog,
			FileUploadWrapper,
			FloatingPane,
			Lightbox,
			Menu,
			Modal,
			Overlay,
			Popover,
			ProgressBar,
			Sidebar,
			Tabs,
		},
		input: {
			Autosuggest,
			ComboBox,
			FileUploader,
			LookupListInput,
			SelectInput,
			TextInput,
			Toggle,
		},
		objects: {
			Component,
			Constructor,
			EventBindings,
			FileItem,
		},
		model,
		util,
		keyCode,
	};

	return gadgetui;

})();
//# sourceMappingURL=gadget-ui.js.map
