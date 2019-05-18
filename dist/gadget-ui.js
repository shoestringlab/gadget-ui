"use strict";

/*
 * author: Robert Munn <robert.d.munn@gmail.com>
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
			UP: 38
		}
};

// save mouse position
document
	.addEventListener( "mousemove", function(ev){ 
		ev = ev || window.event; 
		gadgetui.mousePosition = gadgetui.util.mouseCoords(ev); 
	});


gadgetui.model = ( function() {
	"use strict";

	var _model = {};
	function BindableObject( data, element ) {
		this.data = data;
		this.elements = [ ];
		if ( element !== undefined ) {
			this.bind( element );
		}
	}

	BindableObject.prototype.handleEvent = function( ev ) {
		var ix, obj;
		switch ( ev.type ) {
			case "change":
				for( ix = 0; ix < this.elements.length; ix++ ){
					obj = this.elements[ ix ];
					if( ev.originalSource === undefined ){
						ev.originalSource = "BindableObject.handleEvent['change']";
					}
					if( ev.target.name === obj.prop && ev.originalSource !== 'BindableObject.updateDomElement' ){
						//select box binding
						if( ev.target.type.match( /select/ ) ){
							this.change( { 	id : ev.target.value,
									text : ev.target.options[ev.target.selectedIndex].innerHTML
								}, ev, obj.prop );
						}
						else{
						// text input binding
						this.change( ev.target.value, ev, obj.prop );
						}
					}
				}

		}
	};

	// for each bound control, update the value
	BindableObject.prototype.change = function( value, event, property ) {
		var ix, obj;
		if( event.originalSource === undefined ){
			event.originalSource = "BindableObject.change";
		}
		console.log( "change : Source: " + event.originalSource );

		// this code changes the value of the BinableObject to the incoming value
		if ( property === undefined ) {
			// Directive is to replace the entire value stored in the BindableObject
			// update the BindableObject value with the incoming value
			// value could be anything, simple value or object, does not matter
			this.data = value;
		}
		else if ( typeof this.data === 'object' ) {
			//Directive is to replace a property of the value stored in the BindableObject
			// verifies _this "data" is an object and not a simple value
			// update the BindableObject's specified property with the incoming value
			// value could be anything, simple value or object, does not matter

			if( this.data[ property ] === undefined ){
				throw( "Property '" + property + "' of object is undefined." );
			}
			else{
				this.data[ property ] = value;
			}
			// check if we are updating only a single property or the entire object

		}
		else {
			throw "Attempt to treat a simple value as an object with properties. Change fails.";
		}

		// check if there are other dom elements linked to the property
		for( ix = 0; ix < this.elements.length; ix++ ){
			obj = this.elements[ ix ];
			if( ( property === undefined || property === obj.prop ) && ( event.target !== undefined && obj.elem != event.target ) ){
				this.updateDomElement( event,  obj.elem, value );
			}
		}
	};

	BindableObject.prototype.updateDom = function( event, value, property ){
		var ix, obj, key;
		if( event.originalSource === undefined ){
			event.originalSource = 'BindableObject.updateDom';
		}
		// this code changes the value of the DOM element to the incoming value
		for( ix = 0; ix < this.elements.length; ix++ ){
			obj = this.elements[ ix ];

			if ( property === undefined  ){
				if( typeof value === 'object' ){
					for( key in value ){
						if( this.elements[ ix ].prop === key ){
							this.updateDomElement( event, obj.elem, value[ key ] );
						}
					}
				}else{
					// this code sets the value of each control bound to the BindableObject
					// to the correspondingly bound property of the incoming value
					this.updateDomElement( event, obj.elem, value );
				}

				//break;
			}else if ( obj.prop === property ){
				this.updateDomElement( event, obj.elem, value );
			}
		}
	};

	BindableObject.prototype.updateDomElement = function( event, selector, newValue ){
		var valueElements = "INPUT";
		var arrayElements = "OL,UL,SELECT";
		var wrappingElements = "DIV,SPAN,H1,H2,H3,H4,H5,H6,P,TEXTAREA,LABEL,BUTTON";

		var _updateOptions = function(){
			switch( selector.tagName ){
				case "SELECT":
					while (selector.firstChild) {
						selector.removeChild(selector.firstChild);
					}
					var idx = 0;
					newValue.forEach( function( item ){
						var opt = document.createElement("option");
						if( typeof item === 'object' ){
							opt.value = item.id;
							opt.text = item.text;
						}else{
							opt.text = item;
						}
						selector.appendChild( opt );
						idx++;
					});
				break;
				case "UL":
				case "OL":
					while (selector.firstChild) {
						selector.removeChild(selector.firstChild);
					}
					newValue.forEach( function( item ){
						var opt = document.createElement("li");
						opt.textContent = item;
						selector.appendChild( opt );
					});
				break;
			}
		};

		if( event.originalSource === undefined ){
			event.originalSource = "BindableObject.updateDomElement";
		}
		//console.log( "updateDomElement : selector: { type: " + selector.nodeName + ", name: " + selector.name + " }" );
		//console.log( "updateDomElement : Source: " + event.originalSource );

		// updating the bound DOM element requires understanding what kind of DOM element is being updated
		// and what kind of data we are dealing with

		if( typeof newValue === 'object' ){
			// select box objects are populated with { text: text, id: id }
			if( valueElements.indexOf( selector.tagName ) >=0 ){
				selector.value = newValue.id;
			}else if( arrayElements.indexOf( selector.tagName ) >=0 ){
				_updateOptions();
			}else{
				selector.textContent = newValue.text;
			}
		}else{
			if( valueElements.indexOf( selector.tagName ) >=0 ){
				selector.value = newValue;
			}else if( arrayElements.indexOf( selector.tagName ) >=0 ){
				_updateOptions();
			}else{
				selector.textContent = newValue;
			}
		}

		// we have three ways to update values
		// 1. via a change event fired from changing the DOM element
		// 2. via model.set() which should change the model value and update the dom element(s)
		// 3. via a second dom element, e.g. when more than one dom element is linked to the property
		//    we need to be able to update the other dom elements without entering an infinite loop
		if( event.originalSource !== 'model.set' ){
			var ev = new Event( "change" );
			ev.originalSource = 'model.updateDomElement';
			selector.dispatchEvent( ev );
		}
	};

	// bind an object to an HTML element
	BindableObject.prototype.bind = function( element, property ) {
		var e, _this = this;

		if ( property === undefined ) {
			// BindableObject holds a simple value
			// set the DOM element value to the value of the Bindable object
			element.value = this.data;
			e = {
				elem : element,
				prop : ""
			};
		}
		else {
			// Bindable object holds an object with properties
			// set the DOM element value to the value of the specified property in the
			// Bindable object
			element.value = this.data[ property ];
			e = {
				elem : element,
				prop : property
			};
		}
		//add an event listener so we get notified when the value of the DOM element
		// changes
		//element[ 0 ].addEventListener( "change", this, false );
		//IE 8 support
		if (element.addEventListener) {
			element.addEventListener( "change", this, false);
		}
		else {
			// IE8
			element.attachEvent("onpropertychange", function( ev ){
				if( ev.propertyName === 'value'){
					var el = ev.srcElement, val = ( el.nodeName === 'SELECT' ) ? { id: el.value, text: el.options[el.selectedIndex].innerHTML } : el.value;
					_this.change( val, { target: el }, el.name );
				}
			});
		}
		this.elements.push( e );
	};

	return {
		BindableObject : BindableObject,

		create : function( name, value, element ) {
			if ( element !== undefined ) {
				_model[ name ] = new BindableObject( value, element );
			}
			else {
				_model[ name ] = new BindableObject( value );
			}
		},

		destroy : function( name ) {
			delete _model[ name ];
		},

		bind : function( name, element ) {
			var n = name.split( "." );
			if ( n.length === 1 ) {
				_model[ name ].bind( element );
			}
			else {
				_model[ n[ 0 ] ].bind( element, n[ 1 ] );
			}
		},

		exists : function( name ) {
			if ( _model.hasOwnProperty( name ) ) {
				return true;
			}

			return false;
		},
		// getter - if the name of the object to get has a period, we are
		// getting a property of the object, e.g. user.firstname
		get : function( name ) {
			if( name === null || name === undefined ){
				console.log( "Expected parameter [name] is not defined." );
				return;
			}

			var n = name.split( "." );
			try{
				if ( n.length === 1 ) {
					if( _model[name] === undefined ){
						throw "Key '" + name + "' does not exist in the model.";
					}else{
						return _model[ name ].data;
					}
				}
				if( _model[n[0]] === undefined ){
					throw "Key '" + n[0] + "' does not exist in the model.";
				}
				return _model[n[0]].data[ n[ 1 ] ];

			}catch( e ){
				console.log( e );
				return undefined;
			}
		},

		// setter - if the name of the object to set has a period, we are
		// setting a property of the object, e.g. user.firstname
		set : function( name, value ) {
			if( name === null || name === undefined ){
				console.log( "Expected parameter [name] is not defined." );
				return;
			}

			var n = name.split( "." ), event = { originalSource : 'model.set'};
			if ( this.exists( n[ 0 ] ) === false ) {
				if ( n.length === 1 ) {
					this.create( name, value );
				}
				else {
					// don't create complex objects, only simple values
					throw "Object " + n[ 0 ] + "is not yet initialized.";
				}
			}
			else {
				if ( n.length === 1 ) {
					_model[ name ].change( value, event );
					_model[ name ].updateDom( event, value );
				}
				else {
					_model[ n[ 0 ] ].change( value, event, n[1] );
					_model[ n[ 0 ] ].updateDom( event, value, n[1] );
				}
			}
			//console.log( "model value set: name: " + name + ", value: " + value );
		}
	};

}() );

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
function Bubble( selector, message, options ){
	this.selector = selector;
	this.message = message;
	this.config( options );
	this.render();
	this.setStyles();
	this.setBehaviors();
	this.show();
}

Bubble.prototype.render = function(){
	var span,
		arrowOutside,
		arrowInside,
		bubbleDiv = document.createElement( "div" );
	gadgetui.util.addClass( bubbleDiv, "gadgetui-bubble" );
	gadgetui.util.addClass( bubbleDiv, "gadgetui-bubble-" + this.bubbleType );
	bubbleDiv.setAttribute( "id", this.id );
	bubbleDiv.innerHTML = this.message;

	if( this.closable ){
		span = document.createElement( "span" );
		gadgetui.util.addClass( span, "oi" );
		span.setAttribute( 'data-glyph', "circle-x" );

	}
	arrowOutside = document.createElement( "div" );
	gadgetui.util.addClass( arrowOutside, "gadgetui-bubble-arrow-outside" );

	this.selector.parentNode.insertBefore( bubbleDiv, this.selector.nextSibling );
	this.bubbleSelector = document.getElementById( this.id );
	if( this.closable ){
		this.bubbleSelector.appendChild( span );
	}
	this.bubbleSelector.appendChild( arrowOutside );
	arrowInside = document.createElement( "div" );
	gadgetui.util.addClass( arrowInside, "gadgetui-bubble-arrow-inside" );
	this.bubbleSelector.appendChild( arrowInside );
};

Bubble.prototype.show = function(){
	this.bubbleSelector.style.display = "block";
};

Bubble.prototype.setStyles = function(){

	//console.log( "top: " + this.top + ", left: " + this.left );
	this.setBubbleStyles();
	this.calculateArrowPosition();
	this.calculateArrowStyle();
	this.setBeforeRules();
	this.setAfterRules();
	this.calculatePosition();

	this.bubbleSelector.style.top = this.top + "px";
	this.bubbleSelector.style.left = this.left + "px";

	this.spanElement = this.bubbleSelector.getElementsByTagName( "span" );
	var spanLeft = this.bubbleWidth - 6 - this.closeIconSize - this.borderWidth * 2,
		css = gadgetui.util.setStyle;
	css( this.spanElement[0], "left", spanLeft + "px" );
	css( this.spanElement[0], "position", "absolute" );
	css( this.spanElement[0], "cursor", "pointer"  );
	css( this.spanElement[0], "top", 6 + "px" );
	css( this.spanElement[0], "color", this.borderColor );
};

Bubble.prototype.setBubbleStyles = function(){
	var css = gadgetui.util.setStyle;
	css( this.bubbleSelector, "margin", 0 );
	css( this.bubbleSelector, "padding", this.padding + "px" );
	css( this.bubbleSelector, "width", this.width + "px" );
	css( this.bubbleSelector, "height", this.height + "px" );
	css( this.bubbleSelector, "line-height", this.lineHeight + "px" );
	css( this.bubbleSelector, "border-radius", this.borderRadius + "px" );

	css( this.bubbleSelector, "-moz-border-radius", this.borderRadius + "px" );
	css( this.bubbleSelector, "-webkit-border-radius", this.borderRadius + "px" );

	css( this.bubbleSelector, "-webkit-box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor );
	css( this.bubbleSelector, "-moz-box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor );
	css( this.bubbleSelector, "box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor );

	css( this.bubbleSelector, "border", this.borderWidth + "px solid " + this.borderColor );
	css( this.bubbleSelector, "background-color", this.backgroundColor );
	css( this.bubbleSelector, "position", "absolute" );
	css( this.bubbleSelector, "text-align", "left" );
	css( this.bubbleSelector, "opacity", this.opacity );
	css( this.bubbleSelector, "font", this.font );
	css( this.bubbleSelector, "z-index", this.zIndex );
};

Bubble.prototype.setBeforeRules = function(){
	// set rules on paragraph :before pseudo-selector
	var css = gadgetui.util.setStyle,
		outside = this.bubbleSelector.getElementsByClassName( "gadgetui-bubble-arrow-outside" );
	css( outside[0], "content", " " );
	css( outside[0], "position", "absolute" );
	css( outside[0], "width", 0 );
	css( outside[0], "height", 0 );
	css( outside[0], "left", this.beforeArrowLeft + "px" );
	css( outside[0], "top", this.arrowTop + "px" );
	css( outside[0], "border", this.arrowSize + "px solid" );
	css( outside[0], "border-color", this.beforeBorderColor );
};

Bubble.prototype.setAfterRules = function(){
		var css = gadgetui.util.setStyle,
			inside = this.bubbleSelector.getElementsByClassName( "gadgetui-bubble-arrow-inside" );

		css( inside[0], "content", " " );
		css( inside[0], "position", "absolute" );
		css( inside[0], "width", 0 );
		css( inside[0], "height", 0 );
		css( inside[0], "left", this.afterArrowLeft + "px" );
		css( inside[0], "top", this.afterArrowTop + "px" );
		css( inside[0], "border", this.afterArrowSize + "px solid" );
		css( inside[0], "border-color", this.afterBorderColor );
};

Bubble.prototype.calculatePosition = function(){
	var _this = this;
	// Here we must walk up the DOM to the ancestors of the selector to see whether they are set to position: relative. If _this is the case,
	// we must add the offset values of the ancestor to the position values for the control or it will not be correctly placed.
	this.relativeOffset = gadgetui.util.getRelativeParentOffset( this.selector );

	//$.each(  this.position.split( " " ), function( ix, ele ){
	this.position.split( " " ).forEach( function( ele ){
		switch( ele ){
			case "top":
				_this.top =  _this.top - _this.relativeOffset.top;
				break;
			case "bottom":
				_this.top =  _this.top + _this.selector.offsetHeight - _this.relativeOffset.top;
				//console.log( "_this.top + _this.selector.outerHeight() " + _this.selector.outerHeight() );
				break;
			case "left":

				break;
			case "right":
				_this.left = _this.left + _this.selector.offsetWidth - _this.relativeOffset.left;
				//console.log( "_this.left + _this.selector.outerWidth() - _this.relativeOffset.left " + _this.selector.outerWidth() );
				break;
			case "center":
				_this.left = _this.left + _this.selector.offsetWidth / 2  - _this.relativeOffset.left;
				//console.log( "_this.left + _this.selector.outerWidth() / 2 - _this.relativeOffset.left  " + _this.selector.outerWidth() / 2);
				break;
			}
	});
};

Bubble.prototype.calculateArrowPosition = function(){
	var doubleArrow = this.arrowSize * 2,
		afterArrowCenter,
		doublePadding = this.padding * 2,
		arrowOffset = this.borderWidth + this.borderRadius + this.arrowSize,
		afterArrowOffset =  Math.floor( Math.sqrt( Math.pow( this.borderWidth, 2 ) + Math.pow( this.borderWidth, 2 ) ) ) - 1;

		this.afterArrowSize = this.arrowSize - afterArrowOffset;
		afterArrowCenter = ( doubleArrow - this.afterArrowSize * 2) / 2;
	switch( this.arrowPositionArray[0] ){
		case "left":
			this.beforeArrowLeft = -doubleArrow;
			this.afterArrowLeft = -this.afterArrowSize * 2;
			this.left = this.left + this.arrowSize - this.borderWidth;
			//console.log( "this.left + this.arrowSize - this.borderWidth" );
			break;
		case "right":
			this.beforeArrowLeft = this.width + doublePadding;
			this.afterArrowLeft = this.beforeArrowLeft;
			this.left = this.left - this.bubbleWidth - this.arrowSize + this.borderWidth;
			//console.log( "this.left - this.bubbleWidth - this.arrowSize + this.borderWidth" );
			break;
		case "top":
			this.arrowTop = -( doubleArrow );
			this.afterArrowTop = -( this.afterArrowSize * 2 );
			this.top = this.top + this.arrowSize - this.borderWidth;
			//console.log( "this.top + this.arrowSize - this.borderWidth" );
			break;
		case "bottom":

			this.arrowTop = this.height + doublePadding;
			this.afterArrowTop = this.arrowTop;
			this.top = this.top - this.bubbleHeight - this.arrowSize + this.borderWidth;
			//console.log( "this.top - this.bubbleHeight - this.arrowSize + this.borderWidth" );
			break;
	}

	switch( this.arrowPositionArray[1] ){
		case "top":
			this.arrowTop = this.borderRadius;
			this.afterArrowTop = this.arrowTop + afterArrowCenter;
			this.top = this.top - arrowOffset;
			//console.log( "this.top - arrowOffset" );
			break;
		case "bottom":

			this.arrowTop = this.bubbleHeight - this.borderWidth * 2 - doubleArrow - this.borderRadius;
			this.afterArrowTop = this.arrowTop + afterArrowCenter;
			this.top = this.top - this.bubbleHeight + arrowOffset;
			//console.log( "this.top - this.bubbleHeight + arrowOffset" );
			break;
		case "right":
			this.beforeArrowLeft = this.bubbleWidth - this.borderWidth * 2 - doubleArrow - this.borderRadius;
			this.afterArrowLeft = this.beforeArrowLeft + afterArrowOffset;
			this.left = this.left - this.bubbleWidth + arrowOffset;
			//console.log( "this.left - this.bubbleWidth + arrowOffset" );
			break;
		case "left":
			this.beforeArrowLeft = this.borderRadius;
			this.afterArrowLeft = this.beforeArrowLeft + afterArrowOffset;
			this.left = this.left - arrowOffset;
			//console.log( "this.left - arrowOffset" );
			break;
	}

};

Bubble.prototype.calculateArrowStyle = function(){
	var colorArray = [], arrowStart = this.arrowPositionArray[0], arrowEnd = this.arrowPositionArray[1] + " " + this.arrowDirection;


	if( this.arrowDirection === 'middle' ){
		switch( this.arrowPositionArray[0] ){
		case "top":
			this.beforeBorderColor = "transparent transparent " + this.borderColor + " transparent";
			this.afterBorderColor = "transparent transparent #fff transparent";
			break;
		case "bottom":
			this.beforeBorderColor = this.borderColor + " transparent transparent transparent";
			this.afterBorderColor = "#fff transparent transparent transparent";
			break;
		case "right":
			this.beforeBorderColor = "transparent transparent transparent " + this.borderColor;
			this.afterBorderColor = "transparent transparent transparent #fff";
			break;
		case "left":
			this.beforeBorderColor = "transparent " + this.borderColor + " transparent transparent";
			this.afterBorderColor = "transparent #fff transparent transparent";
			break;
		}
	}else{
		if( arrowStart === 'top' || arrowEnd === 'bottom corner' || arrowEnd === 'top center' ){
			colorArray[0] = 'transparent';
			colorArray[2] =  this.borderColor;
		}else if( arrowStart === 'bottom' || arrowEnd === 'bottom center' || arrowEnd === 'top corner' ){
			colorArray[0] = this.borderColor;
			colorArray[2] =  'transparent';
		}

		if( arrowStart === 'right' || arrowEnd === 'left corner' || arrowEnd === 'right center' ){
			colorArray[1] = 'transparent';
			colorArray[3] =  this.borderColor;
		}else if( arrowStart === 'left' || arrowEnd === 'left center' || arrowEnd === 'right corner' ){
			colorArray[1] =  this.borderColor;
			colorArray[3] = 'transparent';
		}

		this.beforeBorderColor = colorArray.toString().replace( /\),/gi, ") " ).replace( /,transparent/gi, " transparent" ).replace( /transparent,/gi, "transparent " );
		this.afterBorderColor = this.beforeBorderColor.replace( this.borderColor, "#fff", "g" );
		//console.log( this.beforeBorderColor );
		//console.log( this.afterBorderColor );
	}

};

Bubble.prototype.setBehaviors = function(){
	var _this = this,
		css = gadgetui.util.setStyle;
	//$( "span", this.bubbleSelector )
	this.spanElement[0]
		.addEventListener( "click", function(){
				css( _this.bubbleSelector, "display", 'none' );
				_this.bubbleSelector.parentNode.removeChild( _this.bubbleSelector );
			});

	if( this.autoClose ){
		closeBubble = function(){
			css( _this.bubbleSelector, "display", 'none' );
			_this.bubbleSelector.parentNode.removeChild( _this.bubbleSelector );
		};
		setTimeout( closeBubble, this.autoCloseDelay );
	}
};

Bubble.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	//var baseUIColor = getStyleRuleValue( "color", ".ui-state-active" );
	var baseUIColor = "silver";
	this.bubbleType = ( options.bubbleType === undefined ? "speech" : options.bubbleType );
	this.id = "gadgetui-bubble-" + gadgetui.util.Id();
	this.height = ( options.height === undefined ? 100 : options.height );
	this.position = ( options.position === undefined ? "top right" : options.position ); // position of arrow tip on selector - top right | bottom right | top center | bottom center | top left | bottom left
	this.width = ( options.width === undefined ? 200 : options.width ); // width of bubble
	this.padding = ( options.padding === undefined ? 20 : options.padding ); // interior padding of bubble
	this.opacity = ( options.opacity === undefined ? 1 : options.opacity ); // interior padding of bubble
	// baseline position
	this.top = gadgetui.util.getOffset( this.selector ).top;
	//console.log( "initial top: " + this.top );
	this.left = gadgetui.util.getOffset( this.selector ).left;
	//console.log( "initial left: " + this.left );
	this.shadowColor = ( options.shadowColor === undefined ? baseUIColor : options.shadowColor );
	this.shadowSize = 2; // shadow
	this.borderColor = ( options.borderColor === undefined ? baseUIColor : options.borderColor );
	this.borderWidth = ( options.borderWidth === undefined ? 8 : options.borderWidth ); //	border: 8px solid #CC4B4B; // width of bubble border
	this.arrowPosition = ( options.arrowPosition === undefined ? "bottom left" : options.arrowPosition ); // location of arrow on bubble - top left | top right | top center | right top | right center | right bottom | bottom right | bottom center | bottom right | left bottom | left center | left top
	this.arrowDirection =  ( options.arrowDirection === undefined ? "middle" : options.arrowDirection ); // direction arrow points - center | corner | middle
	this.arrowPositionArray = this.arrowPosition.split( " " );
	this.bubbleWidth = this.width + (this.padding * 2) + (this.borderWidth * 2); // full width of visible bubble
	this.bubbleHeight = this.height + (this.padding * 2) + (this.borderWidth * 2); // full height of visible bubble
	//this.setArrowDirection();

	this.closeIconSize = 13; // ui-icon css
	this.arrowSize = ( options.arrowSize === undefined ? 25 : options.arrowSize ); // half size of arrow
	this.backgroundColor = ( options.backgroundColor === undefined ? "#FFFFFF" : options.backgroundColor );
	this.lineHeight = ( options.lineHeight === undefined ? "1.2em" : options.lineHeight ); // line height of text in bubble
	this.borderRadius = ( options.borderRadius === undefined ? 30 : options.borderRadius );	//border-radius
	this.boxShadowColor = ( options.boxShadowColor === undefined ? baseUIColor : options.boxShadowColor );
	this.font = ( options.font === undefined ? "1em Arial sans" : options.font );
	this.zIndex = ( options.zIndex === undefined ? gadgetui.util.getMaxZIndex() + 1 : options.zIndex );
	this.closable = ( options.closable === undefined ? false : options.closable );
	this.autoClose = ( options.autoClose === undefined ? false : options.autoClose );
	this.autoCloseDelay = ( options.autoCloseDelay === undefined ? 5000 : options.autoCloseDelay );
	this.relativeOffset = { left: 0, top: 0 };
};

function CollapsiblePane( selector, options ){

	this.selector = selector;
	this.config( options );

	this.addControl();

	this.addCSS();
	this.addHeader();

	this.icon = this.wrapper.querySelector( "div.oi" );

	this.addBindings();
	this.height = this.wrapper.offsetHeight;
	this.headerHeight = this.header.offsetHeight;
	this.selectorHeight = this.selector.offsetHeight;
	//if( this.collapse === true ){
		this.toggle();
	//}
}

CollapsiblePane.prototype.addControl = function(){
	var pane = document.createElement( "div" );


	if( this.class ){
		gadgetui.util.addClass( pane, this.class );
	}else{
		gadgetui.util.addClass( pane, "gadget-ui-collapsiblePane" );
	}
	this.selector.parentNode.insertBefore( pane, this.selector );
	this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild( this.selector );
	pane.appendChild( this.selector );
};

CollapsiblePane.prototype.addHeader = function(){
	var div,
	css = gadgetui.util.setStyle,
		header = document.createElement( "div" );

	if( this.headerClass ){
		gadgetui.util.addClass( header, this.headerClass );
	}else{
		gadgetui.util.addClass( header, "gadget-ui-collapsiblePane-header" );
	}
	header.innerHTML = this.title;
	this.wrapper.insertBefore( header, this.selector );
	this.header = ( this.headerClass ? this.wrapper.querySelector( "div." + this.headerClass ) : this.wrapper.querySelector( "div.gadget-ui-collapsiblePane-header" ) ) ;
	div = document.createElement( "div" );
	//gadgetui.util.addClass( div, "oi" );
	//div.setAttribute( 'data-glyph', "chevron-top" );
	this.header.appendChild( div );
};

CollapsiblePane.prototype.addCSS = function(){
	var theWidth = this.width,
		css = gadgetui.util.setStyle;
	css( this.wrapper, "width", theWidth );
	css( this.wrapper, "overflow",  "hidden" );
};

CollapsiblePane.prototype.addBindings = function(){
	var _this = this,
	header = ( this.headerClass ? this.wrapper.querySelector( "div." + this.headerClass ) : this.wrapper.querySelector( "div.gadget-ui-collapsiblePane-header" ) ) ;

	header
		.addEventListener( "click", function(){
			_this.toggle();
		});
};

CollapsiblePane.prototype.toggle = function(){
	var _this = this,
		css = gadgetui.util.setStyle,
		icon,
		myHeight,
		display,
		//border,
		selectorHeight,
		expandClass = "",
		collapseClass = "";
	if( this.collapsed === true ){
		icon = collapseClass;
		display = "block";
		myHeight = this.height;
		selectorHeight = this.selectorHeight;
		this.collapsed = false;
	}else{
		icon = expandClass;
		display = "none";
		myHeight = this.headerHeight;
		selectorHeight = 0;
		this.collapsed = true;
	}

	this.eventName = ( this.collapsed ? "collapse" : "expand" );

	var ev = new Event( this.eventName );
	this.selector.dispatchEvent( ev );

	if( typeof Velocity != 'undefined' && this.animate ){

		Velocity( this.wrapper, {
			height: myHeight
		},{ queue: false, duration: 300, complete: function() {
			//_this.icon.setAttribute( "data-glyph", icon );
			}
		});
		Velocity( this.selector, {
			height: selectorHeight
		},{ queue: false, duration: 300, complete: function() {

			}
		});
	}else{
		css( this.selector, "display", display );
		//this.icon.setAttribute( "data-glyph", icon );
	}
};

CollapsiblePane.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.animate = (( options.animate === undefined) ? true : options.animate );
	this.title = ( options.title === undefined ? "": options.title );
	this.width = gadgetui.util.getStyle( this.selector, "width" );
	this.collapse = ( ( options.collapse === undefined ? false : options.collapse ) );
	this.collapsed = ( ( options.collapse === undefined ? true :!  options.collapse ) );
	this.class = ( ( options.class === undefined ? false : options.class ) );
	this.headerClass = ( ( options.headerClass === undefined ? false : options.headerClass ) );
};


function Dialog( selector, options ){

  this.selector = selector;
	if( options !== undefined ){
		this.config( options );
    this.buttons = ( options.buttons !== undefined ? options.buttons : [] );
	}

	this.setup( options );

  this.addButtons();
}

Dialog.prototype = FloatingPane.prototype;

Dialog.prototype.addButtons = function(){
  var self = this;
  var css = gadgetui.util.setStyle;
  this.buttonDiv = document.createElement( "div" );
  css( this.buttonDiv, "text-align", "center" );
  css( this.buttonDiv, "padding", ".5em" );
  this.buttons.forEach( function( button ){
    var btn = document.createElement( "button" );
    btn.innerText = button.label;
    css( btn, "margin", ".5em" );
    btn.addEventListener( "click", button.click );
    self.buttonDiv.appendChild( btn );
  });
  this.wrapper.appendChild( this.buttonDiv );
}


function FileUploadWrapper(file, selector) {
  var ix,
    id,
    options,
    bindings = gadgetui.objects.EventBindings.getAll();

  id = gadgetui.util.Id();
  options = { id: id, filename: file.name, width: gadgetui.util.getStyle( selector, "width" )};
  this.file = file;
  this.id = id;
  this.progressbar = new gadgetui.display.ProgressBar(selector, options);
  this.progressbar.render();
  for (ix = 0; ix < bindings.length; ix++) {
    this[bindings[ix].name] = bindings[ix].func;
  }
}

FileUploadWrapper.prototype.events = ["uploadComplete"];

FileUploadWrapper.prototype.completeUpload = function(fileItem) {
  this.progressbar.destroy();
  this.fireEvent("uploadComplete", fileItem);
};

function FloatingPane( selector, options ){
	this.selector = selector;
	if( options !== undefined ){
		this.config( options );
	}

	this.setup( options );
}

FloatingPane.prototype.setup = function( options ){
	this.addControl();
	this.addHeader();
	if( this.enableShrink ){
		this.maxmin = this.wrapper.querySelector( "div.oi[name='maxmin']" );
	}
	// need to be computed after header is done
	this.minWidth = ( this.title.length > 0 ? gadgetui.util.textWidth( this.title, this.header.style ) + 50 : 100 );
	var paddingPx = ( parseInt( gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector, "padding" ) ), 10 ) * 2 );
	// 6 px is padding + border of header
	var headerHeight = gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.header, "height" ) ) + 6;
	//set height by setting width on selector to get content height at that width
	gadgetui.util.setStyle( this.selector, "width", this.width - paddingPx );
	this.height = ( options.height === undefined ? gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector, "height" ) ) + paddingPx + headerHeight + 10 : options.height );

	this.addCSS();

	// now set height to computed height of control _this has been created
	this.height = gadgetui.util.getStyle( this.wrapper, "height" );

	this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset( this.selector ).left;
	this.addBindings();
	if( this.enableShrink ){
		this.minimize();
		this.expand();
	}
};

FloatingPane.prototype.addBindings = function(){
	var _this = this;

	var dragger = gadgetui.util.draggable( this.wrapper );

	this.wrapper.addEventListener( "drag_end", function( event ){
		_this.top = event.detail.top;
		_this.left = event.detail.left;
		_this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset( _this.selector ).left;
		console.log( _this );
	});

	if( this.enableShrink ){
		this.maxmin.addEventListener( "click", function( event ){
			if( _this.minimized ){
				_this.expand();
			}else{
				_this.minimize();
			}
		});
	}
	if( this.enableClose ){
		this.closeIcon.addEventListener( "click", function(){ _this.close.apply( _this ) } );
	}
};

FloatingPane.prototype.close = function(){
	this.wrapper.parentNode.removeChild( this.wrapper );
};

FloatingPane.prototype.addHeader = function(){
	var css = gadgetui.util.setStyle;
	this.header = document.createElement( "div" );
	this.header.innerHTML = this.title;
	if( this.headerClass ){
		gadgetui.util.addClass( header, this.headerClass );
	}else{
		gadgetui.util.addClass( this.header, 'gadget-ui-floatingPane-header' );
	}
	//this.header.setAttribute( "style",
	if( this.enableShrink ){
		this.icon = document.createElement( "div" );
		gadgetui.util.addClass( this.icon, "oi" );
		this.icon.setAttribute( "name", "maxmin" );
		this.header.insertBefore( this.icon, undefined );
		this.wrapper.insertBefore( this.header, this.selector );
		this.icon.setAttribute( 'data-glyph', "fullscreen-exit" );
		this.header.appendChild( this.icon );
	}else{
		this.wrapper.insertBefore( this.header, this.selector );
	}

	if( this.enableClose ){
		this.closeIcon = document.createElement( "div" );
		this.closeIcon.setAttribute( "name", "closeIcon" );
		css( this.closeIcon, "float", "right" );
		css( this.closeIcon, "display", "inline-block" );
		css( this.closeIcon, "margin-right", "3px" );
		gadgetui.util.addClass( this.closeIcon, "oi" );
		this.header.appendChild( this.closeIcon );
		this.closeIcon.setAttribute( 'data-glyph', "circle-x" );
	}
};

FloatingPane.prototype.addCSS = function(){
	var css = gadgetui.util.setStyle;
	//copy width from selector
	css( this.wrapper, "width",  this.width );
	if( this.enableShrink ){
		css( this.maxmin, "float", "left" );
		css( this.maxmin, "display", "inline" );
	}
	if( this.top !== undefined ) css( this.wrapper, "top", this.top );
	if( this.left !== undefined )css( this.wrapper, "left", this.left );
	if( this.bottom !== undefined ) css( this.wrapper, "bottom", this.bottom );
	if( this.right !== undefined )css( this.wrapper, "right", this.right );
};

FloatingPane.prototype.addControl = function(){
	var fp = document.createElement( "div" );
	if( this.class ){
		gadgetui.util.addClass( pane, this.class );
	}else{
		gadgetui.util.addClass( fp, "gadget-ui-floatingPane" );
	}
	fp.draggable = true;
	this.selector.parentNode.insertBefore( fp, this.selector );
	this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild( this.selector );
	fp.appendChild( this.selector );

};

FloatingPane.prototype.expand = function(){
	// when minimizing and expanding, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position

	var _this = this,
		css = gadgetui.util.setStyle,
		offset = gadgetui.util.getOffset( this.wrapper ),
		parentPaddingLeft = parseInt( gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.wrapper.parentElement, "padding-left" ) ), 10 ),
		lx =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft - parentPaddingLeft;

		//width = parseInt( gadgetui.util.getNumberValue( this.width ), 10 );

	if( typeof Velocity != 'undefined' && this.animate ){

		Velocity( this.wrapper, {
			width: this.width
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		});

		Velocity( this.selector, {
			height: this.height
		},{queue: false, duration: 500, complete: function() {
			_this.icon.setAttribute( "data-glyph", "fullscreen-exit" );
			css( _this.selector, "overflow", "scroll" );
		}
		});
	}else{
		css( this.wrapper, "width", this.width );
		css( this.selector, "height", this.height );
		this.icon.setAttribute( "data-glyph", "fullscreen-exit" );
		css( this.selector, "overflow", "scroll" );
	}

	this.minimized = false;
};

FloatingPane.prototype.minimize = function(){
	// when minimizing and maximizing, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position

	var _this = this,
		css = gadgetui.util.setStyle,
		offset = gadgetui.util.getOffset( this.wrapper ),
		parentPaddingLeft = parseInt( gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.wrapper.parentElement, "padding-left" ) ), 10 ),
		lx =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft - parentPaddingLeft,
		width = parseInt( gadgetui.util.getNumberValue( this.width ), 10 );

	css( this.selector, "overflow", "hidden" );

	if( typeof Velocity != 'undefined' && this.animate ){

		Velocity( this.wrapper, {
			width: _this.minWidth
		},{queue: false, duration: 500, complete: function() {
			_this.icon.setAttribute( "data-glyph", "fullscreen-enter" );
			}
		});

		Velocity( this.selector, {
			height: "50px"
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		});
	}else{
		//css( this.wrapper, "left", ( lx + width - this.minWidth ) );
		css( this.wrapper, "width", this.minWidth );
		css( this.selector, "height", "50px" );
		this.icon.setAttribute( "data-glyph", "fullscreen-enter" );
	}
	this.minimized = true;
};

FloatingPane.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.animate = (( options.animate === undefined) ? true : options.animate );
	this.title = ( options.title === undefined ? "": options.title );
	this.width = gadgetui.util.getStyle( this.selector, "width" );
	this.class = ( ( options.class === undefined ? false : options.class ) );
 	this.top = ( options.top === undefined ? undefined: options.top );
	this.left = ( options.left === undefined ? undefined : options.left );
	this.bottom = ( options.bottom === undefined ? undefined : options.bottom );
	this.right = ( options.right === undefined ? undefined : options.right );
	this.headerClass = ( ( options.headerClass === undefined ? false : options.headerClass ) );
	this.minimized = false;
	this.relativeOffsetLeft = 0;
	this.enableShrink = ( options.enableShrink !== undefined ? options.enableShrink : true );
	this.enableClose = ( options.enableClose !== undefined ? options.enableClose : true );
};

function Modal( selector, options ){
	this.selector = selector;
	if( options !== undefined ){
		this.config( options );
	}

	this.setup( options );
}

Modal.prototype.config = function( options ){
  var css = gadgetui.util.setStyle;
  options = ( options === undefined ? {} : options );
  this.zIndex = (( options.zIndex === undefined) ? 1 : options.zIndex );

};


function ProgressBar(selector, options) {
  this.selector = selector;
  this.configure(options);
}

ProgressBar.prototype.configure = function(options) {
  this.id = options.id;
  this.filename = options.filename;
  this.width = options.width;
};

ProgressBar.prototype.render = function() {
  var css = gadgetui.util.setStyle;
/*   document.querySelector(this.selector).append(
    '<div class="gadgetui-progressbar-progressbox" name="progressbox_' +
      this.id +
      '" style="display:none;"><div name="filename" class="gadgetui-progressbar-filename">' +
      this.filename +
      '</div><div class="progressbar" name="progressbar_' +
      this.id +
      '"></div ><div name="statustxt" class="statustxt">0%</div></div>'
  ); */
  var pbDiv = document.createElement( "div" );
  pbDiv.setAttribute( "name", "progressbox_" + this.id );
  gadgetui.util.addClass( pbDiv, "gadgetui-progressbar-progressbox" );
  css( pbDiv, "display", "none" );

  var fileDiv = document.createElement( "div" );
  fileDiv.setAttribute( "name", "filename" );
  gadgetui.util.addClass( fileDiv, "gadgetui-progressbar-filename" );
  fileDiv.innerText = this.filename;
  pbDiv.appendChild( fileDiv );

  var pbarDiv = document.createElement( "div" );
  gadgetui.util.addClass( pbarDiv, "progressbar" );
  pbarDiv.setAttribute( "name", "progressbar_" + this.id );
  pbDiv.appendChild( pbarDiv );

  var statusDiv = document.createElement( "div" );
  statusDiv.setAttribute( "name", "statustxt" );
  gadgetui.util.addClass( statusDiv, "statustxt" );
  statusDiv.innertText = "0%";
  pbDiv.appendChild( statusDiv );

  this.selector.appendChild( pbDiv );

  this.progressbox = document.querySelector(
    "div[name='progressbox_" + this.id + "']",
    this.selector
  );
  this.progressbar = document.querySelector(
    "div[name='progressbar_" + this.id + "']",
    this.selector
  );
  this.statustxt = document.querySelector( "div[name='statustxt']", document.querySelector("div[name='progressbox_" + this.id + "']", this.selector) );
  css( this.progressbox, "display", "inline-block" );
  css( this.progressbox, "width", this.width );
};

ProgressBar.prototype.start = function() {
  var css = gadgetui.util.setStyle;
  css( this.progressbar, "width", "0" );
  this.statustxt.innerHTML = "0%";
};

ProgressBar.prototype.updatePercent = function(percent) {
  var css = gadgetui.util.setStyle;
  var percentage = percent + "%";
  this.percent = percent;
  css( this.progressbar, "width", percentage);
  this.statustxt.innerHTML = percentage;
  if (percent > 50) {
    css(this.statustxt,"color", "#fff");
  }
};

ProgressBar.prototype.update = function(text) {
  this.statustxt.innerHTML = text;
};

ProgressBar.prototype.destroy = function() {
  this.progressbox.parentNode.removeChild( this.progressbox );
};


	return{
		Bubble : Bubble,
		CollapsiblePane: CollapsiblePane,
		Dialog: Dialog,
		FloatingPane: FloatingPane,
		FileUploadWrapper: FileUploadWrapper,
		ProgressBar: ProgressBar
	};
}());

gadgetui.input = (function() {
	
	
function ComboBox( selector, options ){
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;
	this.config( options );
	this.setSaveFunc();
	this.setDataProviderRefresh();
	this.addControl();
	this.addCSS();
	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.label, this.model );
	this.addBehaviors();
	this.setStartingValues();
}

ComboBox.prototype.addControl = function(){
	var css = gadgetui.util.setStyle;
	this.comboBox = gadgetui.util.createElement( "div" );
	this.input = gadgetui.util.createElement( "input" );
	this.label = gadgetui.util.createElement( "div" );
	this.inputWrapper = gadgetui.util.createElement( "div" );
	this.selectWrapper = gadgetui.util.createElement( "div" );

	gadgetui.util.addClass( this.comboBox, "gadgetui-combobox" );
	gadgetui.util.addClass( this.input, "gadgetui-combobox-input" );
	gadgetui.util.addClass( this.label, "gadgetui-combobox-label" );
	gadgetui.util.addClass( this.inputWrapper, "gadgetui-combobox-inputwrapper" );
	gadgetui.util.addClass( this.selectWrapper,"gadgetui-combobox-selectwrapper" );

	this.selector.parentNode.insertBefore( this.comboBox, this.selector );
	this.selector.parentNode.removeChild( this.selector );
	this.comboBox.appendChild( this.label );
	this.selectWrapper.appendChild( this.selector );
	this.comboBox.appendChild( this.selectWrapper );
	this.inputWrapper.appendChild( this.input );
	this.comboBox.appendChild( this.inputWrapper );
	this.label.setAttribute( "data-id", this.id );
	this.label.setAttribute( "gadgetui-bind", this.selector.getAttribute( "gadgetui-bind" ) );
	this.label.innerHTML = this.text;
	this.input.setAttribute( "placeholder", this.newOption.text );
	this.input.setAttribute( "type", "text" );
	this.input.setAttribute( "name", "custom" );

	css( this.comboBox, "opacity", ".0" );
};

ComboBox.prototype.addCSS = function(){
	var css = gadgetui.util.setStyle;
	gadgetui.util.addClass( this.selector, "gadgetui-combobox-select" );
	css( this.selector, "width", this.width );
	css( this.selector, "border",  0 );
	css( this.selector, "display",  "inline" );
	css( this.comboBox, "position",  "relative" );

	var styles = gadgetui.util.getStyle( this.selector ),
		inputWidth = this.selector.clientWidth,
		inputWidthAdjusted,
		inputLeftOffset = 0,
		selectMarginTop = 0,
		selectLeftPadding = 0,
		leftOffset = 0,
		inputWrapperTop = this.borderWidth,
		inputLeftMargin,
		leftPosition;

	leftPosition = gadgetui.util.getNumberValue( this.borderWidth ) + 4;

	if( this.borderRadius > 5 ){
		selectLeftPadding = this.borderRadius - 5;
		leftPosition = gadgetui.util.getNumberValue( leftPosition ) + gadgetui.util.getNumberValue( selectLeftPadding );
	}
	inputLeftMargin = leftPosition;
	inputWidthAdjusted = inputWidth - this.arrowWidth - gadgetui.util.getNumberValue( this.borderRadius ) - 4;
	console.log( navigator.userAgent );
	if( navigator.userAgent.match( /(Safari)/ ) && !navigator.userAgent.match( /(Chrome)/ )){
		inputWrapperTop = this.borderWidth - 2;
		selectLeftPadding = (selectLeftPadding < 4 ) ? 4 : this.borderRadius - 1;
		selectMarginTop = 1;
	}else if( navigator.userAgent.match( /Edge/ ) ){
		selectLeftPadding = (selectLeftPadding < 1 ) ? 1 : this.borderRadius - 4;
		inputLeftMargin--;
	}else if( navigator.userAgent.match( /MSIE/) ){
		selectLeftPadding = (selectLeftPadding < 1 ) ? 1 : this.borderRadius - 4;
	}else if( navigator.userAgent.match( /Trident/ ) ){
		selectLeftPadding = (selectLeftPadding < 2 ) ? 2 : this.borderRadius - 3;
	}else if( navigator.userAgent.match( /Chrome/ ) ){
		selectLeftPadding = (selectLeftPadding < 4 ) ? 4 : this.borderRadius - 1;
		selectMarginTop = 1;
	}

	// positioning
	css( this.selector, "margin-top", selectMarginTop );
	css( this.selector, "padding-left", selectLeftPadding );

	css( this.inputWrapper, "top", inputWrapperTop );
	css( this.inputWrapper,"left",leftOffset );

	css( this.input, "width", inputWidthAdjusted );
	css( this.input, "font-size", styles.fontSize );

	//appearance
	css( this.comboBox, "font-size", styles.fontSize );

	css( this.label,"left",leftPosition );
	css( this.label, "font-family", styles.fontFamily );
	css( this.label, "font-size", styles.fontSize );
	css( this.label, "font-weight", styles.fontWeight );
	// add rules for arrow Icon
	//we're doing this programmatically so we can skin our arrow icon
	if( navigator.userAgent.match( /Firefox/) ){
		if( this.scaleIconHeight === true ){
			css( this.selectWrapper, "background-size",  this.arrowWidth + "px " + inputHeight + "px" );
		}
	}
	css( this.selector, "-webkit-appearance",  "none" );
	css( this.selector, "-moz-appearance",  "window" );

	if( this.scaleIconHeight === true ){
		css( this.selector, "background-size",  this.arrowWidth + "px " + inputHeight + "px" );
	}

	css( this.comboBox, "opacity",  1 );

	if( this.hideable ){
		css( this.inputWrapper, "display", 'none' );
		css( this.selectWrapper, "display", 'none' );
	}else{
		css( this.selectWrapper, "display", 'inline' );
				css( this.label, "display", 'none' );
		if( this.selector.selectedIndex <= 0 ) {
			css( this.inputWrapper, "display", 'inline' );
		}
	}
};

ComboBox.prototype.setSelectOptions = function(){
	var _this = this, id, text, option;


	while (_this.selector.options.length > 0) {
		_this.selector.remove(0);
    }
	//console.log( "append new option" );
	option = gadgetui.util.createElement( "option" );
	option.value = _this.newOption.id;
	option.text = _this.newOption.text;
	_this.selector.add( option );

	this.dataProvider.data.forEach( function( obj ){
		id = obj.id;
		text = obj.text;
		if( text === undefined ){
			text = id;
		}
		option = gadgetui.util.createElement( "option" );
		option.value = id;
		option.text = text;

		_this.selector.add( option );
	});
};

ComboBox.prototype.find = function( text ){
	var ix;
	for( ix = 0; ix < this.dataProvider.data.length; ix++ ){
		if( this.dataProvider.data[ix].text === text ){
			return this.dataProvider.data[ix].id;
		}
	}
	return;
};

ComboBox.prototype.getText = function( id ){
	var ix,
		compId = parseInt( id, 10 );
	if( isNaN( compId ) === true ){
		compId = id;
	}
	for( ix = 0; ix < this.dataProvider.data.length; ix++ ){
		if( this.dataProvider.data[ix].id === compId ){
			return this.dataProvider.data[ix].text;
		}
	}
	return;
};
ComboBox.prototype.showLabel = function(){
	var css = gadgetui.util.setStyle;
	css( this.label, "display", "inline-block" );
	css( this.selectWrapper, "display", 'none' );
	css( this.inputWrapper, "display", 'none' );
};

ComboBox.prototype.addBehaviors = function( obj ) {
	var _this = this;
	if( this.hideable ){
		this.comboBox
			.addEventListener( this.activate, function( ) {
				setTimeout( function( ) {
					if( _this.label.style.display != "none" ){
						console.log( "combo mouseenter ");
						//_this.label.style.display = "none" );
						_this.selectWrapper.style.display = "inline";
						_this.label.style.display = "none";
						if( _this.selector.selectedIndex <= 0 ) {
							_this.inputWrapper.style.display = "inline";
						}
					}
				}, _this.delay );
			});
		this.comboBox
			.addEventListener( "mouseleave", function( ) {
				console.log( "combo mouseleave ");
				if ( _this.selector != document.activeElement && _this.input != document.activeElement ) {
					_this.showLabel();
				}
			});
	}
	_this.input
		.addEventListener( "click", function( e ){
			console.log( "input click ");
		});
	_this.input
		.addEventListener( "keyup", function( event ) {
			console.log( "input keyup");
			if ( event.which === 13 ) {
				var inputText =  gadgetui.util.encode( _this.input.value );
				_this.handleInput( inputText );
			}
		});
	if( this.hideable ){
		_this.input
			.addEventListener( "blur", function( ) {
				console.log( "input blur" );

				if( gadgetui.util.mouseWithin( _this.selector, gadgetui.mousePosition ) === true ){
					_this.inputWrapper.style.display = 'none';
					_this.selector.focus();
				}else{
					_this.showLabel();
				}
			});
	}
	if( this.hideable ){
		this.selector
			.addEventListener( "mouseenter", function( ev ){
				_this.selector.style.display = "inline";
			});
	}
	this.selector
		.addEventListener( "click", function( ev ){
			console.log( "select click");
			ev.stopPropagation();
		});
	this.selector
		.addEventListener( "change", function( event ) {
			var idx = ( event.target.selectedIndex >= 0 ) ? event.target.selectedIndex : 0;
			if( parseInt( event.target[ idx ].value, 10 ) !== parseInt( _this.id, 10 ) ){
				console.log( "select change");
				if( event.target.selectedIndex > 0 ){
					_this.inputWrapper.style.display = 'none';
					_this.setValue( event.target[ event.target.selectedIndex ].value );
				}else{
					_this.inputWrapper.style.display = 'block';
					_this.setValue( _this.newOption.value );
					_this.input.focus();
				}
				gadgetui.util.trigger( _this.selector, "gadgetui-combobox-change", { id: event.target[ event.target.selectedIndex ].value, text: event.target[ event.target.selectedIndex ].innerHTML } );
			}
		});
	if( this.hideable ){
		this.selector
			.addEventListener( "blur", function( event ) {
				console.log( "select blur ");
				event.stopPropagation();
				setTimeout( function( ) {
					//if( _this.emitEvents === true ){

					if( _this.input !== document.activeElement ){
						_this.showLabel();
					}
				}, 200 );
			});
	}
};

ComboBox.prototype.handleInput = function( inputText ){
	var id = this.find( inputText ),
		css = gadgetui.util.setStyle;
	if( id !== undefined ){
		this.selector.value = id;
		this.label.innerText = inputText;
		this.selector.focus();
		this.input.value = '';
		css( this.inputWrapper, "display", 'none' );
	}
	else if ( id === undefined && inputText.length > 0 ) {
		this.save( inputText );
	}
};

ComboBox.prototype.triggerSelectChange = function(){
	console.log("select change");
	var ev = new Event( "change", {
	    view: window,
	    bubbles: true,
	    cancelable: true
	  });
	this.selector.dispatchEvent( ev );
};

ComboBox.prototype.setSaveFunc = function(){
	var _this = this;

	if( this.save !== undefined ){
		var save = this.save;
		this.save = function( text ) {
			var _this = this,
				func,
				promise,
				args = [ text ],
				value = this.find( text );
			if( value === undefined ){
				console.log( "save: " + text );

				promise = new Promise(
						function( resolve, reject ){
							args.push( resolve );
							args.push( reject );
							func = save.apply(_this, args);
							console.log( func );
						});
				promise.then(
						function( value ){
							function callback(){
								// trigger save event if we're triggering events
								//if( _this.emitEvents === true ){
								gadgetui.util.trigger( _this.selector, "gadgetui-combobox-save", { id: value, text: text } );
									//_this.selector.dispatchEvent( new Event( "gadgetui-combobox-save" ), { id: value, text: text } );
								//}
								_this.input.value = '';
								_this.inputWrapper.style.display = 'none';
								_this.id = value;
								_this.dataProvider.refresh();
							}
							if( _this.animate === true && typeof Velocity !== "undefined" ){
								Velocity( _this.selectWrapper, {
									boxShadow: '0 0 15px ' + _this.glowColor,
									borderColor: _this.glowColor
								  }, _this.animateDelay / 2, function(){
									 _this.selectWrapper.style.borderColor = _this.glowColor;
								  } );
								Velocity( _this.selectWrapper, {
									boxShadow: 0,
									borderColor: _this.borderColor
								  }, _this.animateDelay / 2, callback );
							}else{
								callback();
							}
						});
				promise['catch']( function( message ){
					_this.input.value= '';
					_this.inputWrapper.hide();
					console.log( message );
					_this.dataProvider.refresh();

				});
			}
		    return func;
		};
	}
};

ComboBox.prototype.setStartingValues = function(){
	( this.dataProvider.data === undefined ) ? this.dataProvider.refresh() : this.setControls();
};

ComboBox.prototype.setControls = function(){
	console.log( this );
	this.setSelectOptions();
	this.setValue( this.id );
	this.triggerSelectChange();
};

ComboBox.prototype.setValue = function( id ){
	var text = this.getText( id );
	console.log( "setting id:" + id );
	// value and text can only be set to current values in this.dataProvider.data, or to "New" value
	this.id = ( text === undefined ? this.newOption.id : id );
	text = ( text === undefined ? this.newOption.text : text );

	this.text = text;
	this.label.innerText = this.text;
	this.selector.value = this.id;
};

ComboBox.prototype.setDataProviderRefresh = function(){
	var _this = this,
		promise,
		refresh = this.dataProvider.refresh,
		func;
	this.dataProvider.refresh = function(){
		var scope = this;
		if( refresh !== undefined ){
			promise = new Promise(
					function( resolve, reject ){
						var args = [ scope, resolve, reject ];
						func = refresh.apply( this, args );
					});
			promise
				.then( function(){
					gadgetui.util.trigger( _this.selector, "gadgetui-combobox-refresh" );
					//_this.selector.dispatchEvent( new Event( "gadgetui-combobox-refresh" ) );
					_this.setControls();
				});
			promise['catch']( function( message ){
					console.log( "message" );
					_this.setControls();
				});
		}
		return func;
	};
};

ComboBox.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.model =  (( options.model === undefined) ? this.model : options.model );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.dataProvider = (( options.dataProvider === undefined) ? undefined : options.dataProvider );
	this.save = (( options.save === undefined) ? undefined : options.save );
	this.activate = (( options.activate === undefined) ? "mouseenter" : options.activate );
	this.delay = (( options.delay === undefined) ? 10 : options.delay );
	this.borderWidth = gadgetui.util.getStyle( this.selector, "border-width" ) || 1;
	this.borderRadius = gadgetui.util.getStyle( this.selector, "border-radius" ) || 5;
	this.borderColor = gadgetui.util.getStyle( this.selector, "border-color" ) || "silver";
	this.arrowWidth = options.arrowWidth || 25;
	this.width = (( options.width === undefined) ? 150 : options.width );
	this.newOption = (( options.newOption === undefined) ? { text: "...", id: 0 } : options.newOption );
	this.id = (( options.id === undefined) ? this.newOption.id : options.id );
	this.scaleIconHeight = (( options.scaleIconHeight === undefined) ? false : options.scaleIconHeight );
	this.animate = (( options.animate === undefined) ? true : options.animate );
	this.glowColor = (( options.glowColor === undefined ) ? 'rgb(82, 168, 236)' : options.glowColor );
	this.animateDelay = (( options.animateDelay === undefined ) ? 500 : options.animateDelay );
	this.border = this.borderWidth + "px " + this.borderStyle + " " + this.borderColor;
	this.saveBorder = this.borderWidth + "px " + this.borderStyle + " " + this.glowColor;
	this.hideable = options.hideable || false;
};

function FileUploader(selector, options) {
  this.selector = selector;
  //this.dlg = "";
  this.droppedFiles = [];
  this.configure(options);
  this.render(options.title);
  this.setEventHandlers();
  this.setDimensions();
}

FileUploader.prototype.render = function(title) {
  var self = this,
    data,
    options,
    title = title,
    files;

  var renderUploader = function() {
    var css = gadgetui.util.setStyle;
    var options = {
      title: title,
      addFile: self.addFileMessage,
      dropMessage: self.dropMessage,
      fileSelectLbl: ""
    };
    //var tabDiv = document.querySelector("div[name='" + tab.name + "']", self.selector);
    self.selector.innerHTML =
      '<div style="padding:10px;" class="gadgetui-fileuploader-wrapper"><div name="dropzone" class="gadgetui-fileuploader-dropzone" id="dropzone"><div class="gadgetui-fileuploader-dropmessage" name="dropMessageDiv">' +
      options.dropMessage +
      '</span></div></div><div name="filedisplay" class="gadgetui-fileuploader-filedisplay" style="display:none;"></div><div class="buttons full"><div class="fileUpload" name="fileUpload"><input type="file" name="fileselect" class="upload" title="' +
      options.fileSelectLbl +
      '"></div></div>';

      if( self.showUploadButton === false ){
        css( document.querySelector( "div[name='fileUpload']", self.selector ), "display", "none" );
      }

      var left = gadgetui.util.getNumberValue( gadgetui.util.getStyle( self.selector, "width" ) ) - ( gadgetui.util.textWidth( document.querySelector( "div[name='dropMessageDiv']", self.selector ).innerText, self.selector.style ) );
      var top = gadgetui.util.getNumberValue( gadgetui.util.getStyle( self.selector, "height" ) ) / 2;
      css( document.querySelector( "div[name='dropMessageDiv']", self.selector ), "left", left );
      css( document.querySelector( "div[name='dropMessageDiv']", self.selector ), "top", top );

    self.renderDropZone();
  };

  renderUploader();
};

FileUploader.prototype.configure = function(options) {
  // may be undefined
  this.message = options.message;
  this.tags = options.tags;
  this.uploadURI = options.uploadURI;
  this.onUploadComplete = options.onUploadComplete;
  this.willGenerateThumbnails = (options.willGenerateThumbnails !== undefined && options.willGenerateThumbnails !== null ? options.willGenerateThumbnails : false);
  this.showUploadButton = ( options.showUploadButton !== undefined ? options.showUploadButton : true );
  this.addFileMessage = ( options.addFileMessage !== undefined ? options.addFileMessage : "Add a File" );
  this.dropMessage = ( options.dropMessage !== undefined ? options.dropMessage : "Drop Files Here" );

};

FileUploader.prototype.setDimensions = function() {
  var css = gadgetui.util.setStyle;
  var uHeight = gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "height")),
    uWidth = gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "width")),
    dropzone = document.querySelector("div[class='gadgetui-fileuploader-dropzone']", this.selector),
    filedisplay = document.querySelector(
      "div[class='gadgetui-fileuploader-filedisplay']",
      this.selector
    ),
    buttons = document.querySelector("div[class~='buttons']", this.selector);

  css(dropzone, "height", uHeight - gadgetui.util.getNumberValue(gadgetui.util.getStyle(buttons, "height")) - 100);
  css(dropzone, "width", uWidth);

  css(filedisplay, "height", uHeight - gadgetui.util.getNumberValue(gadgetui.util.getStyle(buttons, "height")) - 100);
  css(filedisplay, "width", uWidth);
};

FileUploader.prototype.setEventHandlers = function() {
  var self = this;
  document.querySelector("input[name='fileselect']", self.selector).addEventListener("change", function(evt) {
    var dropzone = document.querySelector("div[name='dropzone']", self.selector),
      filedisplay = document.querySelector("div[name='filedisplay']", self.selector);

    self.processUpload(
      evt,
      evt.target.files,
      dropzone,
      filedisplay
    );
  });
};

FileUploader.prototype.renderDropZone = function() {
  // if we decide to drop files into a drag/drop zone

  var dropzone = document.querySelector("div[name='dropzone']", this.selector),
    filedisplay = document.querySelector("div[name='filedisplay']", this.selector),
    self = this;

    document.addEventListener( "dragstart", function( ev ){
      ev.dataTransfer.setData("text",  "data");
      ev.dataTransfer.effectAllowed = "copy";
    });

  dropzone.addEventListener("dragenter", function(ev) {
    gadgetui.util.addClass( dropzone, "highlighted");

    ev.preventDefault();
    ev.stopPropagation();
  });

  dropzone.addEventListener("dragleave", function(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    gadgetui.util.removeClass( dropzone,"highlighted");
  });

  dropzone.addEventListener("dragover", function(ev) {
    self.handleDragOver(ev);
    ev.dataTransfer.dropEffect = "copy";
  });

  dropzone.addEventListener("drop", function(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    self.processUpload(
      ev,
      ev.dataTransfer.files,
      dropzone,
      filedisplay
    );
  });
};

FileUploader.prototype.processUpload = function(event, files, dropzone, filedisplay) {
  var self = this,
    wrappedFile;
  var css = gadgetui.util.setStyle;
  self.uploadingFiles = [];

  for (var idx = 0; idx < files.length; idx++) {
    wrappedFile = gadgetui.objects.Constructor(
      gadgetui.display.FileUploadWrapper, [files[idx], filedisplay,
        true
      ]);

    self.uploadingFiles.push(wrappedFile);
    wrappedFile.on("uploadComplete", function(fileWrapper) {
      var ix;
      for (ix = 0; ix < self.uploadingFiles.length; ix++) {
        if (self.uploadingFiles[ix].id === fileWrapper.id) {
          self.uploadingFiles.splice(ix, 1);
        }
      }
      if (self.uploadingFiles.length === 0) {
        self.show("dropzone");
        self.setDimensions();
      }
    });
  }

  gadgetui.util.removeClass(dropzone, "highlighted");

  css(dropzone, "display", "none");
  css(filedisplay, "display", "table-cell");

  self.handleFileSelect(self.uploadingFiles, event);
};

FileUploader.prototype.handleFileSelect = function(wrappedFiles, evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var self = this;

  if (self.willGenerateThumbnails) {
    self.generateThumbnails(wrappedFiles);
  } else {
    self.upload(wrappedFiles);
  }
};

FileUploader.prototype.generateThumbnails = function(wrappedFiles) {
  // not going to convert this functionality right now
  this.upload(wrappedFiles);
};

/*
FileUploader.prototype.generateThumbnails = function( wrappedFiles ){
  var self = this;
  var pdfThumbnail = function(wrappedFile, idx) {
      var pdfURL = URL.createObjectURL(wrappedFile.file);
      wrappedFile.progressbar.update(" - generating thumbnail");
      PDFJS.getDocument(pdfURL).then(function(pdf) {
        pdf.getPage(1).then(function(page) {
          var renderContext,
            viewport = page.getViewport(0.5),
            canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };

          page.render(renderContext).then(function() {
            //set to draw behind current content
            ctx.globalCompositeOperation = "destination-over";

            //set background color
            ctx.fillStyle = "#ffffff";

            //draw background / rect on entire canvas
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            var img = canvas.toDataURL();
            wrappedFile = $.extend(wrappedFile, { tile: img });
            if (idx === wrappedFiles.length - 1) {
              self.upload( wrappedFiles );
            }
          });
        });
      });
    },
    imageThumbnail = function(wrappedFile, idx) {
      try {
        wrappedFile.progressbar.update(" - generating thumbnail");
        $.canvasResize(wrappedFile.file, {
          width: 200,
          height: 0,
          crop: false,
          quality: 80,
          callback: function(data, width, height) {
            //file.progressbar.update( " - generated thumbnail" );
            wrappedFile = $.extend(wrappedFile, { tile: data });
            if (idx === wrappedFiles.length - 1) {
              self.upload( wrappedFiles );
            }
          }
        });
      } catch (ev) {
        //could not parse image
      }
    };

  $.each(wrappedFiles, function(ix, wrappedFile) {
    switch (wrappedFile.file.type) {
      case "application/pdf":
        pdfThumbnail(wrappedFile, ix);
        break;
      case "image/jpg":
      case "image/jpeg":
      case "image/png":
      case "image/gif":
        imageThumbnail(wrappedFile, ix);
        break;
      default:
        //console.log( "Could not generate tile on client." );
        wrappedFile.progressbar.update(
          "Could not generate thumbnail on client"
        );
        wrappedFile = $.extend(wrappedFile, { tile: "" });
        if (ix === wrappedFiles.length - 1) {
          self.upload( wrappedFiles );
        }
        break;
    }
  });
};
 */

FileUploader.prototype.upload = function(wrappedFiles) {
  wrappedFiles.forEach(function(wrappedFile) {
    wrappedFile.progressbar.start();
  });

  this.uploadFile(wrappedFiles);
};

FileUploader.prototype.uploadFile = function(wrappedFiles) {
  var self = this;
  var process = function() {
    var blob,
      chunks = [],
      BYTES_PER_CHUNK,
      SIZE,
      parts,
      start,
      end,
      chunk,
      j;

    for (j = 0; j < wrappedFiles.length; j++) {
      blob = wrappedFiles[j].file;
      chunks = [];
      BYTES_PER_CHUNK = 1024 * 1024;
      // 1MB chunk sizes.
      SIZE = blob.size;
      parts = Math.ceil(SIZE / BYTES_PER_CHUNK);
      start = 0;
      end = BYTES_PER_CHUNK;

      while (start < SIZE) {
        if (blob.hasOwnProperty("mozSlice")) {
          chunk = blob.mozSlice(start, end);
        } else if (blob.hasOwnProperty("webkitSlice")) {
          chunk = blob.webkitSlice(start, end);
        } else {
          chunk = blob.slice(start, end);
        }

        chunks.push(chunk);

        start = end;
        end = start + BYTES_PER_CHUNK;
      }

      // start the upload process
      self.uploadChunk(wrappedFiles[j], chunks, 1, parts);
    }
  };
  // process files
  process();
};

FileUploader.prototype.uploadChunk = function(wrappedFile, chunks, filepart, parts) {
  var xhr = new XMLHttpRequest(),
    self = this,
    response,
    tags = self.tags === undefined ? "" : self.tags;

  if (wrappedFile.file.type.substr(0, 5) === "image") {
    tags = "image " + tags;
  }

  xhr.onreadystatechange = function() {
    var json;

    if (xhr.readyState === 4) {
      response = xhr.response;

      if (filepart <= parts) {
        wrappedFile.progressbar.updatePercent(
          parseInt(filepart / parts * 100, 10)
        );
      }
      if (filepart < parts) {
        wrappedFile.id = xhr.getResponseHeader("X-Id");
        filepart++;
        self.uploadChunk(
          wrappedFile,
          chunks,
          filepart,
          parts
        );
      } else {
        try {
          json = {
            data: JSON.parse(response)
          };
        } catch (e) {
          json = {};
        }

        self.handleUploadResponse(json, wrappedFile);
      }
    }
  };

  xhr.open("POST", self.uploadURI, true);
  if (filepart === 1) {
    xhr.setRequestHeader("X-Tags", tags);
  }
  xhr.setRequestHeader("X-Id", wrappedFile.id);
  xhr.setRequestHeader("X-FileName", wrappedFile.file.name);
  xhr.setRequestHeader("X-FileSize", wrappedFile.file.size);
  xhr.setRequestHeader("X-FilePart", filepart);
  xhr.setRequestHeader("X-Parts", parts);
  xhr.setRequestHeader(
    "X-MimeType",
    wrappedFile.file.type || "application/octet-stream"
  );
  xhr.setRequestHeader(
    "X-HasTile",
    wrappedFile.tile !== undefined && wrappedFile.tile.length > 0 ?
    true :
    false
  );
  xhr.setRequestHeader("Content-Type", "application/octet-stream");

  xhr.send(chunks[filepart - 1]);
};

FileUploader.prototype.handleUploadResponse = function(json, wrappedFile) {
  var self = this;
  var fileItem = gadgetui.objects.Constructor(
    gadgetui.objects.FileItem, [{
      mimetype: json.data.mimetype,
      fileid: json.data.fileId,
      filename: json.data.filename,
      filesize: json.data.filesize,
      tags: json.data.tags,
      created: json.data.created,
      createdStr: json.data.created,
      disabled: json.data.disabled,
      path: json.data.path
    }],
    false
  );

  // fire completeUpload event so upload dialog can clean itself up
  wrappedFile.completeUpload(fileItem);

  if (self.onUploadComplete !== undefined) {
    self.onUploadComplete(fileItem);
  }
};

FileUploader.prototype.show = function(name) {
  var css = gadgetui.util.setStyle;
  var dropzone = document.querySelector("div[class='gadgetui-fileuploader-dropzone']", this.selector),
    filedisplay = document.querySelector(
      "div[class='gadgetui-fileuploader-filedisplay']",
      this.selector
    );
  if (name === "dropzone") {
    css(dropzone, "display", "table-cell");
    css(filedisplay, "display", "none");
  } else {
    css(filedisplay, "display", "table-cell");
    css(dropzone, "display", "none");
  }
};

FileUploader.prototype.handleDragOver = function(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = "copy";
  // Explicitly show this is a copy.
};



//author - Robert Munn <robertdmunn@gmail.com>

// significant portions of code from jQuery UI
//adapted from jQuery UI autocomplete. modified and re-distributed per MIT License.


function LookupListInput( selector, options ){
	this.selector = selector;
	this.items = [];
	this.config( options );
	this.setIsMultiLine();
	this.addControl();
	this.initSource();
	this.addMenu();
	this.addBindings();
}

LookupListInput.prototype.addControl = function(){
	this.wrapper = document.createElement( "div" );
	if( this.width !== undefined ){
		gadgetui.util.setStyle( this.wrapper, "width", this.width );
	}
	gadgetui.util.addClass( this.wrapper, "gadgetui-lookuplist-input" );
	this.selector.parentNode.insertBefore( this.wrapper, this.selector );
	this.selector.parentNode.removeChild( this.selector );
	this.wrapper.appendChild( this.selector );
};

LookupListInput.prototype.addMenu = function(){
	var div = document.createElement( "div" );
	gadgetui.util.addClass( div, "gadgetui-lookuplist-menu" );
	gadgetui.util.setStyle( div, "display", "none" );

	this.menu = {
			element: div
		};

	this.wrapper.appendChild( this.menu.element );
};

LookupListInput.prototype.initSource = function(){
	var array, url,
		_this = this;
	if ( this.datasource.constructor === Array ) {
		array = this.datasource;
		this.source = function( request, response ) {
			var content = _this.filter( array, request.term );
			response( content );
		};
	} else if ( typeof this.datasource === "string" ) {
		url = this.datasource;
		this.source = function( request, response ) {
			if ( _this.xhr ) {
				_this.xhr.abort();
			}
			_this.xhr = fetch({
				url: url,
				data: request,
				dataType: "json",
				success: function( data ) {
					response( data );
				},
				error: function() {
					response([]);
				}
			});
		};
	} else {
		this.source = this.datasource;
	}
};

LookupListInput.prototype.escapeRegex = function( value ) {
	return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
};

LookupListInput.prototype._filter = function( array, term ) {
	var matcher = new RegExp( this.escapeRegex( term ), "i" );
	return gadgetui.util.grep( array, function( value ) {
		return matcher.test( value.label || value.value || value );
	});
};

LookupListInput.prototype.checkForDuplicate = function( item ) {
	var ix, found = false;
	for( ix = 0; ix < this.items.length; ix++ ){
		if( this.items[ix].value === item.value ){
			found = true;
			break;
		}
	}
	return found;
};

LookupListInput.prototype.makeUnique = function( content ) {
	var ix, results = [];
	for( ix = 0; ix < content.length; ix++ ){
		if( !this.checkForDuplicate( content[ ix ] ) ){
			results.push( content[ ix ] );
		}
	}
	return results;
};

LookupListInput.prototype.setIsMultiLine = function(){
	var nodeName = this.selector.nodeName.toLowerCase(),
	isTextarea = nodeName === "textarea",
	isInput = nodeName === "input";

	this.isMultiLine = isTextarea ? true : isInput ? false : this.selector.getAttribute( "isContentEditable" );
};

LookupListInput.prototype.addBindings = function(){
	var _this = this, suppressKeyPress, suppressKeyPressRepeat, suppressInput, nodeName = this.selector.nodeName.toLowerCase();
	this.isTextarea = nodeName === "textarea";
	this.isInput = nodeName === "input";
	this.wrapper
		.addEventListener( "click", function(){
			_this.selector.focus();
		});

	this.valueMethod = this.selector[ this.isTextarea || this.isInput ? "value" : "innerText" ];
	this.isNewMenu = true;

	this.selector.setAttribute( "autocomplete", "off" );

	this.selector
		.addEventListener( "keydown", function( event ) {
			if ( this.getAttribute( "readOnly" ) ) {
				suppressKeyPress = true;
				suppressInput = true;
				suppressKeyPressRepeat = true;
				return;
			}

			suppressKeyPress = false;
			suppressInput = false;
			suppressKeyPressRepeat = false;
			var keyCode = gadgetui.keyCode;
			switch ( event.keyCode ) {
			case keyCode.PAGE_UP:
				suppressKeyPress = true;
				this._move( "previousPage", event );
				break;
			case keyCode.PAGE_DOWN:
				suppressKeyPress = true;
				this._move( "nextPage", event );
				break;
			case keyCode.UP:
				suppressKeyPress = true;
				this._keyEvent( "previous", event );
				break;
			case keyCode.DOWN:
				suppressKeyPress = true;
				this._keyEvent( "next", event );
				break;
			case keyCode.ENTER:
				// when menu is open and has focus
				if ( _this.menu.active ) {
					// #6055 - Opera still allows the keypress to occur
					// which causes forms to submit
					suppressKeyPress = true;
					event.preventDefault();
					_this.menu.select( event );
				}
				break;
			case keyCode.BACKSPACE:
				if( !this.value.length && _this.items.length ){
					var selector = this.previousSibling;
					_this.remove( selector );
				}
				break;
			case keyCode.TAB:
				if ( _this.menu.active ) {
					_this.menu.select( event );
				}
				break;
			case keyCode.ESCAPE:
				if ( _this.menu.element.style.display !== 'none' ) {
					if ( !this.isMultiLine ) {
						this._value( this.term );
					}
					this.close( event );
					// Different browsers have different default behavior for escape
					// Single press can mean undo or clear
					// Double press in IE means clear the whole form
					event.preventDefault();
				}
				break;
			default:
				suppressKeyPressRepeat = true;
				// search timeout should be triggered before the input value is changed
				_this._searchTimeout( event );
				break;
			}
		});

	this.selector
		.addEventListener( "keypress", function( event ) {
			if ( suppressKeyPress ) {
				suppressKeyPress = false;
				if ( !this.isMultiLine || _this.menu.element.style.display !== 'none' ) {
					event.preventDefault();
				}
				return;
			}
			if ( suppressKeyPressRepeat ) {
				return;
			}

			// replicate some key handlers to allow them to repeat in Firefox and Opera
			var keyCode = gadgetui.keyCode;
			switch ( event.keyCode ) {
			case keyCode.PAGE_UP:
				this._move( "previousPage", event );
				break;
			case keyCode.PAGE_DOWN:
				this._move( "nextPage", event );
				break;
			case keyCode.UP:
				this._keyEvent( "previous", event );
				break;
			case keyCode.DOWN:
				this._keyEvent( "next", event );
				break;
			}
		});

	this.selector
		.addEventListener( "input", function( event ) {
			if ( suppressInput ) {
				suppressInput = false;
				event.preventDefault();
				return;
			}
			_this._searchTimeout( event );
		});

	this.selector
		.addEventListener( "focus", function( event ) {
			this.selectedItem = null;
			this.previous = this.value;
		});

	this.selector
		.addEventListener( "blur", function( event ) {
			if ( this.cancelBlur ) {
				delete this.cancelBlur;
				return;
			}

			clearTimeout( this.searching );
			_this.close( event );
			_this._change( event );
		});

	// menu bindings
	this.menu.element.addEventListener("mousedown", function( event ) {
		// prevent moving focus out of the text field
		event.preventDefault();

		// IE doesn't prevent moving focus even with event.preventDefault()
		// so we set a flag to know when we should ignore the blur event
		this.cancelBlur = true;
		gadgetui.util.delay(function() {
			delete this.cancelBlur;
		});

		// clicking on the scrollbar causes focus to shift to the body
		// but we can't detect a mouseup or a click immediately afterward
		// so we have to track the next mousedown and close the menu if
		// the user clicks somewhere outside of the autocomplete
		var menuElement = _this.menu.element;
		/*if ( !event.target.classList.contains( "gadgetui-lookuplist-item" ) ) {
			gadgetui.util.delay(function() {
				 document.addEventListener( "mousedown", function( event ) {
					if ( event.target !== _this.menu.element &&
							event.target !== menuElement &&
							!gadgetui.util.contains( menuElement, event.target ) ) {
						_this.close();
					}
				});
			});
		}*/
	});

	this.menu.element.addEventListener( "menuselect", function( event ) {
		var item = event.detail,
			previous = _this.previous;

		// only trigger when focus was lost (click on menu)
		if ( _this.menu.element !== document.activeElement ) {
			_this.menu.element.focus();
			_this.previous = previous;
			// #6109 - IE triggers two focus events and the second
			// is asynchronous, so we need to reset the previous
			// term synchronously and asynchronously :-(
			gadgetui.util.delay(function() {
				_this.previous = previous;
				_this.selectedItem = item;
			});
		}

		//if ( false !== this._trigger( "select", event, { item: item } ) ) {
			_this._value( item.value );
		//}
		// reset the term after the select event
		// this allows custom select handling to work properly
		_this.term = _this._value();

		_this.close( event );
		_this.selectedItem = item;
		if( !_this.checkForDuplicate( item ) ){
			_this.add( item );
		}else{

		}
	});
};

LookupListInput.prototype._renderItem = function( item ){
	var itemNode, itemWrapper = document.createElement( "div" );
	gadgetui.util.addClass( itemWrapper, "gadgetui-lookuplist-input-item-wrapper" );
	itemNode = document.createElement( "div" );
	gadgetui.util.addClass( itemNode, "gadgetui-lookuplist-input-item" );
	itemNode.innerHTML = this.labelRenderer( item );
	itemWrapper.appendChild( itemNode );
	return itemWrapper;
};

LookupListInput.prototype._renderItemCancel = function( item, wrapper ){
	var	css = gadgetui.util.setStyle,
		itemCancel = document.createElement( "span" ),
		spanLeft = gadgetui.util.getNumberValue( gadgetui.util.getStyle( wrapper, "width" ) )
		+ 6;  // font-size of icon
		//- 3; // top offset of icon

	gadgetui.util.addClass( itemCancel, "oi" );
	itemCancel.setAttribute( 'data-glyph', "circle-x" );
	css( itemCancel, "font-size", 12 );
	css( itemCancel, "opacity", ".5" );
	css( itemCancel, "left", spanLeft );
	css( itemCancel, "position", "absolute" );
	css( itemCancel, "cursor", "pointer"  );
	css( itemCancel, "top", 3 );
	return itemCancel;
};

LookupListInput.prototype.add = function( item ){
	var _this = this,
		prop, list, itemWrapper,
		itemCancel;

	itemWrapper = this.itemRenderer( item );
	itemWrapper.setAttribute( "data-value", item.value );
	this.wrapper.insertBefore( itemWrapper, this.selector );
	itemCancel = this.itemCancelRenderer( item, itemWrapper );
	if( itemCancel !== undefined ){
		itemWrapper.appendChild( itemCancel );
		itemCancel.addEventListener( "click", function( event ){
			_this.remove( this.parentNode );
		});
	}

	this.selector.value = '';
	this.items.push( item );

	if( this.emitEvents === true ){
		gadgetui.util.trigger( this.selector, "gadgetui-lookuplist-input-add", item );
	}

	if( this.func !== undefined ){
		this.func( item, 'add' );
	}
	if( this.model !== undefined ){
		//update the model
		prop = this.selector.getAttribute( "gadgetui-bind" );
		if( prop !== null && prop !== undefined ){
			list = this.model.get( prop );
			if( typeof list === Array ){
				list = [];
			}
			list.push( item );
			this.model.set( prop, list );
		}
	}
};

LookupListInput.prototype.remove = function( selector ){
	var _this = this, removed, ix, prop, list, value = selector.getAttribute( "data-value" );

	selector.parentNode.removeChild( selector );
	// remove from internal array
	for( ix = 0; ix < this.items.length; ix++ ){
		if( this.items[ ix ].value === value ){
			removed = this.items.splice( ix, 1 );
		}
	}
	if( this.model !== undefined ){
		prop = this.selector.getAttribute( "gadgetui-bind" );
		if( prop !== null && prop !== undefined ){
			list = this.model.get( prop );
			list.forEach( function( obj, ix ){
				if( obj.value === value ){
					list.splice( ix, 1 );
					if( _this.func !== undefined ){
						_this.func( obj, 'remove' );
					}
					if( _this.emitEvents === true ){
						gadgetui.util.trigger( _this.selector, "gadgetui-lookuplist-input-remove", obj );
					}
					_this.model.set( prop, list );
					return false;
				}
			});
		}
	}
};

LookupListInput.prototype.reset = function(){

	while ( this.wrapper.firstChild && this.wrapper.firstChild !== this.selector ) {
			this.wrapper.removeChild( this.wrapper.firstChild );
	}
	this.items = [];
	if( this.model !== undefined ){
		var prop = this.selector.getAttribute( "gadgetui-bind" );
		this.model.set( prop, [] );
	}
};

LookupListInput.prototype.destroy = function() {
	clearTimeout( this.searching );
	this.menu.element.remove();
	this.liveRegion.remove();
};

LookupListInput.prototype._setOption = function( key, value ) {
	this._super( key, value );
	if ( key === "source" ) {
		this._initSource();
	}
	if ( key === "appendTo" ) {
		this.menu.element.appendTo( this._appendTo() );
	}
	if ( key === "disabled" && value && this.xhr ) {
		this.xhr.abort();
	}
};

LookupListInput.prototype._appendTo = function() {
	var element = this.options.appendTo;

	if ( element ) {
		element = element.jquery || element.nodeType ?
			$( element ) :
			this.document.find( element ).eq( 0 );
	}

	if ( !element || !element[ 0 ] ) {
		element = this.element.closest( ".ui-front" );
	}

	if ( !element.length ) {
		element = this.document[ 0 ].body;
	}

	return element;
};

LookupListInput.prototype._searchTimeout = function( event ) {
	var _this = this;
	clearTimeout( this.searching );
	this.searching = gadgetui.util.delay(function() {

		// Search if the value has changed, or if the user retypes the same value (see #7434)
		var equalValues = this.term === _this.selector.value,
			menuVisible = _this.menu.element.style.display !== 'none',
			modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

		if ( !equalValues || ( equalValues && !menuVisible && !modifierKey ) ) {
			_this.selectedItem = null;
			_this.search( null, event );
		}
	}, this.delay );
};

LookupListInput.prototype.search = function( value, event ) {
	var _this = this;
	value = value != null ? value : _this.selector.value;

	// always save the actual value, not the one passed as an argument
	this.term = this._value();

	if ( value.length < this.minLength ) {
		return this.close( event );
	}

	return this._search( value );
};

LookupListInput.prototype._search = function( value ) {
	this.pending++;
	this.cancelSearch = false;

	this.source( { term: value }, this._response() );
};

LookupListInput.prototype._response = function() {
	var _this = this,
		index = ++this.requestIndex,
		fn = function( content ) {
				_this.__response( content );

			_this.pending--;
			/*	if ( !_this.pending ) {
				this.element.removeClass( "ui-autocomplete-loading" );
			}	*/
		},
		proxy = function(){
			return fn.apply( _this, arguments );
		};
	return proxy;
};

LookupListInput.prototype.__response = function( content ) {
	content = this.makeUnique( content );

	if ( content && content.length ) {
		content = this._normalize( content );
	}
	this.selector.dispatchEvent( new CustomEvent( "response", { content: content } ) );
	if ( !this.disabled && content && content.length && !this.cancelSearch ) {
		this._suggest( content );
		this.selector.dispatchEvent( new Event( "open" ) );
	} else {
		this._close();
	}
};

LookupListInput.prototype.close = function( event ) {
	this.cancelSearch = true;
	this._close( event );
};

LookupListInput.prototype._close = function( event ) {
	if ( this.menu.element.style.display !== 'none' ) {
		this.menu.element.style.display = 'none';
		this.menu.element.blur();
		this.isNewMenu = true;
	}
};

LookupListInput.prototype._change = function( event ) {
	/*	if ( this.previous !== this._value() ) {
	//	this._trigger( "change", event, { item: this.selectedItem } );
		//this.selector.dispatchEvent( event );
	}	*/
};

LookupListInput.prototype._normalize = function( items ) {
	// assume all items have the right format when the first item is complete
	if ( items.length && items[ 0 ].label && items[ 0 ].value ) {
		return items;
	}
	return items.map( function( item ) {
		if ( typeof item === "string" ) {
			return {
				label: item,
				value: item
			};
		}
		item.label = item.label || item.value;
		item.value = item.value || item.label;

		return item;
	});
};

LookupListInput.prototype._suggest = function( items ) {
	var div = this.menu.element;
	while (div.firstChild) {
		div.removeChild( div.firstChild );
	}
	this._renderMenu( items );
	this.isNewMenu = true;

	// size and position menu
	div.style.display = 'block';
	this._resizeMenu();
	this.position.of = this.element;

	/*	if ( this.autoFocus ) {
	//	this.menu.next();
	}	*/
};

LookupListInput.prototype._resizeMenu = function() {
	var div = this.menu.element;
	// don't change it right now
};

LookupListInput.prototype._renderMenu = function( items ) {
	var _this = this, ix;
	var maxItems = Math.min( this.maxSuggestions, items.length );
	for( ix = 0; ix < maxItems; ix++ ){
		_this._renderItemData( items[ ix ] );
	}
};

LookupListInput.prototype._renderItemData = function( item ) {
	var _this = this,
		menuItem = this.menuItemRenderer( item );

	menuItem.addEventListener( "click", function( event ){
		var ev = new CustomEvent( "menuselect", { detail: item } );
		_this.menu.element.dispatchEvent( ev );
	});
	this.menu.element.appendChild( menuItem );

};

LookupListInput.prototype._renderMenuItem = function( item ) {
	var menuItem = document.createElement( "div" );
	gadgetui.util.addClass( menuItem, "gadgetui-lookuplist-item" );
	menuItem.setAttribute( "value", item.value );
	menuItem.innerText = this.labelRenderer( item );
	return menuItem;
};

LookupListInput.prototype._renderLabel = function( item ) {
	return item.label;
};

LookupListInput.prototype._move = function( direction, event ) {
	if ( !this.menu.element.style.display !== 'none' ) {
		this.search( null, event );
		return;
	}
	if ( this.menu.element.isFirstItem() && /^previous/.test( direction ) ||
			this.menu.element.isLastItem() && /^next/.test( direction ) ) {

		if ( !this.isMultiLine ) {
			this._value( this.term );
		}

		this.menu.blur();
		return;
	}
	this.menu[ direction ]( event );
};

LookupListInput.prototype.widget = function() {
	return this.menu.element;
};

LookupListInput.prototype._value = function() {
	return ( this.isInput ? this.selector.value : this.selector.innerText );
};

LookupListInput.prototype._keyEvent = function( keyEvent, event ) {
	if ( !this.isMultiLine || this.menu.element.style.display !== 'none' ) {
		this._move( keyEvent, event );

		// prevents moving cursor to beginning/end of the text field in some browsers
		event.preventDefault();
	}
};

LookupListInput.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	// if binding but no model was specified, use gadgetui model
	if( this.selector.getAttribute( "gadgetui-bind" ) !== undefined ){
		this.model = (( options.model === undefined) ? gadgetui.model : options.model );
	}
	this.width = (( options.width === undefined) ? undefined : options.width );
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.filter = (( options.filter === undefined) ? this._filter : options.filter );
	this.labelRenderer = (( options.labelRenderer === undefined) ? this._renderLabel : options.labelRenderer );
	this.itemRenderer = (( options.itemRenderer === undefined) ? this._renderItem : options.itemRenderer );
	this.menuItemRenderer = (( options.menuItemRenderer === undefined) ? this._renderMenuItem : options.menuItemRenderer );
	this.itemCancelRenderer = (( options.itemCancelRenderer === undefined) ? this._renderItemCancel : options.itemCancelRenderer );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.datasource = (( options.datasource === undefined) ? (( options.lookupList !== undefined ) ? options.lookupList : true ) : options.datasource );
	this.minLength = (( options.minLength === undefined) ? 0 : options.minLength );
	this.disabled = (( options.disabled === undefined) ? false : options.disabled );
	this.maxSuggestions = (( options.maxSuggestions === undefined) ? 20 : options.maxSuggestions );
	this.position = ( options.position === undefined ) ? { my: "left top", at: "left bottom", collision: "none" } : options.position;
	this.autoFocus = (( options.autoFocus === undefined) ? false : options.autoFocus );
	this.requestIndex = 0;
};


function SelectInput( selector, options ){
	this.selector = selector;

	this.config( options );
	this.setSelectOptions();
	this.setInitialValue( options );

	this.addControl();
	this.addCSS();
	this.selector.style.display = 'none';

	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.label, this.model );
	this.addBindings();
}

SelectInput.prototype.setInitialValue = function( options ){
	this.value = ( options.value || { id: this.selector.options[this.selector.selectedIndex||0].value, text: this.selector.options[this.selector.selectedIndex||0].innerHTML } );
	this.selector.value = this.value.id;
};

SelectInput.prototype.addControl = function(){
	var _this = this;
	this.wrapper = document.createElement( "div" );
	this.label = document.createElement( "div" );
	gadgetui.util.addClass( this.wrapper, "gadgetui-selectinput-div" );
	gadgetui.util.addClass( this.label, "gadgetui-selectinput-label" );
	this.label.setAttribute( "gadgetui-bind", this.selector.getAttribute( "gadgetui-bind" ) );
	this.label.innerHTML = this.value.text;
	this.selector.parentNode.insertBefore( this.wrapper, this.selector );
	this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild( this.selector );
	this.wrapper.appendChild( this.selector );
	this.selector.parentNode.insertBefore( this.label, this.selector );
};

SelectInput.prototype.setSelectOptions = function(){
	var _this = this, id, text, option;
	if( this.selector.getAttribute( "gadgetui-bind-options" ) !== null || this.dataProvider !== undefined ){
		while (_this.selector.options.length > 0) {
			_this.selector.remove(0);
	  }

		if( this.selector.getAttribute( "gadgetui-bind-options" ) !== null ){
			// use the gadgetui-ui-bind attribute to populate the select box from the model
			var optionsArray = this.model.get( this.selector.getAttribute( "gadgetui-bind-options" ) );
			optionsArray.forEach( function( item ){
				var opt = document.createElement("option");
				if( typeof item === "object" ){
					// object containing id, text keys
					opt.value = item.id;
					opt.text = item.text;
				}else{
					// simple values in array
					opt.text = item;
				}

				_this.selector.add( opt );
			});
		}else if( this.dataProvider !== undefined ){
			// use the dataProvider option to populate the select if provided
			this.dataProvider.data.forEach( function( obj ){
				id = obj.id;
				text = obj.text;
				if( text === undefined ){
					text = id;
				}
				option = gadgetui.util.createElement( "option" );
				option.value = id;
				option.text = text;

				_this.selector.add( option );
			});
		}
	}
};

SelectInput.prototype.addCSS = function(){
	var height,
		parentstyle,
		css = gadgetui.util.setStyle,
		style = gadgetui.util.getStyle( this.selector );

	css( this.selector, "min-width", "100px" );
	css( this.selector, "font-size", style.fontSize );

	parentstyle = gadgetui.util.getStyle( this.selector.parentNode );
	height = gadgetui.util.getNumberValue( parentstyle.height ) - 2;
	this.label.setAttribute( "style", "" );
	css( this.label, "padding-top", "2px" );
	css( this.label, "height", height + "px" );
	css( this.label, "margin-left", "9px" );

	if( navigator.userAgent.match( /Edge/ ) ){
		css( this.selector, "margin-left", "5px" );
	}else if( navigator.userAgent.match( /MSIE/ ) ){
		css( this.selector, "margin-top", "0px" );
		css( this.selector, "margin-left", "5px" );
	}
};

SelectInput.prototype.addBindings = function() {
	var _this = this,
		css = gadgetui.util.setStyle;

	this.label
		.addEventListener( this.activate, function( event ) {
			css( _this.label, "display", 'none' );
			css( _this.selector, "display", "inline-block" );
			event.preventDefault();
		});

	this.selector
		.addEventListener( "blur", function( ev ) {
			//setTimeout( function() {
				css( _this.label, "display", "inline-block" );
				css( _this.selector, "display", 'none' );
			//}, 100 );
		});

	this.selector
		.addEventListener( "change", function( ev ) {
			setTimeout( function() {
				var value = ev.target.value,
					label = ev.target[ ev.target.selectedIndex ].innerHTML;

				if( value.trim().length === 0 ){
					value = 0;
				}

				_this.label.innerText = label;
				if( _this.model !== undefined && _this.selector.getAttribute( "gadgetui-bind" ) === undefined ){
					// if we have specified a model but no data binding, change the model value
					_this.model.set( this.name, { id: value, text: label } );
				}

				if( _this.emitEvents === true ){
					gadgetui.util.trigger( _this.selector, "gadgetui-input-change", { id: value, text: label } );
				}
				if( _this.func !== undefined ){
					_this.func( { id: value, text: label } );
				}
				_this.value = { id: value, text: label };
			}, 100 );
		});

	this.selector
		.addEventListener( "mouseleave", function( ) {
			if ( _this.selector !== document.activeElement ) {
				css( _this.label, "display", 'inline-block' );
				css( _this.selector, "display", 'none' );
			}
		});


/*		function detectLeftButton(evt) {
	    evt = evt || window.event;
	    var button = evt.which || evt.button;
	    return button == 1;
	}

	document.onmouseup = function( event ){
		var isLeftClick = detectLeftButton( event );
		if( isLeftClick === true ){
			if ( $( _this.selector ).is( ":focus" ) === false ) {
				label
					.css( "display", "inline-block" );
				$( _this.selector )
					.hide( );
			}
		}
	};	*/
};

SelectInput.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.model =  (( options.model === undefined) ? undefined : options.model );
	this.dataProvider =  (( options.dataProvider === undefined) ? undefined : options.dataProvider );
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.activate = (( options.activate === undefined) ? "mouseenter" : options.activate );
};

function TextInput( selector, options ){
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;

	this.config( options );

	this.setInitialValue();
	this.addControl();
	this.setLineHeight();
	this.setFont();
	this.setMaxWidth();
	this.setWidth();
	this.addCSS();
	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.label, this.model );
	this.addBindings();
}

TextInput.prototype.addControl = function(){
	this.wrapper = document.createElement( "div" );
	this.labelDiv = document.createElement( "div" );
	this.inputDiv = document.createElement( "div" );
	this.label = document.createElement( "input" );
	
	this.label.setAttribute( "type", "text" );
	this.label.setAttribute( "data-active", "false" );
	this.label.setAttribute( "readonly", "true" );
	this.label.setAttribute( "value", this.value );
	this.label.setAttribute( "gadgetui-bind", this.selector.getAttribute( "gadgetui-bind" ) );
	this.labelDiv.appendChild( this.label );
	
	this.selector.parentNode.insertBefore( this.wrapper, this.selector );
	this.selector.parentNode.removeChild( this.selector );
	
	this.inputDiv.appendChild( this.selector );
	this.wrapper.appendChild( this.inputDiv );
	this.selector.parentNode.parentNode.insertBefore( this.labelDiv, this.inputDiv );

	this.wrapper = this.selector.parentNode.parentNode;
	this.labelDiv = this.wrapper.childNodes[0];
	this.label = this.labelDiv.childNodes[0];
	this.inputDiv = this.wrapper.childNodes[1];
};

TextInput.prototype.setInitialValue = function(){
	var val = this.selector.value,
		ph = this.selector.getAttribute( "placeholder" );

	if( val.length === 0 ){
		if( ph !== null && ph!== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}
	this.value = val;
};

TextInput.prototype.setLineHeight = function(){
	var lineHeight = this.selector.offsetHeight;
	this.lineHeight = lineHeight;
};

TextInput.prototype.setFont = function(){
	var style = gadgetui.util.getStyle( this.selector ),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
		this.font = font;
};

TextInput.prototype.setWidth = function(){
	this.width = gadgetui.util.textWidth( this.selector.value, this.font ) + 10;
	if( this.width === 10 ){
		this.width = this.maxWidth;
	}
};

TextInput.prototype.setMaxWidth = function(){
	var parentStyle = gadgetui.util.getStyle( this.selector.parentNode.parentNode );
	this.maxWidth = gadgetui.util.getNumberValue( parentStyle.width );
};

TextInput.prototype.addCSS = function(){
	var style = gadgetui.util.getStyle( this.selector ),
		css = gadgetui.util.setStyle;
	// add CSS classes
	gadgetui.util.addClass( this.selector, "gadgetui-textinput" );
	gadgetui.util.addClass( this.wrapper, "gadgetui-textinput-div" );
	gadgetui.util.addClass( this.labelDiv, "gadgetui-inputlabel" );
	gadgetui.util.addClass( this.label, "gadgetui-inputlabelinput" );
	gadgetui.util.addClass( this.inputDiv, "gadgetui-inputdiv" );
	css( this.label, "background", "none" );
	css( this.label, "padding-left", "4px" );
	css( this.label, "border", " 1px solid transparent" );
	css( this.label, "width", this.width + "px" );
	css( this.label, "font-family", style.fontFamily );
	css( this.label, "font-size", style.fontSize );
	css( this.label, "font-weight", style.fontWeight );
	css( this.label, "font-variant", style.fontVariant );
	
	css( this.label, "max-width", "" );
	css( this.label, "min-width", this.minWidth + "px" );
	
	if( this.lineHeight > 20 ){
		// add min height to label div as well so label/input isn't offset vertically
		css( this.wrapper, "min-height", this.lineHeight + "px" );
		css( this.labelDiv, "min-height", this.lineHeight + "px" );
		css( this.inputDiv, "min-height", this.lineHeight + "px" );
	}	
	
	css( this.labelDiv, "height", this.lineHeight + "px" );
	css( this.labelDiv, "font-size", style.fontSize );
	css( this.labelDiv, "display", "block" );
	
	css( this.inputDiv, "height", this.lineHeight + "px" );
	css( this.inputDiv, "font-size", style.fontSize );
	css( this.inputDiv, "display", "block" );	
	

	css( this.selector, "padding-left", "4px" );
	css( this.selector, "border", "1px solid " + this.borderColor );
	css( this.selector, "font-family", style.fontFamily );
	css( this.selector, "font-size", style.fontSize );
	css( this.selector, "font-weight", style.fontWeight );
	css( this.selector, "font-variant", style.fontVariant );
	
	css( this.selector, "width", this.width + "px" );
	css( this.selector, "min-width", this.minWidth + "px" );	

	this.selector.setAttribute( "placeholder", this.value );
	css( this.inputDiv, "display", 'none' );

	if( this.maxWidth > 10 && this.enforceMaxWidth === true ){
		css( this.label, "max-width", this.maxWidth );
		css( this.selector, "max-width", this.maxWidth );

		if( this.maxWidth < this.width ){
			this.label.value = gadgetui.util.fitText( this.value, this.font, this.maxWidth );
		}
	}
};

TextInput.prototype.setControlWidth = function( text ){
	var textWidth = parseInt( gadgetui.util.textWidth(text, this.font ), 10 ),
		css = gadgetui.util.setStyle;
	if( textWidth < this.minWidth ){
		textWidth = this.minWidth;
	}
	css( this.selector, "width", ( textWidth + 30 ) + "px" );
	css( this.label, "width", ( textWidth + 30 ) + "px" );	
};

TextInput.prototype.addBindings = function(){
	var _this = this;

	this.label
		//.off( _this.activate )
		.addEventListener( _this.activate, function( ) {
			if( _this.useActive && ( _this.label.getAttribute( "data-active" ) === "false" || _this.label.getAttribute( "data-active" ) === undefined ) ){
				_this.label.setAttribute( "data-active", "true" );
			}else{
				setTimeout( 
					function(){
					var event, css = gadgetui.util.setStyle;
					if( gadgetui.util.mouseWithin( _this.label, gadgetui.mousePosition ) === true ){
						// both input and label
						css( _this.labelDiv, "display", 'none' );
						css( _this.inputDiv, "display", 'block' );
						_this.setControlWidth( _this.selector.value );

						// if we are only showing the input on click, focus on the element immediately
						if( _this.activate === "click" ){
							_this.selector.focus();
						}
						if( _this.emitEvents === true ){
							// raise an event _this the input is active
							
							event = new Event( "gadgetui-input-show" );
							_this.selector.dispatchEvent( event );
						}
					}}, _this.delay );
			}
		});

	this.selector
		.addEventListener( "focus", function(e){
			e.preventDefault();
		});

	this.selector
		.addEventListener( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				this.blur();
			}
			_this.setControlWidth( this.value );
		});

	this.selector
		.addEventListener( "change", function( event ) {
			setTimeout( function( ) {
				var value = event.target.value, style, txtWidth;
				if( value.length === 0 && _this.selector.getAttribute( "placeholder" ) !== undefined ){
					value = _this.selector.getAttribute( "placeholder" );
				}

				txtWidth = gadgetui.util.textWidth( value, _this.font );

				if( _this.maxWidth < txtWidth ){
					value = gadgetui.util.fitText( value, _this.font, _this.maxWidth );
				}
				_this.label.value = value;
				if( _this.model !== undefined && _this.selector.getAttribute( "gadgetui-bind" ) === undefined ){	
					// if we have specified a model but no data binding, change the model value
					_this.model.set( _this.selector.name, event.target.value );
				}

				if( _this.emitEvents === true ){
					gadgetui.util.trigger( _this.selector, "gadgetui-input-change", { text: event.target.value } );
				}

				if( _this.func !== undefined ){
					_this.func( { text: event.target.value } );
				}				
			}, 200 );
		});
	
	this.selector
		//.removeEventListener( "mouseleave" )
		.addEventListener( "mouseleave", function( ) {
			var css = gadgetui.util.setStyle;
			if( this !== document.activeElement ){
				css( _this.labelDiv, "display", "block" );
				css( _this.inputDiv, "display", "none" );
				css( _this.label, "maxWidth", _this.maxWidth );				
			}
		});

	this.selector
		.addEventListener( "blur", function( ) {
			var css = gadgetui.util.setStyle;
			css( _this.inputDiv, "display", 'none' );
			css( _this.labelDiv, "display", 'block' );
			_this.label.setAttribute( "data-active", "false" );
			css( _this.selector, "maxWidth", _this.maxWidth );
			css( _this.label, "maxWidth", _this.maxWidth );
		});

};

TextInput.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.borderColor =  (( options.borderColor === undefined) ? "#d0d0d0" : options.borderColor );
	this.useActive =  (( options.useActive === undefined) ? false : options.useActive );
	this.model =  (( options.model === undefined) ? this.model : options.model );
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.activate = (( options.activate === undefined) ? "mouseenter" : options.activate );
	this.delay = (( options.delay === undefined) ? 10 : options.delay );
	this.minWidth = (( options.minWidth === undefined) ? 100 : options.minWidth );
	this.enforceMaxWidth = ( options.enforceMaxWidth === undefined ? false : options.enforceMaxWidth );
};

	return{
		FileUploader: FileUploader,
		TextInput: TextInput,
		SelectInput: SelectInput,
		ComboBox: ComboBox,
		LookupListInput: LookupListInput
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
  on: function(event, func) {
    if (this.events[event] === undefined) {
      this.events[event] = [];
    }
    this.events[event].push(func);
    return this;
  },

  off: function(event) {
    // clear listeners
    this.events[event] = [];
    return this;
  },

  fireEvent: function(key, args) {
    var self = this;
    this.events[key].forEach( function( func ) {
      func(self, args);
    });
  },

  getAll: function() {
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

gadgetui.util = ( function() {

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
			if ( bindVar !== undefined && model !== undefined ) {
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
		}
	};
}() );

//# sourceMappingURL=gadget-ui.js.map