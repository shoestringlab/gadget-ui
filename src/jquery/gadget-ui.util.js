gadgetui.util = (function() {


  return {

    split: function(val) {
      return val.split(/,\s*/);
    },
    extractLast: function(term) {
      return this.split(term).pop();
    },
    getNumberValue: function(pixelValue) {
      return Number(pixelValue.substring(0, pixelValue.length - 2));
    },

    addClass: function(sel, className) {
      if (sel.classList) {
        sel.classList.add(className);
      } else {
        sel.className += " " + className;
      }
    },

    removeClass: function(sel, className) {
      if (sel.classList) {
        sel.classList.remove(className);
      } else {
        //sel.className += " " + className;
        var classes = sel.className;
        var regex = / + className + /gi;
        classes.replace( regex, "" );
        sel.className = classes;
      }
    },

    getOffset: function(selector) {
      var rect = selector.getBoundingClientRect();

      return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft
      };
    },

    getRelativeParentOffset: function(selector) {
      var i,
        parents = selector.parentsUntil("body"),
        relativeOffsetLeft = 0,
        relativeOffsetTop = 0;

      for (i = 0; i < parents.length; i++) {
        if (parents[i].style.position === "relative") {
          var offset = gadgetui.util.getOffset(parents[i]);
          // set the largest offset values of the ancestors
          if (offset.left > relativeOffsetLeft) {
            relativeOffsetLeft = offset.left;
          }

          if (offset.top > relativeOffsetTop) {
            relativeOffsetTop = offset.top;
          }
        }
      }
      return { left: relativeOffsetLeft, top: relativeOffsetTop };
    },
    Id: function() {
      return (Math.random() * 100).toString().replace(/\./g, "");
    },
    bind: function(selector, model) {
      var bindVar = selector[0].getAttribute("gadgetui-bind");

      // if binding was specified, make it so
      if (bindVar !== undefined && model !== undefined) {
        model.bind(bindVar, selector);
      }
    },
    encode: function(input, options) {
      var result,
        canon = true,
        encode = true,
        encodeType = "html";
      if (options !== undefined) {
        canon = options.canon === undefined ? true : options.canon;
        encode = options.encode === undefined ? true : options.encode;
        //enum (html|css|attr|js|url)
        encodeType =
          options.encodeType === undefined ? "html" : options.encodeType;
      }
      if (canon) {
        result = $.encoder.canonicalize(input);
      }
      if (encode) {
        switch (encodeType) {
          case "html":
            result = $.encoder.encodeForHTML(result);
            break;
          case "css":
            result = $.encoder.encodeForCSS(result);
            break;
          case "attr":
            result = $.encoder.encodeForHTMLAttribute(result);
            break;
          case "js":
            result = $.encoder.encodeForJavascript(result);
            break;
          case "url":
            result = $.encoder.encodeForURL(result);
            break;
        }
      }
      return result;
    },
    mouseCoords: function(ev) {
      // from http://www.webreference.com/programming/javascript/mk/column2/
      if (ev.pageX || ev.pageY) {
        return { x: ev.pageX, y: ev.pageY };
      }
      return {
        x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y: ev.clientY + document.body.scrollTop - document.body.clientTop
      };
    },
    mouseWithin: function(selector, coords) {
      var rect = selector[0].getBoundingClientRect();
      return coords.x >= rect.left &&
        coords.x <= rect.right &&
        coords.y >= rect.top &&
        coords.y <= rect.bottom
        ? true
        : false;
    },
    getStyle: function(el, prop) {
      if (window.getComputedStyle !== undefined) {
        if (prop !== undefined) {
          return window.getComputedStyle(el[0], null).getPropertyValue(prop);
        } else {
          return window.getComputedStyle(el[0], null);
        }
      } else {
        if (prop !== undefined) {
          return el[0].currentStyle[prop];
        } else {
          return el[0].currentStyle;
        }
      }
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
    		}
  };
})();
