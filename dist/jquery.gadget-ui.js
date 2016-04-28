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


gadgetui.model = ( function( $ ) {
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
					if( ev.target.name === obj.prop && ev.originalSource !== 'BindableObject.updateDomElement'){
						//select box binding
						if( ev.target.type.match( /select/ ) ){
							this.change( { 	id : $( ev.target ).val(), 
									text : $( ev.target ).find('option:selected').text() 
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
			if( ( property === undefined || property === obj.prop ) && ( event.target !== undefined && obj.elem[0] !== event.target ) ){
				this.updateDomElement( event, obj.elem, value );
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
		console.log( "updateDomElement : selector: { type: " + selector[0].nodeName + ", name: " + selector[0].name + " }" );
		console.log( "updateDomElement : Source: " + event.originalSource );
		if( typeof value === 'object' ){
			// select box objects are populated with { key: key, value: value } 
			if( selector.is( "div" ) === true  ||  selector.is( "span" ) === true){
				selector.text( value.text );
			}else{
				selector.val( value.id );
			}
		}else{
			if( selector.is( "div" ) === true  ||  selector.is( "span" ) === true){
				selector.text( value );
			}else{
				selector.val( value );
			}
		}

		// we have three ways to update values 
		// 1. via a change event fired from changing the DOM element
		// 2. via model.set() which should change the model value and update the dom element(s)
		// 3. via a second dom element, e.g. when more than one dom element is linked to the property
		//    we need to be able to update the other dom elements without entering an infinite loop
		if( event.originalSource !== 'model.set' ){
			var ev = $.Event( "change" );
			ev.originalSource = 'BindableObject.updateDomElement';
			selector.trigger( ev );
		}
	};

	// bind an object to an HTML element
	BindableObject.prototype.bind = function( element, property ) {
		var e, _this = this;

		if ( property === undefined ) {
			// BindableObject holds a simple value
			// set the DOM element value to the value of the Bindable object
			element.val( this.data );
			e = {
				elem : element,
				prop : ""
			};
		}
		else {
			// Bindable object holds an object with properties
			// set the DOM element value to the value of the specified property in the
			// Bindable object
			element.val( this.data[ property ] );
			e = {
				elem : element,
				prop : property
			};
		}
		//add an event listener so we get notified when the value of the DOM element
		// changes
		//element[ 0 ].addEventListener( "change", this, false );
		//IE 8 support
		if (element[ 0 ].addEventListener) {
			element[ 0 ].addEventListener("change", this, false);
		}
		else {
			// IE8
			element[ 0 ].attachEvent("onpropertychange", function( ev ){
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

}( jQuery ) );


$.gadgetui = {};

$.gadgetui.textWidth = function(text, font) {
	// http://stackoverflow.com/questions/1582534/calculating-text-width-with-jquery
	// based on edsioufi's solution
    if (!$.gadgetui.textWidth.fakeEl) $.gadgetui.textWidth.fakeEl = $('<span id="gadgetui-textWidth">').appendTo(document.body);
    
    var width, htmlText = text || $.fn.val() || $.fn.text();
    if( htmlText.length > 0 ){
    	htmlText = $.gadgetui.textWidth.fakeEl.text(htmlText).html(); //encode to Html
    	if( htmlText === undefined ){
    		htmlText = "";
    	}else{
    		htmlText = htmlText.replace(/\s/g, "&nbsp;"); //replace trailing and leading spaces
    	}
    }
    $.gadgetui.textWidth.fakeEl.html(htmlText).css('font', font || $.fn.css('font'));
    $.gadgetui.textWidth.fakeEl.css( "display", "inline" );
    width = $.gadgetui.textWidth.fakeEl.width();
    $.gadgetui.textWidth.fakeEl.css( "display", "none" );
    return width;
};	

$.gadgetui.fitText = function( text, font, width ){
	var ix, midpoint, txtWidth = $.gadgetui.textWidth( text, font ), ellipsisWidth = $.gadgetui.textWidth( "...", font );
	if( txtWidth < width ){
		return text;
	}else{
		midpoint = Math.floor( text.length / 2 ) - 1;
		while( txtWidth + ellipsisWidth >= width ){
			text = text.slice( 0, midpoint ) + text.slice( midpoint + 1, text.length );
	
			midpoint = Math.floor( text.length / 2 ) - 1;
			txtWidth = $.gadgetui.textWidth( text, font );

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
};
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
gadgetui.display = (function($) {
	
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
	var str =  '<div class="gadgetui-bubble gadgetui-bubble-' + this.bubbleType + '" id="' + this.id + '">' + this.message;
	if( this.closable ){
		str = str + '<span class="ui-icon ui-icon-close"></span>';
	}
	str = str + '<div class="gadgetui-bubble-arrow-outside"></div><div class="gadgetui-bubble-arrow-inside"></div></div>';

	this.selector
		.after( str );
};

Bubble.prototype.show = function(){
	this.bubbleSelector.show( "fade", 500 );
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
	this.bubbleSelector
		.css( "top", this.top )
		.css( "left", this.left );

	$( "span", this.bubbleSelector )
		.css( "left", this.bubbleWidth - 6 - this.closeIconSize - this.borderWidth * 2 )
		.css( "position", "absolute" )
		.css( "cursor", "pointer" )
		.css( "top", 6 );
};

Bubble.prototype.setBubbleStyles = function(){
	this.bubbleSelector = $( "#" + this.id );

	this.bubbleSelector
		.css( "margin", 0 )
		.css( "padding", this.padding )
		.css( "width", this.width )
		.css( "height", this.height )
		.css( "line-height", this.lineHeight + "px" )
		.css( "border-radius", this.borderRadius )
		.css( "-moz-border-radius", this.borderRadius )
		.css( "-webkit-border-radius", this.borderRadius )

		.css( "-webkit-box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor )
		.css( "-moz-box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor )
		.css( "box-shadow", this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor )

		.css( "border", this.borderWidth + "px solid " + this.borderColor )
		.css( "background-color", this.backgroundColor )
		.css( "position", "absolute" )
		.css( "text-align", "left" )
		.css( "opacity", this.opacity )
		.css( "font", this.font )
		.css( "z-index", this.zIndex );
};

Bubble.prototype.setBeforeRules = function(){
	// set rules on paragraph :before pseudo-selector
	var rules = {
		content: " ",
		position: "absolute",
		width: 0,
		height: 0,
		left: this.beforeArrowLeft + "px",
		top: this.arrowTop + "px",
		border: this.arrowSize + "px solid",
		borderColor: this.beforeBorderColor
	};
	$( "div[class='gadgetui-bubble-arrow-outside']", $( "#" + this.id ) ).addRule( rules, 0 );
};

Bubble.prototype.setAfterRules = function(){

	var rules = {
		content: " ",
		position: "absolute",
		width: 0,
		height: 0,
		left: this.afterArrowLeft + "px",
		top: this.afterArrowTop + "px",
		border: this.afterArrowSize + "px solid",
		borderColor: this.afterBorderColor
	};
	
	$( "div[class='gadgetui-bubble-arrow-inside']", $( "#" + this.id ) ).addRule( rules, 0 );
};

Bubble.prototype.calculatePosition = function(){
	var _this = this;
	// Here we must walk up the DOM to the ancestors of the selector to see whether they are set to position: relative. If _this is the case,
	// we must add the offset values of the ancestor to the position values for the control or it will not be correctly placed.
	this.relativeOffset = gadgetui.util.getRelativeParentOffset( this.selector );

	$.each(  this.position.split( " " ), function( ix, ele ){
			switch( ele ){
			case "top":
				_this.top =  _this.top - _this.relativeOffset.top;
				break;
			case "bottom":
				_this.top =  _this.top + _this.selector.outerHeight() - _this.relativeOffset.top;
				//console.log( "_this.top + _this.selector.outerHeight() " + _this.selector.outerHeight() );
				break;
			case "left":

				break;
			case "right":
				_this.left = _this.left + _this.selector.outerWidth() - _this.relativeOffset.left;
				//console.log( "_this.left + _this.selector.outerWidth() - _this.relativeOffset.left " + _this.selector.outerWidth() );
				break;
			case "center":
				_this.left = _this.left + _this.selector.outerWidth() / 2  - _this.relativeOffset.left;
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
		


	/*	
	 right *, * right center, * left corner - colorArray[1] = 'transparent', colorArray[3] = this.borderColor
	 left *, * right corner, * left center - colorArray[1] = this.borderColor, colorArray[3] = 'transparent'
	 top *, * bottom corner, * top center - colorArray[0] = 'transparent', colorArray[2] =  this.borderColor
	 bottom *, * bottom center, * top corner - colorArray[0] =  this.borderColor, colorArray[2] = 'transparent'
	 	
	 	
	 */
	
	// switch-based decision tree - working and re-factored
	
	/*	switch( this.arrowPosition + " " + this.arrowDirection ){
		case "right top center":
		case "right bottom corner":
		case "top right center":
		case "top left corner":
			this.beforeBorderColor = " transparent transparent " + this.borderColor + " " + this.borderColor;
			this.afterBorderColor = "transparent transparent #fff #fff";			
			break;
		case "left top center":
		case "left bottom corner":			
		case "top left center":
		case "top right corner":
			this.beforeBorderColor = " transparent " + this.borderColor + " " + this.borderColor + " transparent";
			this.afterBorderColor = "transparent #fff #fff" + " transparent";			
			break;

		case "right bottom center":			
		case "right top corner":
		case "bottom right center":
		case "bottom left corner":
			this.beforeBorderColor = this.borderColor + " transparent transparent " + this.borderColor;
			this.afterBorderColor = "#fff transparent transparent #fff";			
			break;
		case "bottom left center":
		case "bottom right corner":
		case "left bottom center":			
		case "left top corner":
			//working
			this.beforeBorderColor = this.borderColor + this.borderColor + " transparent transparent";
			this.afterBorderColor = "#fff #fff transparent transparent ";			
			break;
	}		*/
};

Bubble.prototype.setBehaviors = function(){
	var _this = this;
	$( "span", this.bubbleSelector )
		.on( "click", function(){
			_this.bubbleSelector.hide( "fade" ).remove();
		});

	if( this.autoClose ){
		closeBubble = function(){
			_this.bubbleSelector.hide( "fade" ).remove();
		};
		setTimeout( closeBubble, this.autoCloseDelay );
	}
};

Bubble.prototype.config = function( options ){
	var baseUIColor = getStyleRuleValue( "color", ".ui-state-active" );
	this.bubbleType = ( options.bubbleType === undefined ? "speech" : options.bubbleType );
	this.id = "gadgetui-bubble-" + gadgetui.util.Id();
	this.height = ( options.height === undefined ? 100 : options.height );
	this.position = ( options.position === undefined ? "top right" : options.position ); // position of arrow tip on selector - top right | bottom right | top center | bottom center | top left | bottom left
	this.width = ( options.width === undefined ? 200 : options.width ); // width of bubble
	this.padding = ( options.padding === undefined ? 20 : options.padding ); // interior padding of bubble
	this.opacity = ( options.opacity === undefined ? 1 : options.opacity ); // interior padding of bubble
	// baseline position
	this.top = this.selector.offset().top;
	//console.log( "initial top: " + this.top );
	this.left = this.selector.offset().left;
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

	this.closeIconSize = 16; // ui-icon css
	this.arrowSize = ( options.arrowSize === undefined ? 25 : options.arrowSize ); // half size of arrow 
	this.backgroundColor = ( options.backgroundColor === undefined ? "#FFFFFF" : options.backgroundColor );
	this.lineHeight = ( options.lineHeight === undefined ? "1.2em" : options.lineHeight ); // line height of text in bubble
	this.borderRadius = ( options.borderRadius === undefined ? 30 : options.borderRadius );	//border-radius
	this.boxShadowColor = ( options.boxShadowColor === undefined ? baseUIColor : options.boxShadowColor );
	this.font = ( options.font === undefined ? "1em Arial sans" : options.font );
	this.zIndex = ( options.zIndex === undefined ? 100 : options.zIndex );
	this.closable = ( options.closable === undefined ? false : options.closable );
	this.autoClose = ( options.autoClose === undefined ? false : options.autoClose );
	this.autoCloseDelay = ( options.autoCloseDelay === undefined ? 5000 : options.autoCloseDelay );
	this.relativeOffset = { left: 0, top: 0 };
};

function CollapsiblePane( selector, options ){

	this.selector = selector;
	if( options !== undefined ){
		this.config( options );
	}
	
	this.addControl();
	this.wrapper = $( this.selector ).parent();
	this.addCSS();
	this.addHeader();
	
	this.icon = $( "div div", this.wrapper );
	
	this.addBindings();
	if( this.collapse === true ){
		this.toggle();
	}		
}

CollapsiblePane.prototype.addBindings = function(){
	var _this = this, header = $( "div.gadget-ui-collapsiblePane-header", this.wrapper );
	header
		.on( "click", function(){
			_this.toggle();
		});

};

CollapsiblePane.prototype.addHeader = function(){
	this.wrapper.prepend( '<div class="ui-widget-header ui-corner-all gadget-ui-collapsiblePane-header">' + this.title + '<div class="ui-icon ui-icon-triangle-1-n"></div></div>');
};

CollapsiblePane.prototype.addCSS = function(){
	
	//copy width from selector
	this.wrapper
		.css( "width", this.width );
	
	//now make the width of the selector to fill the wrapper
	$( this.selector )
		.css( "width", this.interiorWidth )
		.css( "padding", this.padding );
};

CollapsiblePane.prototype.addControl = function(){
	$( this.selector ).wrap( '<div class="gadget-ui-collapsiblePane ui-corner-all ui-widget-content"></div>' );
};

CollapsiblePane.prototype.config = function( args ){
	this.title = ( args.title === undefined ? "": args.title );
	this.path = ( args.path === undefined ? "/bower_components/gadget-ui/dist/": args.path );
	this.padding = ( args.padding === undefined ? ".5em": args.padding );
	this.paddingTop = ( args.paddingTop === undefined ? ".3em": args.paddingTop );
	this.width = ( args.width === undefined ? $( this.selector ).css( "width" ) : args.width );
	this.interiorWidth = ( args.interiorWidth === undefined ? "": args.interiorWidth );
	this.collapse = ( ( args.collapse === undefined || args.collapse === false ? false : true ) );
};

CollapsiblePane.prototype.toggle = function(){
	var _this = this, add, remove, expandClass = "ui-icon-triangle-1-s", collapseClass = "ui-icon-triangle-1-n";
	if( _this.selector.css( "display" ) === "none" ){
		add = collapseClass;
		remove = expandClass;
	}else{
		add = expandClass;
		remove = collapseClass;			
	}
	
	_this.eventName = ( ( _this.eventName === undefined || _this.eventName === "collapse" ) ? "expand" : "collapse" );
	_this.selector
		.css( "padding", _this.padding )
		.css( "padding-top", _this.paddingTop )
		.toggle( 'blind', {}, 200, function(  ) {
			$( _this.icon ).addClass( add )
						.removeClass( remove );
			$( this ).css( "padding", _this.padding );
			_this.selector.trigger( _this.eventName );
		});
};

function FloatingPane( selector, options ){

	this.selector = selector;
	if( options !== undefined ){
		this.config( options );
	}
	
	this.addControl();
	this.wrapper = $( this.selector ).parent();

	this.addHeader();
	this.maxmin = $( "div div[class~='ui-icon']", this.wrapper );
	
	this.addCSS();

	// now set height to computed height of control _this has been created
	this.height = gadgetui.util.getStyle( $( this.selector ).parent(), "height" );

	this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset( this.selector ).left;
	this.addBindings();
}

FloatingPane.prototype.addBindings = function(){
	var _this = this;
	// jquery-ui draggable
	this.wrapper.draggable( {addClasses: false } );
	
	this.maxmin.on( "click", function(){
		if( _this.minimized ){
			_this.expand();
		}else{
			_this.minimize();
		}
	});
};

FloatingPane.prototype.addHeader = function(){
	this.wrapper.prepend( '<div class="ui-widget-header ui-corner-all gadget-ui-floatingPane-header">' + this.title + '<div class="ui-icon ui-icon-arrow-4"></div></div>');
};


FloatingPane.prototype.addCSS = function(){
	//copy width from selector
	this.wrapper.css( "width", this.width )
			.css( "minWidth", this.minWidth )
			.css( "opacity", this.opacity )
			.css( "z-index", this.zIndex );

	//now make the width of the selector to fill the wrapper
	$( this.selector )
		.css( "width", this.interiorWidth )
		.css( "padding", this.padding );
	
	this.maxmin
		.css( "float", "right" )
		.css( "display", "inline" );
};

FloatingPane.prototype.addControl = function(){
	$( this.selector ).wrap( '<div class="gadget-ui-floatingPane ui-corner-all ui-widget-content"></div>');
};

FloatingPane.prototype.config = function( args ){
	this.title = ( args.title === undefined ? "": args.title );
	this.path = ( args.path === undefined ? "/bower_components/gadget-ui/dist/": args.path );
	this.position = ( args.position === undefined ? { my: "right top", at: "right top", of: window } : args.position );
	this.padding = ( args.padding === undefined ? "15px": args.padding );
	this.paddingTop = ( args.paddingTop === undefined ? ".3em": args.paddingTop );
	this.width = ( args.width === undefined ? $( this.selector ).css( "width" ) : args.width );
	this.minWidth = ( this.title.length > 0 ? Math.max( 100, this.title.length * 10 ) : 100 );

	this.height = ( args.height === undefined ? gadgetui.util.getNumberValue( gadgetui.util.getStyle( $( this.selector ), "height" ) ) + ( gadgetui.util.getNumberValue( this.padding ) * 2 ) : args.height );
	this.interiorWidth = ( args.interiorWidth === undefined ? "": args.interiorWidth );
	this.opacity = ( ( args.opacity === undefined ? 1 : args.opacity ) );
	this.zIndex = ( ( args.zIndex === undefined ? 100000 : args.zIndex ) );
	this.minimized = false;
	this.relativeOffsetLeft = 0;
};

FloatingPane.prototype.expand = function(){
	// when minimizing and expanding, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position
	
	var _this = this, 
		offset = $( this.wrapper).offset(),
		l =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );
	
	
	
	this.wrapper.animate({
		left: l - width + _this.minWidth
	},{queue: false, duration: 500}, function() {
		// Animation complete.
	});

	this.wrapper.animate({
		width: this.width
	},{queue: false, duration: 500}, function() {
		// Animation complete.
	});

	this.wrapper.animate({
		height: this.height
	},{queue: false, duration: 500, complete: function() {
		_this.maxmin
		.removeClass( "ui-icon-arrow-4-diag" )
		.addClass( "ui-icon-arrow-4" );
	}
	});

	this.minimized = false;
};

FloatingPane.prototype.minimize = function(){
	// when minimizing and maximizing, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position
	
	var _this = this, offset = $( this.wrapper).offset(),
		l =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );

	this.wrapper.animate({
		left: l + width - _this.minWidth
	},{queue: false, duration: 500}, function() {

	});

	this.wrapper.animate({
		width: _this.minWidth
	},{queue: false, duration: 500, complete: function() {
		_this.maxmin
		.removeClass( "ui-icon-arrow-4" )
		.addClass( "ui-icon-arrow-4-diag" );
		}
	});

	this.wrapper.animate({
		height: "50px"
	},{queue: false, duration: 500}, function() {
		// Animation complete.
	});

	this.minimized = true;

};


	return{
		Bubble : Bubble,
		CollapsiblePane: CollapsiblePane,
		FloatingPane: FloatingPane
	};
}(jQuery));
gadgetui.input = (function($) {
	
	
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
	$( this.selector )
		.wrap( "<div class='gadgetui-combobox'></div>")
		.wrap( "<div class='gadgetui-combobox-selectwrapper'></div>")
		.parent().parent()
		.append( "<div class='gadgetui-combobox-inputwrapper'><input class='gadgetui-combobox-input' value='' name='custom' type='text' placeholder='" + this.newOption.text + "'/></div>" )
		.prepend( "<div class='gadgetui-combobox-label' data-id='" + this.id +  "'>" + this.text + "</div>");

	this.comboBox = $( this.selector ).parent().parent();
	this.input = $( "input[class='gadgetui-combobox-input']", $( this.selector ).parent().parent() );
	this.label = $( "div[class='gadgetui-combobox-label']", $( this.selector ).parent().parent() );
	this.label.attr( "gadgetui-bind", this.selector.attr( "gadgetui-bind" ) );	

	this.inputWrapper = $( "div[class='gadgetui-combobox-inputwrapper']", $( this.selector ).parent().parent() );
	this.selectWrapper = $( "div[class='gadgetui-combobox-selectwrapper']", $( this.selector ).parent().parent() );
	this.comboBox.css( "opacity", ".0" );
	// set placeholder shim
	if( $.isFunction( this.input.placeholder) ){
		 this.input.placeholder();
	}
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

	this.selector
		.addClass( "gadgetui-combobox-select" )
		.css( "width", this.width )
		.css( "border", 0 )
		.css( "display", "inline" );

	this.comboBox
		.css( "position", "relative" );

	var rules,
		styles = gadgetui.util.getStyle( this.selector ),
		wrapperStyles = gadgetui.util.getStyle( this.selectWrapper ),
		inputWidth = this.selector[0].clientWidth,
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
	this.selector
		.css( "margin-top", selectMarginTop )
		.css( "padding-left", selectLeftPadding );

	this.inputWrapper
		.css( "position", "absolute" )
		.css( "top", inputWrapperTop )
		.css( "left", leftOffset );	

	this.input
		.css( "display", "inline" )
		.css( "padding-left", inputLeftOffset )
		.css( "margin-left",  inputLeftMargin )
		.css( "width", inputWidthAdjusted );

	this.label
		.css( "position", "absolute" )
		.css( "left", leftPosition )
		.css( "top", this.borderWidth + 1 )
		.css( "margin-left", 0 );

	this.selectWrapper
		.css( "display", "inline" )
		.css( "position", "absolute" )
		.css( "padding-bottom", "1px" )
		.css( "left", 0 );

	//appearance 
	this.comboBox
		.css( "font-size", styles.fontSize );	

	this.selectWrapper
		.css( "background-color", this.backgroundColor )
		.css( "border", this.border )
		.css( "border-radius", this.borderRadius );

	this.input
		.css( "border", 0 )
		.css( "font-size", styles.fontSize )
		.css( "background-color", this.inputBackground );

	this.label
		.css( "font-family", styles.fontFamily )
		.css( "font-size", styles.fontSize )
		.css( "font-weight", styles.fontWeight );
	// add rules for arrow Icon
	//we're doing this programmatically so we can skin our arrow icon
	if( navigator.userAgent.match( /Firefox/) ){
		
		this.selectWrapper
			.css( 'background-image', 'url(' + this.arrowIcon + ')')
			.css('background-repeat', 'no-repeat' )
			.css('background-position', 'right center' );

		if( this.scaleIconHeight === true ){
			this.selectWrapper
				.css( "background-size", this.arrowWidth + "px " + inputHeight + "px" );
		}
	}
	this.selector
		.css( '-webkit-appearance', 'none' )
		.css( '-moz-appearance', 'window')
		.css( "background-image", "url('" + this.arrowIcon + "')" )
		.css( 'background-repeat', 'no-repeat' )
		.css( 'background-position', 'right center' );


	if( this.scaleIconHeight === true ){
		this.selectWrapper
			.css( "background-size", this.arrowWidth + "px " + inputHeight + "px" );
	}

	this.inputWrapper.hide();
	this.selectWrapper.hide();
	this.comboBox.css( "opacity", "1" );
};

ComboBox.prototype.setSelectOptions = function(){
	var _this = this, id, text;

	$( _this.selector )
		.empty();
	//console.log( "append new option" );
	$( _this.selector )
		.append( "<option value='" + _this.newOption.id + "'>" + _this.newOption.text + "</option>" );

	$.each( this.dataProvider.data, function( ix, obj ){
		id = obj.id;
		text = obj.text;
		if( text === undefined ){ 
			text = id; 
		}
		//console.log( "append " + text );
		$( _this.selector )
			.append( "<option value=" + id + ">" + text );
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
	this.label.css( "display", "inline-block" );
	this.selectWrapper.hide();
	this.inputWrapper.hide();
};

ComboBox.prototype.addBehaviors = function( obj ) {
	var _this = this;

	$( this.comboBox )
		.on( this.activate, function( ) {
			setTimeout( function( ) {
				if( _this.label.css( "display" ) != "none" ){
					console.log( "combo mouseenter ");
					//_this.label.css( "display", "none" );
					_this.selectWrapper.css( "display", "inline" );
					_this.label.css( "display", "none" );
					if( _this.selector.prop('selectedIndex') <= 0 ) {
						_this.inputWrapper.css( "display", "inline" );
					}
				//	_this.selector
				//		.css( "display", "inline" );
				}
			}, _this.delay );
		})
		.on( "mouseleave", function( ) {
			console.log( "combo mouseleave ");
			if ( _this.selector.is( ":focus" ) === false && _this.input.is( ":focus" ) === false ) {
				_this.showLabel();
			}
		});

	_this.input
		.on( "click", function( e ){
			console.log( "input click ");
		})
		.on( "keyup", function( event ) {
			console.log( "input keyup");
			if ( event.which === 13 ) {
				var inputText =  gadgetui.util.encode( _this.input.val() );
				_this.handleInput( inputText );
			}
		})
		.on( "blur", function( ) {
			console.log( "input blur" );

			if( gadgetui.util.mouseWithin( _this.selector, gadgetui.mousePosition ) === true ){
				_this.inputWrapper.hide();
				_this.selector.focus();
			}else{
				_this.showLabel();
			}
		});

	this.selector
		.on( "mouseenter", function( ev ){
			_this.selector.css( "display", "inline" );
		})
		.on( "click", function( ev ){
			console.log( "select click");
			ev.stopPropagation();
		})
		.on( "change", function( event ) {
			var idx = ( event.target.selectedIndex >= 0 ) ? event.target.selectedIndex : 0;
			if( parseInt( event.target[ idx ].value, 10 ) !== parseInt( _this.id, 10 ) ){
				console.log( "select change");
				if( event.target.selectedIndex > 0 ){
					_this.inputWrapper.hide();
					_this.setValue( event.target[ event.target.selectedIndex ].value );
				}else{
					_this.inputWrapper.show();
					_this.setValue( _this.newOption.value );
					_this.input.focus();
				}
				$( _this.selector )
					.trigger( "gadgetui-combobox-change", [ { id: event.target[ event.target.selectedIndex ].value, text: event.target[ event.target.selectedIndex ].innerHTML } ] );
	
				console.log( "label:" + _this.label.text() );
			}
		})

		.on( "blur", function( event ) {
			console.log( "select blur ");
			event.stopPropagation();
			setTimeout( function( ) {
				//if( _this.emitEvents === true ){

				if( _this.input.is( ":focus" ) === false ){
					_this.showLabel();
				}
			}, 200 );
		} );
	
	$( "option", this.selector )
		.on( "mouseenter", function( ev ){
			console.log( "option mouseenter" );
			if( _this.selector.css( "display" ) !== "inline" ){
				_this.selector.css( "display", "inline" );
			}
		});
};

ComboBox.prototype.handleInput = function( inputText ){
	var id = this.find( inputText );
	if( id !== undefined ){
		this.selector.val( id );
		this.label.text( inputText );
		this.selector.focus();
		this.input.val('');
		this.inputWrapper.hide();
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
	this.selector[0].dispatchEvent( ev );
};

ComboBox.prototype.setSaveFunc = function(){
	var _this = this;

	if( $.isFunction( this.save ) === true ){
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
									_this.selector.trigger( "gadgetui-combobox-save", { id: value, text: text } );
								//}
								_this.input.val( "" );
								_this.inputWrapper.hide();
								_this.id = value;
								_this.dataProvider.refresh();
							}
							if( _this.animate === true ){
								_this.selectWrapper.animate({
									boxShadow: '0 0 5px ' + _this.glowColor,
									borderColor: _this.glowColor
								  }, _this.animateDelay / 2 );							
								_this.selectWrapper.animate({
									boxShadow: 0,
									borderColor: _this.borderColor
								  }, _this.animateDelay / 2, callback );
							}else{
								callback();
							}
						});
				promise['catch']( function( message ){
					_this.input.val( "" );
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
	this.label.text( this.text );
	this.selector.val( this.id );
};

ComboBox.prototype.setDataProviderRefresh = function(){
	var _this = this,
		promise,
		refresh = this.dataProvider.refresh,
		func;
	this.dataProvider.refresh = function(){
		var scope = this;
		if( $.isFunction( refresh ) === true ){
			promise = new Promise(
					function( resolve, reject ){
						var args = [ scope, resolve, reject ];
						func = refresh.apply( this, args );
					});
			promise
				.then( function(){
					_this.selector.trigger( "gadgetui-combobox-refresh" );
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

ComboBox.prototype.config = function( args ){
	if( args !== undefined ){
		this.model =  (( args.model === undefined) ? this.model : args.model );
		this.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
		this.dataProvider = (( args.dataProvider === undefined) ? undefined : args.dataProvider );
		this.save = (( args.save === undefined) ? undefined : args.save );
		this.activate = (( args.activate === undefined) ? "mouseenter" : args.activate );
		this.delay = (( args.delay === undefined) ? 10 : args.delay );
		this.inputBackground = (( args.inputBackground === undefined) ? "#ffffff" : args.inputBackground );
		this.borderWidth = (( args.borderWidth === undefined) ? 1 : args.borderWidth );
		this.borderColor = (( args.borderColor === undefined) ? "#d0d0d0" : args.borderColor );
		this.borderStyle = (( args.borderStyle === undefined) ? "solid" : args.borderStyle );
		this.borderRadius = (( args.borderRadius === undefined) ? 5 : args.borderRadius );
		this.border = this.borderWidth + "px " + this.borderStyle + " " + this.borderColor;
		this.width = (( args.width === undefined) ? 150 : args.width );
		this.newOption = (( args.newOption === undefined) ? { text: "...", id: 0 } : args.newOption );
		this.id = (( args.id === undefined) ? this.newOption.id : args.id );
		this.arrowIcon = (( args.arrowIcon === undefined) ? "/bower_components/gadget-ui/dist/img/arrow.png" : args.arrowIcon );
		this.scaleIconHeight = (( args.scaleIconHeight === undefined) ? false : args.scaleIconHeight );
		this.animate = (( args.animate === undefined) ? true : args.animate );
		this.glowColor = (( args.glowColor === undefined ) ? 'rgb(82, 168, 236)' : args.glowColor );
		this.animateDelay = (( args.animateDelay === undefined ) ? 500 : args.animateDelay );
	}
};

function LookupListInput( selector, options ){
	function _renderLabel( item ){
		return item.label;
	};
	this.itemRenderer = _renderLabel;
	this.menuItemRenderer = _renderLabel;
	this.emitEvents = true;
	
	this.selector = selector;
	
	if( options !== undefined ){
		this.config( options );
	}
	
	//gadgetui.util.bind( this.selector, this.model );
	$( this.selector ).wrap( '<div class="gadgetui-lookuplist-input-div ui-widget-content ui-corner-all"></div>' );
	this.addBindings();
}

LookupListInput.prototype.addBindings = function(){
	var _this = this;

	$( this.selector ).parent()
		.on( "click", function(){
			$( _this ).focus();
		})
		.on( "click", "div[class~='gadgetui-lookuplist-input-cancel']", function(e){
			_this.remove( _this.selector, $( e.target ).attr( "gadgetui-lookuplist-input-value" ) );
		});

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
			.attr( "data-value", item.value )
			.append( $( "<a>" ).text( _this.menuItemRenderer( item ) ) )
			.appendTo( ul );
		}else{
			//default jquery-ui implementation
			return $( "<li>" )
			.append( $( "<a>" ).text( item.label ) )
			.appendTo( ul );
		}
	};	
};

LookupListInput.prototype.add = function( el, item ){
	var prop, list;
	$( "<div class='gadgetui-lookuplist-input-item-wrapper'><div class='gadgetui-lookuplist-input-cancel ui-corner-all ui-widget-content' gadgetui-lookuplist-input-value='" + item.value + "'><div class='gadgetui-lookuplist-input-item'>" + this.itemRenderer( item ) + "</div></div></div>" )
		.insertBefore( el );
	$( el ).val('');
	if( item.title !== undefined ){
		$( "div[class~='gadgetui-lookuplist-input-cancel']", $( el ).parent() ).last().attr( "title", item.title );
	}
	if( this.emitEvents === true ){
		$( el ).trigger( "gadgetui-lookuplist-input-add", [ item ] );
	}
	if( this.func !== undefined ){
		this.func( item, 'add' );
	}
	if( this.model !== undefined ){
		//update the model 
		prop = $( el ).attr( "gadgetui-bind" );
		list = this.model.get( prop );
		if( $.isArray( list ) === false ){
			list = [];
		}
		list.push( item );
		this.model.set( prop, list );
	}
};

LookupListInput.prototype.remove = function( el, value ){
	$( "div[gadgetui-lookuplist-input-value='" + value + "']", $( el ).parent() ).parent().remove();

	var _this = this, prop, list;

	if( this.model !== undefined ){
		prop = $( el ).attr( "gadgetui-bind" );
		list = this.model.get( prop );
		$.each( list, function( i, obj ){
			if( obj.value === value ){
				list.splice( i, 1 );
				if( _this.func !== undefined ){
					_this.func( obj, 'remove' );
				}
				if( _this.emitEvents === true ){
					$( el ).trigger( "gadgetui-lookuplist-input-remove", [ obj ] );
				}
				_this.model.set( prop, list );
				return false;
			}
		});
	}
};

LookupListInput.prototype.reset = function(){
	$( ".gadgetui-lookuplist-input-item-wrapper", $(  this.el ).parent() ).empty();

	if( this.model !== undefined ){
		prop = $( this.el ).attr( "gadget-ui-bind" );
		list = this.model.get( prop );
		list.length = 0;
	}
};

LookupListInput.prototype.config = function( options ){
	// if binding but no model was specified, use gadgetui model
	if( $( this.selector ).attr( "gadgetui-bind" ) !== undefined ){
		this.model = (( options.model === undefined) ? gadgetui.model : options.model );
	}
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.itemRenderer = (( options.itemRenderer === undefined) ? this.itemRenderer : options.itemRenderer );
	this.menuItemRenderer = (( options.menuItemRenderer === undefined) ? this.menuItemRenderer : options.menuItemRenderer );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.datasource = (( options.datasource === undefined) ? (( options.lookupList !== undefined ) ? options.lookupList : true ) : options.datasource );
	this.width = (( options.width === undefined) ? undefined : options.width );
	this.minLength = (( options.minLength === undefined) ? 0 : options.minLength );
	
	return this;
};	


function SelectInput( selector, options ){
	this.selector = selector;

	this.config( options );
	this.setInitialValue();

	this.addControl();
	this.addCSS();
	this.selector.css( "display", 'none' );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.label, this.model );
	
	this.addBindings();
}

SelectInput.prototype.setInitialValue = function(){
	// this.value set in config()
	this.selector.val( this.value.id );
};

SelectInput.prototype.addControl = function(){
	$( this.selector ).wrap( "<div class='gadgetui-selectinput-div'></div>");
	$( this.selector ).parent().prepend( "<div class='gadgetui-selectinput-label'>" + this.value.text + "</div>");
	this.label = $( "div[class='gadgetui-selectinput-label']", $( this.selector ).parent() );
	this.label.attr( "gadgetui-bind", this.selector.attr( "gadgetui-bind" ) );
};

SelectInput.prototype.addCSS = function(){
	var height, 
		parentstyle,
		style = gadgetui.util.getStyle( $(this.selector) );

	this.selector.css( "min-width", "100px" );
	this.selector.css( "font-size", style.fontSize );

	parentstyle = gadgetui.util.getStyle( $(this.selector).parent() );
	height = gadgetui.util.getNumberValue( parentstyle.height ) - 2;
	this.label.attr( "style", "" );
	this.label.css( "padding-top", "2px" );
	this.label.css( "height", height + "px" );
	this.label.css( "margin-left", "9px" );	

	if( navigator.userAgent.match( /Edge/ ) ){
		this.selector.css( "margin-left", "5px" );
	}else if( navigator.userAgent.match( /MSIE/ ) ){
		this.selector.css( "margin-top", "0px" );
		this.selector.css( "margin-left", "5px" );
	}
};

SelectInput.prototype.addBindings = function() {
	var _this = this;

	this.label
		.on( this.activate, function( event ) {
			_this.label.css( "display", 'none' );
			_this.selector.css( "display", "inline-block" );
			event.preventDefault();
		});

	this.selector
		.on( "blur", function( ev ) {
			//setTimeout( function() {
				_this.label.css( "display", "inline-block" );
				_this.selector.css( "display", 'none' );
			//}, 100 );
		});

	this.selector
		.on( "change", function( ev ) {
			setTimeout( function() {
				var value = ev.target.value,
					label = ev.target[ ev.target.selectedIndex ].innerHTML;
				
				if( value.trim().length === 0 ){
					value = 0;
				}
	
				_this.label.text( label );
				if( _this.model !== undefined && _this.selector.attr( "gadgetui-bind" ) === undefined ){	
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
		.on( "mouseleave", function( ) {
			if ( _this.selector !== document.activeElement ) {
				_this.label.css( "display", 'inline-block' );
				_this.selector.css( "display", 'none' );
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
	this.value = (( options.value === undefined) ? { id: $(this.selector).val(), text : $(this.selector)[0][ $(this.selector)[0].selectedIndex ].innerHTML } : options.value );
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
	this.selector.wrap( "<div class='gadgetui-inputdiv'></div>" );
	this.inputDiv = this.selector.parent();
	this.inputDiv.wrap( "<div class='gadgetui-textinput-div'></div>");
	this.wrapper = this.selector.parent().parent();
	this.wrapper.prepend( "<div class='gadgetui-inputlabel'><input type='text' data-active='false' class='gadgetui-inputlabelinput' readonly='true' style='border:0;background:none;' value='" + this.value + "'></div>");
	this.labelDiv = $( "div[class='gadgetui-inputlabel']", this.wrapper );
	this.label = $( "input[class='gadgetui-inputlabelinput']", this.wrapper );
	this.label.attr( "gadgetui-bind", this.selector.attr( "gadgetui-bind" ) );
};

TextInput.prototype.setInitialValue = function(){
	var val = this.selector.val(),
		ph = this.selector.attr( "placeholder" );

	if( val.length === 0 ){
		if( ph !== null && ph !== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}
	this.value = val;
};

TextInput.prototype.setLineHeight = function(){
	var lineHeight = this.selector.outerHeight();
	this.lineHeight = lineHeight;
};

TextInput.prototype.setFont = function(){
	var style = gadgetui.util.getStyle( this.selector ),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
		this.font = font;
};

TextInput.prototype.setWidth = function(){
	this.width = $.gadgetui.textWidth( this.selector.val(), this.font ) + 10;
	if( this.width === 10 ){
		this.width = this.maxWidth;
	}
};

TextInput.prototype.setMaxWidth = function(){
	var parentStyle = gadgetui.util.getStyle( this.selector.parent().parent() );
	this.maxWidth = gadgetui.util.getNumberValue( parentStyle.width );
};

TextInput.prototype.addCSS = function(){
	var style = gadgetui.util.getStyle( this.selector );
	this.selector
		.addClass( "gadgetui-textinput" );
	
	this.label
		.css( "background", "none" )
		.css( "padding-left", "4px" )
		.css( "border", " 1px solid transparent" )
		.css( "width", this.width )
		.css( "font-family", style.fontFamily )
		.css( "font-size", style.fontSize )
		.css( "font-weight", style.fontWeight )
		.css( "font-variant", style.fontVariant )
		
		.css( "max-width", "" )
		.css( "min-width", this.minWidth );
	
	if( this.lineHeight > 20 ){
		// add min height to label div as well so label/input isn't offset vertically
		this.wrapper
			.css( "min-height", this.lineHeight );
		this.labelDiv
		 	.css( "min-height", this.lineHeight );
		this.inputDiv
			.css( "min-height", this.lineHeight );
	}	
	
	this.labelDiv
		.css( "height", this.lineHeight )
		.css( "font-size", style.fontSize )
		.css( "display", "block" );
	
	this.inputDiv
		.css( "height", this.lineHeight )
		.css( "font-size", style.fontSize )
		.css( "display", "block" );	
	this.selector
		.css( "padding-left", "4px" )
		.css( "border", "1px solid " + this.borderColor )
		.css( "font-family", style.fontFamily )
		.css( "font-size", style.fontSize )
		.css( "font-weight", style.fontWeight )
		.css( "font-variant", style.fontVariant )
		
		.css( "width", this.width )
		.css( "min-width", this.minWidth );	

	this.selector.attr( "placeholder", this.value );
	this.inputDiv
		.css( "display", 'none' );

	if( this.maxWidth > 10 && this.enforceMaxWidth === true ){
		this.label
			.css( "max-width", this.maxWidth );
		this.selector
			.css( "max-width", this.maxWidth );

		if( this.maxWidth < this.width ){
			this.label.val( $.gadgetui.fitText( this.value, this.font, this.maxWidth ) );
		}
	}
};

TextInput.prototype.setControlWidth = function( text ){
	var textWidth = parseInt( $.gadgetui.textWidth( text, this.font ), 10 );
	if( textWidth < this.minWidth ){
		textWidth = this.minWidth;
	}
	this.selector.css( "width", ( textWidth + 30 ) );
	this.label.css( "width", ( textWidth + 30 ) );	
};

TextInput.prototype.addBindings = function(){
	var _this = this;

	this.label
		//.off( _this.activate )
		.on( _this.activate, function( event ) {
			if( _this.useActive && ( _this.label.attr( "data-active" ) === "false" || _this.label.attr( "data-active" ) === undefined ) ){
				_this.label.attr( "data-active", "true" );
			}else{
				setTimeout( 
					function(){
					var css = gadgetui.util.setStyle;
					//if( gadgetui.util.mouseWithin( _this.labelDiv, gadgetui.mousePosition ) ){
						// both input and label
						_this.labelDiv.css( "display", 'none' );
						_this.inputDiv.css( "display", 'block' );
						_this.setControlWidth( _this.selector.val() );

						// if we are only showing the input on click, focus on the element immediately
						if( _this.activate === "click" ){
							_this.selector.focus();
						}
						if( _this.emitEvents === true ){
							// raise an event _this the input is active
							
							//_this.selector.trigger( "gadgetui-input-show" );
							_this.selector.trigger( "gadgetui-input-show", _this.selector );
						}
					//}
					}, _this.delay );
			}
		});

	this.selector
		.on( "focus", function(e){
			e.preventDefault();
		});

	this.selector
		.on( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				this.blur();
			}
			_this.setControlWidth( this.value );
		});

	this.selector
		.on( "change", function( event ) {
			setTimeout( function( ) {
				var value = event.target.value, style, txtWidth;
				if( value.length === 0 && _this.selector.attr( "placeholder" ) !== undefined ){
					value = _this.selector.attr( "placeholder" );
				}

				txtWidth = $.gadgetui.textWidth( value, _this.font );

				if( _this.maxWidth < txtWidth ){
					value = $.gadgetui.fitText( value, _this.font, _this.maxWidth );
				}
				_this.label.val( value );
				if( _this.model !== undefined && _this.selector.attr( "gadgetui-bind" ) === undefined ){	
					// if we have specified a model but no data binding, change the model value
					_this.model.set( _this.selector.name, event.target.value );
				}

				if( _this.emitEvents === true ){
					_this.selector.trigger( "gadgetui-input-change", { text: event.target.value } );
				}

				if( _this.func !== undefined ){
					_this.func( { text: event.target.value } );
				}				
			}, 200 );
		});
	
	this.selector
		//.removeEventListener( "mouseleave" )
		.on( "mouseleave", function( ) {
			if( this !== document.activeElement ){
				_this.labelDiv.css( "display", "block" );
				_this.inputDiv.css( "display", "none" );
				_this.label.css( "maxWidth", _this.maxWidth );				
			}
		});

	this.selector
		.on( "blur", function( ) {
			_this.inputDiv.css( "display", 'none' );
			_this.labelDiv.css( "display", 'block' );
			_this.label.attr( "data-active", "false" );
			_this.selector.css( "maxWidth", _this.maxWidth );
			_this.label.css( "maxWidth", _this.maxWidth );
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
	this.enforceMaxWidth = ( options.enforceMaxWidth === undefined ? false : options.enforceMaxWidth );
};

	return{
		ComboBox: ComboBox,
		TextInput: TextInput,
		SelectInput: SelectInput,
		LookupListInput: LookupListInput
	};
}(jQuery));
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
		
		getRelativeParentOffset: function( selector ){
			var i,
				parents = selector.parentsUntil( "body" ),
				relativeOffsetLeft = 0,
				relativeOffsetTop = 0;

			for( i = 0; i < parents.length; i++ ){
				if( parents[ i ].style.position === "relative" ){
					var offset = gadgetui.util.getOffset( parents[ i ] );
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

			var bindVar = selector[0].getAttribute( "gadgetui-bind" );

			// if binding was specified, make it so
			if( bindVar !== undefined && model !== undefined ){
				model.bind( bindVar, selector );
			}
		},
		encode : function( input, options ){
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
		},
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
			var rect = selector[0].getBoundingClientRect();
			return ( coords.x >= rect.left && coords.x <= rect.right && coords.y >= rect.top && coords.y <= rect.bottom ) ? true : false;
		},
		getStyle : function (el, prop) {
		    if ( window.getComputedStyle !== undefined ) {
		    	if( prop !== undefined ){
		    		return window.getComputedStyle(el[0], null).getPropertyValue(prop);
		    	}else{
		    		return window.getComputedStyle(el[0], null);
		    	}
		    } else {
		    	if( prop !== undefined ){
		    		return el[0].currentStyle[prop];
		    	}else{
		    		return el[0].currentStyle;
		    	}
		    }
		}
		
	};
} ());	
//# sourceMappingURL=jquery.gadget-ui.js.map