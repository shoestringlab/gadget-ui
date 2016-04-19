gadgetui.util = ( function(){

	return{
		split: function( val ) {
			return val.split( /,\s*/ );
		},
		extractLast: function( term ) {
			return this.split( term ).pop();
		},
		getNumberValue: function( pixelValue ){
			return Number( pixelValue.substring( 0, pixelValue.length - 2 ) );
		},

		addClass: function( sel, className ){
			if (sel.classList){
				sel.classList.add(className);
			}else{
				sel.className += ' ' + className;
			}
		},
		
		getOffset: function( selector ){
			var rect =  selector.getBoundingClientRect();

			return {
			  top: rect.top + document.body.scrollTop,
			  left: rect.left + document.body.scrollLeft
			};
		},
		//http://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/
		//getParentsUntil - MIT License
		getParentsUntil : function (elem, parent, selector) {

		    var parents = [];
		    if ( parent ) {
		        var parentType = parent.charAt(0);
		    }
		    if ( selector ) {
		        var selectorType = selector.charAt(0);
		    }

		    // Get matches
		    for ( ; elem && elem !== document; elem = elem.parentNode ) {

		        // Check if parent has been reached
		        if ( parent ) {

		            // If parent is a class
		            if ( parentType === '.' ) {
		                if ( elem.classList.contains( parent.substr(1) ) ) {
		                    break;
		                }
		            }

		            // If parent is an ID
		            if ( parentType === '#' ) {
		                if ( elem.id === parent.substr(1) ) {
		                    break;
		                }
		            }

		            // If parent is a data attribute
		            if ( parentType === '[' ) {
		                if ( elem.hasAttribute( parent.substr(1, parent.length - 1) ) ) {
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
		                if ( elem.classList.contains( selector.substr(1) ) ) {
		                    parents.push( elem );
		                }
		            }

		            // If selector is an ID
		            if ( selectorType === '#' ) {
		                if ( elem.id === selector.substr(1) ) {
		                    parents.push( elem );
		                }
		            }

		            // If selector is a data attribute
		            if ( selectorType === '[' ) {
		                if ( elem.hasAttribute( selector.substr(1, selector.length - 1) ) ) {
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
		getRelativeParentOffset: function( selector ){
			var i,
				offset,
				parents = gadgetui.util.getParentsUntil( selector, "body" ),
				relativeOffsetLeft = 0,
				relativeOffsetTop = 0;

			for( i = 0; i < parents.length; i++ ){
				if( parents[ i ].style.position === "relative" ){
					offset = gadgetui.util.getOffset( parents[ i ] );
					// set the largest offset values of the ancestors
					if( offset.left > relativeOffsetLeft ){
						relativeOffsetLeft = offset.left;
					}
					
					if( offset.top > relativeOffsetTop ){
						relativeOffsetTop = offset.top;
					}
				}
			}
			return { left: relativeOffsetLeft, top: relativeOffsetTop };
		},
		Id: function(){
			return ( (Math.random() * 100).toString() ).replace(  /\./g, "" );
		},
		bind : function( selector, model ){
			var bindVar = selector.getAttribute( "gadgetui-bind" );

			// if binding was specified, make it so
			if( bindVar !== undefined && model !== undefined ){
				model.bind( bindVar, selector );
			}
		},
		/*	encode : function( input, options ){
			var result, canon = true, encode = true, encodeType = 'html';
			if( options !== undefined ){
				canon = ( options.canon === undefined ? true : options.canon );
				encode = ( options.encode === undefined ? true : options.encode );
				//enum (html|css|attr|js|url)
				encodeType = ( options.encodeType === undefined ? "html" : options.encodeType );
			}
			if( canon ){
				result = $.encoder.canonicalize( input );
			}
			if( encode ){
				switch( encodeType ){
					case "html":
						result = $.encoder.encodeForHTML( result );
						break;
					case "css":
						result = $.encoder.encodeForCSS( result );
						break;
					case "attr":
						result = $.encoder.encodeForHTMLAttribute( result );
						break;
					case "js":
						result = $.encoder.encodeForJavascript( result );
						break;
					case "url":
						result = $.encoder.encodeForURL( result );
						break;				
				}
				
			}
			return result;
		},	*/
		mouseCoords : function(ev){
			// from http://www.webreference.com/programming/javascript/mk/column2/
			if(ev.pageX || ev.pageY){
				return {x:ev.pageX, y:ev.pageY};
			}
			return {
				x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
				y:ev.clientY + document.body.scrollTop  - document.body.clientTop
			};
		},
		mouseWithin : function( selector, coords ){
			var rect = selector.getBoundingClientRect();
			return ( coords.x >= rect.left && coords.x <= rect.right && coords.y >= rect.top && coords.y <= rect.bottom ) ? true : false;
		},
		getStyle : function (el, prop) {
		    if ( window.getComputedStyle !== undefined ) {
		    	if( prop !== undefined ){
		    		return window.getComputedStyle(el, null).getPropertyValue(prop);
		    	}else{
		    		return window.getComputedStyle(el, null);
		    	}
		    } else {
		    	if( prop !== undefined ){
		    		return el.currentStyle[prop];
		    	}else{
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
			function _destroy() {
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
			if( !gadgetui.util.textWidthEl ){
				gadgetui.util.textWidthEl = document.createElement( "div" );
				gadgetui.util.textWidthEl.setAttribute( "id", "gadgetui-textWidth" );
				gadgetui.util.textWidthEl.setAttribute( "style", "display: none;" );
				document.body.appendChild( gadgetui.util.textWidthEl );
			}
				//gadgetui.util.fakeEl = $('<span id="gadgetui-textWidth">').appendTo(document.body);
		    
		    //var width, htmlText = text || selector.value || selector.innerHTML;
			var width, htmlText = text;
		    if( htmlText.length > 0 ){
		    	//htmlText =  gadgetui.util.TextWidth.fakeEl.text(htmlText).html(); //encode to Html
		    	gadgetui.util.textWidthEl.innerText = htmlText;
		    	if( htmlText === undefined ){
		    		htmlText = "";
		    	}else{
		    		htmlText = htmlText.replace(/\s/g, "&nbsp;"); //replace trailing and leading spaces
		    	}
		    }
		    gadgetui.util.textWidthEl.innertText=htmlText;
		    //gadgetui.util.textWidthEl.style.font = font;
		   // gadgetui.util.textWidthEl.html( htmlText ).style.font = font;
		   // gadgetui.util.textWidthEl.html(htmlText).css('font', font || $.fn.css('font'));
		    gadgetui.util.textWidthEl.style.fontFamily = style.fontFamily;
		    gadgetui.util.textWidthEl.style.fontSize = style.fontSize;
		    gadgetui.util.textWidthEl.style.fontWeight = style.fontWeight;
		    gadgetui.util.textWidthEl.style.fontVariant = style.fontVariant;
		    gadgetui.util.textWidthEl.style.display = "inline";

		    width = gadgetui.util.textWidthEl.offsetWidth;
		    gadgetui.util.textWidthEl.style.display = "none";
		    return width;
		},

		fitText :function( text, style, width ){
			var midpoint, txtWidth = gadgetui.util.TextWidth( text, style ), ellipsisWidth = gadgetui.util.TextWidth( "...", style );
			if( txtWidth < width ){
				return text;
			}else{
				midpoint = Math.floor( text.length / 2 ) - 1;
				while( txtWidth + ellipsisWidth >= width ){
					text = text.slice( 0, midpoint ) + text.slice( midpoint + 1, text.length );
			
					midpoint = Math.floor( text.length / 2 ) - 1;
					txtWidth = gadgetui.util.TextWidth( text, font );

				}
				midpoint = Math.floor( text.length / 2 ) - 1;
				text = text.slice( 0, midpoint ) + "..." + text.slice( midpoint, text.length );
				
				//remove spaces around the ellipsis
				while( text.substring( midpoint - 1, midpoint ) === " " ){
					text = text.slice( 0, midpoint - 1 ) + text.slice( midpoint, text.length );
					midpoint = midpoint - 1;
				}
				
				while( text.substring( midpoint + 3, midpoint + 4 ) === " " ){
					text = text.slice( 0, midpoint + 3 ) + text.slice( midpoint + 4, text.length );
					midpoint = midpoint - 1;
				}		
				return text;
			}
		},
		
		createElement : function( tagName ){
			var el = document.createElement( tagName );
			el.setAttribute( "style", "" );
			return el;	
		},
		
		addStyle : function( element, style ){
			var estyles = element.getAttribute( "style" ),
				currentStyles = ( estyles !== null ? estyles : "" );
			element.setAttribute( "style", currentStyles + " " + style + ";" );
		},
		setStyle : function( element, style, value ){
			var newStyles,
				estyles = element.getAttribute( "style" ),
				currentStyles = ( estyles !== null ? estyles : "" ),
				str = '(' + style + ')+ *\\:[^\\;]*\\;',
				re = new RegExp( str , "g" );
			//find styles in the style string
			//([\w\-]+)+ *\:[^\;]*\;
			if( currentStyles.search( re ) >= 0 ){
				newStyles = currentStyles.replace( re, style + ": " + value + ";" ); 
			}else{
				newStyles = currentStyles + " " + style + ": " + value + ";";
			}
			element.setAttribute( "style", newStyles );
		},		
		encode : function( str ){
			return str;
		},
		
		trigger : function( selector, eventType, data ){
			
			selector.dispatchEvent( new CustomEvent( eventType, { detail: data } ) );
			
		},
		getMaxZIndex : function(){
			  var elems = document.querySelectorAll( "*" );
			  var highest = 0;
			  for (var ix = 0; ix < elems.length; ix++ )
			  {
			    var zindex = gadgetui.util.getStyle( elems[ix], "z-index" );
			    if ((zindex > highest) && (zindex != 'auto'))
			    {
			      highest = zindex;
			    }
			  }
			  return highest;
		},
		// copied from jQuery core, re-distributed per MIT License
		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;

			// Go through the array, only saving the items
			// _this pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}

			return matches;
		}
	};
} ());	