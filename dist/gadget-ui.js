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

var gadgetui = {};
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
					if( ev.target.name === obj.prop ){
						//select box binding
						if( ev.target.type.match( /select/ ) ){
							this.change( { 	value : ev.target.value, 
									key : ev.target.options[ev.target.selectedIndex].innerHTML 
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

		// this code changes the value of the BinableObject to the incoming value
		if ( property === undefined ) {
			// Directive is to replace the entire value stored in the BindableObject
			// update the BindableObject value with the incoming value
			// value could be anything, simple value or object, does not matter
			this.data = value;
		}
		else if ( typeof this.data === 'object' ) {
			//Directive is to replace a property of the value stored in the BindableObject
			// verifies that "data" is an object and not a simple value
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
			if( ( property === undefined || property === obj.prop ) && ( event.target !== undefined && obj.elem[0] != event.target ) ){
				this.updateDomElement( obj.elem, value );
			}
		}
	};
	
	BindableObject.prototype.updateDom = function( value, property ){
		var ix, obj;
		// this code changes the value of the DOM element to the incoming value
		for( ix = 0; ix < this.elements.length; ix++ ){
			obj = this.elements[ ix ];

			if ( property === undefined  || ( property !== undefined && obj.prop === property ) ){

				// this code sets the value of each control bound to the BindableObject
				// to the correspondingly bound property of the incoming value
				this.updateDomElement( obj.elem, value );
				//break;
			}
		}
	};
	
	BindableObject.prototype.updateDomElement = function( selector, value ){
		if( typeof value === 'object' ){
			// select box objects are populated with { key: key, value: value } 
			if( selector.is( "div" ) === true ){
				selector.text( value.text );
			}else{
				selector.val( value.id );
			}
		}else{
			if( selector.is( "div" ) === true ){
				selector.text( value );
			}else{
				selector.val( value );
			}
		}
		console.log( "updated Dom element: " + selector );
		selector.trigger( "change" );
	};

	// bind an object to an HTML element
	BindableObject.prototype.bind = function( element, property ) {
		var e, self = this;

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
					var el = ev.srcElement, val = ( el.nodeName === 'SELECT' ) ? { value: el.value, key: el.options[el.selectedIndex].innerHTML } : el.value;
					self.change( val, { target: el }, el.name );
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
			var n = name.split( "." ), fevent = {};
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
					_model[ name ].change( value, fevent );
					_model[ name ].updateDom( value );
				}
				else {
					_model[ n[ 0 ] ].change( value, fevent, n[1] );
					_model[ n[ 0 ] ].updateDom( value, n[1] );	
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
	var spanLeft = this.bubbleWidth - 6 - this.closeIconSize - this.borderWidth * 2;
	this.spanElement[0].setAttribute( "style", "left: " + spanLeft + "px; position: absolute; cursor: pointer; top: 6px; color: " + this.borderColor + ";" );
/*		this.spanElement[0].style.left = this.bubbleWidth - 6 - this.closeIconSize - this.borderWidth * 2;
	this.spanElement[0].style.position = "absolute";
	this.spanElement[0].style.cursor = "pointer" ;
	this.spanElement[0].style.top = 6;	*/
};

Bubble.prototype.setBubbleStyles = function(){
	
	this.bubbleSelector.setAttribute( "style", "margin : 0; width:" + this.width + "px; height:" + this.height + "px; padding:" + this.padding + "px; line-height:" + this.lineHeight + "px; border-radius:" + this.borderRadius + "px; -moz-border-radius:" + this.borderRadius + "px; -webkit-border-radius:" + this.borderRadius + ";-webkit-box-shadow: " + this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor + "; -moz-box-shadow: " + this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor+ "; box-shadow:" + this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor + "; border: " +  this.borderWidth + "px solid " + this.borderColor + "; background-color: " + this.backgroundColor + "; position: absolute; text-align: left; opacity:" + this.opacity + "; font: " + this.font + "; z-index: " + this.zIndex + ";" );
	//this.bubbleSelector.style.margin = 0;
	//this.bubbleSelector.style.padding = this.padding;
	//this.bubbleSelector.style.width = this.width;
	//this.bubbleSelector.style.height = this.height;
	//this.bubbleSelector.style.lineHeight = this.lineHeight + "px";
	//this.bubbleSelector.style.borderRadius = this.borderRadius;
	
	//this.bubbleSelector.style.-moz-border-radius = this.borderRadius;
	//this.bubbleSelector.style.-webkit-border-radius = this.borderRadius;

	//this.bubbleSelector.style.-webkit-box-shadow = this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor;
	//this.bubbleSelector.style.-moz-box-shadow = this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor;
	//this.bubbleSelector.style.boxShadow = this.shadowSize + "px " + this.shadowSize + "px 4px " + this.boxShadowColor;

	//this.bubbleSelector.style.border = this.borderWidth + "px solid " + this.borderColor;
	/*	this.bubbleSelector.style.backgroundColor = this.backgroundColor;
	this.bubbleSelector.style.position = "absolute";
	this.bubbleSelector.style.textAlign = "left";
	this.bubbleSelector.style.opacity = this.opacity;
	this.bubbleSelector.style.font = this.font;
	this.bubbleSelector.style.zIndex = this.zIndex;	*/
};

Bubble.prototype.setBeforeRules = function(){
	// set rules on paragraph :before pseudo-selector
	//var rules = {
	var outside = this.bubbleSelector.getElementsByClassName( "gadgetui-bubble-arrow-outside" );
	outside[0].setAttribute( "style", "content: ''; position: absolute; width: 0; height: 0; left: " + this.beforeArrowLeft + "px; top : " + this.arrowTop + "px; border: " + this.arrowSize + "px solid; border-color :" + this.beforeBorderColor + ";" );
/*		outside[0].style.content = " ";
	outside[0].style.position = "absolute";
	outside[0].style.width = 0;
	outside[0].style.height = 0;
	outside[0].style.left = this.beforeArrowLeft + "px";
	outside[0].style.top = this.arrowTop + "px";
	outside[0].style.border = this.arrowSize + "px solid";
	outside[0].style.borderColor = this.beforeBorderColor;	*/
	//}; 
	
	//outside.addRule( rules, 0 );

};

Bubble.prototype.setAfterRules = function(){
		var inside = this.bubbleSelector.getElementsByClassName( "gadgetui-bubble-arrow-inside" );
	//var rules = {
		inside[0].setAttribute( "style", "content: ''; position: absolute; width: 0; height: 0; left: " + this.afterArrowLeft + "px; top : " + this.afterArrowTop + "px; border: " + this.afterArrowSize + "px solid; border-color :" + this.afterBorderColor + ";" );
/*			inside[0].style.content = " ";
		inside[0].style.position = "absolute";
		inside[0].style.width = 0;
		inside[0].style.height = 0;
		inside[0].style.left = this.afterArrowLeft + "px";
		inside[0].style.top = this.afterArrowTop + "px";
		inside[0].style.border = this.afterArrowSize + "px solid";
		inside[0].style.borderColor = this.afterBorderColor;	*/
	//},
	
	//inside.addRule( rules, 0 );
};

Bubble.prototype.calculatePosition = function(){
	var self = this;
	// Here we must walk up the DOM to the ancestors of the selector to see whether they are set to position: relative. If that is the case,
	// we must add the offset values of the ancestor to the position values for the control or it will not be correctly placed.
	this.relativeOffset = gadgetui.util.getRelativeParentOffset( this.selector );

	//$.each(  this.position.split( " " ), function( ix, ele ){
	this.position.split( " " ).forEach( function( ele ){
		switch( ele ){
			case "top":
				self.top =  self.top - self.relativeOffset.top;
				break;
			case "bottom":
				self.top =  self.top + self.selector.offsetHeight - self.relativeOffset.top;
				//console.log( "self.top + self.selector.outerHeight() " + self.selector.outerHeight() );
				break;
			case "left":

				break;
			case "right":
				self.left = self.left + self.selector.offsetWidth - self.relativeOffset.left;
				//console.log( "self.left + self.selector.outerWidth() - self.relativeOffset.left " + self.selector.outerWidth() );
				break;
			case "center":
				self.left = self.left + self.selector.offsetWidth / 2  - self.relativeOffset.left;
				//console.log( "self.left + self.selector.outerWidth() / 2 - self.relativeOffset.left  " + self.selector.outerWidth() / 2);
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
	var self = this;
	//$( "span", this.bubbleSelector )
	this.spanElement[0]
	.addEventListener( "click", function(){
			self.bubbleSelector.style.display= 'none';
			self.bubbleSelector.parentNode.removeChild( self.bubbleSelector );
		});

	if( this.autoClose ){
		closeBubble = function(){
			self.bubbleSelector.style.display= 'none';
			self.bubbleSelector.parentNode.removeChild( self.bubbleSelector );
		};
		setTimeout( closeBubble, this.autoCloseDelay );
	}
};

Bubble.prototype.config = function( options ){
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
	
	//$( this.selector ).wrap( '<div class="gadget-ui-collapsiblePane ui-corner-all ui-widget-content"></div>' );
};

CollapsiblePane.prototype.addHeader = function(){
	var div,
		header = document.createElement( "div" );
	header.setAttribute( "style", "padding: 2px 0px 2px .5em; text-align: left; border-radius: " + this.borderRadius + "px; border: 1px solid "  + this.borderColor + "; background: " + this.headerBackgroundColor + "; color: " + this.headerColor + "; font-weight: bold; font: " + this.font );
	gadgetui.util.addClass( header, "gadget-ui-collapsiblePane-header" );
	header.innerHTML = this.title;
	this.wrapper.insertBefore( header, this.selector );
	this.header = this.wrapper.querySelector( "div.gadget-ui-collapsiblePane-header" );
	div = document.createElement( "div" );
	gadgetui.util.addClass( div, "oi" );
	div.setAttribute( 'data-glyph', "caret-top" );
	this.header.appendChild( div );
	//this.wrapper.prepend( '<div class="ui-widget-header ui-corner-all gadget-ui-collapsiblePane-header">' + this.title + '<div class="ui-icon ui-icon-triangle-1-n"></div></div>');
};

CollapsiblePane.prototype.addCSS = function(){
	var theWidth = this.width;
/*		if( parseInt( this.width, 10 ) > 0 ){
		theWidth = theWidth;
	}	*/
	//copy width from selector
	//if( !this.wrapper.style ){
		this.wrapper.setAttribute( "style", "width: " + theWidth + "; border: 1px solid "  + this.borderColor + "; border-radius: " + this.borderRadius + "px; overflow: hidden;");
	//}else{
	//	this.wrapper.style.width = this.width + "px";
	//}
	
	//now make the width of the selector to fill the wrapper
	if( !this.selector.style ){
		this.selector.setAttribute( "style", "padding: " + this.padding + "px;" );
	}
	
};

CollapsiblePane.prototype.addBindings = function(){
	var self = this, header = this.wrapper.querySelector(  "div.gadget-ui-collapsiblePane-header" );
	header
		.addEventListener( "click", function(){
			self.toggle();
		});

};

CollapsiblePane.prototype.config = function( args ){
	this.title = ( args.title === undefined ? "": args.title );
	this.path = ( args.path === undefined ? "/bower_components/gadget-ui/dist/": args.path );
	this.padding = ( args.padding === undefined ? ".5em": args.padding );
	this.paddingTop = ( args.paddingTop === undefined ? ".3em": args.paddingTop );
	this.width = ( args.width === undefined ? gadgetui.util.getStyle( this.selector, "width" ) : args.width );
	this.interiorWidth = ( args.interiorWidth === undefined ? "": args.interiorWidth );
	this.collapse = ( ( args.collapse === undefined || args.collapse === false ? false : true ) );
	this.borderColor = ( args.borderColor === undefined ? "silver": args.borderColor );
	this.headerColor = ( args.headerColor === undefined ? "black": args.headerColor );
	this.headerBackgroundColor = ( args.headerBackgroundColor === undefined ? "silver": args.headerBackgroundColor );
	this.borderRadius = ( args.borderRadius === undefined ? 6 : args.borderRadius );
};

CollapsiblePane.prototype.toggle = function(){
	var self = this, 
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
	
	self.eventName = ( ( self.eventName === "collapse" ) ? "expand" : "collapse" );
	self.selector.style.padding = self.padding + "px";
	self.selector.style.paddingTop = self.paddingTop + "px";

	var ev = new Event( self.eventName );
	self.selector.dispatchEvent( ev );
	
	if( typeof Velocity != 'undefined' ){
		if( display === "block" ){
			self.wrapper.style.border = border;
		}
		Velocity( this.wrapper, {
			height: myHeight
		},{ queue: false, duration: 500, complete: function() {
			//self.selector.style.display = display;
			//self.wrapper.style.border = border;
			self.icon.setAttribute( "data-glyph", icon );
			} 
		});
		Velocity( this.selector, {
			height: selectorHeight
		},{ queue: false, duration: 500, complete: function() {

			} 
		});			
	}else{
		self.selector.style.display = display;
		self.icon.setAttribute( "data-glyph", icon );
	}
	/*		.toggle( 'blind', {}, 200, function(  ) {
			$( self.icon ).addClass( add )
						.removeClass( remove );
			$( this ).css( "padding", self.padding );
			self.selector.trigger( self.eventName );
		});	*/
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

	// now set height to computed height of control that has been created
	this.height = gadgetui.util.getStyle( this.wrapper, "height" );

	this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset( this.selector ).left;
	this.addBindings();
}

FloatingPane.prototype.addBindings = function(){
	var self = this;
	// jquery-ui draggable
	//this.wrapper.draggable( {addClasses: false } );
	gadgetui.util.draggable( this.wrapper );
	
	this.maxmin.addEventListener( "click", function(){
		if( self.minimized ){
			self.expand();
		}else{
			self.minimize();
		}
	});
};

FloatingPane.prototype.addHeader = function(){
	this.header = document.createElement( "div" );
	this.header.innerHTML = this.title;
	gadgetui.util.addClass( this.header, 'gadget-ui-floatingPane-header' );
	this.header.setAttribute( "style", "padding: 2px 0px 2px .5em; text-align: left; border-radius: " + this.borderRadius + "px; border: 1px solid "  + this.borderColor + "; background: " + this.headerBackgroundColor + "; color: " + this.headerColor + "; font-weight: bold; font: " + this.font );
	this.icon = document.createElement( "div" );
	gadgetui.util.addClass( this.icon, "oi" );
	this.header.insertBefore( this.icon, undefined );
	this.wrapper.insertBefore( this.header, this.selector );
	this.icon.setAttribute( 'data-glyph', "fullscreen-exit" );
	this.header.appendChild( this.icon );	
	//this.wrapper.prepend( '<div class="ui-widget-header ui-corner-all gadget-ui-floatingPane-header">' + this.title + '<div class="ui-icon ui-icon-arrow-4"></div></div>');
};

FloatingPane.prototype.addCSS = function(){
	//copy width from selector
	this.wrapper.setAttribute( "style", "width: " + this.width + "; border: 1px solid "  + this.borderColor + "; border-radius: " + this.borderRadius + "px;");
	//.css( "width", this.width )
	this.wrapper.style.minWidth = this.minWidth;
	this.wrapper.style.opacity = this.opacity;
	this.wrapper.style.zIndex = this.zIndex;
	
	//now make the width of the selector to fill the wrapper
	this.selector.setAttribute( "style", "width: " + this.interiorWidth + "px; padding: " + this.padding + "px;" );
/*			.css( "width", this.interiorWidth )
		.css( "padding", this.padding );	*/
	
	this.maxmin.setAttribute( "style", "float: right; display: inline;" );
	/*		.css( "float", "right" )
		.css( "display", "inline" );	*/
};

FloatingPane.prototype.addControl = function(){
	var fp = document.createElement( "div" );
	gadgetui.util.addClass( fp, "gadget-ui-floatingPane" );
	
	this.selector.parentNode.insertBefore( fp, this.selector );
	this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild( this.selector );
	fp.appendChild( this.selector );
	
};

FloatingPane.prototype.config = function( args ){
	this.title = ( args.title === undefined ? "": args.title );
	this.path = ( args.path === undefined ? "/bower_components/gadget-ui/dist/": args.path );
	this.position = ( args.position === undefined ? { my: "right top", at: "right top", of: window } : args.position );
	this.padding = ( args.padding === undefined ? "15px": args.padding );
	this.paddingTop = ( args.paddingTop === undefined ? ".3em": args.paddingTop );
	this.width = ( args.width === undefined ? gadgetui.util.getStyle( this.selector, "width" ) : args.width );
	this.minWidth = ( this.title.length > 0 ? Math.max( 100, this.title.length * 10 ) + 20 : 100 );

	this.height = ( args.height === undefined ? gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector, "height" ) ) + ( gadgetui.util.getNumberValue( this.padding ) * 2 ) : args.height );
	this.interiorWidth = ( args.interiorWidth === undefined ? "": args.interiorWidth );
	this.opacity = ( ( args.opacity === undefined ? 1 : args.opacity ) );
	this.zIndex = ( ( args.zIndex === undefined ? 100000 : args.zIndex ) );
	this.minimized = false;
	this.relativeOffsetLeft = 0;
	this.borderColor = ( args.borderColor === undefined ? "silver": args.borderColor );
	this.headerColor = ( args.headerColor === undefined ? "black": args.headerColor );
	this.headerBackgroundColor = ( args.headerBackgroundColor === undefined ? "silver": args.headerBackgroundColor );
	this.borderRadius = ( args.borderRadius === undefined ? 6 : args.borderRadius );	
};

FloatingPane.prototype.expand = function(){
	// when minimizing and expanding, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position
	
	var self = this, 
		offset = gadgetui.util.getOffset( this.wrapper ),
		lx =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );
	
	if( typeof Velocity != 'undefined' ){
		
		Velocity( this.wrapper, {
			left: lx - width + self.minWidth
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
			self.icon.setAttribute( "data-glyph", "fullscreen-exit" );
		}
		});
	}else{
		this.wrapper.style.left = ( lx - width + this.minWidth ) + "px";
		this.wrapper.style.width = this.width;
		this.wrapper.style.height = this.height;
		this.icon.setAttribute( "data-glyph", "fullscreen-exit" );
	}
	this.minimized = false;
};

FloatingPane.prototype.minimize = function(){
	// when minimizing and maximizing, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position
	
	var self = this, offset = gadgetui.util.getOffset( this.wrapper ),
		lx =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );

	if( typeof Velocity != 'undefined' ){
			
		Velocity( this.wrapper, {
			left: lx + width - self.minWidth
		},{queue: false, duration: 500}, function() {
	
		});
	
		Velocity( this.wrapper, {
			width: self.minWidth
		},{queue: false, duration: 500, complete: function() {
			self.icon.setAttribute( "data-glyph", "fullscreen-enter" );
			}
		});
	
		Velocity( this.wrapper, {
			height: "50px"
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		});
	}else{
		this.wrapper.style.left = ( lx + width - this.minWidth ) + "px";
		this.wrapper.style.width = this.minWidth + "px";
		this.wrapper.style.height = "50px";
		this.icon.setAttribute( "data-glyph", "fullscreen-enter" );
	}
	this.minimized = true;

};


	return{
		Bubble : Bubble,
		CollapsiblePane: CollapsiblePane,
		FloatingPane: FloatingPane
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
				parents = gadgetui.util.getParentsUntil( selector, "body" ),
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
			var rect = selector[0].getBoundingClientRect();
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
		}
		
	};
} ());	