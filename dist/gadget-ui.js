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
					if( ev.target.name === obj.prop && ev.originalSource !== 'updateDomElement' ){
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
			if( ( property === undefined || property === obj.prop ) && ( event.target !== undefined && obj.elem != event.target ) ){
				this.updateDomElement( event,  obj.elem, value );
			}
		}
	};
	
	BindableObject.prototype.updateDom = function( event, value, property ){
		var ix, obj;
		// this code changes the value of the DOM element to the incoming value
		for( ix = 0; ix < this.elements.length; ix++ ){
			obj = this.elements[ ix ];

			if ( property === undefined  || ( property !== undefined && obj.prop === property ) ){

				// this code sets the value of each control bound to the BindableObject
				// to the correspondingly bound property of the incoming value

				this.updateDomElement( event, obj.elem, value );
				//break;
			}
		}
	};
	
	BindableObject.prototype.updateDomElement = function( event, selector, value ){
		if( typeof value === 'object' ){
			// select box objects are populated with { key: key, value: value } 
			if( selector.tagName === "DIV" ){
				selector.innerText = value.text;
			}else{
				selector.value = value.id;
			}
		}else{
			if( selector.tagName === "DIV" ){
				selector.innerText = value;
			}else{
				selector.value = value;
			}
		}
		console.log( "updated Dom element: " + selector );
		// don't generate a change event on the selector if the change came from model.set method
		if( event.originalSource !== 'model.set' ){
			var ev = new Event( "change" );
			ev.originalSource = 'updateDomElement';
			selector.dispatchEvent( ev );
		}
	};

	// bind an object to an HTML element
	BindableObject.prototype.bind = function( element, property ) {
		var e, self = this;

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
gadgetui.input = (function() {
	
	
/*	function ComboBox( selector, options ){

	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;
	this.config( options );
	console.log( "1:" + this.id );
	this.setSaveFunc();
	console.log( "2:" + this.id );
	this.setDataProviderRefresh();
	console.log( "3:" + this.id );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	this.addControl();
	console.log( "4:" + this.id );
	this.setCSS();
	this.addBehaviors();
	console.log( "5:" + this.id );
	this.setStartingValues();
	console.log( "6:" + this.id );
}

ComboBox.prototype.addControl = function(){
	$( this.selector )
		.wrap( "<div class='gadgetui-combobox'></div>")
		.wrap( "<div class='gadgetui-combobox-selectwrapper'></div>")
		.parentNode.parentNode
		.append( "<div class='gadgetui-combobox-inputwrapper'><input class='gadgetui-combobox-input' value='' name='custom' type='text' placeholder='" + this.newOption.text + "'/></div>" )
		.prepend( "<div class='gadgetui-combobox-label' data-id='" + this.id +  "'>" + this.text + "</div>");

	this.comboBox = this.selector.parentNode.parentNode;
	this.input = $( "input[class='gadgetui-combobox-input']", this.selector.parentNode.parentNode );
	this.label = $( "div[class='gadgetui-combobox-label']", this.selector.parentNode.parentNode );
	this.inputWrapper = $( "div[class='gadgetui-combobox-inputwrapper']", this.selector.parentNode.parentNode );
	this.selectWrapper = $( "div[class='gadgetui-combobox-selectwrapper']", this.selector.parentNode.parentNode );
	this.comboBox.css( "opacity", ".0" );
	// set placeholder shim
	if( $.isFunction( this.input.placeholder) ){
		 this.input.placeholder();
	}
};

ComboBox.prototype.setCSS = function(){
	var self = this,

	promise = new Promise(
		function( resolve, reject ){
			self.getArrowWidth( resolve, reject );
		});
	promise
		.then( function(){
			self.addCSS();
		});
	promise['catch']( function( message ){
			// use width of default icon
			self.arrowWidth = 22;
			console.log( message );
			self.addCSS();
		});
};

ComboBox.prototype.getArrowWidth = function( resolve, reject ){
	var self = this, 
		img = new Image();
		img.onload = function() {
			self.arrowWidth = this.width;
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
		styles = gadgetui.util.getStyle( this.selector[0] ),
		wrapperStyles = gadgetui.util.getStyle( this.selectWrapper[0] ),
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
	var self = this, id, text;

	$( self.selector )
		.empty();
	//console.log( "append new option" );
	$( self.selector )
		.append( "<option value='" + self.newOption.id + "'>" + self.newOption.text + "</option>" );

	$.each( this.dataProvider.data, function( ix, obj ){
		id = obj.id;
		text = obj.text;
		if( text === undefined ){ 
			text = id; 
		}
		//console.log( "append " + text );
		$( self.selector )
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
	var self = this;
	// setup mousePosition
	if( gadgetui.mousePosition === undefined ){
		$( document )
			.on( "mousemove", function(ev){ 
				ev = ev || window.event; 
				gadgetui.mousePosition = gadgetui.util.mouseCoords(ev); 
			});
	}

	$( this.comboBox )
		.on( this.activate, function( ) {
			setTimeout( function( ) {
				if( self.label.css( "display" ) != "none" ){
					console.log( "combo mouseenter ");
					//self.label.css( "display", "none" );
					self.selectWrapper.css( "display", "inline" );
					self.label.css( "display", "none" );
					if( self.selector.prop('selectedIndex') <= 0 ) {
						self.inputWrapper.css( "display", "inline" );
					}
				//	self.selector
				//		.css( "display", "inline" );
				}
			}, self.delay );
		})
		.on( "mouseleave", function( ) {
			console.log( "combo mouseleave ");
			if ( self.selector.is( ":focus" ) === false && self.input.is( ":focus" ) === false ) {
				self.showLabel();
			}
		});

	self.input
		.on( "click", function( e ){
			console.log( "input click ");
		})
		.on( "keyup", function( event ) {
			console.log( "input keyup");
			if ( event.which === 13 ) {
				var inputText =  gadgetui.util.encode( self.input.val() );
				self.handleInput( inputText );
			}
		})
		.on( "blur", function( ) {
			console.log( "input blur" );

			if( gadgetui.util.mouseWithin( self.selector, gadgetui.mousePosition ) === true ){
				self.inputWrapper.hide();
				self.selector.focus();
			}else{
				self.showLabel();
			}
		});

	this.selector
		.on( "mouseenter", function( ev ){
			self.selector.css( "display", "inline" );
		})
		.on( "click", function( ev ){
			console.log( "select click");
			ev.stopPropagation();
		})
		.on( "change", function( event ) {
			if( parseInt( event.target[ event.target.selectedIndex ].value, 10 ) !== parseInt(self.id, 10 ) ){
				console.log( "select change");
				if( event.target.selectedIndex > 0 ){
					self.inputWrapper.hide();
					self.setValue( event.target[ event.target.selectedIndex ].value );
				}else{
					self.inputWrapper.show();
					self.setValue( self.newOption.value );
					self.input.focus();
				}
				$( self.selector )
					.trigger( "gadgetui-combobox-change", [ { id: event.target[ event.target.selectedIndex ].value, text: event.target[ event.target.selectedIndex ].innerHTML } ] );
	
				console.log( "label:" + self.label.text() );
			}
		})

		.on( "blur", function( event ) {
			console.log( "select blur ");
			event.stopPropagation();
			setTimeout( function( ) {
				//if( self.emitEvents === true ){

				if( self.input.is( ":focus" ) === false ){
					self.showLabel();
				}
			}, 200 );
		} );
	
	$( "option", this.selector )
		.on( "mouseenter", function( ev ){
			console.log( "option mouseenter" );
			if( self.selector.css( "display" ) !== "inline" ){
				self.selector.css( "display", "inline" );
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
	var self = this;

	if( $.isFunction( this.save ) === true ){
		var save = this.save;
		this.save = function( text ) {
			var that = this,
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
							func = save.apply(that, args);
							console.log( func );
						});
				promise.then(
						function( value ){
							function callback(){
								// trigger save event if we're triggering events 
								//if( self.emitEvents === true ){
									self.selector.trigger( "gadgetui-combobox-save", { id: value, text: text } );
								//}
								self.input.val( "" );
								self.inputWrapper.hide();
								self.id = value;
								self.dataProvider.refresh();
							}
							if( self.animate === true ){
								self.selectWrapper.animate({
									boxShadow: '0 0 5px ' + self.glowColor,
									borderColor: self.glowColor
								  }, self.animateDelay / 2 );							
								self.selectWrapper.animate({
									boxShadow: 0,
									borderColor: self.borderColor
								  }, self.animateDelay / 2, callback );
							}else{
								callback();
							}
						});
				promise['catch']( function( message ){
					self.input.val( "" );
					self.inputWrapper.hide();
					console.log( message );
					self.dataProvider.refresh();

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
	var self = this,
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
					self.selector.trigger( "gadgetui-combobox-refresh" );
					self.setControls();
				});
			promise['catch']( function( message ){
					console.log( "message" );
					self.setControls();
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
};	*/
/*	
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
	$( this.selector ).wrap( '<div class="gadgetui-lookuplistinput-div ui-widget-content ui-corner-all"></div>' );
	this.addBindings();
}

LookupListInput.prototype.addBindings = function(){
	var self = this;
	
	this.selector.parentNode
		.on( "click", function(){
			$( self ).focus();
		})
		.on( "click", "div[class~='gadgetui-lookuplist-input-cancel']", function(e){
			self.remove( self.selector, $( e.target ).attr( "gadgetui-lookuplist-input-value" ) );
		});
	
	$( this.selector )
		.autocomplete( {
			minLength : self.minLength,
			source : function( request, response ) {
				response( $.ui.autocomplete.filter( self.datasource, gadgetui.util.extractLast( request.term ) ) );
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

				self.add( self.selector, ui.item );
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
		if( typeof self.menuItemRenderer === "function"){
			return $( "<li>" )
			.attr( "data-value", item.value )
			.append( $( "<a>" ).text( self.menuItemRenderer( item ) ) )
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
		$( "div[class~='gadgetui-lookuplist-input-cancel']", $( el ).parentNode ).last().attr( "title", item.title );
	}
	if( this.emitEvents === true ){
		$( el ).trigger( "gadgetui-lookuplistinput-add", [ item ] );
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
	$( "div[gadgetui-lookuplist-input-value='" + value + "']", $( el ).parentNode ).parentNode.remove();

	var self = this, prop, list;

	if( this.model !== undefined ){
		prop = $( el ).attr( "gadgetui-bind" );
		list = this.model.get( prop );
		$.each( list, function( i, obj ){
			if( obj.value === value ){
				list.splice( i, 1 );
				if( self.func !== undefined ){
					self.func( obj, 'remove' );
				}
				if( self.emitEvents === true ){
					$( el ).trigger( "gadgetui-lookuplistinput-remove", [ obj ] );
				}
				self.model.set( prop, list );
				return false;
			}
		});
	}
};

LookupListInput.prototype.reset = function(){
	$( ".gadgetui-lookuplist-input-item-wrapper", $(  this.el ).parentNode ).empty();

	if( this.model !== undefined ){
		prop = $( this.el ).attr( "gadget-ui-bind" );
		list = this.model.get( prop );
		list.length = 0;
	}
};

LookupListInput.prototype.config = function( args ){
	// if binding but no model was specified, use gadgetui model
	if( $( this.selector ).attr( "gadgetui-bind" ) !== undefined ){
		this.model = (( args.model === undefined) ? gadgetui.model : args.model );
	}
	this.func = (( args.func === undefined) ? undefined : args.func );
	this.itemRenderer = (( args.itemRenderer === undefined) ? this.itemRenderer : args.itemRenderer );
	this.menuItemRenderer = (( args.menuItemRenderer === undefined) ? this.menuItemRenderer : args.menuItemRenderer );
	this.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	this.datasource = (( args.datasource === undefined) ? (( args.lookupList !== undefined ) ? args.lookupList : true ) : args.datasource );
	this.minLength = (( args.minLength === undefined) ? 0 : args.minLength );
	return this;
};	
	*/

function SelectInput( selector, options ){
	this.selector = selector;

	this.config( options );
	this.setInitialValue();

	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );

	this.addControl();
	this.addCSS();
	this.selector.style.display = 'none';
	
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
		style = gadgetui.util.getStyle( this.selector );

	this.selector.style.minWidth = "100px";
	this.selector.style.fontSize = style.fontSize;

	parentstyle = gadgetui.util.getStyle( this.selector.parentNode );
	height = gadgetui.util.getNumberValue( parentstyle.height ) - 2;
	this.label.setAttribute( "style", "" );
	this.label.style.paddingTop = "2px";
	this.label.style.height = height + "px";
	this.label.style.marginLeft = "9px";	

	if( navigator.userAgent.match( /Edge/ ) ){
		this.selector.style.marginLeft = "5px";
	}else if( navigator.userAgent.match( /MSIE/ ) ){
		this.selector.style.marginTop = "0px";
		this.selector.style.marginLeft = "5px";
	}
};

SelectInput.prototype.addBindings = function() {
	var self = this;

	this.label
		.addEventListener( this.activate, function( event ) {
			self.label.style.display = 'none';
			self.selector.style.display = "inline-block";
			event.preventDefault();
		});

	this.selector
		.addEventListener( "blur", function( ev ) {
			var value, label;
			setTimeout( function() {
				value = self.selector.value;
				label = self.selector[ self.selector.selectedIndex ].innerHTML;
				
				if( value.trim().length === 0 ){
					value = " ... ";
				}

				self.label.innerText = label;
				if( self.model !== undefined && self.selector.getAttribute( "gadgetui-bind" ) === undefined ){	
					// if we have specified a model but no data binding, change the model value
					self.model.set( this.name, { id: value, text: label } );
				}

				if( self.emitEvents === true ){
					self.selector.dispatchEvent( new Event( "gadgetui-input-change" ), { id: value, text: label } );
				}
				if( self.func !== undefined ){
					self.func( { id: value, text: label } );
				}
				self.value = { id: value, text: label };
				self.label.style.display = "inline-block";
				self.selector.style.display = 'none';
			}, 100 );
		});
/*		this.selector
		.addEventListener( "keyup", function( event ) {
			if ( parseInt( event.which, 10 ) === 13 ) {
				self.selector.blur();
			}
		});	*/

	this.wrapper
		.addEventListener( "mouseleave", function( ) {
			if ( self.selector !== document.activeElement ) {
				self.label.style.display = 'inline-block';
				self.selector.style.display = 'none';
			}
		});

	this.selector
		.addEventListener( "change", function( ev ) {
			var value = ev.target.value,
				label = ev.target[ ev.target.selectedIndex ].innerHTML;
			if( label.trim().length === 0 ){
				label = " ... ";
			}
			self.label.innerText = label;
			self.value = { id: value, text: label };
			
		});

/*		function detectLeftButton(evt) {
	    evt = evt || window.event;
	    var button = evt.which || evt.button;
	    return button == 1;
	}
	
	document.onmouseup = function( event ){
		var isLeftClick = detectLeftButton( event );
		if( isLeftClick === true ){
			if ( $( self.selector ).is( ":focus" ) === false ) {
				label
					.css( "display", "inline-block" );
				$( self.selector )
					.hide( );
			}			
		}
	};	*/
};

SelectInput.prototype.config = function( options ){
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

	if( options !== undefined ){
		this.config( options );
	}

	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );

	this.setInitialValue();
	//this.addClass();
	this.addControl();
	this.setLineHeight();
	this.setFont();
	this.setMaxWidth();
	this.setWidth();
	this.addCSS();

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
	// minimum height
	this.lineHeight = lineHeight;
};

TextInput.prototype.setFont = function(){
	var style = gadgetui.util.getStyle( this.selector ),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
		this.font = font;
};

TextInput.prototype.setWidth = function(){
	var style = gadgetui.util.getStyle( this.selector );
	this.width = gadgetui.util.textWidth( this.selector.value, style ) + 10;
	if( this.width === 10 ){
		this.width = this.minWidth;
	}
};

TextInput.prototype.setMaxWidth = function(){
	var parentStyle = gadgetui.util.getStyle( this.selector.parentNode.parentNode );
	this.maxWidth = gadgetui.util.getNumberValue( parentStyle.width );
};

TextInput.prototype.addCSS = function(){
	//var fontSize = gadgetui.util.getStyle( this.selector, "font-size" );
	var style = gadgetui.util.getStyle( this.selector );
		//font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
	// add CSS classes
	gadgetui.util.addClass( this.selector, "gadgetui-textinput" );
	gadgetui.util.addClass( this.wrapper, "gadgetui-textinput-div" );
	gadgetui.util.addClass( this.labelDiv, "gadgetui-inputlabel" );
	gadgetui.util.addClass( this.label, "gadgetui-inputlabelinput" );
	gadgetui.util.addClass( this.inputDiv, "gadgetui-inputdiv" );
	this.label.setAttribute( "style", "background:none; padding-left: 4px; border: 1px solid transparent; width: " + this.width + "px; font-family: " + style.fontFamily + "; font-size: " + style.fontSize + "; font-weight: " +  style.fontWeight + "; font-variant: " + style.fontVariant );

	this.label.style.maxWidth = "";
	this.label.style.minWidth = this.minWidth + "px";
	
	if( this.lineHeight > 20 ){
		// add min height to label div as well so label/input isn't offset vertically
		this.wrapper.setAttribute( "style", "min-height: " + this.lineHeight + "px;" );
		this.labelDiv.setAttribute( "style", "min-height: " + this.lineHeight + "px;" );
		this.inputDiv.setAttribute( "style", "min-height: " + this.lineHeight + "px;" );
	}	
	
	this.labelDiv.setAttribute( "style", "height: " + this.lineHeight + "px; font-size: " + style.fontSize + "; display: block" );
	this.inputDiv.setAttribute( "style", "height: " + this.lineHeight + "px; font-size: " + style.fontSize + "; display: block" );
	if( this.selector.getAttribute( "style" ) === undefined ){
		this.selector.setAttribute( "style", "" );
	}
	this.selector.style.paddingLeft = "4px";
	this.selector.style.border = "1px solid " + this.borderColor;
	this.selector.style.fontFamily = style.fontFamily;
	this.selector.style.fontSize = style.fontSize;
	this.selector.style.fontWeight = style.fontWeight;
	this.selector.style.fontVariant = style.fontVariant;
	
	this.selector.style.width = this.width + "px";
	this.selector.style.minWidth = this.minWidth + "px";	

	this.selector.setAttribute( "placeholder", this.value );
	this.inputDiv.style.display = 'none';

	if( this.maxWidth > 10 && this.enforceMaxWidth === true ){
		this.label.style.maxWidth = this.maxWidth;
		this.selector.style.maxWidth = this.maxWidth;

		if( this.maxWidth < this.width ){
			this.label.value = gadgetui.util.fitText( this.value, this.font, this.maxWidth );
		}
	}
};

TextInput.prototype.setControlWidth = function( text ){
	var style = gadgetui.util.getStyle( this.selector ),
		textWidth = parseInt( gadgetui.util.textWidth(text, style ), 10 );
	if( textWidth < this.minWidth ){
		textWidth = this.minWidth;
	}
	this.selector.style.width = ( textWidth + 30 ) + "px";
	this.label.style.width = ( textWidth + 30 ) + "px";	
};

TextInput.prototype.addBindings = function(){
	var self = this, oVar, 
		//obj = this.selector.parentNode,
		//label = labeldiv.querySelector( "input" ),
		//font = gadgetui.util.getStyle( this.wrapper, "font-size" ) + " " + gadgetui.util.getStyle( this.wrapper, "font-family" );
	oVar = ( (this.object === undefined) ? {} : this.object );

	// setup mousePosition
	if( gadgetui.mousePosition === undefined ){
		document
			.addEventListener( "mousemove", function(ev){ 
				ev = ev || window.event; 
				gadgetui.mousePosition = gadgetui.util.mouseCoords(ev); 
			});
	}
	
	this.selector
		//.removeEventListener( "mouseleave" )
		.addEventListener( "mouseleave", function( ) {
			if( this !== document.activeElement ){
				self.labelDiv.style.display = "block";
				self.inputDiv.style.display = 'none';
				self.label.style.maxWidth = self.maxWidth;				
			}
		});
	this.selector
		.addEventListener( "focus", function(e){
			e.preventDefault();
		});
	this.selector
		.addEventListener( "blur", function( ) {
			var newVal, txtWidth, labelText;
			setTimeout( function( ) {
				newVal = self.selector.value;
				if ( oVar.isDirty === true ) {
					if( newVal.length === 0 && self.selector.getAttribute( "placeholder" ) !== undefined ){
						newVal = self.selector.getAttribute( "placeholder" );
					}
					oVar[ self.selector.name ] = self.selector.value;
					var style = gadgetui.util.getStyle( self.selector );
					txtWidth = gadgetui.util.textWidth( newVal, style );
					if( self.maxWidth < txtWidth ){
						labelText = gadgetui.util.fitText( newVal, self.font, self.maxWidth );
					}else{
						labelText = newVal;
					}
					self.label.value = labelText;
					if( self.model !== undefined && self.selector.getAttribute( "gadgetui-bind" ) === undefined ){	
						// if we have specified a model but no data binding, change the model value
						self.model.set( self.selector.name, oVar[ self.selector.name ] );
					}
	
					oVar.isDirty = false;
					if( self.emitEvents === true ){
						self.selector.dispatchEvent( "gadgetui-input-change", [ oVar ] );
					}
					if( self.func !== undefined ){
						self.func( oVar );
					}
				}
				self.inputDiv.style.display = 'none';
				self.labelDiv.style.display = 'block';
				self.label.setAttribute( "data-active", "false" );
				//input = self.wrapper.parentNode.querySelector( "input" );
				self.selector.style.maxWidth = self.maxWidth;
				self.label.style.maxWidth = self.maxWidth;
				
				if( self.emitEvents === true ){
					self.selector.dispatchEvent( new Event( "gadgetui-input-hide" ), self.selector );
				}	
			}, 200 );
		});
	this.selector
		.addEventListener( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				this.blur();
			}
			self.setControlWidth( this.value );
			//console.log( "width: " + gadgetui.util.textWidth( this.value, font ) + 10 );
		});
	this.selector
		.addEventListener( "change", function( e ) {
			var value = e.target.value;
			if( value.trim().length === 0 ){
				value = " ... ";
			}
			oVar.isDirty = true;
			self.label.value = value;
		});

	this.label
		//.off( self.activate )
		.addEventListener( self.activate, function( ) {
			if( self.useActive && ( self.label.getAttribute( "data-active" ) === "false" || self.label.getAttribute( "data-active" ) === undefined ) ){
				self.label.setAttribute( "data-active", "true" );
			}else{
				setTimeout( 
					function(){
					var event;
					if( gadgetui.util.mouseWithin( self.label, gadgetui.mousePosition ) === true ){
						// both input and label
						self.labelDiv.style.display = 'none';
						self.inputDiv.style.display = 'block';
						//input = self.wrapper.getElementsByTagName( "input" )[0];

						
						//self.label.style.width = gadgetui.util.textWidth( self.selector.value, self.font ) + 10;
						self.setControlWidth( self.selector.value );

						// if we are only showing the input on click, focus on the element immediately
						if( self.activate === "click" ){
							self.selector.focus();
						}
						if( self.emitEvents === true ){
							// raise an event that the input is active
							event = new Event( "gadgetui-input-show" );
							self.selector.dispatchEvent( event, self.selector );
						}
					}}, self.delay );
			}
		});

};

TextInput.prototype.config = function( args ){
	this.borderColor =  (( args.borderColor === undefined) ? "#d0d0d0" : args.borderColor );
	this.useActive =  (( args.useActive === undefined) ? false : args.useActive );
	this.model =  (( args.model === undefined) ? this.model : args.model );
	this.object = (( args.object === undefined) ? undefined : args.object );
	this.func = (( args.func === undefined) ? undefined : args.func );
	this.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	this.activate = (( args.activate === undefined) ? "mouseenter" : args.activate );
	this.delay = (( args.delay === undefined) ? 10 : args.delay );
	this.minWidth = (( args.minWidth === undefined) ? 100 : args.minWidth );
	this.enforceMaxWidth = ( args.enforceMaxWidth === undefined ? false : args.enforceMaxWidth );
};

	return{
		TextInput: TextInput,
		SelectInput: SelectInput
		/*	ComboBox: ComboBox,
		
		
		LookupListInput: LookupListInput	*/
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
		}
		
	};
} ());	