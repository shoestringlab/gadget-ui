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

	BindableObject.prototype.handleEvent = function( e ) {
		var that = this;
		switch (e.type) {
			case "change":
				$.each( this.elements, function( i, value ) {
					if( e.target.name === value.prop ){
						that.change( e.target.value, value.prop );
					}
				} );
				break;
		}
	};

	// for each bound control, update the value
	BindableObject.prototype.change = function( value, property ) {
		var that = this, n;

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

		// this code changes the value of the DOM element to the incoming value
		$.each( this.elements, function( i, obj ) {
			if ( obj.prop.length === 0 && typeof value !== 'object' ) {
				// BindableObject holds a simple value
				// make sure the incoming value is a simple value
				// set the DOM element value to the incoming value
				obj.elem.val( value );
			}
			else if ( property !== undefined && typeof value === 'object' && obj.prop === property ) {
				// incoming value is an object
				// this code sets the value of each control bound to the BindableObject
				// to the correspondingly bound property of the incoming value
				obj.elem.val( value[ property.prop ] );
			}
			else if ( property !== undefined && typeof value !== 'object' ) {
				// this is an update coming from the control to the BindableObject
				// no need to update the control, it already holds the correct value
				return true;
			}
			else if ( typeof value === 'object' && obj.prop === property ) {
				// property is not defined, meaning an object that has
				// properties bound to controls has been replaced
				// this code assumes that the object in 'value' has a property
				// associated with the property being changed
				// i.e. that value[ obj.prop ] is a valid property of
				// value, because if it isn't, this call will error
				obj.elem.val( value[ obj.prop ] );
			}
			else {
				console.log( "No change conditions met for " + obj + " to change." );
				// skip the rest of this iteration of the loop
				return true;
			}
			//var event = new Event('change');
			obj.elem.trigger("change");
		} );
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
			var n = name.split( "." );
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
					_model[ name ].change( value );
				}
				else {
					_model[ n[ 0 ] ].change( value, n[1] );
				}
			}
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
		arrowOffset = this.borderWidth + this.borderRadius + this.arrowSize;
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

	function CollapsiblePane( args ){
		var self = this, wrapper, header;
		self.selector = args.selector;
		if( args.config !== undefined ){
			self.config( args.config );
		}
		
		$( self.selector ).wrap( '<div class="gadget-ui-collapsiblePane ui-corner-all ui-widget-content"></div>');
		wrapper = $( self.selector ).parent();
		//copy width from selector
		wrapper.css( "width", self.width );
		
		//now make the width of the selector to fill the wrapper
		$( self.selector )
			.css( "width", self.interiorWidth )
			.css( "padding", self.padding );
		wrapper.prepend( '<div class="ui-widget-header ui-corner-all gadget-ui-collapsiblePane-header">' + self.title + '<div class="ui-icon ui-icon-triangle-1-n"></div></div>');
		header = $( "div.gadget-ui-collapsiblePane-header", wrapper );
		self.icon = $( "div div", wrapper );
		header.on( "click", function(){
				self.toggle();
			});
		if( self.collapse === true ){
			self.toggle();
		}
	}

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

function FloatingPane( args ){

	this.selector = args.selector;
	if( args.config !== undefined ){
		this.config( args.config );
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
	
	

function LookupListInput( selector, args ){
	function _renderLabel( item ){
		return item.label;
	};
	this.itemRenderer = _renderLabel;
	this.menuItemRenderer = _renderLabel;
	this.emitEvents = true;
	
	this.selector = selector;
	
	if( args.config !== undefined ){
		this.config( args.config );
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


function SelectInput( args ){
	var self = this, val, o;
	self.emitEvents = true;
	self.model = gadgetui.model;
	self.func;

	el = this.setElements( args.el );

	if( el.length === 1 && args.object !== undefined ){
		o = args.object;
	}

	if( args.config !== undefined ){
		self.config( args.config );
	}

	$.each( el,  function( index, selector ){
		val = self.setInitialValue( selector );

		// bind to the model if binding is specified
		gadgetui.util.bind( selector, self.model );

		self.addControl( selector, val );
		self.addCSS( selector );
		$( selector ).hide();
		
		self.addBindings( $( selector ).parent(), o  );
	});

	return this;
}

SelectInput.prototype.setElements = function( el ){
	if( el === undefined ){
		el = $( "select[gadgetui-selectinput='true']", document );
	}
	return el;
};


SelectInput.prototype.setInitialValue = function( selector ){
	var val = $( selector ).val(),
		ph = $( selector ).attr( "placeholder" );

	if( val.length === 0 ){
		if( ph !== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}
	return val;
};

SelectInput.prototype.addControl = function( selector, val ){
	$( selector ).wrap( "<div class='gadgetui-selectinput-div'></div>");
	$( selector ).parent().prepend( "<div class='gadgetui-selectinput-label'>" + val + "</div>");
};

SelectInput.prototype.addCSS = function( selector ){
	var height, 
		parentstyle,
		span = $( "div[class='gadgetui-selectinput-label']", $( selector ).parent() );

	$( selector )
		.css( "border", "0px 2px" )
		.css( "min-width", "10em" )
		.css( "font-size", "1em" );

	//style = window.getComputedStyle( $( selector )[0] );
	parentstyle = window.getComputedStyle( $( selector ).parent()[0] );
	height = gadgetui.util.getNumberValue( parentstyle.height ) - 2;
	span
		.css( "padding-top", "2px" )
		.css( "height", height )
		.css( "margin-left", "9px");

};

SelectInput.prototype.addBindings = function( selector, object ) {
	var self = this, oVar,
		span = $( "div[class='gadgetui-selectinput-label']", $( selector ) ),
		select = $( "select", selector );

	oVar = ( (object === undefined) ? {} : object );

	span
		.off( this.activate )
		.on( this.activate, function( ) {
			$( this ).hide();
			
			select.css( "display", "inline-block" );
		});

	$( selector )
		.off( "change" )
		.on( "change", function( e ) {
			var value = e.target.value;
			if( value.trim().length === 0 ){
				value = " ... ";
			}
			oVar.isDirty = true;
			span
				.text( value );
		});

	select
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

					span
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
				span
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

	selector
		.off( "mouseleave" )
		.on( "mouseleave", function( ) {
			if ( select.is( ":focus" ) === false ) {
				span
					.css( "display", "inline-block" );
				select
					.hide( );
			}
		});
	
/*		function detectLeftButton(event) {
	    if ('buttons' in event) {
	        return event.buttons === 1;
	    } else if ('which' in event) {
	        return event.which === 1;
	    } else {
	        return event.button === 1;
	    }
	}	*/

	function detectLeftButton(evt) {
	    evt = evt || window.event;
	    var button = evt.which || evt.button;
	    return button == 1;
	}
	
	document.onmouseup = function( event ){
		var isLeftClick = detectLeftButton( event );
		if( isLeftClick === true ){
			if ( select.is( ":focus" ) === false ) {
				span
					.css( "display", "inline-block" );
				select
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
};
	

function TextInput( args ){
	var self = this, val, o, lineHeight;
	self.emitEvents = true;
	self.model = gadgetui.model;
	self.func;

	self.setElements( args.el );
	
	if( self.el.length === 1 && args.object !== undefined ){
		o = args.object;
	}

	if( args.config === undefined ){
		args.config = {};
	}
	self.config( args.config );
	
	$.each( self.el,  function( index, input ){
		// bind to the model if binding is specified
		gadgetui.util.bind( input, self.model );

		val = self.setInitialValue( input );
		self.addClass( input );
		self.addControl( input, val );
		lineHeight = self.setLineHeight( input );
		self.setWidth( input, val );
		self.addCSS( input, lineHeight );

		self.addBindings( $( input ), o );
	});

	return this;
}

TextInput.prototype.addBindings = function( input, object ){

	var self = this, oVar, 
		obj = $( input ).parent(),
		labeldiv = $( "div[class='gadgetui-inputlabel']", obj ),
		label = $( "input", labeldiv ),
		font = obj.css( "font-size" ) + " " + obj.css( "font-family" );
	oVar = ( (object === undefined) ? {} : object );

	input
		.off( "mouseleave" )
		.on( "mouseleave", function( ) {
			if( input.is( ":focus" ) === false ) {
				labeldiv.css( "display", "block" );
				input.hide();
				$( "input", $( obj ).parent() )
					.css( "max-width",  self.maxWidth );					
			}
		});		

	label
		.off( self.activate )
		.on( self.activate, function( ) {
			
			// both input and label
			labeldiv.hide();
			
			$( "input", obj )
				.css( "max-width",  "" )
				.css( "min-width", "10em" )
				.css( "width", $.gadgetui.textWidth( input.val(), font ) + 10 );

			//just input
			input.css( "display", "block" );
				
			// if we are only showing the input on click, focus on the element immediately
			if( self.activate === "click" ){
				input.focus();
			}
		});
	input
		.off( "focus" )
		.on( "focus", function(e){
			e.preventDefault();
		});
	input
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

				label.css( "display", "block" );
				labeldiv.css( "display", "block" );
				//$( "img", $( self ).parent( ) ).hide( );

				$( "input", $( obj ).parent() )
					.css( "max-width",  self.maxWidth );
				
				$( it ).hide( );
	
			}, 200 );
		});
	input
		.off( "keyup" )
		.on( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				$( this ).blur( );
			}
			$( "input", obj )
				.css( "width", $.gadgetui.textWidth( input.val(), font ) + 10 );
		});
	input
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

TextInput.prototype.addClass = function( input ){
	$( input )
		.addClass( "gadgetui-textinput" );
};

TextInput.prototype.setInitialValue = function( input ){

	var val = $( input ).val(),	
		ph = $( input ).attr( "placeholder" );

	if( val.length === 0 ){
		if( ph !== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}

	return val;
};

TextInput.prototype.addControl = function( input, val ){
	$( input ).wrap( "<div class='gadgetui-textinput-div'></div>");
	$( input ).parent().prepend( "<div class='gadgetui-inputlabel'><input type='text' class='gadgetui-inputlabelinput' readonly='true' style='border:0;background:none;' value='" + val + "'></div>");
	$( input ).hide();	
};

TextInput.prototype.setLineHeight = function( input ){
	var lineHeight = $( input ).outerHeight();
	// minimum height
	if( lineHeight > 20 ){
		$( input ).parent()
			.css( "min-height", lineHeight );
		// add min height to label div as well so label/input isn't offset vertically
		$( "div[class='gadgetui-inputlabel']", $( input ).parent() )
			.css( "min-height", lineHeight );
	}
};

TextInput.prototype.setWidth = function( input, val ){
	var style = window.getComputedStyle( $( input )[0] ),
		parentStyle = window.getComputedStyle( $( input ).parent().parent()[0] ),
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant,
		width = $.gadgetui.textWidth( $( input ).val(), font ) + 10,
		maxWidth = parentStyle.width; parseInt( parentStyle.width.substring( 0, parentStyle.width.length - 2 ), 10 );
	
	if( this.borderColor === undefined ){
		this.borderColor = style.borderBottomColor;
	}
		
	if( maxWidth > 10 && this.enforceMaxWidth === true ){
		$( "input", $( input ).parent() )
			.css( "max-width", maxWidth );
		this.maxWidth = maxWidth;
		if( width === 10 ){
			width = maxWidth;
		}
		if( maxWidth < width ){
			$( "input[class='gadgetui-inputlabelinput']", $( input ).parent() )
				.val( $.gadgetui.fitText( val ), font, maxWidth );
		}
	}
	if( maxWidth > width ){
		width = maxWidth;
	}	
};

TextInput.prototype.addCSS = function( input, lineHeight ){
	
	$( "input[class='gadgetui-inputlabelinput']", $( input ).parent()  )
		.css( "font-size", window.getComputedStyle( $( input )[0] ).fontSize )
		.css( "padding-left", "4px" )
		.css( "border", "1px solid transparent" );

	$( "div[class='gadgetui-inputlabel']", $( input ).parent() )
		.css( "height", lineHeight )
		
		.css( "font-size", $( input ).css( "font-size" ) )
		.css( "display", "block" );	
	
	$( input )
		.css( "padding-left", "4px" )
		.css( "border", "1px solid " + this.borderColor );
};

TextInput.prototype.setElements = function( el ){

	if( el === undefined ){
		el = $( "input[gadgetui-textinput='true']", document );
	}
	this.el = el;
};

TextInput.prototype.config = function( args ){
	var self = this;
	self.borderColor =  (( args.borderColor === undefined) ? self.borderColor : args.borderColor );
	self.model =  (( args.model === undefined) ? self.model : args.model );
	self.func = (( args.func === undefined) ? undefined : args.func );
	self.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	self.activate = (( args.activate === undefined) ? "mouseenter" : args.activate );
	self.enforceMaxWidth = ( args.enforceMaxWidth === undefined ? false : args.enforceMaxWidth );
};

	return{
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
		}
		
	};
} ());	