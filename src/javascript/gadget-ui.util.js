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

const W = " ";


export var keyCode = {
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

export var mousePosition;

export function setMousePosition(pos) {
	mousePosition = pos;
}

export function split(val) {
	return val.split(/,\s*/);
}

export function extractLast(term) {
	return split(term).pop();
}

export function getNumberValue(pixelValue) {
	return isNaN(Number(pixelValue))
		? Number(pixelValue.substring(0, pixelValue.length - 2))
		: pixelValue;
}

export function checkBrowser() {
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

export function getOffset(selector) {
	var rect = selector.getBoundingClientRect();

	return {
		top: rect.top + document.body.scrollTop,
		left: rect.left + document.body.scrollLeft,
	};
}

// http://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/
// getParentsUntil - MIT License
export function getParentsUntil(elem, parent, selector) {
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

export function getRelativeParentOffset(selector) {
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

export function Id() {
	return (Math.random() * 100).toString().replace(/\./g, "");
}

export function bind(selector, model) {
	var bindVar = selector.getAttribute("gadgetui-bind");

	// if binding was specified, make it so
	if (bindVar !== undefined && bindVar !== null && model !== undefined) {
		model.bind(bindVar, selector);
	}
}

export function mouseCoords(ev) {
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

export function mouseWithin(selector, coords) {
	var rect = selector.getBoundingClientRect();
	return coords.x >= rect.left &&
		coords.x <= rect.right &&
		coords.y >= rect.top &&
		coords.y <= rect.bottom
		? true
		: false;
}

export function getStyle(el, prop) {
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
export function draggable(selector, handle) {
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
				top: getStyle(selector, "top"),
				left: getStyle(selector, "left"),
			},
		});

		// Trigger it!
		selector.dispatchEvent(myEvent);
		selected = null;
	}

	// Bind the functions...
	const dragTarget = handle || selector;
	dragTarget.onmousedown = function (e) {
		// If a handle is specified, check if the click is on an interactive element
		if (handle) {
			const target = e.target;
			// Allow interaction with form elements
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.tagName === "SELECT" ||
				target.tagName === "BUTTON"
			) {
				return true;
			}
		}
		_drag_init(selector);
		return false;
	};

	document.onmousemove = _move_elem;
	document.onmouseup = _destroy;
}

export function parseFont(font) {
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

export function textWidth(text, style) {
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

export function fitText(text, style, width) {
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

export function createElement(tagName) {
	var el = document.createElement(tagName);
	el.setAttribute("style", "");
	return el;
}

export function addStyle(element, style) {
	var estyles = element.getAttribute("style"),
		currentStyles = estyles !== null ? estyles : "";
	element.setAttribute("style", currentStyles + " " + style + ";");
}

export function isNumeric(num) {
	return !isNaN(parseFloat(num)) && isFinite(num);
}

export function setStyle(element, style, value) {
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

export function encode(str) {
	return str;
}

export function trigger(selector, eventType, data) {
	selector.dispatchEvent(
		new CustomEvent(eventType, {
			detail: data,
		}),
	);
}

export function getMaxZIndex() {
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
export function grep(elems, callback, invert) {
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

export function delay(handler, delay) {
	function handlerProxy() {
		return handler.apply(instance, arguments);
	}
	var instance = this;
	return setTimeout(handlerProxy, delay || 0);
}

export function contains(child, parent) {
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

export function B({ ctx: e, line: c, spaceWidth: p, spaceChar: n, width: a }) {
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

export function splitText({ ctx: e, text: c, justify: p, width: n }) {
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

export function getTextHeight({ ctx: e, text: c, style: p }) {
	const n = e.textBaseline,
		a = e.font;
	((e.textBaseline = "bottom"), (e.font = p));
	const { actualBoundingBoxAscent: i } = e.measureText(c);
	return ((e.textBaseline = n), (e.font = a), i);
}

export function drawText(e, c, p) {
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
