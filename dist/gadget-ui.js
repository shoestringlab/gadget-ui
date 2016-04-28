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
	
	BindableObject.prototype.updateDomElement = function( event, selector, value ){
		if( event.originalSource === undefined ){
			event.originalSource = "BindableObject.updateDomElement";
		}
		console.log( "updateDomElement : selector: { type: " + selector.nodeName + ", name: " + selector.name + " }" );
		console.log( "updateDomElement : Source: " + event.originalSource );	
		if( typeof value === 'object' ){
			// select box objects are populated with { text: text, id: id } 
			if( selector.tagName === "DIV" || selector.tagName === "SPAN" ){
				selector.innerText = value.text;
			}else{
				selector.value = value.id;
			}
		}else{
			if( selector.tagName === "DIV" || selector.tagName === "SPAN" ){
				selector.innerText = value;
			}else{
				selector.value = value;
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
			console.log( "model value set: name: " + name + ", value: " + value );
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
	//console.log( "this.setBubbleStyles();" );
	//console.log( "top: " + this.top + ", left: " + this.left );
	this.calculateArrowPosition();
	//console.log( "this.calculateArrowPosition();" );
	//console.log( "top: " + this.top + ", left: " + this.left );
	this.calculateArrowStyle();
	//console.log( "this.calculateArrowStyle();" );
	//console.log( "top: " + this.top + ", left: " + this.left );
	this.setBeforeRules();
	//console.log( "this.setBeforeRules();" );
	//console.log( "top: " + this.top + ", left: " + this.left );
	this.setAfterRules();
	//console.log( "this.setAfterRules();" );
	//console.log( "top: " + this.top + ", left: " + this.left );
	this.calculatePosition();
	//console.log( "this.calculatePosition();" );
	//console.log( "top: " + this.top + ", left: " + this.left );

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
	if( this.collapse === true ){
		this.toggle();
	}		
}

CollapsiblePane.prototype.addControl = function(){
	var pane = document.createElement( "div" );
	
	gadgetui.util.addClass( pane, "gadget-ui-collapsiblePane" );
	this.selector.parentNode.insertBefore( pane, this.selector );
	this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild( this.selector );
	pane.appendChild( this.selector );
};

CollapsiblePane.prototype.addHeader = function(){
	var div,
	css = gadgetui.util.setStyle,
		header = document.createElement( "div" );

	css( header, "padding",  "2px 0px 2px .5em" );
	css( header, "text-align",  "left" );
	css( header, "border-radius",  this.borderRadius + "px" );
	css( header, "border",  "1px solid "  + this.borderColor );
	css( header, "background",  this.headerBackgroundColor );
	css( header, "color",  this.headerColor );
	css( header, "font-weight",  "bold" );
	css( header, "font",  this.font );

	gadgetui.util.addClass( header, "gadget-ui-collapsiblePane-header" );
	header.innerHTML = this.title;
	this.wrapper.insertBefore( header, this.selector );
	this.header = this.wrapper.querySelector( "div.gadget-ui-collapsiblePane-header" );
	div = document.createElement( "div" );
	gadgetui.util.addClass( div, "oi" );
	div.setAttribute( 'data-glyph', "caret-top" );
	this.header.appendChild( div );
};

CollapsiblePane.prototype.addCSS = function(){
	var theWidth = this.width,
		css = gadgetui.util.setStyle;

	css( this.wrapper, "width", theWidth );
	css( this.wrapper, "border",  "1px solid "  + this.borderColor );
	css( this.wrapper, "border-radius",  this.borderRadius + "px" );
	css( this.wrapper, "overflow",  "hidden" );

	//now make the width of the selector to fill the wrapper
	if( !this.selector.style ){
		css( this.selector, "padding", this.padding + "px" );
	}
};

CollapsiblePane.prototype.addBindings = function(){
	var _this = this, header = this.wrapper.querySelector(  "div.gadget-ui-collapsiblePane-header" );
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
		border,
		selectorHeight,
		expandClass = "caret-bottom", 
		collapseClass = "caret-top";
	if( this.collapsed === true ){
		icon = collapseClass;
		display = "block";
		myHeight = this.height;
		selectorHeight = this.selectorHeight;
		border = "1px solid " + this.borderColor;
		this.collapsed = false;
	}else{
		icon = expandClass;
		display = "none";
		myHeight = this.headerHeight;
		selectorHeight = 0;
		border = "1px solid transparent";
		this.collapsed = true;
	}
	
	this.eventName = ( ( this.eventName === "collapse" ) ? "expand" : "collapse" );
	css( this.selector, "padding", this.padding + "px" );
	css( this.selector, "padding-top", this.paddingTop + "px" );

	var ev = new Event( this.eventName );
	this.selector.dispatchEvent( ev );
	
	if( typeof Velocity != 'undefined' && this.animate ){
		if( display === "block" ){
			css( this.wrapper, "border", border );
		}
		Velocity( this.wrapper, {
			height: myHeight
		},{ queue: false, duration: 500, complete: function() {
			//_this.selector.style.display = display;
			//_this.wrapper.style.border = border;
			_this.icon.setAttribute( "data-glyph", icon );
			} 
		});
		Velocity( this.selector, {
			height: selectorHeight
		},{ queue: false, duration: 500, complete: function() {

			} 
		});			
	}else{
		css( this.selector, "display", display );
		this.icon.setAttribute( "data-glyph", icon );
	}
};

CollapsiblePane.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.animate = (( options.animate === undefined) ? true : options.animate );
	this.title = ( options.title === undefined ? "": options.title );
	this.path = ( options.path === undefined ? "/bower_components/gadget-ui/dist/": options.path );
	this.padding = ( options.padding === undefined ? ".5em": options.padding );
	this.paddingTop = ( options.paddingTop === undefined ? ".3em": options.paddingTop );
	this.width = ( options.width === undefined ? gadgetui.util.getStyle( this.selector, "width" ) : options.width );
	this.interiorWidth = ( options.interiorWidth === undefined ? "": options.interiorWidth );
	this.collapse = ( ( options.collapse === undefined || options.collapse === false ? false : true ) );
	this.borderColor = ( options.borderColor === undefined ? "silver": options.borderColor );
	this.headerColor = ( options.headerColor === undefined ? "black": options.headerColor );
	this.headerBackgroundColor = ( options.headerBackgroundColor === undefined ? "silver": options.headerBackgroundColor );
	this.borderRadius = ( options.borderRadius === undefined ? 6 : options.borderRadius );
};

	function FloatingPane( selector, options ){

	this.selector = selector;
	if( options !== undefined ){
		this.config( options );
	}
	
	this.addControl();
	this.addHeader();
	this.maxmin = this.wrapper.querySelector( "div.oi" );
	
	this.addCSS();

	// now set height to computed height of control _this has been created
	this.height = gadgetui.util.getStyle( this.wrapper, "height" );

	this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset( this.selector ).left;
	this.addBindings();
}

FloatingPane.prototype.addBindings = function(){
	var _this = this;
	// jquery-ui draggable
	//this.wrapper.draggable( {addClasses: false } );
	gadgetui.util.draggable( this.wrapper );
	
	this.maxmin.addEventListener( "click", function(){
		if( _this.minimized ){
			_this.expand();
		}else{
			_this.minimize();
		}
	});
};

FloatingPane.prototype.addHeader = function(){
	var css = gadgetui.util.setStyle;
	this.header = document.createElement( "div" );
	this.header.innerHTML = this.title;
	gadgetui.util.addClass( this.header, 'gadget-ui-floatingPane-header' );
	//this.header.setAttribute( "style",
	css( this.header, "padding",  "2px 0px 2px .5em" );
	css( this.header, "text-align",  "left" );
	css( this.header, "border-radius", this.borderRadius + "px" );
	css( this.header, "border",  "1px solid "  + this.borderColor );
	css( this.header, "background", this.headerBackgroundColor );
	css( this.header, "color",  this.headerColor );
	css( this.header, "font-weight",  "bold" );
	css( this.header, "font",  this.font );

	this.icon = document.createElement( "div" );
	gadgetui.util.addClass( this.icon, "oi" );
	this.header.insertBefore( this.icon, undefined );
	this.wrapper.insertBefore( this.header, this.selector );
	this.icon.setAttribute( 'data-glyph', "fullscreen-exit" );
	this.header.appendChild( this.icon );	
};

FloatingPane.prototype.addCSS = function(){
	var css = gadgetui.util.setStyle;
	//copy width from selector
	css( this.wrapper, "width",  this.width );
	css( this.wrapper, "border",  "1px solid "  + this.borderColor );
	css( this.wrapper, "border-radius", this.borderRadius + "px" );
	css( this.wrapper, "min-width", this.minWidth );
	css( this.wrapper, "opacity", this.opacity );
	css( this.wrapper, "z-index", this.zIndex );
	
	//now make the width of the selector to fill the wrapper
	css( this.selector, "width", this.interiorWidth + "px" );
	css( this.selector, "padding", this.padding + "px" );
	
	css( this.maxmin, "float", "right" );
	css( this.maxmin, "display", "inline" );
};

FloatingPane.prototype.addControl = function(){
	var fp = document.createElement( "div" );
	gadgetui.util.addClass( fp, "gadget-ui-floatingPane" );
	
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
		lx =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );
	
	if( typeof Velocity != 'undefined' && this.animate ){
		
		Velocity( this.wrapper, {
			left: lx - width + _this.minWidth
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		});
	
		Velocity( this.wrapper, {
			width: this.width
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		});
	
		Velocity( this.wrapper, {
			height: this.height
		},{queue: false, duration: 500, complete: function() {
			_this.icon.setAttribute( "data-glyph", "fullscreen-exit" );
		}
		});
	}else{
		css( this.wrapper, "left", ( lx - width + this.minWidth ) + "px" );
		css( this.wrapper, "width", this.width );
		css( this.wrapper, "height", this.height );
		this.icon.setAttribute( "data-glyph", "fullscreen-exit" );
	}
	this.minimized = false;
};

FloatingPane.prototype.minimize = function(){
	// when minimizing and maximizing, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position
	
	var _this = this,
		css = gadgetui.util.setStyle,
		offset = gadgetui.util.getOffset( this.wrapper ),
		lx =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );

	if( typeof Velocity != 'undefined' && this.animate ){
			
		Velocity( this.wrapper, {
			left: lx + width - _this.minWidth
		},{queue: false, duration: 500}, function() {
	
		});
	
		Velocity( this.wrapper, {
			width: _this.minWidth
		},{queue: false, duration: 500, complete: function() {
			_this.icon.setAttribute( "data-glyph", "fullscreen-enter" );
			}
		});
	
		Velocity( this.wrapper, {
			height: "50px"
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		});
	}else{
		css( this.wrapper, "left", ( lx + width - this.minWidth ) + "px" );
		css( this.wrapper, "width", this.minWidth + "px" );
		css( this.wrapper, "height", "50px" );
		this.icon.setAttribute( "data-glyph", "fullscreen-enter" );
	}
	this.minimized = true;
};

FloatingPane.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.animate = (( options.animate === undefined) ? true : options.animate );
	this.title = ( options.title === undefined ? "": options.title );
	this.path = ( options.path === undefined ? "/bower_components/gadget-ui/dist/": options.path );
	this.position = ( options.position === undefined ? { my: "right top", at: "right top", of: window } : options.position );
	this.padding = ( options.padding === undefined ? "15px": options.padding );
	this.paddingTop = ( options.paddingTop === undefined ? ".3em": options.paddingTop );
	this.width = ( options.width === undefined ? gadgetui.util.getStyle( this.selector, "width" ) : options.width );
	this.minWidth = ( this.title.length > 0 ? Math.max( 100, this.title.length * 10 ) + 20 : 100 );

	this.height = ( options.height === undefined ? gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector, "height" ) ) + ( gadgetui.util.getNumberValue( this.padding ) * 2 ) : options.height );
	this.interiorWidth = ( options.interiorWidth === undefined ? "": options.interiorWidth );
	this.opacity = ( ( options.opacity === undefined ? 1 : options.opacity ) );
	this.zIndex = ( ( options.zIndex === undefined ? gadgetui.util.getMaxZIndex() + 1 : options.zIndex ) );
	this.minimized = false;
	this.relativeOffsetLeft = 0;
	this.borderColor = ( options.borderColor === undefined ? "silver": options.borderColor );
	this.headerColor = ( options.headerColor === undefined ? "black": options.headerColor );
	this.headerBackgroundColor = ( options.headerBackgroundColor === undefined ? "silver": options.headerBackgroundColor );
	this.borderRadius = ( options.borderRadius === undefined ? 6 : options.borderRadius );	
};



	return{
		Bubble : Bubble,
		CollapsiblePane: CollapsiblePane,
		FloatingPane: FloatingPane
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
	this.setCSS();
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

ComboBox.prototype.setCSS = function(){
	var _this = this,

	promise = new Promise(
		function( resolve, reject ){
			_this.getArrowWidth( resolve, reject );
		});
	promise
		.then( function(){
			_this.addCSS();
		});
	promise['catch']( function( message ){
			// use width of default icon
			_this.arrowWidth = 22;
			console.log( message );
			_this.addCSS();
		});
};

ComboBox.prototype.getArrowWidth = function( resolve, reject ){
	var _this = this, 
		img = new Image();
		img.onload = function() {
			_this.arrowWidth = this.width;
			resolve();
		};
		img.onerror = function(){
			reject( "Icon was not loaded." );
		};
		img.src = this.arrowIcon;
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
  
	leftPosition = this.borderWidth + 4;

	if( this.borderRadius > 5 ){
		selectLeftPadding = this.borderRadius - 5;
		leftPosition = leftPosition + selectLeftPadding;
	}
	inputLeftMargin = leftPosition;
	inputWidthAdjusted = inputWidth - this.arrowWidth - this.borderRadius - 4;
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
	
	
	css( this.inputWrapper, "position",  "absolute" ); 
	css( this.inputWrapper, "top", inputWrapperTop );
	css( this.inputWrapper,"left",leftOffset );

	css( this.input, "display",  "inline" ); 
	css( this.input,"padding-left",inputLeftOffset );
	css( this.input,"margin-left",inputLeftMargin );
	css( this.input, "width", inputWidthAdjusted ); 

	css( this.label, "position",  "absolute" ); 
	css( this.label,"left",leftPosition );
	css( this.label,"top",( this.borderWidth + 1 ) );
	css( this.label, "margin-left", 0 );

	css( this.selectWrapper, "display",  "inline" ); 
	css( this.selectWrapper, "position",  "absolute" ); 
	css( this.selectWrapper, "padding-bottom",  "1px" ); 
	css( this.selectWrapper, "left", 0 );

	//appearance 
	css( this.comboBox, "font-size", styles.fontSize );	

	css( this.selectWrapper, "background-color", this.backgroundColor );
	css( this.selectWrapper, "border-color", this.borderColor ); 
	css( this.selectWrapper, "border-style", this.borderStyle ); 
	css( this.selectWrapper, "border-width", this.borderWidth ); 
	css( this.selectWrapper, "border-radius", this.borderRadius ); 

	css( this.input, "border", 0 );
	css( this.input, "font-size", styles.fontSize );
	css( this.input, "background-color", this.inputBackground );


	css( this.label, "font-family", styles.fontFamily );
	css( this.label, "font-size", styles.fontSize );
	css( this.label, "font-weight", styles.fontWeight );
	// add rules for arrow Icon
	//we're doing this programmatically so we can skin our arrow icon
	if( navigator.userAgent.match( /Firefox/) ){
		
		css( this.selectWrapper, "background-image",  "url('" + this.arrowIcon + "')" ); 
		css( this.selectWrapper, "background-repeat",  "no-repeat" ); 
		css( this.selectWrapper, "background-position",  "right center" ); 

		if( this.scaleIconHeight === true ){
			css( this.selectWrapper, "background-size",  this.arrowWidth + "px " + inputHeight + "px" ); 
		}
	}
	css( this.selector, "-webkit-appearance",  "none" ); 
	css( this.selector, "-moz-appearance",  "window" ); 
	css( this.selector, "background-image",  "url('" + this.arrowIcon + "')" ); 
	css( this.selector, "background-repeat",  "no-repeat" ); 
	css( this.selector, "background-position",  "right center" ); 

	if( this.scaleIconHeight === true ){
		css( this.selector, "background-size",  this.arrowWidth + "px " + inputHeight + "px" ); 
	}

	css( this.inputWrapper, "display", 'none' );
	css( this.selectWrapper, "display", 'none' );
	css( this.comboBox, "opacity",  1 ); 
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

	this.selector
		.addEventListener( "mouseenter", function( ev ){
			_this.selector.style.display = "inline";
		});
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
	
/*		$( "option", this.selector
		.on( "mouseenter", function( ev ){
			console.log( "option mouseenter" );
			if( _this.selector.css( "display" ) !== "inline" ){
				_this.selector.style.display = "inline";
			}
		});	*/
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
									boxShadow: '0 0 5px ' + _this.glowColor,
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
	this.inputBackground = (( options.inputBackground === undefined) ? "#ffffff" : options.inputBackground );
	this.borderWidth = (( options.borderWidth === undefined) ? 1 : options.borderWidth );
	this.borderColor = (( options.borderColor === undefined) ? "#d0d0d0" : options.borderColor );
	this.borderStyle = (( options.borderStyle === undefined) ? "solid" : options.borderStyle );
	this.borderRadius = (( options.borderRadius === undefined) ? 5 : options.borderRadius );
	this.width = (( options.width === undefined) ? 150 : options.width );
	this.newOption = (( options.newOption === undefined) ? { text: "...", id: 0 } : options.newOption );
	this.id = (( options.id === undefined) ? this.newOption.id : options.id );
	this.arrowIcon = (( options.arrowIcon === undefined) ? "/bower_components/gadget-ui/dist/img/arrow.png" : options.arrowIcon );
	this.scaleIconHeight = (( options.scaleIconHeight === undefined) ? false : options.scaleIconHeight );
	this.animate = (( options.animate === undefined) ? true : options.animate );
	this.glowColor = (( options.glowColor === undefined ) ? 'rgb(82, 168, 236)' : options.glowColor );
	this.animateDelay = (( options.animateDelay === undefined ) ? 500 : options.animateDelay );
	this.border = this.borderWidth + "px " + this.borderStyle + " " + this.borderColor;
	this.saveBorder = this.borderWidth + "px " + this.borderStyle + " " + this.glowColor;
};


//author - Robert Munn <robertdmunn@gmail.com>

// significant portions of code from jQuery UI
//adapted from jQuery UI autocomplete. modified and re-distributed per MIT License.


function LookupListInput( selector, options ){
	function _renderLabel( item ){
		return item.label;
	};
	this.itemRenderer = _renderLabel;
	this.menuItemRenderer = _renderLabel;
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

LookupListInput.prototype.addLiveRegion = function(){
	var liveRegion = document.createElement( "span" );
	liveRegion.setAttribute( "role", "status" );
	liveRegion.setAttribute( "aria-live", "assertive" );
	liveRegion.setAttribute( "aria-relevant", "additions" );
	gadgetui.util.addClass( "liveRegion", "ui-helper-hidden-accessible" );
	this.document[ 0 ].body.appendChild( liveRegion );

	// turning off autocomplete prevents the browser from remembering the
	// value when navigating through history, so we re-enable autocomplete
	// if the page is unloaded before the widget is destroyed. #7790
	this._on( this.window, {
	beforeunload: function() {
		this.element.removeAttribute( "autocomplete" );
	}
	});
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

LookupListInput.prototype.filter = function( array, term ) {
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
		if ( !event.target.classList.contains( "gadgetui-lookuplist-item" ) ) {
			gadgetui.util.delay(function() {
				this.document.one( "mousedown", function( event ) {
					if ( event.target !== _this.menu.element &&
							event.target !== menuElement &&
							!gadgetui.util.contains( menuElement, event.target ) ) {
						_this.close();
					}
				});
			});
		}
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
	
	/*	
	$( this.selector )
		.autocomplete( {
			minLength : _this.minLength,
			source : function( request, response ) {
				response( $.ui.autocomplete.filter( _this.datasource, gadgetui.util.extractLast( request.term ) ) );
			},

			focus : function( ) {
				// prevent value inserted on
				// focus
				return false;
			},
			select : function( event, ui ) {
				var terms = gadgetui.util.split( this.value );
				// remove the current input
				terms.pop( );

				_this.add( _this.selector, ui.item );
				this.value = '';
				this.focus( );
				return false;
			}
		} ).on( "keydown", function( event ) {
			$( this )
				.css( "width", Math.round( ( $( this ).val( ).length * 0.66 ) + 3 ) + "em" );
	
			if ( event.keyCode === $.ui.keyCode.TAB && $( this ).data( "ui-autocomplete" ).menu.active ) {
				event.preventDefault( );
			}
			if ( event.keyCode === $.ui.keyCode.BACKSPACE && $( this ).val( ).length === 0 ) {
				event.preventDefault();
				var elem = $( this ).prev( "div[class~='gadgetui-lookuplist-input-item-wrapper']" );

				elem.remove( );
			}
		});

	$.ui.autocomplete.prototype._renderItem = function( ul, item){
		if( typeof _this.menuItemRenderer === "function"){
			return $( "<li>" )
			.setAttribute( "data-value", item.value )
			.append( $( "<a>" ).text( _this.menuItemRenderer( item ) ) )
			.appendTo( ul );
		}else{
			//default jquery-ui implementation
			return $( "<li>" )
			.append( $( "<a>" ).text( item.label ) )
			.appendTo( ul );
		}
	};		*/
};

LookupListInput.prototype.add = function( item ){
	var _this = this,
		prop, list, itemWrapper, itemCancel, itemNode;

	itemWrapper = document.createElement( "div" );
	gadgetui.util.addClass( itemWrapper, "gadgetui-lookuplist-input-item-wrapper" );
	itemCancel = document.createElement( "span" );
	//gadgetui.util.addClass( itemCancel, "gadgetui-lookuplist-input-cancel" );
	itemWrapper.setAttribute( "data-value", item.value );
	if( item.title !== undefined ){
		itemCancel.setAttribute( "title", item.title );
	}
	gadgetui.util.addClass( itemCancel, "oi" );
	itemCancel.setAttribute( 'data-glyph', "circle-x" );
	gadgetui.util.setStyle( itemCancel, "font-size", ".4em" );
	gadgetui.util.setStyle( itemCancel, "opacity", ".5" );
	itemNode = document.createElement( "div" );
	gadgetui.util.addClass( itemNode, "gadgetui-lookuplist-input-item" ); 
	itemNode.innerHTML = this.itemRenderer( item );
	itemWrapper.appendChild( itemCancel );
	itemWrapper.appendChild( itemNode );
	this.wrapper.insertBefore( itemWrapper, this.selector );

	var spanLeft =  gadgetui.util.getNumberValue( gadgetui.util.getStyle( itemWrapper, "width" ) ) 
					- gadgetui.util.getNumberValue(  gadgetui.util.getStyle( itemNode, "padding-left" ) )  
					- gadgetui.util.getNumberValue(  gadgetui.util.getStyle( itemNode, "padding-right" ) );
	var	css = gadgetui.util.setStyle;
	css( itemCancel, "left", spanLeft );
	css( itemCancel, "position", "absolute" );
	css( itemCancel, "cursor", "pointer"  );
	css( itemCancel, "top", 5 );

	itemCancel.addEventListener( "click", function( event ){
		_this.remove( this.parentNode );
	});
	
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
		list = this.model.get( prop );
		if( typeof list === Array ){
			list = [];
		}
		list.push( item );
		this.model.set( prop, list );
	}
};

LookupListInput.prototype.remove = function( selector ){
	//el.parentNode.querySelector( "div[data-value='" + value + "']" ).parentNode.remove();
	var _this = this, removed, ix, prop, list, value = selector.getAttribute( "data-value" );

	selector.parentNode.removeChild( selector );
	// remove from internal array
	for( ix = 0; ix < this.items.length; ix++ ){
		if( this.items[ ix ].value === value ){
			removed = this.items.splice( ix, 1 );
			console.log( 'removed: ' + removed.label );
		}
	}
	if( this.model !== undefined ){
		prop = this.selector.getAttribute( "gadgetui-bind" );
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
};

LookupListInput.prototype.reset = function(){
	this.selector.parentNode.querySelector( ".gadgetui-lookuplist-input-item-wrapper" ).empty();

	if( this.model !== undefined ){
		prop = this.el.getAttribute( "gadget-ui-bind" );
		list = this.model.get( prop );
		list.length = 0;
	}
};

LookupListInput.prototype.destroy = function() {
	clearTimeout( this.searching );
	//this.selector.removeClass( "gadgetui-lookuplist-input" );
	this.menu.element.remove();
	this.liveRegion.remove();
};

LookupListInput.prototype._setOption = function( key, value ) {
//_setOption: function( key, value ) {
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
//_appendTo: function() {
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
	//search: function( value, event ) {
	value = value != null ? value : _this.selector.value;

	// always save the actual value, not the one passed as an argument
	this.term = this._value();

	if ( value.length < this.minLength ) {
		return this.close( event );
	}

	/*	if ( this._trigger( "search", event ) === false ) {
		return;
	}	*/

	return this._search( value );
};

LookupListInput.prototype._search = function( value ) {
	//_search: function( value ) {
	this.pending++;
	//this.element.addClass( "ui-autocomplete-loading" );
	this.cancelSearch = false;

	this.source( { term: value }, this._response() );
	console.log( this.datasource );
};

LookupListInput.prototype._response = function() {
	//_response: function() {
	var _this = this, 
		index = ++this.requestIndex,
		fn = function( content ) {
			//if ( index === _this.requestIndex ) {
				_this.__response( content );
			//}

			_this.pending--;
			if ( !_this.pending ) {
				//this.element.removeClass( "ui-autocomplete-loading" );
			}
		},
		proxy = function(){
			return fn.apply( _this, arguments );
		};
	return proxy;
};

LookupListInput.prototype.__response = function( content ) {
	//__response: function( content ) {
	content = this.makeUnique( content );
	
	if ( content && content.length ) {
		content = this._normalize( content );
	}
	//this._trigger( "response", null, { content: content } );
	this.selector.dispatchEvent( new CustomEvent( "response", { content: content } ) );
	if ( !this.disabled && content && content.length && !this.cancelSearch ) {
		this._suggest( content );
		this.selector.dispatchEvent( new Event( "open" ) );
		//this._trigger( "open" );
	} else {
		// use ._close() instead of .close() so we don't cancel future searches
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
		//this.selector.dispatchEvent( event );
		//this._trigger( "close", event );
	}
};

LookupListInput.prototype._change = function( event ) {
	if ( this.previous !== this._value() ) {
	//	this._trigger( "change", event, { item: this.selectedItem } );
		//this.selector.dispatchEvent( event );
	}
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
	this._renderMenu( div, items );
	this.isNewMenu = true;
	//this.menu.refresh();

	// size and position menu
	div.style.display = 'block';
	this._resizeMenu();
	this.position.of = this.element;
	
	if ( this.autoFocus ) {
	//	this.menu.next();
	}
};

LookupListInput.prototype._resizeMenu = function() {
	var div = this.menu.element;
	// don't change it right now
};

LookupListInput.prototype._renderMenu = function( div, items ) {
	var _this = this;
	items.forEach( function( item, index ) {
		_this._renderItemData( div, item );
	});
};

LookupListInput.prototype._renderItemData = function( div, item ) {
	return this._renderItem( div, item );
};

LookupListInput.prototype._renderItem = function( div, item ) {
	var _this = this,
		menuItem = document.createElement( "div" );
	gadgetui.util.addClass( menuItem, "gadgetui-lookuplist-item" );
	menuItem.setAttribute( "value", item.value );
	menuItem.innerText = this.menuItemRenderer( item );
	div.appendChild( menuItem );
	
	menuItem.addEventListener( "click", function( event ){
		var ev = new CustomEvent( "menuselect", { detail: item } );
		_this.menu.element.dispatchEvent( ev );
	});
	return div;
	//return $( "<li>" ).text( item.label ).appendTo( ul );
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
	this.itemRenderer = (( options.itemRenderer === undefined) ? this.itemRenderer : options.itemRenderer );
	this.menuItemRenderer = (( options.menuItemRenderer === undefined) ? this.menuItemRenderer : options.menuItemRenderer );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.datasource = (( options.datasource === undefined) ? (( options.lookupList !== undefined ) ? options.lookupList : true ) : options.datasource );
	this.minLength = (( options.minLength === undefined) ? 0 : options.minLength );
	this.disabled = (( options.disabled === undefined) ? false : options.disabled );
	this.position = ( options.position === undefined ) ? { my: "left top", at: "left bottom", collision: "none" } : options.position;
	this.autoFocus = (( options.autoFocus === undefined) ? false : options.autoFocus );
	this.requestIndex = 0;
};

function SelectInput( selector, options ){
	this.selector = selector;

	this.config( options );
	this.setInitialValue();

	this.addControl();
	this.addCSS();
	this.selector.style.display = 'none';

	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.label, this.model );	
	this.addBindings();
}

SelectInput.prototype.setInitialValue = function(){
	// this.value set in config()
	this.selector.value = this.value.id;
};

SelectInput.prototype.addControl = function(){
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
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.activate = (( options.activate === undefined) ? "mouseenter" : options.activate );
	this.value = (( options.value === undefined) ? { id: this.selector[ this.selector.selectedIndex ].value, text : this.selector[ this.selector.selectedIndex ].innerHTML } : options.value );
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
		TextInput: TextInput,
		SelectInput: SelectInput,
		ComboBox: ComboBox,
		LookupListInput: LookupListInput
	};
}());
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

		isNumeric: function( num ) {
			  return !isNaN(parseFloat( num )) && isFinite( num );
		},
			
		setStyle : function( element, style, value ){
			var newStyles,
				estyles = element.getAttribute( "style" ),
				currentStyles = ( estyles !== null ? estyles : "" ),
				str = '(' + style + ')+ *\\:[^\\;]*\\;',
				re = new RegExp( str , "g" );
			//find styles in the style string
			//([\w\-]+)+ *\:[^\;]*\;
			
			// assume 
			if( gadgetui.util.isNumeric( value ) === true ){
				// don't modify properties that accept a straight numeric value
				switch( style ){
				case "opacity":
				case "z-index":
				case "font-weight":
					break;
				default:
					value = value + "px";
				}
			}
			
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
		},
		delay: function( handler, delay ) {
			function handlerProxy() {
				return handler
					.apply( instance, arguments );
			}
			var instance = this;
			return setTimeout( handlerProxy, delay || 0 );
		},
		contains: function( child, parent ){
			 var node = child.parentNode;
		     while (node != null) {
		         if (node == parent) {
		             return true;
		         }
		         node = node.parentNode;
		     }
		     return false;
		}
	};
} ());	
//# sourceMappingURL=gadget-ui.js.map