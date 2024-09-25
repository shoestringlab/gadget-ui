
"use strict";

/*
 * author: Robert Munn <robert@robertmunn.com>
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
function Bubble( options ){
	this.canvas = document.createElement( 'canvas');
	this.ctx = this.canvas.getContext('2d');
	this.config( options );
	this.bubble = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		arrowPosition: 'topleft',
		arrowAngle: 315,
		text: '',
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
		vAlign: this.vAlign
	};
}

Bubble.prototype.config = function (options) {
	options = (options === undefined ? {} : options);
	this.color = ((options.color === undefined) ? "#000" : options.color);
	this.borderWidth = ((options.borderWidth === undefined) ? 1 : options.borderWidth);
	this.borderColor = ((options.borderColor === undefined ? "#000" : options.borderColor));
	this.backgroundColor = (options.backgroundColor === undefined ? "#f0f0f0" : options.backgroundColor);
	this.fontSize = ((options.fontSize === undefined) ? 14 : options.fontSize);
	this.font = ((options.font === undefined) ? "Arial" : options.font);
	this.fontStyle = ((options.fontStyle === undefined) ? "" : options.fontStyle);
	this.fontWeight = ((options.fontWeight === undefined) ? 100 : options.fontWeight);
	this.fontVariant = ((options.fontVariant === undefined) ? "" : options.fontVariant);
	this.lineHeight = ((options.lineHeight === undefined) ? null : options.lineHeight);
	this.align = ((options.align === undefined) ? "center" : options.align); //center, left, right
	this.vAlign = ((options.vAlign === undefined) ? "middle" : options.vAlign);// middle, top, bottom
	this.justifyText = ((options.justifyText === undefined) ? false : options.justifyText);
};

Bubble.prototype.events = ['rendered'];

Bubble.prototype.setBubble = function(x, y, width, height, arrowPosition, length, angle ){
	this.bubble.x = x;
	this.bubble.y = y;
	this.bubble.width = width;
	this.bubble.height = height;
	this.setArrow( arrowPosition, length, angle );
	this.calculateBoundingRect();
	const rect = this.getBoundingClientRect();
	this.canvas.height = rect.height;
	this.canvas.width = rect.width;
	const body = document.querySelector( "body" );
	body.appendChild( this.canvas );
};

Bubble.prototype.setText = function( text ){
	this.bubble.text = text;
};

Bubble.prototype.setPosition = function(x, y) {
	this.bubble.x = x;
	this.bubble.y = y;
};

Bubble.prototype.setArrow = function( position, length, angle ){
	// get the dX and dY of the arrow so we can figure out where it needs to be
	this.setArrowLength( length );
	this.setArrowPosition( position );
	this.setArrowAngle( angle );
	this.setArrowComponents();
	this.setArrowVector();
};

Bubble.prototype.setArrowPosition = function( position ) {
	this.bubble.arrowPosition = position;
	switch( this.bubble.arrowPosition ){
		case "top":
			this.bubble.arrowX = this.bubble.x + ( this.bubble.width / 2 );
			this.bubble.arrowY = this.bubble.y;
			break;
		case "topright":
			this.bubble.arrowX = this.bubble.x + this.bubble.width;
			this.bubble.arrowY = this.bubble.y;
			break;
		case "right":
			this.bubble.arrowX = this.bubble.x + this.bubble.width;
			this.bubble.arrowY = this.bubble.y + this.bubble.height / 2;
			break;
		case "bottomright":
			this.bubble.arrowX = this.bubble.x + this.bubble.width;
			this.bubble.arrowY = this.bubble.y + this.bubble.height;
			break;
		case "bottom":
			this.bubble.arrowX = this.bubble.x + ( this.bubble.width / 2 );
			this.bubble.arrowY = this.bubble.y + this.bubble.height;
			break;
		case "bottomleft":
			this.bubble.arrowX = this.bubble.x;
			this.bubble.arrowY = this.bubble.y + this.bubble.height;
			break;
		case "left":
			this.bubble.arrowX = this.bubble.x;
			this.bubble.arrowY = this.bubble.y + this.bubble.height / 2;
			break;
		case "topleft":
			this.bubble.arrowX = this.bubble.x;
			this.bubble.arrowY = this.bubble.y;
			break;
		default:
			this.bubble.arrowX = this.bubble.x;
			this.bubble.arrowY = this.bubble.y;
			break;
	}
};

Bubble.prototype.setArrowAngle = function(angle) {
	this.bubble.arrowAngle = angle;
	switch( this.bubble.arrowPosition ){
		case "top":
			if( angle < 280 && angle > 80 ){
				console.error( "Angle must be 280-360 or 0-80 degrees." );
				this.bubble.arrowAngle = 0;
			}
			break;
		case "topright":
			if( angle < 10 && angle > 80 ){
				console.error( "Angle must be between 10 and 80 degrees." );
				this.bubble.arrowAngle = 45;
			}
			break;
		case "right":
			if( angle < 10 && angle > 170 ){
				console.error( "Angle must be between 10 and 170 degrees." );
				this.bubble.arrowAngle = 90;
			}
			break;
		case "bottomright":
			if( angle < 100 && angle > 170 ){
				console.error( "Angle must be between 100 and 170 degrees." );
				this.bubble.arrowAngle = 180;
			}
			break;
		case "bottom":
			if( angle < 100 && angle > 260 ){
				console.error( "Angle must be between 100 and 260 degrees." );
				this.bubble.arrowAngle = 180;
			}
			break;
		case "bottomleft":
			if( angle < 190 && angle > 260 ){
				console.error( "Angle must be between 190 and 260 degrees." );
				this.bubble.arrowAngle = 225;
			}
			break;
		case "left":
			if( angle < 190 && angle > 350 ){
				console.error( "Angle must be between 190 and 350 degrees." );
				this.bubble.arrowAngle = 270;
			}
			break;
		case "topleft":
			if( angle < 280 && angle > 80 ){
				console.error( "Angle must be between 280 and 80 degrees." );
				this.bubble.arrowAngle = 315;
			}
			break;
		default:
			this.bubble.arrowAngle = 315;
			break;
	}
};

Bubble.prototype.setArrowLength = function(length) {
	this.bubble.arrowLength = length;
};

Bubble.prototype.setArrowComponents = function(){
	const angleInRadians = Math.abs(this.bubble.arrowAngle - 90) * Math.PI / 180;
	// calculate the change in x and y for the vector
	this.bubble.arrowDx = Math.round(this.bubble.arrowLength * Math.cos( angleInRadians ));
	this.bubble.arrowDy = Math.round(this.bubble.arrowLength * Math.sin( angleInRadians ));
};

Bubble.prototype.setArrowVector = function() {

	// arrowEndX and arrowEndY based on quandrant of arrow position and direction
	if( this.bubble.arrowAngle >= 0 && this.bubble.arrowAngle <= 90 ){
		this.bubble.arrowEndX = this.bubble.arrowX + this.bubble.arrowDx;
		this.bubble.arrowEndY = this.bubble.arrowY - this.bubble.arrowDy;
	}else if(this.bubble.arrowAngle >= 90 && this.bubble.arrowAngle <= 180 ){
		this.bubble.arrowEndX = this.bubble.arrowX + this.bubble.arrowDx;
		this.bubble.arrowEndY = this.bubble.arrowY + this.bubble.arrowDy;
	}else if(this.bubble.arrowAngle >= 180 && this.bubble.arrowAngle <= 270 ){
		this.bubble.arrowEndX = this.bubble.arrowX + this.bubble.arrowDx;
		this.bubble.arrowEndY = this.bubble.arrowY + this.bubble.arrowDy;
	}else if(this.bubble.arrowAngle >= 270 && this.bubble.arrowAngle <= 360 ){
		this.bubble.arrowEndX = this.bubble.arrowX + this.bubble.arrowDx;
		this.bubble.arrowEndY = this.bubble.arrowY + this.bubble.arrowDy;
	}
};

Bubble.prototype.calculateBoundingRect = function(){
	this.bubble.top = Math.min( this.bubble.y, this.bubble.arrowEndY ) - Math.floor( this.bubble.borderWidth / 2 );
	this.bubble.left = Math.min( this.bubble.x, this.bubble.arrowEndX ) - Math.floor( this.bubble.borderWidth / 2 );
	this.bubble.right = Math.max( this.bubble.x + this.bubble.width, this.bubble.arrowEndX ) + Math.floor( this.bubble.borderWidth / 2 );
	this.bubble.bottom = Math.max( this.bubble.y + this.bubble.height, this.bubble.arrowEndY ) + Math.floor( this.bubble.borderWidth / 2 );
};

Bubble.prototype.getBoundingClientRect = function(){
	return{
		top: this.bubble.top,
		left: this.bubble.left,
		bottom: this.bubble.bottom,
		right: this.bubble.right,
		height: this.bubble.bottom - this.bubble.top,
		width: this.bubble.right - this.bubble.left
	};
};

Bubble.prototype.render = function(){
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	// Draw bubble body
	this.ctx.fillStyle = this.bubble.backgroundColor;
	this.ctx.strokeStyle = this.bubble.borderColor;
	this.ctx.lineWidth = this.bubble.borderWidth;
	
	// Adjust bubble position based on arrow location
	let bubbleX = this.bubble.x;
	let bubbleY = this.bubble.y;

	// Draw bubble
	this.ctx.beginPath();
	this.ctx.moveTo(bubbleX, bubbleY);

	// bottom left corner
	this.ctx.lineTo(bubbleX, bubbleY + this.bubble.height);
	// bottom right corner
	this.ctx.lineTo(bubbleX + this.bubble.width, bubbleY + this.bubble.height);
	// top right corner
	this.ctx.lineTo(bubbleX + this.bubble.width, bubbleY);
	
	this.ctx.lineTo(bubbleX, bubbleY);
	
	this.ctx.closePath();

	//this.ctx.fill();
	//this.ctx.stroke();


	this.ctx.moveTo(this.bubble.arrowX, this.bubble.arrowY);
	this.ctx.lineTo(this.bubble.arrowEndX, this.bubble.arrowEndY);
	this.ctx.fill();
	this.ctx.stroke();

	this.ctx.fillStyle = this.bubble.color;
	const config = {
		x: bubbleX + this.bubble.padding,
		y: bubbleY + this.bubble.padding,
		width: this.bubble.width - this.bubble.padding * 2 - this.bubble.borderWidth * 2,
		height: this.bubble.height - this.bubble.padding * 2 - this.bubble.borderWidth * 2, 
		fontSize: this.bubble.fontSize,
		justify: this.bubble.justifyText,
		align: this.bubble.align,
		vAlign: this.bubble.vAlign,
		font: this.bubble.font,
		fontStyle: this.bubble.fontStyle,
		fontWeight: this.bubble.fontWeight,
		fontVariant: this.bubble.fontVariant,
		font: this.bubble.font,
		lineHeight: this.bubble.lineHeight
	  };
	gadgetui.util.drawText( this.ctx, this.bubble.text, config );
};

Bubble.prototype.attachToElement = function( selector, position ) {
	const element = selector;
	if (!element) return;

	const rect = element.getBoundingClientRect();
	const canvasRect = this.canvas.getBoundingClientRect();
	var render = this.canvas.getContext("2d");
	switch( position ){
		case "top":
			this.canvas.style.left = rect.left + (rect.right - rect.left) / 2 + "px";
			this.canvas.style.top = rect.top + "px";
			break;
		case "topright":
			this.canvas.style.left = rect.right + "px";
			this.canvas.style.top = -( this.bubble.padding ) + "px";
			break;
		case "right":
			this.canvas.style.left = rect.right + "px";
			this.canvas.style.top = rect.top / 2 + ( rect.bottom - rect.top ) / 2 + "px";
			break;	
		case "bottomright":
			this.canvas.style.left = rect.right + "px";
			this.canvas.style.top = rect.bottom + "px";
			break;
		case "bottom":
			this.canvas.style.left = rect.left + (rect.right - rect.left) / 2 + "px";
			this.canvas.style.top = rect.bottom + "px";
			break;
		case "bottomleft":
			this.canvas.style.left = rect.left - canvasRect.width + "px";
			this.canvas.style.top = rect.bottom + "px";
			break;
		case "left":
			this.canvas.style.left = rect.left - canvasRect.width + "px";
			this.canvas.style.top = rect.top - ((rect.bottom - rect.top ) / 2) + "px";
			break;
		case "topleft":
			this.canvas.style.left = rect.left - canvasRect.width + "px";
			this.canvas.style.top = rect.top - canvasRect.height + "px";
			break;
		}
		this.canvas.style.position = "absolute";

};

Bubble.prototype.destroy = function(){
	document.querySelector("body").removeChild( this.canvas );
};

function CollapsiblePane(selector, options) {

	this.selector = selector;
	this.config(options);

	this.addControl();

	this.addCSS();
	this.addHeader();

	this.icon = this.wrapper.querySelector("div.oi");

	this.addBindings();
	this.height = this.wrapper.offsetHeight;
	this.headerHeight = this.header.offsetHeight;
	this.selectorHeight = this.selector.offsetHeight;
	//if( this.collapse === true ){
	this.toggle();
	//}
}

CollapsiblePane.prototype.events = ['minimized', 'maximized'];


CollapsiblePane.prototype.addControl = function () {
	var pane = document.createElement("div");


	if (this.class) {
		gadgetui.util.addClass(pane, this.class);
	}
	gadgetui.util.addClass(pane, "gadget-ui-collapsiblePane");

	this.selector.parentNode.insertBefore(pane, this.selector);
	this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild(this.selector);
	pane.appendChild(this.selector);
};

CollapsiblePane.prototype.addHeader = function () {
	var div,
		css = gadgetui.util.setStyle,
		header = document.createElement("div");

	gadgetui.util.addClass(header, "gadget-ui-collapsiblePane-header");
	if (this.headerClass) {
		gadgetui.util.addClass(header, this.headerClass);
	}
	header.innerHTML = this.title;
	this.wrapper.insertBefore(header, this.selector);
	this.header = (this.headerClass ? this.wrapper.querySelector("div." + this.headerClass) : this.wrapper.querySelector("div.gadget-ui-collapsiblePane-header"));
	div = document.createElement("div");
	//gadgetui.util.addClass( div, "oi" );
	//div.setAttribute( 'data-glyph', "chevron-top" );
	this.header.appendChild(div);
};

CollapsiblePane.prototype.addCSS = function () {
	var theWidth = this.width,
		css = gadgetui.util.setStyle;
	css(this.wrapper, "width", theWidth);
	css(this.wrapper, "overflow", "hidden");
};

CollapsiblePane.prototype.addBindings = function () {
	var _this = this,
		header = (this.headerClass ? this.wrapper.querySelector("div." + this.headerClass) : this.wrapper.querySelector("div.gadget-ui-collapsiblePane-header"));

	header
		.addEventListener("click", function () {
			_this.toggle();
		});
};

CollapsiblePane.prototype.toggle = function () {
	var _this = this,
		css = gadgetui.util.setStyle,
		icon,
		myHeight,
		display,
		//border,
		selectorHeight,
		expandClass = "",
		collapseClass = "";
	if (this.collapsed === true) {
		icon = collapseClass;
		display = "block";
		myHeight = this.height;
		selectorHeight = this.selectorHeight;
		this.collapsed = false;
	} else {
		icon = expandClass;
		display = "none";
		myHeight = this.headerHeight;
		selectorHeight = 0;
		this.collapsed = true;
	}

	this.eventName = (this.collapsed ? "collapse" : "expand");
	this.newEventName = (this.collapsed ? "minimized" : "maximized");
	var ev = new Event(this.eventName);
	this.selector.dispatchEvent(ev);

	if (typeof Velocity != 'undefined' && this.animate) {

		Velocity(this.wrapper, {
			height: myHeight
		}, {
			queue: false, duration: _this.delay, complete: function () {
				//_this.icon.setAttribute( "data-glyph", icon );
			}
		});
		Velocity(this.selector, {
			height: selectorHeight
		}, {
			queue: false, duration: _this.delay, complete: function () {
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent(_this.newEventName);
				}
			}
		});
	} else {
		css(this.selector, "display", display);
		//this.icon.setAttribute( "data-glyph", icon );
	}
};

CollapsiblePane.prototype.config = function (options) {
	options = (options === undefined ? {} : options);
	this.animate = ((options.animate === undefined) ? true : options.animate);
	this.delay = ((options.delay === undefined ? 300 : options.delay));
	this.title = (options.title === undefined ? "" : options.title);
	this.width = gadgetui.util.getStyle(this.selector, "width");
	this.collapse = ((options.collapse === undefined ? false : options.collapse));
	this.collapsed = ((options.collapse === undefined ? true : !options.collapse));
	this.class = ((options.class === undefined ? false : options.class));
	this.headerClass = ((options.headerClass === undefined ? false : options.headerClass));
};


function Dialog(selector, options) {
	var css = gadgetui.util.setStyle;
	
	if( selector !== null ){
		this.selector = selector;
	}else{
		let dv = document.createElement("div");
		dv.setAttribute( "id", "gadgetui-dialog-" + Math.random());
		if( options.width !== undefined ){
			css(dv, "width", options.width);
		}
		document.querySelector( "body" ).append(dv);
		this.selector = dv;
	}

	if (options !== undefined) {
		this.config(options);
		this.buttons = (options.buttons !== undefined ? options.buttons : []);
	}

	this.setup(options);

	this.addButtons();
}

Dialog.prototype = FloatingPane.prototype;

Dialog.prototype.addButtons = function () {
	var self = this;
	var css = gadgetui.util.setStyle;
	this.buttonDiv = document.createElement("div");
	css(this.buttonDiv, "text-align", "center");
	css(this.buttonDiv, "padding", ".5em");
	this.buttons.forEach(function (button) {
		var btn = document.createElement("button");
		btn.innerText = button.label;
		css(btn, "margin", ".5em");
		btn.addEventListener("click", button.click);
		self.buttonDiv.appendChild(btn);
	});
	this.wrapper.appendChild(this.buttonDiv);
}


function FileUploadWrapper(file, selector) {
	var ix,
		id,
		options,
		bindings = gadgetui.objects.EventBindings.getAll();

	id = gadgetui.util.Id();
	options = { id: id, filename: file.name, width: gadgetui.util.getStyle(selector, "width") };
	this.file = file;
	this.id = id;
	this.progressbar = new gadgetui.display.ProgressBar(selector, options);
	this.progressbar.render();
	for (ix = 0; ix < bindings.length; ix++) {
		this[bindings[ix].name] = bindings[ix].func;
	}
}

FileUploadWrapper.prototype.events = ["uploadComplete", "uploadAborted"];

FileUploadWrapper.prototype.completeUpload = function (fileItem) {
	let finish = function () {
		this.progressbar.destroy();
		this.fireEvent("uploadComplete", fileItem);
	}.bind(this);
	setTimeout(finish, 1000);
};

FileUploadWrapper.prototype.abortUpload = function (fileItem) {
	let aborted = function () {
		this.progressbar.destroy();
		this.fireEvent("uploadAborted", fileItem);
	}.bind(this);
	setTimeout(aborted, 1000);
};

function FloatingPane(selector, options) {
	this.selector = selector;
	if (options !== undefined) {
		this.config(options);
	}

	this.setup(options);
}

FloatingPane.prototype.events = ['minimized', 'maximized', 'moved', 'closed'];

FloatingPane.prototype.setup = function (options) {
	this.setMessage();
	this.addControl();
	this.addHeader();
	if (this.enableShrink) {
		this.maxmin = this.wrapper.querySelector("div.oi[name='maxmin']");
	}
	// need to be computed after header is done
	this.minWidth = (this.title.length > 0 ? gadgetui.util.textWidth(this.title, this.header.style) + 80 : 100);
	var paddingPx = (parseInt(gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "padding")), 10) * 2);
	// 6 px is padding + border of header
	var headerHeight = gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.header, "height")) + 6;
	//set height by setting width on selector to get content height at that width
	gadgetui.util.setStyle(this.selector, "width", this.width - paddingPx);
	this.height = (options.height === undefined ? gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "height")) + paddingPx + headerHeight + 10 : options.height);

	this.addCSS();

	// now set height to computed height of control _this has been created
	this.height = gadgetui.util.getStyle(this.wrapper, "height");

	this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset(this.selector).left;
	this.addBindings();
	/* 	if( this.enableShrink ){
			this.minimize();
			this.expand();
		} */
};

FloatingPane.prototype.setMessage = function () {
	if (this.message !== undefined) {
		this.selector.innerText = this.message;
	}
}

FloatingPane.prototype.addBindings = function () {
	var dragger = gadgetui.util.draggable(this.wrapper);

	this.wrapper.addEventListener("drag_end", function (event) {
		this.top = event.detail.top;
		this.left = event.detail.left;
		this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset(this.selector).left;

		if (typeof this.fireEvent === 'function') {
			this.fireEvent('moved');
		}
	}.bind(this));

	if (this.enableShrink) {
		this.shrinker.addEventListener("click", function (event) {
			event.stopPropagation();
			if (this.minimized) {
				this.expand();
			} else {
				this.minimize();
			}
		}.bind(this));
	}
	if (this.enableClose) {
		this.closer.addEventListener("click", function (event) {
			event.stopPropagation();
			this.close();
		}.bind(this));
	}
};

FloatingPane.prototype.close = function () {
	if (typeof this.fireEvent === 'function') {
		this.fireEvent('closed');
	}
	this.wrapper.parentNode.removeChild(this.wrapper);

};

FloatingPane.prototype.addHeader = function () {
	var css = gadgetui.util.setStyle;
	this.header = document.createElement("div");
	this.header.innerHTML = this.title;
	if (this.headerClass) {
		gadgetui.util.addClass(header, this.headerClass);
	}
	gadgetui.util.addClass(this.header, 'gadget-ui-floatingPane-header');


	if (this.enableShrink) {
		this.shrinker = document.createElement("span");
		this.shrinker.setAttribute("name", "maxmin");
		css(this.shrinker, "float", "left");
		css(this.shrinker, "margin-right", ".5em");
		var shrinkIcon = `<svg class="feather">
								<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#minimize"/>
								</svg>`;
		this.shrinker.innerHTML = shrinkIcon;
		this.header.insertBefore(this.shrinker, undefined);
		this.wrapper.insertBefore(this.header, this.selector);
		this.header.appendChild(this.shrinker);
	} else {
		this.wrapper.insertBefore(this.header, this.selector);
	}

	if (this.enableClose) {
		var span = document.createElement("span");
		span.setAttribute("name", "closeIcon");
		css(span, "float", "right");
		var icon = `<svg class="feather">
								<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#x-circle"/>
								</svg>`;
		span.innerHTML = icon;
		this.header.appendChild(span);
		css(span, "right", "3px");
		css(span, "position", "absolute");
		css(span, "cursor", "pointer");
		css(span, "top", "3px");
		this.closer = span;
	}
};

FloatingPane.prototype.addCSS = function () {
	var css = gadgetui.util.setStyle;
	//copy width from selector
	css(this.wrapper, "width", this.width);
	css(this.wrapper, "z-index", this.zIndex);
	if( this.backgroundColor.length ){
		css(this.wrapper, "background-color", this.backgroundColor);
	}
	if (this.top !== undefined) css(this.wrapper, "top", this.top);
	if (this.left !== undefined) css(this.wrapper, "left", this.left);
	if (this.bottom !== undefined) css(this.wrapper, "bottom", this.bottom);
	if (this.right !== undefined) css(this.wrapper, "right", this.right);
};

FloatingPane.prototype.addControl = function () {
	var fp = document.createElement("div");
	if (this.class) {
		gadgetui.util.addClass(fp, this.class);
	}
	gadgetui.util.addClass(fp, "gadget-ui-floatingPane");

	fp.draggable = true;
	this.selector.parentNode.insertBefore(fp, this.selector);
	this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild(this.selector);
	fp.appendChild(this.selector);

};

FloatingPane.prototype.expand = function () {
	// when minimizing and expanding, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position

	var _this = this,
		css = gadgetui.util.setStyle,
		offset = gadgetui.util.getOffset(this.wrapper),
		parentPaddingLeft = parseInt(gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.wrapper.parentElement, "padding-left")), 10),
		lx = parseInt(new Number(offset.left), 10) - this.relativeOffsetLeft - parentPaddingLeft;

	//width = parseInt( gadgetui.util.getNumberValue( this.width ), 10 );
	var icon = `<svg class="feather">
								<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#minimize"/>
								</svg>`;
	if (typeof Velocity != 'undefined' && this.animate) {

		Velocity(this.wrapper, {
			width: this.width
		}, { queue: false, duration: 500 }, function () {
			// Animation complete.
		});

		Velocity(this.selector, {
			height: this.height
		}, {
			queue: false, duration: 500, complete: function () {
				_this.shrinker.innerHTML = icon;
				css(_this.selector, "overflow", "scroll");

				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('maximized');
				}
			}
		});
	} else {

		css(this.wrapper, "width", this.width);
		css(this.selector, "height", this.height);
		this.shrinker.innerHTML = icon;
		css(this.selector, "overflow", "scroll");
		if (typeof this.fireEvent === 'function') {
			this.fireEvent('maximized');
		}
	}

	this.minimized = false;
};

FloatingPane.prototype.minimize = function () {
	// when minimizing and maximizing, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position

	var _this = this,
		css = gadgetui.util.setStyle,
		offset = gadgetui.util.getOffset(this.wrapper),
		parentPaddingLeft = parseInt(gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.wrapper.parentElement, "padding-left")), 10),
		lx = parseInt(new Number(offset.left), 10) - this.relativeOffsetLeft - parentPaddingLeft,
		width = parseInt(gadgetui.util.getNumberValue(this.width), 10);

	css(this.selector, "overflow", "hidden");
	var icon = `<svg class="feather">
							<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#maximize"/>
							</svg>`;
	if (typeof Velocity != 'undefined' && this.animate) {

		Velocity(this.wrapper, {
			width: _this.minWidth
		}, {
			queue: false, duration: _this.delay, complete: function () {
				//_this.icon.setAttribute( "data-glyph", "fullscreen-enter" );
				_this.shrinker.innerHTML = icon;
			}
		});

		Velocity(this.selector, {
			height: "50px"
		}, { queue: false, duration: _this.delay }, function () {
			// Animation complete.
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('minimized');
			}
		});
	} else {
		css(this.wrapper, "width", this.minWidth);
		css(this.selector, "height", "50px");
		this.shrinker.innerHTML = icon;
		if (typeof this.fireEvent === 'function') {
			this.fireEvent('minimized');
		}
	}
	this.minimized = true;
};

FloatingPane.prototype.config = function (options) {
	options = (options === undefined ? {} : options);
	this.message = (options.message === undefined ? undefined : options.message);
	this.animate = ((options.animate === undefined) ? true : options.animate);
	this.delay = ((options.delay === undefined ? 500 : options.delay));
	this.title = (options.title === undefined ? "" : options.title);
	this.backgroundColor = (options.backgroundColor === undefined ? "" : options.backgroundColor);
	this.zIndex = (options.zIndex === undefined ? gadgetui.util.getMaxZIndex() + 1 : options.zIndex);
	this.width = gadgetui.util.getStyle(this.selector, "width");
	this.top = (options.top === undefined ? undefined : options.top);
	this.left = (options.left === undefined ? undefined : options.left);
	this.bottom = (options.bottom === undefined ? undefined : options.bottom);
	this.right = (options.right === undefined ? undefined : options.right);
	this.class = ((options.class === undefined ? false : options.class));
	this.headerClass = ((options.headerClass === undefined ? false : options.headerClass));
	this.featherPath = options.featherPath || "/node_modules/feather-icons";
	this.minimized = false;
	this.relativeOffsetLeft = 0;
	this.enableShrink = (options.enableShrink !== undefined ? options.enableShrink : true);
	this.enableClose = (options.enableClose !== undefined ? options.enableClose : true);
};

function Lightbox( selector, options ){
    this.selector = selector;
    this.config( options );
    this.addControl();
    this.updateImage();
}

Lightbox.prototype.events = ['showPrevious','showNext'];

Lightbox.prototype.config = function( options ){
    this.images = options.images;
    this.currentIndex = 0;
    this.featherPath = options.featherPath || "/node_modules/feather-icons";
    this.time = options.time || 3000;
    this.enableModal = ( options.enableModal === undefined ? true : options.enableModal );
};

Lightbox.prototype.addControl = function(){
    gadgetui.util.addClass( this.selector, "gadgetui-lightbox" );
    this.imageContainer  = document.createElement( "div" );
    gadgetui.util.addClass(  this.imageContainer, "gadgetui-lightbox-image-container" );
	
    this.spanPrevious = document.createElement("span");
    this.spanNext = document.createElement("span");
	gadgetui.util.addClass(this.spanPrevious, "gadgetui-lightbox-previousControl");
	gadgetui.util.addClass(this.spanNext, "gadgetui-lightbox-nextControl");

	this.spanPrevious.innerHTML = `<svg class="feather" name="chevron">
      <use xlink:href="${this.featherPath}/dist/feather-sprite.svg#chevron-left"/>
    </svg>`;
    this.spanNext.innerHTML = `<svg class="feather" name="chevron">
      <use xlink:href="${this.featherPath}/dist/feather-sprite.svg#chevron-right"/>
    </svg>`;
    this.selector.appendChild( this.spanPrevious );
    this.selector.appendChild( this.imageContainer );
    this.selector.appendChild( this.spanNext );

    this.spanPrevious.addEventListener( "click", function( event ){
        this.prevImage();
    }.bind(this));

    this.spanNext.addEventListener( "click", function( event ){
        this.nextImage();
    }.bind(this));

    if( this.enableModal ){
        this.modal = document.createElement("div");
        gadgetui.util.addClass( this.modal, "gadgetui-lightbox-modal");
        gadgetui.util.addClass( this.modal, "gadgetui-hidden");
        this.modalImageContainer = document.createElement("div");
        this.modal.appendChild( this.modalImageContainer );
        gadgetui.util.addClass( this.modalImageContainer, "gadgetui-lightbox-modal-imagecontainer");

        document.querySelector("body").appendChild( this.modal );

        this.imageContainer.addEventListener( "click", function(event){
            this.setModalImage();
            gadgetui.util.addClass( this.selector, "gadgetui-hidden");
            gadgetui.util.removeClass( this.modal, "gadgetui-hidden");
            this.stopAnimation();
        }.bind(this));

        this.modal.addEventListener( "click", function(event){
            gadgetui.util.addClass( this.modal, "gadgetui-hidden");
            gadgetui.util.removeClass( this.selector, "gadgetui-hidden");
            this.animate();
        }.bind(this));
    }
};

// Function to show the next image
Lightbox.prototype.nextImage = function() {
    this.currentIndex = ( this.currentIndex + 1 ) %  this.images.length;
    this.updateImage();
};

// Function to show the previous image
Lightbox.prototype.prevImage = function() {
    this.currentIndex = ( this.currentIndex - 1 + this.images.length ) %  this.images.length;
    this.updateImage();
};

// Function to update the current image
Lightbox.prototype.updateImage = function() {
    this.imageContainer.innerHTML = `<img style="height:100%;width:100%;" src="${this.images[this.currentIndex]}" alt="Image ${this.currentIndex + 1}">`;
};

Lightbox.prototype.animate = function() {
    this.interval = setInterval(function () {
        this.nextImage();
        }.bind(this), this.time );
};

Lightbox.prototype.stopAnimation = function() {
    clearInterval(this.interval);
};

Lightbox.prototype.setModalImage = function() {
    this.modalImageContainer.innerHTML = `<img style="height:100%;width:100%;" src="${this.images[this.currentIndex]}" alt="Image ${this.currentIndex + 1}">`;
};





function Menu(selector, options) {
	this.selector = selector;
	this.elements = [];
	this.config(options);
	if (this.datasource !== undefined) {
		this.retrieveData();
	} else {
		if (this.data !== undefined) this.addControl();
		this.addBindings();
	}
}

Menu.prototype.events = ['clicked'];

Menu.prototype.retrieveData = function () {
	this.datasource()
		.then(function (data) {
			this.data = data;
			this.addControl();
		}.bind(this));
};

Menu.prototype.addControl = function () {

	let processItem = function (item, parent) {
		// if there is a label, add the label
		let label = (item.label !== undefined ? item.label : "");
		//let element = `<div class="gadget-ui-menu-item">{label}</div>`;
		let element = document.createElement("div");
		element.classList.add("gadget-ui-menu-item");
		element.innerText = label;
		let image = (item.image !== undefined ? item.image : "");
		if (image.length) {
			let imgEl = document.createElement("img");
			imgEl.src = image;
			imgEl.classList.add("gadget-ui-menu-icon");
			element.appendChild(imgEl);
		}
		if (item.link !== undefined && item.link !== null && (item.link.length > 0 || typeof item.link === 'function')) {
			//element.removeEventListener( "click" );
			element.style.cursor = 'pointer';
			element.addEventListener("click", function () {
				if (typeof this.fireEvent === 'function') {
					this.fireEvent('clicked', item);
				}
				if (typeof item.link === 'function') {
					item.link();
				} else {
					window.open(item.link);
				}
			}.bind(this));
		}
		// if there is a menuItem, add it
		if (item.menuItem !== undefined) {
			element.appendChild(processMenuItem(item.menuItem, element));
		}
		return element;
	}.bind(this);

	let processMenuItem = function (menuItemData, parent) {
		// add <div class="gadget-ui-menu-menuItem"> as child of menu
		let element = document.createElement("div");
		element.classList.add("gadget-ui-menu-menuItem");
		menuItemData.items.forEach(function (item) {
			element.appendChild(processItem(item, element));
		});

		return element;
	};

	let generateMenu = function (menuData) {
		//let element = `<div class="gadget-ui-menu">{menuData.label}</div>`;
		let element = document.createElement("div");
		element.classList.add("gadget-ui-menu");
		let label = (menuData.label !== undefined ? menuData.label : "");
		element.innerText = label;
		let image = (menuData.image !== undefined ? menuData.image : "");
		if (image.length) {
			let imgEl = document.createElement("img");
			imgEl.src = image;
			imgEl.classList.add("gadget-ui-menu-icon");
			element.appendChild(imgEl);
		}
		// process the menuItem
		element.appendChild(processMenuItem(menuData.menuItem, element));
		return element;
	};

	this.data.forEach(function (menu) {

		let element = generateMenu(menu);
		// for each menu, generate the items and sub-menus
		this.selector.appendChild(element);
		this.elements.push(element);
	}.bind(this));
};

Menu.prototype.addBindings = function () {

	let menus = this.selector.querySelectorAll(".gadget-ui-menu");
	// each menu needs to be initialized
	menus.forEach(function (mu) {
		let menuItem = mu.querySelector("div[class='gadget-ui-menu-menuItem']");

		let items = menuItem.querySelectorAll("div[class='gadget-ui-menu-item']");

		// get the menuItems inside the root
		let menuItems = menuItem.querySelectorAll("div[class='gadget-ui-menu-menuItem']");

		// loop over the items
		items.forEach(function (item) {
			// find if there is a menuItem inside the item class
			let mItem = item.querySelector("div[class='gadget-ui-menu-menuItem']");

			// add a hover event listener for each item
			item.addEventListener("mouseenter", function (evt) {
				if (mItem !== null) {
					mItem.classList.add("gadget-ui-menu-hovering");
				}
				item.classList.add("gadget-ui-menu-selected");
				let children = item.parentNode.children;
				for (var ix = 0; ix < children.length; ix++) {
					if (children[ix] !== item) {
						children[ix].classList.remove("gadget-ui-menu-selected");
					}
				}

				evt.preventDefault();
			});

			item.addEventListener("mouseleave", function (evt) {
				if (mItem !== null) {
					mItem.classList.remove("gadget-ui-menu-hovering");
				}
			});
		});

		// add hover event listener to the root menuItem
		mu.addEventListener("mouseenter", function (event) {
			menuItem.classList.add("gadget-ui-menu-hovering");
		});
		// add mouseleave event listener to root menuItem
		mu.addEventListener("mouseleave", function (event) {
			menuItem.classList.remove("gadget-ui-menu-hovering");
		});

		// add listeners to the menu items under the root
		menuItems.forEach(function (mItem) {
			mItem.addEventListener("mouseenter", function (ev) {
				mItem.classList.add("gadget-ui-menu-hovering");
			});
			mItem.addEventListener("mouseleave", function (evt) {
				if (mItem.parentNode.classList.toString().indexOf("selected") < 0) {
					mItem.classList.remove("gadget-ui-menu-hovering");
				}
			});
		});
	});
};

Menu.prototype.destroy = function () {
	let menus = this.selector.querySelectorAll("div.gadget-ui-menu");
	// remove the menus
	for (var idx = 0; idx < menus.length; idx++) {
		document.querySelector(this.selector).removeChild(menus[idx]);
	}
};

Menu.prototype.config = function (options) {
	this.data = (options.data !== undefined ? options.data : undefined);
	this.datasource = (options.datasource !== undefined ? options.datasource : undefined);
};

function Modal(selector, options) {
	this.selector = selector;
	this.config(options);

	this.addControl();
	this.addBindings();
}

Modal.prototype.events = ['opened', 'closed'];

Modal.prototype.addControl = function () {
	this.wrapper = document.createElement("div");
	if (this.class) {
		gadgetui.util.addClass(this.wrapper, this.class);
	}
	gadgetui.util.addClass(this.wrapper, "gadgetui-modal");

	this.selector.parentNode.insertBefore(this.wrapper, this.selector);
	//this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild(this.selector);
	this.wrapper.appendChild(this.selector);
	var icon = "";
	if (this.closeIcon.indexOf('svg') > 0) {
		icon = '<svg class="' + this.featherClass + '"><use xlink:href="' + this.closeIcon + '"/></svg>';
	} else {
		icon = '<img src="' + this.closeIcon + '"/>';
	}
	gadgetui.util.addClass(this.selector, "gadgetui-modalWindow");
	this.selector.innerHTML = `<span name="close" class="gadgetui-right-align">
              <a name="close">
              ${icon}
              </a>
              </span>` + this.selector.innerHTML;
	if (this.autoOpen) {
		this.open();
	}
};

Modal.prototype.addBindings = function () {
	let self = this;
	let close = this.selector.querySelector(" a[name='close']");
	close.addEventListener("click", function (event) {
		self.close();
	});
};

Modal.prototype.open = function () {
	gadgetui.util.addClass(this.wrapper, "gadgetui-showModal");
	if (typeof this.fireEvent === 'function') {
		this.fireEvent('opened');
	}
};

Modal.prototype.close = function () {
	gadgetui.util.removeClass(this.wrapper, "gadgetui-showModal");
	if (typeof this.fireEvent === 'function') {
		this.fireEvent('closed');
	}
};

Modal.prototype.destroy = function () {
	// remove the wrapper
	this.selector.parentNode.removeChild(this.selector);
	this.wrapper.parentNode.insertBefore(this.selector, this.wrapper);
	this.wrapper.parentNode.removeChild(this.wrapper);
	// remove the close span
	this.selector.removeChild(this.selector.querySelector(".gadgetui-right-align"));
};

Modal.prototype.config = function (options) {
	this.class = ((options.class === undefined ? false : options.class));
	this.featherClass = ((options.featherClass === undefined ? 'feather' : options.featherClass));
	//this.featherPath = options.featherPath || "/node_modules/feather-icons";
	this.closeIcon = ((options.closeIcon === undefined ? '/node_modules/feather-icons/dist/feather-sprite.svg#x-circle' : options.closeIcon));
	this.autoOpen = (options.autoOpen === false ? false : true);
};


function ProgressBar(selector, options) {
	this.selector = selector;
	this.configure(options);
}

ProgressBar.prototype.configure = function (options) {
	this.id = options.id;
	this.label = options.label;
	this.width = options.width;
};

ProgressBar.prototype.events = ['start,updatePercent,update'];

ProgressBar.prototype.render = function () {
	var css = gadgetui.util.setStyle;

	var pbDiv = document.createElement("div");
	pbDiv.setAttribute("name", "progressbox_" + this.id);
	gadgetui.util.addClass(pbDiv, "gadgetui-progressbar-progressbox");
	
	this.selector.appendChild(pbDiv);

	var fileDiv = document.createElement("div");
	fileDiv.setAttribute("name", "label");
	gadgetui.util.addClass(fileDiv, "gadgetui-progressbar-label");
	fileDiv.innerText = " " + this.label + " ";

	pbDiv.appendChild(fileDiv);

	var pbarDiv = document.createElement("div");
	gadgetui.util.addClass(pbarDiv, "gadget-ui-progressbar");
	pbarDiv.setAttribute("name", "progressbar_" + this.id);

	pbDiv.appendChild(pbarDiv);

	var statusDiv = document.createElement("div");
	statusDiv.setAttribute("name", "statustxt");
	gadgetui.util.addClass(statusDiv, "statustxt");
	statusDiv.innertText = "0%";

	pbDiv.appendChild(statusDiv);


	this.progressbox = this.selector.querySelector("div[name='progressbox_" + this.id + "']");
	this.progressbar = this.selector.querySelector("div[name='progressbar_" + this.id + "']");
	this.statustxt = this.selector.querySelector("div[name='progressbox_" + this.id + "'] div[name='statustxt']");
};

ProgressBar.prototype.start = function () {
	var css = gadgetui.util.setStyle;
	css(this.progressbar, "width", "0");
	this.statustxt.innerHTML = "0%";
};

ProgressBar.prototype.updatePercent = function (percent) {
	var css = gadgetui.util.setStyle;
	var percentage = percent + "%";
	this.percent = percent;
	css(this.progressbar, "width", percentage);
	this.statustxt.innerHTML = percentage;
};

ProgressBar.prototype.update = function (text) {
	this.statustxt.innerHTML = text;
};

ProgressBar.prototype.destroy = function () {
	this.progressbox.parentNode.removeChild(this.progressbox);
};


function Sidebar(selector, options) {
	this.selector = selector;
	this.minimized = false;
	this.config(options);
	this.addControl();
	this.addBindings(options);
}

Sidebar.prototype.events = ['maximized', 'minimized'];

Sidebar.prototype.config = function (options) {
	this.class = ((options.class === undefined ? false : options.class));
	this.featherPath = options.featherPath || "/node_modules/feather-icons";
	this.animate = ((options.animate === undefined) ? true : options.animate);
	this.delay = ((options.delay === undefined ? 300 : options.delay));
	this.toggleTitle = ((options.toggleTitle === undefined ? "Toggle Sidebar" : options.toggleTitle)); 
};

Sidebar.prototype.addControl = function () {
	this.wrapper = document.createElement("div");
	if (this.class) {
		gadgetui.util.addClass(this.wrapper, this.class);
	}
	gadgetui.util.addClass(this.wrapper, "gadgetui-sidebar");

	this.span = document.createElement("span");
	this.span.setAttribute("title", this.toggleTitle );
	gadgetui.util.addClass(this.span, "gadgetui-right-align");
	gadgetui.util.addClass(this.span, "gadgetui-sidebar-toggle");
	this.span.innerHTML = `<svg class="feather" name="chevron">
      <use xlink:href="${this.featherPath}/dist/feather-sprite.svg#chevron-left"/>
    </svg>`;

	this.selector.parentNode.insertBefore(this.wrapper, this.selector);
	this.selector.parentNode.removeChild(this.selector);
	this.wrapper.appendChild(this.selector);
	this.wrapper.insertBefore(this.span, this.selector);
	this.width = this.wrapper.offsetWidth;
};

Sidebar.prototype.maximize = function () {
	let self = this;
	self.minimized = false;
	self.setChevron(self.minimized);
	gadgetui.util.removeClass(self.wrapper, "gadgetui-sidebar-minimized");

	if (typeof Velocity != 'undefined' && this.animate) {
		Velocity(self.wrapper, {
			width: self.width
		}, {
			queue: false, duration: self.delay, complete: function () {
				//_this.icon.setAttribute( "data-glyph", icon );
				gadgetui.util.removeClass(self.selector, "gadgetui-sidebarContent-minimized");
				if (typeof self.fireEvent === 'function') {
					self.fireEvent('maximized');
				}
			}
		});
	} else {
		gadgetui.util.removeClass(self.selector, "gadgetui-sidebarContent-minimized");
		if (typeof self.fireEvent === 'function') {
			self.fireEvent('maximized');
		}
	}

}

Sidebar.prototype.minimize = function () {
	let self = this;
	self.minimized = true;
	self.setChevron(self.minimized);
	gadgetui.util.addClass(self.selector, "gadgetui-sidebarContent-minimized");
	if (typeof Velocity != 'undefined' && self.animate) {

		Velocity(self.wrapper, {
			width: 25
		}, {
			queue: false, duration: self.delay, complete: function () {
				//_this.icon.setAttribute( "data-glyph", icon );
				gadgetui.util.addClass(self.wrapper, "gadgetui-sidebar-minimized");
				if (typeof self.fireEvent === 'function') {
					self.fireEvent('minimized');
				}
			}
		});
	} else {
		gadgetui.util.addClass(self.wrapper, "gadgetui-sidebar-minimized");
		if (typeof self.fireEvent === 'function') {
			self.fireEvent('minimized');
		}
	}
}

Sidebar.prototype.addBindings = function (options) {
	let self = this;

	this.span.addEventListener("click", function (event) {
		if (self.minimized) {
			self.maximize();

		} else {
			self.minimize();
		}
	});

	if (options.minimized) {
		self.minimize();
	}
};

Sidebar.prototype.setChevron = function (minimized) {
	let chevron = (minimized ? "chevron-right" : "chevron-left");
	let svg = this.wrapper.querySelector("svg");
	svg.innerHTML = `<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#${chevron}"/>`;
}

function Tabs(selector, options) {
	this.selector = selector;
	this.config(options);
	this.addControl();
}

Tabs.prototype.config = function (options) {
	this.direction = (options.direction === undefined ? "horizontal" : options.direction);
	this.tabContentDivIds = [];
	this.tabs = [];
	this.activeTab;
};

Tabs.prototype.events = ["tabSelected"];

Tabs.prototype.addControl = function () {
	let dir = (this.direction === "vertical" ? "v" : "h");
	this.selector.classList.add("gadget-ui-tabs-" + dir);
	this.tabs = this.selector.querySelectorAll("div");
	let activeSet = false;
	this.tabs.forEach(function (tab) {
		tab.classList.add("gadget-ui-tab-" + dir);
		// set the first tab active
		if (!activeSet) {
			activeSet = true;
			this.setActiveTab(tab.attributes['data-tab'].value);
			//tab.classList.add( "gadget-ui-tab-" + dir + "-active" );

			//this.activeTab = tab.id;
		}
		this.tabContentDivIds.push(tab.attributes['data-tab'].value);
		document.querySelector("#" + tab.attributes['data-tab'].value).style.display = 'none';
		tab.addEventListener("click", function () {
			this.setActiveTab(tab.attributes['data-tab'].value);
		}.bind(this));
	}.bind(this));
	document.querySelector("#" + this.tabContentDivIds[0]).style.display = 'block';
};

Tabs.prototype.setActiveTab = function (activeTab) {
	let dir = (this.direction === "vertical" ? "v" : "h");
	this.tabContentDivIds.forEach(function (tab) {
		let dsp = (tab === activeTab ? "block" : "none");
		document.querySelector("#" + tab).style.display = dsp;
	});

	this.tabs.forEach(function (tab) {
		if (tab.attributes['data-tab'].value === activeTab) {
			tab.classList.add("gadget-ui-tab-" + dir + "-active");
		} else {
			tab.classList.remove("gadget-ui-tab-" + dir + "-active");
		}
	}.bind(this));
	this.activeTab = activeTab;
	// if events were called for
	if (this.events['tabSelected'] !== undefined) {
		this.fireEvent("tabSelected", activeTab);
	}
};


	return{
		Bubble : Bubble,
		CollapsiblePane: CollapsiblePane,
		Dialog: Dialog,
		FileUploadWrapper: FileUploadWrapper,
		FloatingPane: FloatingPane,
		Menu: Menu,
		Lightbox: Lightbox,
		Modal: Modal,
		ProgressBar: ProgressBar,
		Sidebar: Sidebar,
		Tabs: Tabs
	};
}());

gadgetui.input = (function() {
	
	
function ComboBox(selector, options) {
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;
	this.config(options);
	this.setSaveFunc();
	this.setDataProviderRefresh();
	this.addControl();
	this.addCSS();
	// bind to the model if binding is specified
	gadgetui.util.bind(this.selector, this.model);
	// bind to the model if binding is specified
	gadgetui.util.bind(this.label, this.model);
	this.addBehaviors();
	this.setStartingValues();
}

ComboBox.prototype.addControl = function () {
	var css = gadgetui.util.setStyle;
	this.comboBox = gadgetui.util.createElement("div");
	this.input = gadgetui.util.createElement("input");
	this.label = gadgetui.util.createElement("div");
	this.inputWrapper = gadgetui.util.createElement("div");
	this.selectWrapper = gadgetui.util.createElement("div");

	gadgetui.util.addClass(this.comboBox, "gadgetui-combobox");
	gadgetui.util.addClass(this.input, "gadgetui-combobox-input");
	gadgetui.util.addClass(this.label, "gadgetui-combobox-label");
	gadgetui.util.addClass(this.inputWrapper, "gadgetui-combobox-inputwrapper");
	gadgetui.util.addClass(this.selectWrapper, "gadgetui-combobox-selectwrapper");

	this.selector.parentNode.insertBefore(this.comboBox, this.selector);
	this.selector.parentNode.removeChild(this.selector);
	this.comboBox.appendChild(this.label);
	this.selectWrapper.appendChild(this.selector);
	this.comboBox.appendChild(this.selectWrapper);
	this.inputWrapper.appendChild(this.input);
	this.comboBox.appendChild(this.inputWrapper);
	this.label.setAttribute("data-id", this.id);
	this.label.setAttribute("gadgetui-bind", this.selector.getAttribute("gadgetui-bind"));
	this.label.innerHTML = this.text;
	this.input.setAttribute("placeholder", this.newOption.text);
	this.input.setAttribute("type", "text");
	this.input.setAttribute("name", "custom");

	css(this.comboBox, "opacity", ".0");
};

ComboBox.prototype.addCSS = function () {
	var css = gadgetui.util.setStyle;
	gadgetui.util.addClass(this.selector, "gadgetui-combobox-select");
	css(this.selector, "width", this.width);
	css(this.selector, "border", 0);
	css(this.selector, "display", "inline");
	css(this.comboBox, "position", "relative");

	var styles = gadgetui.util.getStyle(this.selector),
		inputWidth = this.selector.clientWidth,
		inputWidthAdjusted,
		inputLeftOffset = 0,
		selectMarginTop = 0,
		selectLeftPadding = 0,
		leftOffset = 0,
		inputWrapperTop = this.borderWidth,
		inputLeftMargin,
		leftPosition;

	leftPosition = gadgetui.util.getNumberValue(this.borderWidth) + 4;

	if (this.borderRadius > 5) {
		selectLeftPadding = this.borderRadius - 5;
		leftPosition = gadgetui.util.getNumberValue(leftPosition) + gadgetui.util.getNumberValue(selectLeftPadding);
	}
	inputLeftMargin = leftPosition;
	inputWidthAdjusted = inputWidth - this.arrowWidth - gadgetui.util.getNumberValue(this.borderRadius) - 4;
	console.log(navigator.userAgent);
	if (navigator.userAgent.match(/(Safari)/) && !navigator.userAgent.match(/(Chrome)/)) {
		inputWrapperTop = this.borderWidth - 2;
		selectLeftPadding = (selectLeftPadding < 4) ? 4 : this.borderRadius - 1;
		selectMarginTop = 1;
	} else if (navigator.userAgent.match(/Edge/)) {
		selectLeftPadding = (selectLeftPadding < 1) ? 1 : this.borderRadius - 4;
		inputLeftMargin--;
	} else if (navigator.userAgent.match(/MSIE/)) {
		selectLeftPadding = (selectLeftPadding < 1) ? 1 : this.borderRadius - 4;
	} else if (navigator.userAgent.match(/Trident/)) {
		selectLeftPadding = (selectLeftPadding < 2) ? 2 : this.borderRadius - 3;
	} else if (navigator.userAgent.match(/Chrome/)) {
		selectLeftPadding = (selectLeftPadding < 4) ? 4 : this.borderRadius - 1;
		selectMarginTop = 1;
	}

	// positioning
	css(this.selector, "margin-top", selectMarginTop);
	css(this.selector, "padding-left", selectLeftPadding);

	css(this.inputWrapper, "top", inputWrapperTop);
	css(this.inputWrapper, "left", leftOffset);

	css(this.input, "width", inputWidthAdjusted);
	css(this.input, "font-size", styles.fontSize);

	//appearance
	css(this.comboBox, "font-size", styles.fontSize);

	css(this.label, "left", leftPosition);
	css(this.label, "font-family", styles.fontFamily);
	css(this.label, "font-size", styles.fontSize);
	css(this.label, "font-weight", styles.fontWeight);
	// add rules for arrow Icon
	//we're doing this programmatically so we can skin our arrow icon
	if (navigator.userAgent.match(/Firefox/)) {
		if (this.scaleIconHeight === true) {
			css(this.selectWrapper, "background-size", this.arrowWidth + "px " + inputHeight + "px");
		}
	}
	css(this.selector, "-webkit-appearance", "none");
	css(this.selector, "-moz-appearance", "window");

	if (this.scaleIconHeight === true) {
		css(this.selector, "background-size", this.arrowWidth + "px " + inputHeight + "px");
	}

	css(this.comboBox, "opacity", 1);

	if (this.hideable) {
		css(this.inputWrapper, "display", 'none');
		css(this.selectWrapper, "display", 'none');
	} else {
		css(this.selectWrapper, "display", 'inline');
		css(this.label, "display", 'none');
		if (this.selector.selectedIndex <= 0) {
			css(this.inputWrapper, "display", 'inline');
		}
	}
};

ComboBox.prototype.setSelectOptions = function () {
	var _this = this, id, text, option;


	while (_this.selector.options.length > 0) {
		_this.selector.remove(0);
	}
	//console.log( "append new option" );
	option = gadgetui.util.createElement("option");
	option.value = _this.newOption.id;
	option.text = _this.newOption.text;
	_this.selector.add(option);

	this.dataProvider.data.forEach(function (obj) {
		id = obj.id;
		text = obj.text;
		if (text === undefined) {
			text = id;
		}
		option = gadgetui.util.createElement("option");
		option.value = id;
		option.text = text;

		_this.selector.add(option);
	});
};

ComboBox.prototype.find = function (text) {
	var ix;
	for (ix = 0; ix < this.dataProvider.data.length; ix++) {
		if (this.dataProvider.data[ix].text === text) {
			return this.dataProvider.data[ix].id;
		}
	}
	return;
};

ComboBox.prototype.getText = function (id) {
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
};
ComboBox.prototype.showLabel = function () {
	var css = gadgetui.util.setStyle;
	css(this.label, "display", "inline-block");
	css(this.selectWrapper, "display", 'none');
	css(this.inputWrapper, "display", 'none');
};

ComboBox.prototype.events = ['change', 'click', 'focus', 'mouseenter', 'keyup', 'mouseleave', 'blur'];

ComboBox.prototype.addBehaviors = function (obj) {
	var _this = this;
	if (this.hideable) {
		this.comboBox
			.addEventListener(this.activate, function () {
				setTimeout(function () {
					if (_this.label.style.display != "none") {
						console.log("combo mouseenter ");
						//_this.label.style.display = "none" );
						_this.selectWrapper.style.display = "inline";
						_this.label.style.display = "none";
						if (_this.selector.selectedIndex <= 0) {
							_this.inputWrapper.style.display = "inline";
						}
					}
				}, _this.delay);
			});
		this.comboBox
			.addEventListener("mouseleave", function () {
				console.log("combo mouseleave ");
				if (_this.selector != document.activeElement && _this.input != document.activeElement) {
					_this.showLabel();
				}
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('mouseleave');
				}
			});
	}
	_this.input
		.addEventListener("click", function (e) {
			console.log("input click ");
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('click');
			}
		});
	_this.input
		.addEventListener("keyup", function (event) {
			console.log("input keyup");
			if (event.which === 13) {
				var inputText = gadgetui.util.encode(_this.input.value);
				_this.handleInput(inputText);
			}
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('keyup');
			}
		});
	if (this.hideable) {
		_this.input
			.addEventListener("blur", function () {
				console.log("input blur");

				if (gadgetui.util.mouseWithin(_this.selector, gadgetui.mousePosition) === true) {
					_this.inputWrapper.style.display = 'none';
					_this.selector.focus();
				} else {
					_this.showLabel();
				}
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('blur');
				}
			});
	}
	if (this.hideable) {
		this.selector
			.addEventListener("mouseenter", function (ev) {
				_this.selector.style.display = "inline";
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('mouseenter');
				}
			});
	}
	this.selector
		.addEventListener("click", function (ev) {
			console.log("select click");
			ev.stopPropagation();
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('click');
			}
		});
	this.selector
		.addEventListener("change", function (event) {
			var idx = (event.target.selectedIndex >= 0) ? event.target.selectedIndex : 0;
			if (parseInt(event.target[idx].value, 10) !== parseInt(_this.id, 10)) {
				console.log("select change");
				if (event.target.selectedIndex > 0) {
					_this.inputWrapper.style.display = 'none';
					_this.setValue(event.target[event.target.selectedIndex].value);
				} else {
					_this.inputWrapper.style.display = 'block';
					_this.setValue(_this.newOption.value);
					_this.input.focus();
				}
				gadgetui.util.trigger(_this.selector, "gadgetui-combobox-change", { id: event.target[event.target.selectedIndex].value, text: event.target[event.target.selectedIndex].innerHTML });
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('change');
				}
			}
		});
	if (this.hideable) {
		this.selector
			.addEventListener("blur", function (event) {
				console.log("select blur ");
				event.stopPropagation();
				setTimeout(function () {
					//if( _this.emitEvents === true ){

					if (_this.input !== document.activeElement) {
						_this.showLabel();
					}
				}, 200);
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('blur');
				}
			});
	}
};

ComboBox.prototype.handleInput = function (inputText) {
	var id = this.find(inputText),
		css = gadgetui.util.setStyle;
	if (id !== undefined) {
		this.selector.value = id;
		this.label.innerText = inputText;
		this.selector.focus();
		this.input.value = '';
		css(this.inputWrapper, "display", 'none');
	}
	else if (id === undefined && inputText.length > 0) {
		this.save(inputText);
	}
};

ComboBox.prototype.triggerSelectChange = function () {
	console.log("select change");
	var ev = new Event("change", {
		view: window,
		bubbles: true,
		cancelable: true
	});
	this.selector.dispatchEvent(ev);
};

ComboBox.prototype.setSaveFunc = function () {
	var _this = this;

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

				promise = new Promise(
					function (resolve, reject) {
						args.push(resolve);
						args.push(reject);
						func = save.apply(_this, args);
						console.log(func);
					});
				promise.then(
					function (value) {
						function callback() {
							// trigger save event if we're triggering events
							//if( _this.emitEvents === true ){
							gadgetui.util.trigger(_this.selector, "gadgetui-combobox-save", { id: value, text: text });
							//_this.selector.dispatchEvent( new Event( "gadgetui-combobox-save" ), { id: value, text: text } );
							//}
							_this.input.value = '';
							_this.inputWrapper.style.display = 'none';
							_this.id = value;
							_this.dataProvider.refresh();
						}
						if (_this.animate === true && typeof Velocity !== "undefined") {
							Velocity(_this.selectWrapper, {
								boxShadow: '0 0 15px ' + _this.glowColor,
								borderColor: _this.glowColor
							}, _this.animateDelay / 2, function () {
								_this.selectWrapper.style.borderColor = _this.glowColor;
							});
							Velocity(_this.selectWrapper, {
								boxShadow: 0,
								borderColor: _this.borderColor
							}, _this.animateDelay / 2, callback);
						} else {
							callback();
						}
					});
				promise['catch'](function (message) {
					_this.input.value = '';
					_this.inputWrapper.hide();
					console.log(message);
					_this.dataProvider.refresh();

				});
			}
			return func;
		};
	}
};

ComboBox.prototype.setStartingValues = function () {
	(this.dataProvider.data === undefined) ? this.dataProvider.refresh() : this.setControls();
};

ComboBox.prototype.setControls = function () {
	console.log(this);
	this.setSelectOptions();
	this.setValue(this.id);
	this.triggerSelectChange();
};

ComboBox.prototype.setValue = function (id) {
	var text = this.getText(id);
	console.log("setting id:" + id);
	// value and text can only be set to current values in this.dataProvider.data, or to "New" value
	this.id = (text === undefined ? this.newOption.id : id);
	text = (text === undefined ? this.newOption.text : text);

	this.text = text;
	this.label.innerText = this.text;
	this.selector.value = this.id;
};

ComboBox.prototype.setDataProviderRefresh = function () {
	var _this = this,
		promise,
		refresh = this.dataProvider.refresh,
		func;
	this.dataProvider.refresh = function () {
		var scope = this;
		if (refresh !== undefined) {
			promise = new Promise(
				function (resolve, reject) {
					var args = [scope, resolve, reject];
					func = refresh.apply(this, args);
				});
			promise
				.then(function () {
					gadgetui.util.trigger(_this.selector, "gadgetui-combobox-refresh");
					//_this.selector.dispatchEvent( new Event( "gadgetui-combobox-refresh" ) );
					_this.setControls();
				});
			promise['catch'](function (message) {
				console.log("message");
				_this.setControls();
			});
		}
		return func;
	};
};

ComboBox.prototype.config = function (options) {
	options = (options === undefined ? {} : options);
	this.model = ((options.model === undefined) ? this.model : options.model);
	this.emitEvents = ((options.emitEvents === undefined) ? true : options.emitEvents);
	this.dataProvider = ((options.dataProvider === undefined) ? undefined : options.dataProvider);
	this.save = ((options.save === undefined) ? undefined : options.save);
	this.activate = ((options.activate === undefined) ? "mouseenter" : options.activate);
	this.delay = ((options.delay === undefined) ? 10 : options.delay);
	this.borderWidth = gadgetui.util.getStyle(this.selector, "border-width") || 1;
	this.borderRadius = gadgetui.util.getStyle(this.selector, "border-radius") || 5;
	this.borderColor = gadgetui.util.getStyle(this.selector, "border-color") || "silver";
	this.arrowWidth = options.arrowWidth || 25;
	this.width = ((options.width === undefined) ? 150 : options.width);
	this.newOption = ((options.newOption === undefined) ? { text: "...", id: 0 } : options.newOption);
	this.id = ((options.id === undefined) ? this.newOption.id : options.id);
	this.scaleIconHeight = ((options.scaleIconHeight === undefined) ? false : options.scaleIconHeight);
	this.animate = ((options.animate === undefined) ? true : options.animate);
	this.glowColor = ((options.glowColor === undefined) ? 'rgb(82, 168, 236)' : options.glowColor);
	this.animateDelay = ((options.animateDelay === undefined) ? 500 : options.animateDelay);
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

FileUploader.prototype.events = ['uploadComplete', 'uploadStart', 'show', 'dragover', 'dragstart', 'dragenter', 'dragleave', 'drop'];

FileUploader.prototype.render = function (title) {
	var data,
		options,
		title = title,
		files;

	var renderUploader = function () {
		var css = gadgetui.util.setStyle;
		var options = {
			title: title,
			addFile: this.addFileMessage,
			dropMessage: this.dropMessage,
			fileSelectLbl: ""
		};

		var uploadClass = "gadgetui-fileuploader-uploadIcon";
		if (this.uploadClass.length) {
			uploadClass += " " + this.uploadClass;
		}

		var icon = "";
		if (this.uploadIcon.indexOf(".svg")) {
			icon = '<svg name="gadgetui-fileuploader-uploadIcon" class="' + uploadClass + '"><use xlink:href="' + this.uploadIcon + '"/></svg>'
		} else {
			icon = '<img name="gadgetui-fileuploader-uploadIcon" class="' + uploadClass + '" src="' + this.uploadIcon + '">';
		}

		this.selector.innerHTML =
			'<div class="gadgetui-fileuploader-wrapper"><div name="gadgetui-fileuploader-dropzone" class="gadgetui-fileuploader-dropzone"><div name="gadgetui-fileuploader-filedisplay" class="gadgetui-fileuploader-filedisplay" style="display:none;"></div><div class="gadgetui-fileuploader-dropmessage" name="gadgetui-fileuploader-dropMessageDiv">' +
			options.dropMessage +
			'</span></div></div><div class="buttons full"><div class="gadgetui-fileuploader-fileUpload" name="gadgetui-fileuploader-fileUpload"><label>' + icon + '<input type="file" name="gadgetui-fileuploader-fileselect" class="gadgetui-fileuploader-upload" title="' +
			options.fileSelectLbl +
			'"></label></div></div></div>';

		if (this.showUploadButton === false) {
			css(this.selector.querySelector("input[name='gadgetui-fileuploader-fileselect']"), "display", "none");
		}
		if (this.showDropZone === false) {
			css(this.selector.querySelector("div[name='gadgetui-fileuploader-dropzone']"), "display", "none");
		}
		if (this.showUploadIcon === false) {
			let iconSelector = this.selector.querySelector("img[name='gadgetui-fileuploader-uploadIcon']");
			if (iconSelector === null) {
				iconSelector = this.selector.querySelector("svg[name='gadgetui-fileuploader-uploadIcon']");
			}
			css(iconSelector, "display", "none");
		}

		this.renderDropZone();
	}.bind(this);

	renderUploader();
};

FileUploader.prototype.configure = function (options) {
	// may be undefined
	this.message = options.message;
	this.tags = options.tags;
	this.uploadURI = options.uploadURI;
	this.onUploadComplete = options.onUploadComplete;
	this.willGenerateThumbnails = (options.willGenerateThumbnails !== undefined && options.willGenerateThumbnails !== null ? options.willGenerateThumbnails : false);
	this.showUploadButton = (options.showUploadButton !== undefined ? options.showUploadButton : true);
	this.showDropZone = (options.showDropZone !== undefined ? options.showDropZone : true);
	this.uploadIcon = (options.uploadIcon !== undefined ? options.uploadIcon : '/node_modules/feather-icons/dist/feather-sprite.svg#image');
	this.uploadClass = (options.uploadClass !== undefined ? options.uploadClass : "");
	this.showUploadIcon = (options.uploadIcon !== undefined && options.showUploadIcon !== undefined && options.showUploadIcon ? true : false);
	this.addFileMessage = (options.addFileMessage !== undefined ? options.addFileMessage : "Add a File");
	this.dropMessage = (options.dropMessage !== undefined ? options.dropMessage : "Drop Files Here");
	this.uploadErrorMessage = (options.uploadErrorMessage !== undefined ? options.uploadErrorMessage : "Upload error.");
};

FileUploader.prototype.setDimensions = function () {
	var css = gadgetui.util.setStyle;
	var uHeight = gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "height")),
		uWidth = gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "width")),
		dropzone = this.selector.querySelector("div[class='gadgetui-fileuploader-dropzone']"),
		filedisplay = this.selector.querySelector("div[class='gadgetui-fileuploader-filedisplay']"),
		buttons = this.selector.querySelector("div[class~='buttons']");
};

FileUploader.prototype.setEventHandlers = function () {
	this.selector.querySelector("input[name='gadgetui-fileuploader-fileselect']").addEventListener("change", function (evt) {
		var dropzone = this.selector.querySelector("div[name='gadgetui-fileuploader-dropzone']"),
			filedisplay = this.selector.querySelector("div[name='gadgetui-fileuploader-filedisplay']");

		this.processUpload(
			evt,
			evt.target.files,
			dropzone,
			filedisplay
		);
	}.bind(this));
};

FileUploader.prototype.renderDropZone = function () {
	// if we decide to drop files into a drag/drop zone

	var dropzone = this.selector.querySelector("div[name='gadgetui-fileuploader-dropzone']"),
		filedisplay = this.selector.querySelector("div[name='gadgetui-fileuploader-filedisplay']");

	this.selector.addEventListener("dragstart", function (ev) {
		ev.dataTransfer.setData("text", "data");
		ev.dataTransfer.effectAllowed = "copy";
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('dragstart');
		}
	});

	dropzone.addEventListener("dragenter", function (ev) {
		gadgetui.util.addClass(dropzone, "highlighted");

		ev.preventDefault();
		ev.stopPropagation();
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('dragenter');
		}
	});

	dropzone.addEventListener("dragleave", function (ev) {
		ev.stopPropagation();
		ev.preventDefault();
		gadgetui.util.removeClass(dropzone, "highlighted");
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('dragleave');
		}
	});

	dropzone.addEventListener("dragover", function (ev) {
		this.handleDragOver(ev);
		ev.dataTransfer.dropEffect = "copy";
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('dragover');
		}
	}.bind(this));

	dropzone.addEventListener("drop", function (ev) {
		ev.stopPropagation();
		ev.preventDefault();
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('drop');
		}
		this.processUpload(
			ev,
			ev.dataTransfer.files,
			dropzone,
			filedisplay
		);
	}.bind(this));
};

FileUploader.prototype.processUpload = function (event, files, dropzone, filedisplay) {
	var wrappedFile;
	var css = gadgetui.util.setStyle;
	this.uploadingFiles = [];
	css(filedisplay, "display", "inline");

	for (var idx = 0; idx < files.length; idx++) {
		wrappedFile = gadgetui.objects.Constructor(
			gadgetui.display.FileUploadWrapper, [files[idx], filedisplay,
			true
		]);

		this.uploadingFiles.push(wrappedFile);
		wrappedFile.on("uploadComplete", function (fileWrapper) {
			var ix;
			for (ix = 0; ix < this.uploadingFiles.length; ix++) {
				if (this.uploadingFiles[ix].id === fileWrapper.id) {
					this.uploadingFiles.splice(ix, 1);
				}
			}
			if (this.uploadingFiles.length === 0) {
				if (this.showDropZone) this.show("dropzone");
				this.setDimensions();
			}
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('uploadComplete');
			}
		}.bind(this));
	}

	gadgetui.util.removeClass(dropzone, "highlighted");

	this.handleFileSelect(this.uploadingFiles, event);
};

FileUploader.prototype.handleFileSelect = function (wrappedFiles, evt) {
	evt.stopPropagation();
	evt.preventDefault();

	if (this.willGenerateThumbnails) {
		this.generateThumbnails(wrappedFiles);
	} else {
		this.upload(wrappedFiles);
	}
};

FileUploader.prototype.generateThumbnails = function (wrappedFiles) {
	// not going to convert this functionality right now
	this.upload(wrappedFiles);
};

FileUploader.prototype.upload = function (wrappedFiles) {
	var _this = this;
	wrappedFiles.forEach(function (wrappedFile) {
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('uploadStart');
		}
		wrappedFile.progressbar.start();
	});

	this.uploadFile(wrappedFiles);
};

FileUploader.prototype.uploadFile = function (wrappedFiles) {

	var process = function () {
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
			this.uploadChunk(wrappedFiles[j], chunks, 1, parts);
		}
	}.bind(this);
	// process files
	process();
};

FileUploader.prototype.uploadChunk = function (wrappedFile, chunks, filepart, parts) {
	var xhr = new XMLHttpRequest(),
		response,
		tags = this.tags === undefined ? "" : this.tags;

	/*   if (wrappedFile.file.type.substr(0, 5) === "image") {
		tags = "image " + tags;
	  } */

	xhr.onreadystatechange = function () {
		var json;

		if (xhr.readyState === 4) {
			if (parseInt(xhr.status, 10) !== 200) {
				this.handleUploadError(xhr, {}, wrappedFile);
			} else {
				response = xhr.response;

				if (filepart <= parts) {
					wrappedFile.progressbar.updatePercent(
						parseInt(filepart / parts * 100, 10)
					);
				}
				if (filepart < parts) {
					wrappedFile.id = xhr.getResponseHeader("X-Id");

					filepart++;
					this.uploadChunk(
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
						this.handleUploadError(xhr, json, wrappedFile);
					}

					if (json.data !== null && json.data !== undefined) {
						this.handleUploadResponse(json, wrappedFile);
					} else {
						this.handleUploadError(xhr, json, wrappedFile);
					}

				}
			}

		}
	}.bind(this);

	xhr.open("POST", this.uploadURI, true);
	xhr.setRequestHeader("X-Tags", tags);
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

FileUploader.prototype.handleUploadResponse = function (json, wrappedFile) {

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

	if (this.onUploadComplete !== undefined) {
		this.onUploadComplete(fileItem);
	}
};

FileUploader.prototype.handleUploadError = function (xhr, json, wrappedFile) {
	wrappedFile.progressbar.progressbox.innerText = this.uploadErrorMessage;
	wrappedFile.abortUpload(wrappedFile);
};

FileUploader.prototype.show = function (name) {
	var css = gadgetui.util.setStyle;
	var dropzone = this.selector.querySelector("div[class='gadgetui-fileuploader-dropzone']"),
		filedisplay = this.selector.querySelector("div[class='gadgetui-fileuploader-filedisplay']");
	if (name === "dropzone") {
		css(dropzone, "display", "table-cell");
		css(filedisplay, "display", "none");
	} else {
		css(filedisplay, "display", "table-cell");
		css(dropzone, "display", "none");
	}
};

FileUploader.prototype.handleDragOver = function (evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = "copy";
	// Explicitly show this is a copy.
};

//author - Robert Munn <robertdmunn@gmail.com>

//adapted from jQuery UI autocomplete.

function LookupListInput(selector, options) {
	this.selector = selector;
	this.items = [];
	this.config(options);
	this.setIsMultiLine();
	this.addControl();
	this.initSource();
	this.addMenu();
	this.addBindings();
}

LookupListInput.prototype.events = ['change', 'focus', 'mouseenter', 'keyup', 'mouseleave', 'blur', 'click', 'input', 'keypress', 'keydown', 'menuselect', 'mousedown'];

LookupListInput.prototype.addControl = function () {
	this.wrapper = document.createElement("div");
	if (this.width !== undefined) {
		gadgetui.util.setStyle(this.wrapper, "width", this.width);
	}
	gadgetui.util.addClass(this.wrapper, "gadgetui-lookuplist-input");
	this.selector.parentNode.insertBefore(this.wrapper, this.selector);
	this.selector.parentNode.removeChild(this.selector);
	this.wrapper.appendChild(this.selector);
};

LookupListInput.prototype.addMenu = function () {
	var div = document.createElement("div");
	gadgetui.util.addClass(div, "gadgetui-lookuplist-menu");
	gadgetui.util.setStyle(div, "display", "none");

	this.menu = {
		element: div
	};

	this.wrapper.appendChild(this.menu.element);
};

LookupListInput.prototype.initSource = function () {
	var array, url,
		_this = this;
	if (this.datasource.constructor === Array) {
		array = this.datasource;
		this.source = function (request, response) {
			var content = _this.filter(array, request.term);
			response(content);
		};
	} else if (typeof this.datasource === "string") {
		url = this.datasource;
		this.source = function (request, response) {
			if (_this.xhr) {
				_this.xhr.abort();
			}
			_this.xhr = fetch({
				url: url,
				data: request,
				dataType: "json",
				success: function (data) {
					response(data);
				},
				error: function () {
					response([]);
				}
			});
		};
	} else {
		this.source = this.datasource;
	}
};

LookupListInput.prototype.escapeRegex = function (value) {
	return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
};

LookupListInput.prototype._filter = function (array, term) {
	var matcher = new RegExp(this.escapeRegex(term), "i");
	return gadgetui.util.grep(array, function (value) {
		return matcher.test(value.label || value.value || value);
	});
};

LookupListInput.prototype.checkForDuplicate = function (item) {
	var ix, found = false;
	for (ix = 0; ix < this.items.length; ix++) {
		if (this.items[ix].value === item.value) {
			found = true;
			break;
		}
	}
	return found;
};

LookupListInput.prototype.makeUnique = function (content) {
	var ix, results = [];
	for (ix = 0; ix < content.length; ix++) {
		if (!this.checkForDuplicate(content[ix])) {
			results.push(content[ix]);
		}
	}
	return results;
};

LookupListInput.prototype.setIsMultiLine = function () {
	var nodeName = this.selector.nodeName.toLowerCase(),
		isTextarea = nodeName === "textarea",
		isInput = nodeName === "input";

	this.isMultiLine = isTextarea ? true : isInput ? false : this.selector.getAttribute("isContentEditable");
};

LookupListInput.prototype.addBindings = function () {
	var _this = this, suppressKeyPress, suppressKeyPressRepeat, suppressInput, nodeName = this.selector.nodeName.toLowerCase();
	this.isTextarea = nodeName === "textarea";
	this.isInput = nodeName === "input";
	this.wrapper
		.addEventListener("click", function () {
			_this.selector.focus();
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('click');
			}
		});

	this.valueMethod = this.selector[this.isTextarea || this.isInput ? "value" : "innerText"];
	this.isNewMenu = true;

	this.selector.setAttribute("autocomplete", "off");

	this.selector
		.addEventListener("keydown", function (event) {
			if (this.getAttribute("readOnly")) {
				suppressKeyPress = true;
				suppressInput = true;
				suppressKeyPressRepeat = true;
				return;
			}

			suppressKeyPress = false;
			suppressInput = false;
			suppressKeyPressRepeat = false;
			var keyCode = gadgetui.keyCode;
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
					// when menu is open and has focus
					if (_this.menu.active) {
						// #6055 - Opera still allows the keypress to occur
						// which causes forms to submit
						suppressKeyPress = true;
						event.preventDefault();
						_this.menu.select(event);
					}
					break;
				case keyCode.BACKSPACE:
					if (!this.value.length && _this.items.length) {
						var selector = this.previousSibling;
						_this.remove(selector);
					}
					break;
				case keyCode.TAB:
					if (_this.menu.active) {
						_this.menu.select(event);
					}
					break;
				case keyCode.ESCAPE:
					if (_this.menu.element.style.display !== 'none') {
						if (!this.isMultiLine) {
							this._value(this.term);
						}
						this.close(event);
						// Different browsers have different default behavior for escape
						// Single press can mean undo or clear
						// Double press in IE means clear the whole form
						event.preventDefault();
					}
					break;
				default:
					suppressKeyPressRepeat = true;
					// search timeout should be triggered before the input value is changed
					_this._searchTimeout(event);
					break;
			}
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('keydown');
			}
		});

	this.selector
		.addEventListener("keypress", function (event) {
			if (suppressKeyPress) {
				suppressKeyPress = false;
				if (!this.isMultiLine || _this.menu.element.style.display !== 'none') {
					event.preventDefault();
				}
				return;
			}
			if (suppressKeyPressRepeat) {
				return;
			}

			// replicate some key handlers to allow them to repeat in Firefox and Opera
			var keyCode = gadgetui.keyCode;
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
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('keypress');
			}
		});

	this.selector
		.addEventListener("input", function (event) {
			if (suppressInput) {
				suppressInput = false;
				event.preventDefault();
				return;
			}
			_this._searchTimeout(event);
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('input');
			}
		});

	this.selector
		.addEventListener("focus", function (event) {
			this.selectedItem = null;
			this.previous = this.value;
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('focus');
			}
		});

	this.selector
		.addEventListener("blur", function (event) {
			if (this.cancelBlur) {
				delete this.cancelBlur;
				return;
			}

			clearTimeout(this.searching);
			_this.close(event);
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('blur');
			}
		});

	this.select.addEventListener( "change", function( event ){
		_this.fireEvent("change");
	});

	// menu bindings
	this.menu.element.addEventListener("mousedown", function (event) {
		// prevent moving focus out of the text field
		event.preventDefault();

		// IE doesn't prevent moving focus even with event.preventDefault()
		// so we set a flag to know when we should ignore the blur event
		this.cancelBlur = true;
		gadgetui.util.delay(function () {
			delete this.cancelBlur;
		});

		// clicking on the scrollbar causes focus to shift to the body
		// but we can't detect a mouseup or a click immediately afterward
		// so we have to track the next mousedown and close the menu if
		// the user clicks somewhere outside of the autocomplete
		var menuElement = _this.menu.element;
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('mousedown');
		}
	});

	this.menu.element.addEventListener("menuselect", function (event) {
		var item = event.detail,
			previous = _this.previous;

		// only trigger when focus was lost (click on menu)
		if (_this.menu.element !== document.activeElement) {
			_this.menu.element.focus();
			_this.previous = previous;
			// #6109 - IE triggers two focus events and the second
			// is asynchronous, so we need to reset the previous
			// term synchronously and asynchronously :-(
			gadgetui.util.delay(function () {
				_this.previous = previous;
				_this.selectedItem = item;
			});
		}

		//if ( false !== this._trigger( "select", event, { item: item } ) ) {
		_this._value(item.value);
		//}
		// reset the term after the select event
		// this allows custom select handling to work properly
		_this.term = _this._value();

		_this.close(event);
		_this.selectedItem = item;
		if (!_this.checkForDuplicate(item)) {
			_this.add(item);
		} else {

		}
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('menuselect');
		}
	});
};

LookupListInput.prototype._renderItem = function (item) {
	var itemNode, itemWrapper = document.createElement("div");
	gadgetui.util.addClass(itemWrapper, "gadgetui-lookuplist-input-item-wrapper");
	itemNode = document.createElement("div");
	gadgetui.util.addClass(itemNode, "gadgetui-lookuplist-input-item");
	itemNode.innerHTML = this.labelRenderer(item);
	itemWrapper.appendChild(itemNode);
	return itemWrapper;
};

LookupListInput.prototype._renderItemCancel = function (item, wrapper) {
	var css = gadgetui.util.setStyle,
		itemCancel = document.createElement("span"),
		spanLeft = gadgetui.util.getNumberValue(gadgetui.util.getStyle(wrapper, "width"))
			+ 6;  // font-size of icon
	//- 3; // top offset of icon

	gadgetui.util.addClass(itemCancel, "oi");
	itemCancel.setAttribute('data-glyph', "circle-x");
	css(itemCancel, "font-size", 12);
	css(itemCancel, "opacity", ".5");
	css(itemCancel, "left", spanLeft);
	css(itemCancel, "position", "absolute");
	css(itemCancel, "cursor", "pointer");
	css(itemCancel, "top", 3);
	return itemCancel;
};

LookupListInput.prototype.add = function (item) {
	var _this = this,
		prop, list, itemWrapper,
		itemCancel;

	itemWrapper = this.itemRenderer(item);
	itemWrapper.setAttribute("data-value", item.value);
	this.wrapper.insertBefore(itemWrapper, this.selector);
	itemCancel = this.itemCancelRenderer(item, itemWrapper);
	if (itemCancel !== undefined) {
		itemWrapper.appendChild(itemCancel);
		itemCancel.addEventListener("click", function (event) {
			_this.remove(this.parentNode);
		});
	}

	this.selector.value = '';
	this.items.push(item);

	if (this.emitEvents === true) {
		gadgetui.util.trigger(this.selector, "gadgetui-lookuplist-input-add", item);
	}

	if (this.func !== undefined) {
		this.func(item, 'add');
	}
	if (this.model !== undefined) {
		//update the model
		prop = this.selector.getAttribute("gadgetui-bind");
		if (prop !== null && prop !== undefined) {
			list = this.model.get(prop);
			if (typeof list === Array) {
				list = [];
			}
			list.push(item);
			this.model.set(prop, list);
		}
	}
};

LookupListInput.prototype.remove = function (selector) {
	var _this = this, removed, ix, prop, list, value = selector.getAttribute("data-value");

	selector.parentNode.removeChild(selector);
	// remove from internal array
	for (ix = 0; ix < this.items.length; ix++) {
		if (this.items[ix].value === value) {
			removed = this.items.splice(ix, 1);
		}
	}
	if (this.model !== undefined) {
		prop = this.selector.getAttribute("gadgetui-bind");
		if (prop !== null && prop !== undefined) {
			list = this.model.get(prop);
			list.forEach(function (obj, ix) {
				if (obj.value === value) {
					list.splice(ix, 1);
					if (_this.func !== undefined) {
						_this.func(obj, 'remove');
					}
					if (_this.emitEvents === true) {
						gadgetui.util.trigger(_this.selector, "gadgetui-lookuplist-input-remove", obj);
					}
					_this.model.set(prop, list);
					return false;
				}
			});
		}
	}
};

LookupListInput.prototype.reset = function () {

	while (this.wrapper.firstChild && this.wrapper.firstChild !== this.selector) {
		this.wrapper.removeChild(this.wrapper.firstChild);
	}
	this.items = [];
	if (this.model !== undefined) {
		var prop = this.selector.getAttribute("gadgetui-bind");
		this.model.set(prop, []);
	}
};

LookupListInput.prototype.destroy = function () {
	clearTimeout(this.searching);
	this.menu.element.remove();
	this.liveRegion.remove();
};

LookupListInput.prototype._setOption = function (key, value) {
	this._super(key, value);
	if (key === "source") {
		this._initSource();
	}
	if (key === "appendTo") {
		this.menu.element.appendTo(this._appendTo());
	}
	if (key === "disabled" && value && this.xhr) {
		this.xhr.abort();
	}
};

LookupListInput.prototype._appendTo = function () {
	var element = this.options.appendTo;

	if (element) {
		element = element.jquery || element.nodeType ?
			$(element) :
			this.document.find(element).eq(0);
	}

	if (!element || !element[0]) {
		element = this.element.closest(".ui-front");
	}

	if (!element.length) {
		element = this.document[0].body;
	}

	return element;
};

LookupListInput.prototype._searchTimeout = function (event) {
	var _this = this;
	clearTimeout(this.searching);
	this.searching = gadgetui.util.delay(function () {

		// Search if the value has changed, or if the user retypes the same value (see #7434)
		var equalValues = this.term === _this.selector.value,
			menuVisible = _this.menu.element.style.display !== 'none',
			modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

		if (!equalValues || (equalValues && !menuVisible && !modifierKey)) {
			_this.selectedItem = null;
			_this.search(null, event);
		}
	}, this.delay);
};

LookupListInput.prototype.search = function (value, event) {
	var _this = this;
	value = value != null ? value : _this.selector.value;

	// always save the actual value, not the one passed as an argument
	this.term = this._value();

	if (value.length < this.minLength) {
		return this.close(event);
	}

	return this._search(value);
};

LookupListInput.prototype._search = function (value) {
	this.pending++;
	this.cancelSearch = false;

	this.source({ term: value }, this._response());
};

LookupListInput.prototype._response = function () {
	var _this = this,
		index = ++this.requestIndex,
		fn = function (content) {
			_this.__response(content);

			_this.pending--;
			/*	if ( !_this.pending ) {
				this.element.removeClass( "ui-autocomplete-loading" );
			}	*/
		},
		proxy = function () {
			return fn.apply(_this, arguments);
		};
	return proxy;
};

LookupListInput.prototype.__response = function (content) {
	content = this.makeUnique(content);

	if (content && content.length) {
		content = this._normalize(content);
	}
	this.selector.dispatchEvent(new CustomEvent("response", { content: content }));
	if (!this.disabled && content && content.length && !this.cancelSearch) {
		this._suggest(content);
		this.selector.dispatchEvent(new Event("open"));
	} else {
		this._close();
	}
};

LookupListInput.prototype.close = function (event) {
	this.cancelSearch = true;
	this._close(event);
};

LookupListInput.prototype._close = function (event) {
	if (this.menu.element.style.display !== 'none') {
		this.menu.element.style.display = 'none';
		this.menu.element.blur();
		this.isNewMenu = true;
	}
};

LookupListInput.prototype._normalize = function (items) {
	// assume all items have the right format when the first item is complete
	if (items.length && items[0].label && items[0].value) {
		return items;
	}
	return items.map(function (item) {
		if (typeof item === "string") {
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

LookupListInput.prototype._suggest = function (items) {
	var div = this.menu.element;
	while (div.firstChild) {
		div.removeChild(div.firstChild);
	}
	this._renderMenu(items);
	this.isNewMenu = true;

	// size and position menu
	div.style.display = 'block';
	this._resizeMenu();
	this.position.of = this.element;

	/*	if ( this.autoFocus ) {
	//	this.menu.next();
	}	*/
};

LookupListInput.prototype._resizeMenu = function () {
	var div = this.menu.element;
	// don't change it right now
};

LookupListInput.prototype._renderMenu = function (items) {
	var _this = this, ix;
	var maxItems = Math.min(this.maxSuggestions, items.length);
	for (ix = 0; ix < maxItems; ix++) {
		_this._renderItemData(items[ix]);
	}
};

LookupListInput.prototype._renderItemData = function (item) {
	var _this = this,
		menuItem = this.menuItemRenderer(item);

	menuItem.addEventListener("click", function (event) {
		var ev = new CustomEvent("menuselect", { detail: item });
		_this.menu.element.dispatchEvent(ev);
	});
	this.menu.element.appendChild(menuItem);

};

LookupListInput.prototype._renderMenuItem = function (item) {
	var menuItem = document.createElement("div");
	gadgetui.util.addClass(menuItem, "gadgetui-lookuplist-item");
	menuItem.setAttribute("value", item.value);
	menuItem.innerText = this.labelRenderer(item);
	return menuItem;
};

LookupListInput.prototype._renderLabel = function (item) {
	return item.label;
};

LookupListInput.prototype._move = function (direction, event) {
	if (!this.menu.element.style.display !== 'none') {
		this.search(null, event);
		return;
	}
	if (this.menu.element.isFirstItem() && /^previous/.test(direction) ||
		this.menu.element.isLastItem() && /^next/.test(direction)) {

		if (!this.isMultiLine) {
			this._value(this.term);
		}

		this.menu.blur();
		return;
	}
	this.menu[direction](event);
};

LookupListInput.prototype.widget = function () {
	return this.menu.element;
};

LookupListInput.prototype._value = function () {
	return (this.isInput ? this.selector.value : this.selector.innerText);
};

LookupListInput.prototype._keyEvent = function (keyEvent, event) {
	if (!this.isMultiLine || this.menu.element.style.display !== 'none') {
		this._move(keyEvent, event);

		// prevents moving cursor to beginning/end of the text field in some browsers
		event.preventDefault();
	}
};

LookupListInput.prototype.config = function (options) {
	options = (options === undefined ? {} : options);
	// if binding but no model was specified, use gadgetui model
	if (this.selector.getAttribute("gadgetui-bind") !== undefined) {
		this.model = ((options.model === undefined) ? gadgetui.model : options.model);
	}
	this.width = ((options.width === undefined) ? undefined : options.width);
	this.func = ((options.func === undefined) ? undefined : options.func);
	this.filter = ((options.filter === undefined) ? this._filter : options.filter);
	this.labelRenderer = ((options.labelRenderer === undefined) ? this._renderLabel : options.labelRenderer);
	this.itemRenderer = ((options.itemRenderer === undefined) ? this._renderItem : options.itemRenderer);
	this.menuItemRenderer = ((options.menuItemRenderer === undefined) ? this._renderMenuItem : options.menuItemRenderer);
	this.itemCancelRenderer = ((options.itemCancelRenderer === undefined) ? this._renderItemCancel : options.itemCancelRenderer);
	this.emitEvents = ((options.emitEvents === undefined) ? true : options.emitEvents);
	this.datasource = ((options.datasource === undefined) ? ((options.lookupList !== undefined) ? options.lookupList : true) : options.datasource);
	this.minLength = ((options.minLength === undefined) ? 0 : options.minLength);
	this.disabled = ((options.disabled === undefined) ? false : options.disabled);
	this.maxSuggestions = ((options.maxSuggestions === undefined) ? 20 : options.maxSuggestions);
	this.position = (options.position === undefined) ? { my: "left top", at: "left bottom", collision: "none" } : options.position;
	this.autoFocus = ((options.autoFocus === undefined) ? false : options.autoFocus);
	this.requestIndex = 0;
};


function SelectInput(selector, options) {
	this.selector = selector;

	this.config(options);
	this.setSelectOptions();
	this.setInitialValue(options);

	this.addControl();
	this.addCSS();
	var css = gadgetui.util.setStyle;
	if (this.hideable) {
		css(this.selector, "display", "none");
	} else {
		css(this.label, "display", 'none');
		css(this.selector, "display", "inline-block");
	}

	// bind to the model if binding is specified
	gadgetui.util.bind(this.selector, this.model);
	// bind to the model if binding is specified
	gadgetui.util.bind(this.label, this.model);
	this.addBindings();
}

SelectInput.prototype.events = ['change', 'focus', 'mouseenter', 'mouseleave', 'blur'];

SelectInput.prototype.setInitialValue = function (options) {
	this.value = (options.value || { id: this.selector.options[this.selector.selectedIndex || 0].value, text: this.selector.options[this.selector.selectedIndex || 0].innerHTML });
	this.selector.value = this.value.id;
};

SelectInput.prototype.addControl = function () {
	var _this = this;
	this.wrapper = document.createElement("div");
	this.label = document.createElement("div");
	gadgetui.util.addClass(this.wrapper, "gadgetui-selectinput-div");
	gadgetui.util.addClass(this.label, "gadgetui-selectinput-label");
	this.label.setAttribute("gadgetui-bind", this.selector.getAttribute("gadgetui-bind"));
	this.label.innerHTML = this.value.text;
	this.selector.parentNode.insertBefore(this.wrapper, this.selector);
	this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild(this.selector);
	this.wrapper.appendChild(this.selector);
	this.selector.parentNode.insertBefore(this.label, this.selector);
};

SelectInput.prototype.setSelectOptions = function () {
	var _this = this, id, text, option;
	if (this.selector.getAttribute("gadgetui-bind-options") !== null || this.dataProvider !== undefined) {
		while (_this.selector.options.length > 0) {
			_this.selector.remove(0);
		}

		if (this.selector.getAttribute("gadgetui-bind-options") !== null) {
			// use the gadgetui-ui-bind attribute to populate the select box from the model
			var optionsArray = this.model.get(this.selector.getAttribute("gadgetui-bind-options"));
			optionsArray.forEach(function (item) {
				var opt = document.createElement("option");
				if (typeof item === "object") {
					// object containing id, text keys
					opt.value = item.id;
					opt.text = item.text;
				} else {
					// simple values in array
					opt.text = item;
				}

				_this.selector.add(opt);
			});
		} else if (this.dataProvider !== undefined) {
			// use the dataProvider option to populate the select if provided
			this.dataProvider.data.forEach(function (obj) {
				id = obj.id;
				text = obj.text;
				if (text === undefined) {
					text = id;
				}
				option = gadgetui.util.createElement("option");
				option.value = id;
				option.text = text;

				_this.selector.add(option);
			});
		}
	}
};

SelectInput.prototype.addCSS = function () {
	var height,
		parentstyle,
		css = gadgetui.util.setStyle,
		style = gadgetui.util.getStyle(this.selector);

	css(this.selector, "min-width", "100px");
	css(this.selector, "font-size", style.fontSize);

	parentstyle = gadgetui.util.getStyle(this.selector.parentNode);
	height = gadgetui.util.getNumberValue(parentstyle.height) - 2;
	this.label.setAttribute("style", "");
	css(this.label, "padding-top", "2px");
	css(this.label, "height", height + "px");
	css(this.label, "margin-left", "9px");

	if (navigator.userAgent.match(/Edge/)) {
		css(this.selector, "margin-left", "5px");
	} else if (navigator.userAgent.match(/MSIE/)) {
		css(this.selector, "margin-top", "0px");
		css(this.selector, "margin-left", "5px");
	}
};

SelectInput.prototype.addBindings = function () {
	var _this = this,
		css = gadgetui.util.setStyle;

	if (this.hideable) {
		this.label
			.addEventListener(this.activate, function (event) {
				css(_this.label, "display", 'none');
				css(_this.selector, "display", "inline-block");
				event.preventDefault();
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent(_this.activate);
				}
			});

		this.selector
			.addEventListener("blur", function (ev) {
				//setTimeout( function() {
				css(_this.label, "display", "inline-block");
				css(_this.selector, "display", 'none');
				//}, 100 );
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('blur');
				}
			});
	}

	this.selector
		.addEventListener("change", function (ev) {
			setTimeout(function () {
				var value = ev.target.value,
					label = ev.target[ev.target.selectedIndex].innerHTML;

				if (value.trim().length === 0) {
					value = 0;
				}

				_this.label.innerText = label;
				if (_this.model !== undefined && _this.selector.getAttribute("gadgetui-bind") === undefined) {
					// if we have specified a model but no data binding, change the model value
					_this.model.set(this.name, { id: value, text: label });
				}

				if (_this.emitEvents === true) {
					gadgetui.util.trigger(_this.selector, "gadgetui-input-change", { id: value, text: label });
				}
				if (_this.func !== undefined) {
					_this.func({ id: value, text: label });
				}
				_this.value = { id: value, text: label };
			}, 100);
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('change');
			}
		});

	if (this.hideable) {
		this.selector
			.addEventListener("mouseleave", function () {
				if (_this.selector !== document.activeElement) {
					css(_this.label, "display", 'inline-block');
					css(_this.selector, "display", 'none');
				}
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('mouseleave');
				}
			});
	}
};

SelectInput.prototype.config = function (options) {
	options = (options === undefined ? {} : options);
	this.model = ((options.model === undefined) ? undefined : options.model);
	this.dataProvider = ((options.dataProvider === undefined) ? undefined : options.dataProvider);
	this.func = ((options.func === undefined) ? undefined : options.func);
	this.emitEvents = ((options.emitEvents === undefined) ? true : options.emitEvents);
	this.activate = ((options.activate === undefined) ? "mouseenter" : options.activate);
	this.hideable = options.hideable || false;
};

function TextInput(selector, options) {
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;

	this.config(options);

	this.setInitialValue();
	this.addControl();
	this.setLineHeight();
	this.setFont();
	//this.setMaxWidth();
	this.setWidth();
	this.addCSS();
	// bind to the model if binding is specified
	gadgetui.util.bind(this.selector, this.model);
	this.addBindings();
}

TextInput.prototype.events = ['change', 'focus', 'mouseenter', 'keyup', 'mouseleave', 'blur'];

TextInput.prototype.addControl = function () {
	if (this.hideable) {
		this.blockSize = gadgetui.util.getStyle(this.selector, "block-size");
		gadgetui.util.setStyle(this.selector, 'block-size', this.blockSize);
		this.selector.classList.add(this.browserHideBorderCSS);
	}
};

TextInput.prototype.setInitialValue = function () {
	var val = this.selector.value,
		ph = this.selector.getAttribute("placeholder");

	if (val.length === 0) {
		if (ph !== null && ph !== undefined && ph.length > 0) {
			val = ph;
		} else {
			val = " ... ";
		}
	}
	this.value = val;
};

TextInput.prototype.setLineHeight = function () {
	var lineHeight = this.selector.offsetHeight;
	this.lineHeight = lineHeight;
};

TextInput.prototype.setFont = function () {
	var style = gadgetui.util.getStyle(this.selector),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
	this.font = font;
};

TextInput.prototype.setWidth = function () {
	this.width = gadgetui.util.textWidth(this.selector.value, this.font) + 10;
	if (this.width === 10) {
		this.width = this.maxWidth;
	}
};

TextInput.prototype.addCSS = function () {
	var style = gadgetui.util.getStyle(this.selector),
		css = gadgetui.util.setStyle;
	// add CSS classes
	gadgetui.util.addClass(this.selector, "gadgetui-textinput");

	if (this.maxWidth > 10 && this.enforceMaxWidth === true) {
		css(this.selector, "max-width", this.maxWidth);
	}
};

TextInput.prototype.setControlWidth = function (text) {
	var textWidth = parseInt(gadgetui.util.textWidth(text, this.font), 10),
		css = gadgetui.util.setStyle;
	if (textWidth < this.minWidth) {
		textWidth = this.minWidth;
	}
	css(this.selector, "width", (textWidth + 30) + "px");
};

TextInput.prototype.addBindings = function () {
	var _this = this;

	this.selector
		.addEventListener("mouseenter", function (event) {
			event.preventDefault();
			if (_this.hideable) {
				this.classList.remove(_this.browserHideBorderCSS);
			}
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('mouseenter');
			}
		});
	this.selector
		.addEventListener("focus", function (event) {
			event.preventDefault();
			if (_this.hideable) {
				this.classList.remove(_this.browserHideBorderCSS);
			}
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('focus');
			}
		});
	this.selector
		.addEventListener("keyup", function (event) {
			if (parseInt(event.keyCode, 10) === 13) {
				this.blur();
			}
			_this.setControlWidth(this.value);
			if (typeof _this.fireEvent === 'function') {
				_this.fireEvent('keyup');
			}
		});
	this.selector
		.addEventListener("change", function (event) {
			setTimeout(function () {
				var value = event.target.value, style, txtWidth;
				if (value.length === 0 && _this.selector.getAttribute("placeholder") !== undefined) {
					value = _this.selector.getAttribute("placeholder");
				}

				txtWidth = gadgetui.util.textWidth(value, _this.font);

				if (_this.maxWidth < txtWidth) {
					value = gadgetui.util.fitText(value, _this.font, _this.maxWidth);
				}
				if (_this.model !== undefined && _this.selector.getAttribute("gadgetui-bind") === undefined) {
					// if we have specified a model but no data binding, change the model value
					_this.model.set(_this.selector.name, event.target.value);
				}

				if (_this.emitEvents === true) {
					gadgetui.util.trigger(_this.selector, "gadgetui-input-change", { text: event.target.value });
				}

				if (_this.func !== undefined) {
					_this.func({ text: event.target.value });
				}
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('change');
				}
			}, 200);
		});

	if (this.hideable) {
		this.selector
			//.removeEventListener( "mouseleave" )
			.addEventListener("mouseleave", function () {
				var css = gadgetui.util.setStyle;
				if (this !== document.activeElement) {

					this.classList.add(_this.browserHideBorderCSS);
				}
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('mouseleave');
				}
			});
		this.selector
			.addEventListener("blur", function () {
				var css = gadgetui.util.setStyle;
				css(_this.selector, "maxWidth", _this.maxWidth);
				this.classList.add(_this.browserHideBorderCSS);
				if (typeof _this.fireEvent === 'function') {
					_this.fireEvent('blur');
				}
				//css( _this.label, "maxWidth", _this.maxWidth );
			});
	}
};

TextInput.prototype.config = function (options) {
	options = (options === undefined ? {} : options);
	this.borderColor = ((options.borderColor === undefined) ? "#d0d0d0" : options.borderColor);
	this.useActive = ((options.useActive === undefined) ? false : options.useActive);
	this.model = ((options.model === undefined) ? this.model : options.model);
	this.func = ((options.func === undefined) ? undefined : options.func);
	this.emitEvents = ((options.emitEvents === undefined) ? true : options.emitEvents);
	this.activate = ((options.activate === undefined) ? "mouseenter" : options.activate);
	this.delay = ((options.delay === undefined) ? 10 : options.delay);
	this.minWidth = ((options.minWidth === undefined) ? 100 : options.minWidth);
	this.enforceMaxWidth = (options.enforceMaxWidth === undefined ? false : options.enforceMaxWidth);
	this.hideable = options.hideable || false;
	this.maxWidth = options.maxWidth || gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector.parentNode).width);
	let browser = gadgetui.util.checkBrowser();
	this.browserHideBorderCSS = "gadget-ui-textinput-hideBorder-" + browser;
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

//# sourceMappingURL=gadget-ui.js.map