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
					if( ev.target.name === obj.prop ){
						//select box binding
						if( ev.target.type.match( /select/ ) ){
							this.change( { 	value : $( ev.target ).val(), 
									key : $( ev.target ).find('option:selected').text() 
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
		var e;

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
		element[ 0 ].addEventListener( "change", this, false );
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

}( jQuery ) );


$.gadgetui = {};

$.gadgetui.textWidth = function(text, font) {
	// http://stackoverflow.com/questions/1582534/calculating-text-width-with-jquery
	// based on edsioufi's solution
    if (!$.gadgetui.textWidth.fakeEl) $.gadgetui.textWidth.fakeEl = $('<span id="gadgetui-textWidth">').appendTo(document.body);
    
    var width, htmlText = text || $.fn.val() || $.fn.text();
    htmlText = $.gadgetui.textWidth.fakeEl.text(htmlText).html(); //encode to Html
    htmlText = htmlText.replace(/\s/g, "&nbsp;"); //replace trailing and leading spaces
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
	var str =  '<div class="gadgetui_bubble_' + this.bubbleType + '" id="' + this.id + '">' + this.message;
	if( this.closable ){
		str = str + '<span class="ui-icon ui-icon-close"></span>';
	}
	str = str + '</div>';

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

	$( "#" + this.id + ":before" ).addRule( rules, 0 );
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

	$( "#" + this.id + ":after" ).addRule( rules, 0 );	
};

Bubble.prototype.calculatePosition = function(){
	var self = this;
	// Here we must walk up the DOM to the ancestors of the selector to see whether they are set to position: relative. If that is the case,
	// we must add the offset values of the ancestor to the position values for the control or it will not be correctly placed.
	this.relativeOffset = gadgetui.util.getRelativeParentOffset( this.selector );

	$.each(  this.position.split( " " ), function( ix, ele ){
			switch( ele ){
			case "top":
				self.top =  self.top - self.relativeOffset.top;
				break;
			case "bottom":
				self.top =  self.top + self.selector.outerHeight() - self.relativeOffset.top;
				//console.log( "self.top + self.selector.outerHeight() " + self.selector.outerHeight() );
				break;
			case "left":

				break;
			case "right":
				self.left = self.left + self.selector.outerWidth() - self.relativeOffset.left;
				//console.log( "self.left + self.selector.outerWidth() - self.relativeOffset.left " + self.selector.outerWidth() );
				break;
			case "center":
				self.left = self.left + self.selector.outerWidth() / 2  - self.relativeOffset.left;
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
	var self = this;
	$( "span", this.bubbleSelector )
		.on( "click", function(){
			self.bubbleSelector.hide( "fade", 500 ).remove();
		});

	if( this.autoClose ){
		closeBubble = function(){
			self.bubbleSelector.hide( 'fade', 500 ).remove();
		};
		setTimeout( "closeBubble()", this.autoCloseDelay );
	}
};

Bubble.prototype.config = function( options ){
	var baseUIColor = getStyleRuleValue( "color", ".ui-state-active" );
	this.bubbleType = ( options.bubbleType === undefined ? "speech" : options.bubbleType );
	this.id = "gadgetui_bubble_" + gadgetui.util.Id();
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
	var self = this, header = $( "div.gadget-ui-collapsiblePane-header", this.wrapper );
	header
		.on( "click", function(){
			self.toggle();
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
	var self = this, add, remove, expandClass = "ui-icon-triangle-1-s", collapseClass = "ui-icon-triangle-1-n";
	if( self.selector.css( "display" ) === "none" ){
		add = collapseClass;
		remove = expandClass;
	}else{
		add = expandClass;
		remove = collapseClass;			
	}
	
	self.eventName = ( ( self.eventName === undefined || self.eventName === "collapse" ) ? "expand" : "collapse" );
	self.selector
		.css( "padding", self.padding )
		.css( "padding-top", self.paddingTop )
		.toggle( 'blind', {}, 200, function(  ) {
			$( self.icon ).addClass( add )
						.removeClass( remove );
			$( this ).css( "padding", self.padding );
			self.selector.trigger( self.eventName );
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

	// now set height to computed height of control that has been created
	this.height = window.getComputedStyle( $( this.selector ).parent()[0] ).height;

	this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset( this.selector ).left;
	this.addBindings();
}

FloatingPane.prototype.addBindings = function(){
	var self = this;
	// jquery-ui draggable
	this.wrapper.draggable( {addClasses: false } );
	
	this.maxmin.on( "click", function(){
		if( self.minimized ){
			self.expand();
		}else{
			self.minimize();
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

	this.height = ( args.height === undefined ? gadgetui.util.getNumberValue( window.getComputedStyle( $( this.selector )[0] ).height ) + ( gadgetui.util.getNumberValue( this.padding ) * 2 ) : args.height );
	this.interiorWidth = ( args.interiorWidth === undefined ? "": args.interiorWidth );
	this.opacity = ( ( args.opacity === undefined ? 1 : args.opacity ) );
	this.zIndex = ( ( args.zIndex === undefined ? 100000 : args.zIndex ) );
	this.minimized = false;
	this.relativeOffsetLeft = 0;
};

FloatingPane.prototype.expand = function(){
	// when minimizing and expanding, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position
	
	var self = this, 
		offset = $( this.wrapper).offset(),
		l =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );
	
	
	
	this.wrapper.animate({
		left: l - width + self.minWidth,
	},{queue: false, duration: 500}, function() {
		// Animation complete.
	});

	this.wrapper.animate({
		width: this.width,
	},{queue: false, duration: 500}, function() {
		// Animation complete.
	});

	this.wrapper.animate({
		height: this.height,
	},{queue: false, duration: 500, complete: function() {
		self.maxmin
		.removeClass( "ui-icon-arrow-4-diag" )
		.addClass( "ui-icon-arrow-4" );
	}
	});

	this.minimized = false;
};

FloatingPane.prototype.minimize = function(){
	// when minimizing and maximizing, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position
	
	var self = this, offset = $( this.wrapper).offset(),
		l =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );

	this.wrapper.animate({
		left: l + width - self.minWidth,
	},{queue: false, duration: 500}, function() {

	});

	this.wrapper.animate({
		width: self.minWidth,
	},{queue: false, duration: 500, complete: function() {
		self.maxmin
		.removeClass( "ui-icon-arrow-4" )
		.addClass( "ui-icon-arrow-4-diag" );
		}
	});

	this.wrapper.animate({
		height: "50px",
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
	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	this.addControl();

	this.setCSS();
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
	this.input = $( "input[class='gadgetui-combobox-input']", this.combobox );
	this.label = $( "div[class='gadgetui-combobox-label']", this.comboBox );
	this.inputWrapper = $( "div[class='gadgetui-combobox-inputwrapper']", this.comboBox );
	this.selectWrapper = $( "div[class='gadgetui-combobox-selectwrapper']", this.comboBox );
	this.comboBox.css( "opacity", ".0" );
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
		})
		.catch( function( message ){
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
		styles = window.getComputedStyle( this.selector[0] ),
		wrapperStyles = window.getComputedStyle( this.selectWrapper[0] ),
		inputWidth = this.selector[0].clientWidth,
		inputWidthAdjusted,
		inputLeftOffset = 0,
		selectMarginTop = 0,
		selectLeftPadding = 0,
		leftOffset = 0,
		inputWrapperTop = this.borderWidth,
		leftPosition;

	leftPosition = this.borderWidth + 4;

	if( this.borderRadius > 5 ){
		selectLeftPadding = this.borderRadius - 5;
		leftPosition = leftPosition + selectLeftPadding;
	}
	
	inputWidthAdjusted = inputWidth - this.arrowWidth - this.borderRadius - 4;

	if( navigator.userAgent.match( /(Safari)/ ) && !navigator.userAgent.match( /(Chrome)/ )){
		inputWrapperTop = this.borderWidth - 2;
		selectLeftPadding = (selectLeftPadding < 4 ) ? 4 : this.borderRadius - 1;
		selectMarginTop = 1;
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
		.css( "margin-left",  leftPosition )
		.css( "width", inputWidthAdjusted );

	this.label
		.css( "position", "absolute" )
		.css( "left", leftPosition )
		.css( "top", this.borderWidth + 1 )
		.css( "margin-left", 0 );

	this.selectWrapper
		.css( "display", "inline" )
		.css( "position", "absolute" )
		.css( "padding-bottom", "1px" );

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
		rules = {
				'background-image': 'url(' + this.arrowIcon + ')',
				'background-repeat': 'no-repeat',
				'background-position': 'right center'
				};
		
		if( this.scaleIconHeight === true ){
			rules['background-size'] = this.arrowWidth + "px " + inputHeight + "px";
		}
		this.selectWrapper
			.addRule( rules, 0 );
	}

	rules = {
		'-webkit-appearance': 'none',
		'-moz-appearance': 'window',
		'background-image': 'url(' + this.arrowIcon + ')',
		'background-repeat': 'no-repeat',
		'background-position': 'right center'
	};
	
	if( this.scaleIconHeight === true ){
		rules['background-size'] = this.arrowWidth + "px " + inputHeight + "px";
	}
	this.selector
		.addRule( rules, 0 );
	
	this.inputWrapper.hide();
	this.selectWrapper.hide();
	this.comboBox.css( "opacity", "1" );
};

ComboBox.prototype.setSelectOptions = function(){
	var self = this, id, text;

	$( self.selector )
		.empty();
	console.log( "append new option" );
	$( self.selector )
		.append( "<option value='" + self.newOption.id + "'>" + self.newOption.text + "</option>" );

	$.each( this.dataProvider.data, function( ix, obj ){
		id = obj.id;
		text = obj.text;
		if( text === undefined ){ 
			text = id; 
		}
		console.log( "append " + text );
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
					self.label.hide();
					self.selectWrapper.css( "display", "inline" );
		
					if( self.selector.prop('selectedIndex') <= 0 ) {
						self.inputWrapper.css( "display", "inline" );
					}
					self.selector
						.css( "display", "inline" );
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
			if ( event.keyCode === 13 ) {
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
			console.log( "select change");

			if( event.target.selectedIndex > 0 ){
				self.inputWrapper.hide();
				self.setValue( event.target[ event.target.selectedIndex ].value );
			}else{
				self.inputWrapper.show();
				self.setValue( self.newOption.value );
				self.input.focus();
			}
			console.log( "label:" + self.label.text() );
		})

		.on( "blur", function( event ) {
			console.log( "select blur ");
			event.stopPropagation();
			setTimeout( function( ) {
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
				// trigger save event if we're triggering events 
				if( this.emitEvents === true ){
					this.selector.trigger( "save", text );
				}
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
			}
		    return func;
		};
	}
};

ComboBox.prototype.setStartingValues = function(){
	( this.dataProvider.data === undefined ) ? this.dataProvider.refresh() : this.setControls();
};

ComboBox.prototype.setControls = function(){
	this.setSelectOptions();
	this.setValue( this.id );	
	this.triggerSelectChange();
};

ComboBox.prototype.setValue = function( id ){
	var text = this.getText( id );
	console.log( "text:" + text );
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
	
	gadgetui.util.bind( this.selector, this.model );
	$( this.selector ).wrap( '<div class="gadgetui-lookuplistinput-div ui-widget-content ui-corner-all"></div>' );
	this.addBindings();
}

LookupListInput.prototype.addBindings = function(){
	var self = this;
	
	$( this.selector ).parent()
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
		$( "div[class~='gadgetui-lookuplist-input-cancel']", $( el ).parent() ).last().attr( "title", item.title );
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
		list.push( item );
		this.model.set( prop, list );
	}
};

LookupListInput.prototype.remove = function( el, value ){
	$( "div[gadgetui-lookuplist-input-value='" + value + "']", $( el ).parent() ).parent().remove();

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
	$( ".gadgetui-lookuplist-input-item-wrapper", $(  this.el ).parent() ).empty();

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


function SelectInput( selector, options ){
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;

	if( options !== undefined ){
		this.config( options );
	}

	this.setInitialValue();

	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );

	this.addControl();
	this.addCSS();
	$( this.selector ).hide();
	
	this.addBindings();
}

SelectInput.prototype.setInitialValue = function(){
	var val = $( this.selector ).val(),
		ph = $( this.selector ).attr( "placeholder" );

	if( val.length === 0 ){
		if( ph !== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}
	this.value = val;
};

SelectInput.prototype.addControl = function(){
	$( this.selector ).wrap( "<div class='gadgetui-selectinput-div'></div>");
	$( this.selector ).parent().prepend( "<div class='gadgetui-selectinput-label'>" + this.value + "</div>");
};

SelectInput.prototype.addCSS = function(){
	var height, 
		parentstyle,
		label = $( "div[class='gadgetui-selectinput-label']", $( this.selector ).parent() );

	$( this.selector )
		.css( "border", "0px 2px" )
		.css( "min-width", "10em" )
		.css( "font-size", "1em" );

	//style = window.getComputedStyle( $( selector )[0] );
	parentstyle = window.getComputedStyle( $( this.selector ).parent()[0] );
	height = gadgetui.util.getNumberValue( parentstyle.height ) - 2;
	label
		.css( "padding-top", "2px" )
		.css( "height", height )
		.css( "margin-left", "9px");

};

SelectInput.prototype.addBindings = function() {
	var self = this, 
		oVar,
		control = $( this.selector ).parent(),
		label = $( "div[class='gadgetui-selectinput-label']", control );

	oVar = ( (this.o === undefined) ? {} : this.o );

	label
		.off( this.activate )
		.on( this.activate, function( ) {
			$( this ).hide();
			
			$( self.selector ).css( "display", "inline-block" );
		});

	control
		.off( "change" )
		.on( "change", function( e ) {
			var value = e.target.value;
			if( value.trim().length === 0 ){
				value = " ... ";
			}
			oVar.isDirty = true;
			label
				.text( value );
		});

	$( this.selector )
		.off( "blur" )
		//.css( "min-width", "10em" )
		.on( "blur", function( ) {
			var newVal;
			setTimeout( function() {
				newVal = $( this ).val( );
				if ( oVar.isDirty === true ) {
					if( newVal.trim().length === 0 ){
						newVal = " ... ";
					}
					oVar[ this.name ] = $( this ).val( );

					label
						.text( newVal );
					if( self.model !== undefined && $( this ).attr( "gadgetui-bind" ) === undefined ){	
						// if we have specified a model but no data binding, change the model value
						self.model.set( this.name, oVar[ this.name ] );
					}

					oVar.isDirty = false;
					if( self.emitEvents === true ){
						$( this )
							.trigger( "gadgetui-input-change", [ oVar ] );
					}
					if( self.func !== undefined ){
						self.func( oVar );
					}
				}
				label
					.css( "display", "inline-block" );
				$( this ).hide( );
			}, 100 );
		})
		.off( "keyup" )
		.on( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				$( this ).blur( );
			}
		});

	control
		.off( "mouseleave" )
		.on( "mouseleave", function( ) {
			if ( $( self.selector ).is( ":focus" ) === false ) {
				label
					.css( "display", "inline-block" );
				$( self.selector )
					.hide( );
			}
		});

	function detectLeftButton(evt) {
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
	};
};

SelectInput.prototype.config = function( options ){
	this.model =  (( options.model === undefined) ? this.model : options.model );
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.activate = (( options.activate === undefined) ? "mouseenter" : options.activate );

	if( options.object !== undefined ){
		this.o = options.object;
	}
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
	this.addClass();
	this.addControl();
	this.setLineHeight();
	this.setFont();
	this.setMaxWidth();
	this.setWidth();
	this.addCSS();

	this.addBindings();
}

TextInput.prototype.addBindings = function(){
	var self = this, oVar, 
		obj = $( this.selector ).parent(),
		labeldiv = $( "div[class='gadgetui-inputlabel']", obj ),
		label = $( "input", labeldiv ),
		font = obj.css( "font-size" ) + " " + obj.css( "font-family" );
	oVar = ( (this.object === undefined) ? {} : this.object );

	$( this.selector )
		.off( "mouseleave" )
		.on( "mouseleave", function( ) {
			if( $( this ).is( ":focus" ) === false ) {
				labeldiv.css( "display", "block" );
				$( this ).hide();
				$( "input", $( obj ).parent() )
					.css( "max-width",  self.maxWidth );					
			}
		});		

	label
		.off( self.activate )
		.on( self.activate, function( ) {
			if( self.useActive && ( label.attr( "data-active" ) === "false" || label.attr( "data-active" ) === undefined ) ){
				label.attr( "data-active", "true" );
			}else{
				setTimeout( 
					function(){
					if( label.is( ":hover" ) === true ) {
						// both input and label
						labeldiv.hide();
	
						$( "input", obj )
							.css( "max-width",  "" )
							.css( "min-width", "10em" )
							.css( "width", $.gadgetui.textWidth( $( self.selector ).val(), font ) + 10 );
			
						//just input
						$( self.selector ).css( "display", "block" );
							
						// if we are only showing the input on click, focus on the element immediately
						if( self.activate === "click" ){
							$( self.selector ).focus();
						}
						if( self.emitEvents === true ){
							// raise an event that the input is active
							$( self.selector ).trigger( "gadgetui-input-show", self.selector );
						}
					}}, self.delay );
			}
		});
	$( this.selector )
		.off( "focus" )
		.on( "focus", function(e){
			e.preventDefault();
		});
	$( this.selector )
		.off( "blur" )
		.on( "blur", function( ) {
			var it = this, newVal, txtWidth, labelText;
			setTimeout( function( ) {
				newVal = $( it ).val( );
				if ( oVar.isDirty === true ) {
					if( newVal.length === 0 && $( it ).attr( "placeholder" ) !== undefined ){
						newVal = $( it ).attr( "placeholder" );
					}
					oVar[ it.name ] = $( it ).val( );
					
					txtWidth = $.gadgetui.textWidth( newVal, font );
					if( self.maxWidth < txtWidth ){
						labelText = $.gadgetui.fitText( newVal, font, self.maxWidth );
					}else{
						labelText = newVal;
					}
					label.val( labelText );
					if( self.model !== undefined && $( it ).attr( "gadgetui-bind" ) === undefined ){	
						// if we have specified a model but no data binding, change the model value
						self.model.set( it.name, oVar[ it.name ] );
					}
	
					oVar.isDirty = false;
					if( self.emitEvents === true ){
						$( it ).trigger( "gadgetui-input-change", [ oVar ] );
					}
					if( self.func !== undefined ){
						self.func( oVar );
					}
				}
				$( it ).hide( );
				label.css( "display", "block" );
				labeldiv.css( "display", "block" );
				label.attr( "data-active", "false" );
				//$( "img", $( self ).parent( ) ).hide( );

				$( "input", $( obj ).parent() )
					.css( "max-width",  self.maxWidth );
				
				
				if( self.emitEvents === true ){
					$( it ).trigger( "gadgetui-input-hide", it );
				}	
			}, 200 );
		});
	$( this.selector )
		.off( "keyup" )
		.on( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				$( this ).blur( );
			}
			$( "input", obj )
				.css( "width", $.gadgetui.textWidth( $( this ).val(), font ) + 10 );
		});
	$( this.selector )
		.off( "change" )
		.on( "change", function( e ) {
			var value = e.target.value;
			if( value.trim().length === 0 ){
				value = " ... ";
			}
			oVar.isDirty = true;
			label.val( value );
			});
};

TextInput.prototype.addClass = function(){
	$( this.selector )
		.addClass( "gadgetui-textinput" );
};

TextInput.prototype.setInitialValue = function(){
	var val = $( this.selector ).val(),
		ph = $( this.selector ).attr( "placeholder" );

	if( val.length === 0 ){
		if( ph !== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}

	this.value = val;
};

TextInput.prototype.addControl = function(){
	$( this.selector ).wrap( "<div class='gadgetui-textinput-div'></div>");
	$( this.selector ).parent().prepend( "<div class='gadgetui-inputlabel'><input type='text' data-active='false' class='gadgetui-inputlabelinput' readonly='true' style='border:0;background:none;' value='" + this.value + "'></div>");
	$( this.selector ).hide();	
};

TextInput.prototype.setLineHeight = function(){
	var lineHeight = $( this.selector ).outerHeight();
	// minimum height
	if( lineHeight > 20 ){
		$( this.selector ).parent()
			.css( "min-height", lineHeight );
		// add min height to label div as well so label/input isn't offset vertically
		$( "div[class='gadgetui-inputlabel']", $( this.selector ).parent() )
			.css( "min-height", lineHeight );
	}
	this.lineHeight = lineHeight;
};

TextInput.prototype.setFont = function(){
	var style = window.getComputedStyle( $( this.selector )[0] ),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
		this.font = font;
};

TextInput.prototype.setWidth = function(){
	this.width = $.gadgetui.textWidth( $( this.selector ).val(), this.font ) + 10;
	if( this.width === 10 ){
		this.width = this.maxWidth;
	}
};

TextInput.prototype.setMaxWidth = function(){
	var parentStyle = window.getComputedStyle( $( this.selector ).parent().parent()[0] );
	this.maxWidth = gadgetui.util.getNumberValue( parentStyle.width );
};

TextInput.prototype.addCSS = function(){
	$( "input[class='gadgetui-inputlabelinput']", $( this.selector ).parent()  )
		.css( "font-size", window.getComputedStyle( $( this.selector )[0] ).fontSize )
		.css( "padding-left", "4px" )
		.css( "border", "1px solid transparent" )
		.css( "width", this.width );

	$( "div[class='gadgetui-inputlabel']", $( this.selector ).parent() )
		.css( "height", this.lineHeight )
		
		.css( "font-size", $( this.selector ).css( "font-size" ) )
		.css( "display", "block" );	
	
	$( this.selector )
		.css( "padding-left", "4px" )
		.css( "border", "1px solid " + this.borderColor );

	if( this.maxWidth > 10 && this.enforceMaxWidth === true ){
		$( "input", $( this.selector ).parent() )
			.css( "max-width", this.maxWidth );

		if( this.maxWidth < this.width ){
			$( "input[class='gadgetui-inputlabelinput']", $( this.selector ).parent() )
				.val( $.gadgetui.fitText( this.value ), this.font, this.maxWidth );
		}
	}
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
	this.enforceMaxWidth = ( args.enforceMaxWidth === undefined ? false : args.enforceMaxWidth );
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

		getRelativeParentOffset: function( selector ){
			var i,
				parents = selector.parentsUntil( "body" ),
				relativeOffsetLeft = 0,
				relativeOffsetTop = 0;

			for( i = 0; i < parents.length; i++ ){
				if( $( parents[ i ] ).css( "position" ) === "relative" ){
					// set the largest offset values of the ancestors
					if( $( parents[ i ] ).offset().left > relativeOffsetLeft ){
						relativeOffsetLeft = $( parents[ i ] ).offset().left;
					}
					
					if( $( parents[ i ] ).offset().top > relativeOffsetTop ){
						relativeOffsetTop = $( parents[ i ] ).offset().top;
					}
				}
			}
			return { left: relativeOffsetLeft, top: relativeOffsetTop };
		},
		Id: function(){
			return ( (Math.random() * 100).toString() ).replace(  /\./g, "" );
		},
		bind : function( selector, model ){
			var bindVar = $( selector ).attr( "gadgetui-bind" );
			// if binding was specified, make it so
			if( bindVar !== undefined && model !== undefined ){
				model.bind( bindVar, $( selector ) );
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
		}
		
	};
} ());	