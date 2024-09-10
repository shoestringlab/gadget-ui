gadgetui.util = ( function() {

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
		justify: !1
	  };
	  
	  const W = " ";

	return {
		split : function( val ) {
			return val.split( /,\s*/ );
		},
		extractLast : function( term ) {
			return this.split( term ).pop();
		},
		getNumberValue : function( pixelValue ) {
			return ( isNaN( Number( pixelValue ) ) ? Number( pixelValue.substring( 0, pixelValue.length - 2 ) ) : pixelValue );
		},

		checkBrowser: function(){

			// Opera 8.0+
			var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

			// Firefox 1.0+
			var isFirefox = typeof InstallTrigger !== 'undefined';

			// Safari 3.0+ "[object HTMLElementConstructor]"
			var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

			// Internet Explorer 6-11
			var isIE = /*@cc_on!@*/false || !!document.documentMode;

			// Edge 20+
			var isEdge = !isIE && !!window.StyleMedia;

			// Chrome 1 - 79
			var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

			// Edge (based on chromium) detection
			var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

			// Blink engine detection
			var isBlink = (isChrome || isOpera) && !!window.CSS;

			let browser = 'generic';
			if( isOpera ) browser = 'opera';
			if( isFirefox ) browser = 'firefox';
			if( isSafari ) browser = 'safari';
			if( isIE ) browser = 'ie';
			if( isEdge ) browser = 'edge';
			if( isChrome ) browser = 'chrome';
			if( isEdgeChromium ) browser = 'edgechromium';
			if( isBlink ) browser = 'blink';

			return browser;
		},
		addClass : function( sel, className ) {
			if ( sel.classList ) {
				sel.classList.add( className );
			} else {
				sel.className += ' ' + className;
			}
		},

    removeClass: function(sel, className) {
      if (sel.classList) {
        sel.classList.remove(className);
      } else {
        //sel.className += " " + className;
        var classes = sel.className;
        var regex = new RegExp(className,"g");
        classes.replace( regex, "" );
        sel.className = classes;
      }
    },

		getOffset : function( selector ) {
			var rect = selector.getBoundingClientRect();

			return {
				top : rect.top + document.body.scrollTop,
				left : rect.left + document.body.scrollLeft
			};
		},
		// http://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/
		// getParentsUntil - MIT License
		getParentsUntil : function( elem, parent, selector ) {

			var parents = [];
			if ( parent ) {
				var parentType = parent.charAt( 0 );
			}
			if ( selector ) {
				var selectorType = selector.charAt( 0 );
			}

			// Get matches
			for ( ; elem && elem !== document; elem = elem.parentNode ) {

				// Check if parent has been reached
				if ( parent ) {

					// If parent is a class
					if ( parentType === '.' ) {
						if ( elem.classList.contains( parent.substr( 1 ) ) ) {
							break;
						}
					}

					// If parent is an ID
					if ( parentType === '#' ) {
						if ( elem.id === parent.substr( 1 ) ) {
							break;
						}
					}

					// If parent is a data attribute
					if ( parentType === '[' ) {
						if ( elem.hasAttribute( parent.substr( 1,
								parent.length - 1 ) ) ) {
							break;
						}
					}

					// If parent is a tag
					if ( elem.tagName.toLowerCase() === parent ) {
						break;
					}

				}

				if ( selector ) {

					// If selector is a class
					if ( selectorType === '.' ) {
						if ( elem.classList.contains( selector.substr( 1 ) ) ) {
							parents.push( elem );
						}
					}

					// If selector is an ID
					if ( selectorType === '#' ) {
						if ( elem.id === selector.substr( 1 ) ) {
							parents.push( elem );
						}
					}

					// If selector is a data attribute
					if ( selectorType === '[' ) {
						if ( elem.hasAttribute( selector.substr( 1,
								selector.length - 1 ) ) ) {
							parents.push( elem );
						}
					}

					// If selector is a tag
					if ( elem.tagName.toLowerCase() === selector ) {
						parents.push( elem );
					}

				} else {
					parents.push( elem );
				}

			}

			// Return parents if any exist
			if ( parents.length === 0 ) {
				return null;
			} else {
				return parents;
			}

		},
		getRelativeParentOffset : function( selector ) {
			var i, offset, parents = gadgetui.util.getParentsUntil( selector,
					"body" ), relativeOffsetLeft = 0, relativeOffsetTop = 0;

			for ( i = 0; i < parents.length; i++ ) {
				if ( parents[ i ].style.position === "relative" ) {
					offset = gadgetui.util.getOffset( parents[ i ] );
					// set the largest offset values of the ancestors
					if ( offset.left > relativeOffsetLeft ) {
						relativeOffsetLeft = offset.left;
					}

					if ( offset.top > relativeOffsetTop ) {
						relativeOffsetTop = offset.top;
					}
				}
			}
			return {
				left : relativeOffsetLeft,
				top : relativeOffsetTop
			};
		},
		Id : function() {
			return ( ( Math.random() * 100 ).toString() ).replace( /\./g, "" );
		},
		bind : function( selector, model ) {
			var bindVar = selector.getAttribute( "gadgetui-bind" );

			// if binding was specified, make it so
			if ( bindVar !== undefined && bindVar !== null && model !== undefined ) {
				model.bind( bindVar, selector );
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
		mouseCoords : function( ev ) {
			// from
			// http://www.webreference.com/programming/javascript/mk/column2/
			if ( ev.pageX || ev.pageY ) {
				return {
					x : ev.pageX,
					y : ev.pageY
				};
			}
			return {
				x : ev.clientX + document.body.scrollLeft
						- document.body.clientLeft,
				y : ev.clientY + document.body.scrollTop
						- document.body.clientTop
			};
		},
		mouseWithin : function( selector, coords ) {
			var rect = selector.getBoundingClientRect();
			return ( coords.x >= rect.left && coords.x <= rect.right
					&& coords.y >= rect.top && coords.y <= rect.bottom ) ? true
					: false;
		},
		getStyle : function( el, prop ) {
			if ( window.getComputedStyle !== undefined ) {
				if ( prop !== undefined ) {
					return window.getComputedStyle( el, null )
							.getPropertyValue( prop );
				} else {
					return window.getComputedStyle( el, null );
				}
			} else {
				if ( prop !== undefined ) {
					return el.currentStyle[ prop ];
				} else {
					return el.currentStyle;
				}
			}
		},
		//https://jsfiddle.net/tovic/Xcb8d/
		//author: Taufik Nurrohman
		// code belongs to author
		// no license enforced
		draggable : function( selector ){
			var selected = null, // Object of the element to be moved
		    x_pos = 0, y_pos = 0, // Stores x & y coordinates of the mouse pointer
		    x_elem = 0, y_elem = 0; // Stores top, left values (edge) of the element

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
			        selected.style.left = (x_pos - x_elem) + 'px';
			        selected.style.top = (y_pos - y_elem) + 'px';
			    }
			}

			// Destroy the object when we are done
			function _destroy( event ) {
				console.log( event );
				var myEvent = new CustomEvent("drag_end", {
					detail: {
						top : gadgetui.util.getStyle( selector, "top" ),
						left : gadgetui.util.getStyle( selector, "left" )
					}
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

		textWidth : function( text, style ) {
			// http://stackoverflow.com/questions/1582534/calculating-text-width-with-jquery
			// based on edsioufi's solution
			if ( !gadgetui.util.textWidthEl ) {
				gadgetui.util.textWidthEl = document.createElement( "div" );
				gadgetui.util.textWidthEl.setAttribute( "id",
						"gadgetui-textWidth" );
				gadgetui.util.textWidthEl.setAttribute( "style",
						"display: none;" );
				document.body.appendChild( gadgetui.util.textWidthEl );
			}
			// gadgetui.util.fakeEl = $('<span
			// id="gadgetui-textWidth">').appendTo(document.body);

			// var width, htmlText = text || selector.value ||
			// selector.innerHTML;
			var width, htmlText = text;
			if ( htmlText.length > 0 ) {
				// htmlText =
				// gadgetui.util.TextWidth.fakeEl.text(htmlText).html();
				// //encode to Html
				gadgetui.util.textWidthEl.innerText = htmlText;
				if ( htmlText === undefined ) {
					htmlText = "";
				} else {
					htmlText = htmlText.replace( /\s/g, "&nbsp;" ); // replace
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

		fitText : function( text, style, width ) {
			var midpoint, txtWidth = gadgetui.util.TextWidth( text, style ), ellipsisWidth = gadgetui.util
					.TextWidth( "...", style );
			if ( txtWidth < width ) {
				return text;
			} else {
				midpoint = Math.floor( text.length / 2 ) - 1;
				while ( txtWidth + ellipsisWidth >= width ) {
					text = text.slice( 0, midpoint )
							+ text.slice( midpoint + 1, text.length );

					midpoint = Math.floor( text.length / 2 ) - 1;
					txtWidth = gadgetui.util.TextWidth( text, font );

				}
				midpoint = Math.floor( text.length / 2 ) - 1;
				text = text.slice( 0, midpoint ) + "..."
						+ text.slice( midpoint, text.length );

				// remove spaces around the ellipsis
				while ( text.substring( midpoint - 1, midpoint ) === " " ) {
					text = text.slice( 0, midpoint - 1 )
							+ text.slice( midpoint, text.length );
					midpoint = midpoint - 1;
				}

				while ( text.substring( midpoint + 3, midpoint + 4 ) === " " ) {
					text = text.slice( 0, midpoint + 3 )
							+ text.slice( midpoint + 4, text.length );
					midpoint = midpoint - 1;
				}
				return text;
			}
		},

		createElement : function( tagName ) {
			var el = document.createElement( tagName );
			el.setAttribute( "style", "" );
			return el;
		},

		addStyle : function( element, style ) {
			var estyles = element.getAttribute( "style" ), currentStyles = ( estyles !== null ? estyles
					: "" );
			element.setAttribute( "style", currentStyles + " " + style + ";" );
		},

		isNumeric : function( num ) {
			return !isNaN( parseFloat( num ) ) && isFinite( num );
		},

		setStyle : function( element, style, value ) {
			var newStyles, estyles = element.getAttribute( "style" ), currentStyles = ( estyles !== null ? estyles
					: "" ), str = '(' + style + ')+ *\\:[^\\;]*\\;', re = new RegExp(
					str, "g" );
			// find styles in the style string
			// ([\w\-]+)+ *\:[^\;]*\;

			// assume
			if ( gadgetui.util.isNumeric( value ) === true ) {
				// don't modify properties that accept a straight numeric value
				switch ( style ) {
				case "opacity":
				case "z-index":
				case "font-weight":
					break;
				default:
					value = value + "px";
				}
			}

			if ( currentStyles.search( re ) >= 0 ) {
				newStyles = currentStyles.replace( re, style + ": " + value
						+ ";" );
			} else {
				newStyles = currentStyles + " " + style + ": " + value + ";";
			}
			element.setAttribute( "style", newStyles );
		},
		encode : function( str ) {
			return str;
		},

		trigger : function( selector, eventType, data ) {
			selector.dispatchEvent( new CustomEvent( eventType, {
				detail : data
			} ) );
		},
		getMaxZIndex : function() {
			var elems = document.querySelectorAll( "*" );
			var highest = 0;
			for ( var ix = 0; ix < elems.length; ix++ ) {
				var zindex = gadgetui.util.getStyle( elems[ ix ], "z-index" );
				if ( ( zindex > highest ) && ( zindex != 'auto' ) ) {
					highest = zindex;
				}
			}
			return highest;
		},
		// copied from jQuery core, re-distributed per MIT License
		grep : function( elems, callback, invert ) {
			var callbackInverse, matches = [], i = 0, length = elems.length, callbackExpect = !invert;

			// Go through the array, only saving the items
			// _this pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}

			return matches;
		},
		delay : function( handler, delay ) {
			function handlerProxy() {
				return handler.apply( instance, arguments );
			}
			var instance = this;
			return setTimeout( handlerProxy, delay || 0 );
		},
		contains : function( child, parent ) {
			var node = child.parentNode;
			while ( node != null ) {
				if ( node == parent ) {
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

		B: function({
			ctx: e,
			line: c,
			spaceWidth: p,
			spaceChar: n,
			width: a
		  }) {
			const i = c.trim(), o = i.split(/\s+/), s = o.length - 1;
			if (s === 0)
			  return i;
			const m = e.measureText(o.join("")).width, d = (a - m) / p, b = Math.floor(d / s);
			if (d < 1)
			  return i;
			const r = n.repeat(b);
			return o.join(r);
		  },

		  splitText: function({
			ctx: e,
			text: c,
			justify: p,
			width: n
		  }) {
			const a = /* @__PURE__ */ new Map(), i = (r) => {
			  let g = a.get(r);
			  return g !== void 0 || (g = e.measureText(r).width, a.set(r, g)), g;
			};
			let o = [], s = c.split(`
		  `);
			const m = p ? i(W) : 0;
			let d = 0, b = 0;
			for (const r of s) {
			  let g = i(r);
			  const y = r.length;
			  if (g <= n) {
				o.push(r);
				continue;
			  }
			  let h = r, t, f, l = "";
			  for (; g > n; ) {
				if (d++, t = b, f = t === 0 ? 0 : i(r.substring(0, t)), f < n)
				  for (; f < n && t < y && (t++, f = i(h.substring(0, t)), t !== y); )
					;
				else if (f > n)
				  for (; f > n && (t = Math.max(1, t - 1), f = i(h.substring(0, t)), !(t === 0 || t === 1)); )
					;
				if (b = Math.round(
				  b + (t - b) / d
				), t--, t > 0) {
				  let u = t;
				  if (h.substring(u, u + 1) != " ") {
					for (; h.substring(u, u + 1) != " " && u >= 0; )
					  u--;
					u > 0 && (t = u);
				  }
				}
				t === 0 && (t = 1), l = h.substring(0, t), l = p ? gadgetui.util.B({
				  ctx: e,
				  line: l,
				  spaceWidth: m,
				  spaceChar: W,
				  width: n
				}) : l, o.push(l), h = h.substring(t), g = i(h);
			  }
			  g > 0 && (l = p ? gadgetui.util.B({
				ctx: e,
				line: h,
				spaceWidth: m,
				spaceChar: W,
				width: n
			  }) : h, o.push(l));
			}
			return o;
		  },
		  getTextHeight: function({
			ctx: e,
			text: c,
			style: p
		  }) {
			const n = e.textBaseline, a = e.font;
			e.textBaseline = "bottom", e.font = p;
			const { actualBoundingBoxAscent: i } = e.measureText(c);
			return e.textBaseline = n, e.font = a, i;
		  },
		  
		  drawText: function(e, c, p) {
			const { width: n, height: a, x: i, y: o } = p, s = { ...C, ...p };
			if (n <= 0 || a <= 0 || s.fontSize <= 0)
			  return { height: 0 };
			const m = i + n, d = o + a, { fontStyle: b, fontVariant: r, fontWeight: g, fontSize: y, font: h } = s, t = `${b} ${r} ${g} ${y}px ${h}`;
			e.font = t;
			let f = o + a / 2 + s.fontSize / 2, l;
			s.align === "right" ? (l = m, e.textAlign = "right") : s.align === "left" ? (l = i, e.textAlign = "left") : (l = i + n / 2, e.textAlign = "center");
			const u = gadgetui.util.splitText({
			  ctx: e,
			  text: c,
			  justify: s.justify,
			  width: n
			}), S = s.lineHeight ? s.lineHeight : gadgetui.util.getTextHeight({ ctx: e, text: "M", style: t }), v = S * (u.length - 1), P = v / 2;
			let A = o;
			if (s.vAlign === "top" ? (e.textBaseline = "top", f = o) : s.vAlign === "bottom" ? (e.textBaseline = "bottom", f = d - v, A = d) : (e.textBaseline = "bottom", A = o + a / 2, f -= P), u.forEach((T) => {
			  T = T.trim(), e.fillText(T, l, f), f += S;
			}), s.debug) {
			  const T = "#0C8CE9";
			  e.lineWidth = 1, e.strokeStyle = T, e.strokeRect(i, o, n, a), e.lineWidth = 1, e.strokeStyle = T, e.beginPath(), e.moveTo(l, o), e.lineTo(l, d), e.stroke(), e.strokeStyle = T, e.beginPath(), e.moveTo(i, A), e.lineTo(m, A), e.stroke();
			}
			return { height: v + S };
		  }

	};
}() );
