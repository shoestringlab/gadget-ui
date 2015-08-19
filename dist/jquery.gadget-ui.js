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

Bubble.prototype.config = function( options ){
	var baseUIColor = getStyleRuleValue( "color", ".ui-state-active" );
	this.bubbleType = ( options.bubbleType === undefined ? "speech" : options.bubbleType );
	this.name = ( options.name === undefined ? "bubble" : options.name );
	this.height = ( options.height === undefined ? 100 : options.height );
	this.position = ( options.position === undefined ? "top right" : options.position ); // position of arrow tip on selector - top right | bottom right | top center | bottom center | top left | bottom left
	this.width = ( options.width === undefined ? 200 : options.width ); // width of bubble
	this.padding = ( options.padding === undefined ? 20 : options.padding ); // interior padding of bubble
	this.opacity = ( options.opacity === undefined ? 1 : options.opacity ); // interior padding of bubble
	// baseline position
	this.top = this.selector.offset().top;
	this.left = this.selector.offset().left;

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
	this.lineHeight = ( options.lineHeight === undefined ? 20 : options.lineHeight ); // line height of text in bubble
	this.borderRadius = ( options.borderRadius === undefined ? 30 : options.borderRadius );	//border-radius
	this.boxShadowColor = ( options.boxShadowColor === undefined ? baseUIColor : options.boxShadowColor );
	this.font = ( options.font === undefined ? "Arial sans" : options.font );
	this.zIndex = ( options.zIndex === undefined ? 100 : options.zIndex );
	this.closable = ( options.closable === undefined ? false : options.closable );
	this.autoClose = ( options.autoClose === undefined ? false : options.autoClose );
	this.autoCloseDelay = ( options.autoCloseDelay === undefined ? 5000 : options.autoCloseDelay );
};

Bubble.prototype.render = function(){
	var str =  '<p class="gadgetui_bubble_' + this.bubbleType + '" name="' + this.name + '">' + this.message;
	if( this.closable ){
		str = str + '<span class="ui-icon ui-icon-close"></span>';
	}
	str = str + '</p>';

	this.selector
		.before( str );
};

Bubble.prototype.show = function(){
	this.bubbleSelector.show( "fade", 500 );
};

Bubble.prototype.setStyles = function(){

	this.setBubbleStyles();
	
	this.calculateArrowPosition();

	this.calculateArrowStyle();

	this.setBeforeRules();
	
	this.setAfterRules();
	
	this.calculatePosition();
	
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
	this.bubbleSelector = $( "p[name='" + this.name + "']", this.selector.parent() );

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

	addRule( "p[name='" + this.name + "']:before", rules );	
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

	addRule( "p[name='" + this.name + "']:after", rules );

};

Bubble.prototype.calculatePosition = function(){
	var self = this;

	$.each(  this.position.split( " " ), function( ix, ele ){
			switch( ele ){
			case "top":
				//self.top =  self.top - self.selector.outerHeight();
				break;
			case "bottom":
				self.top =  self.top + self.selector.outerHeight();
				break;
			case "left":

				break;
			case "right":
				self.left = self.left + self.selector.outerWidth();
				break;
			case "center":
				self.left = self.left + self.selector.outerWidth() / 2;
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
			break;
		case "right":
			this.beforeArrowLeft = this.width + doublePadding;
			this.afterArrowLeft = this.beforeArrowLeft;
			this.left = this.left - this.bubbleWidth - this.arrowSize + this.borderWidth;
			break;
		case "top":
			this.arrowTop = -( doubleArrow );
			this.afterArrowTop = -( this.afterArrowSize * 2 );			
			this.top = this.top + this.arrowSize - this.borderWidth;
			break;
		case "bottom":

			this.arrowTop = this.height + doublePadding;
			this.afterArrowTop = this.arrowTop;
			this.top = this.top - this.bubbleHeight - this.arrowSize + this.borderWidth;
			break;
	}

	switch( this.arrowPositionArray[1] ){
		case "top":
			this.arrowTop = this.borderRadius;
			this.afterArrowTop = this.arrowTop + afterArrowCenter;
			this.top = this.top - arrowOffset;
			break;
		case "bottom":

			this.arrowTop = this.bubbleHeight - this.borderWidth * 2 - doubleArrow - this.borderRadius;
			this.afterArrowTop = this.arrowTop + afterArrowCenter;
			this.top = this.top - this.bubbleHeight + arrowOffset;
			break;
		case "right":
			this.beforeArrowLeft = this.bubbleWidth - this.borderWidth * 2 - doubleArrow - this.borderRadius;
			this.afterArrowLeft = this.beforeArrowLeft + afterArrowOffset;
			this.left = this.left - this.bubbleWidth + arrowOffset;
			break;
		case "left":
			this.beforeArrowLeft = this.borderRadius;
			this.afterArrowLeft = this.beforeArrowLeft + afterArrowOffset;
			this.left = this.left - arrowOffset;
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
		console.log( this.beforeBorderColor );
		console.log( this.afterBorderColor );
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
		var self = this, header;
		self.selector = args.selector;
		if( args.config !== undefined ){
			self.config( args.config );
		}
		
		$( self.selector ).wrap( '<div class="gadget-ui-floatingPane ui-corner-all ui-widget-content"></div>');
		self.wrapper = $( self.selector ).parent();
		//copy width from selector
		self.wrapper.css( "width", self.width )
				.css( "minWidth", self.minWidth )
				.css( "opacity", self.opacity )
				.css( "z-index", self.zIndex );

		//now make the width of the selector to fill the wrapper
		$( self.selector )
			.css( "width", self.interiorWidth )
			.css( "padding", self.padding );

		self.wrapper.prepend( '<div class="ui-widget-header ui-corner-all gadget-ui-floatingPane-header">' + self.title + '<div class="ui-icon ui-icon-arrow-4"></div></div>');
		header = $( "div.gadget-ui-floatingPane-header", self.wrapper );

		// jquery-ui draggable
		self.wrapper.draggable( {addClasses: false } );

		self.maxmin = $( "div div[class~='ui-icon']", self.wrapper );
		
		self.maxmin.on("click", function(){
			if( self.minimized ){
				self.expand();
			}else{
				self.minimize();
			}
		});
		
		self.maxmin
			.css( "float", "right" )
			.css( "display", "inline" );	
	}

	FloatingPane.prototype.config = function( args ){
		this.title = ( args.title === undefined ? "": args.title );
		this.path = ( args.path === undefined ? "/bower_components/gadget-ui/dist/": args.path );
		this.position = ( args.position === undefined ? { my: "right top", at: "right top", of: window } : args.position );
		this.padding = ( args.padding === undefined ? ".5em": args.padding );
		this.paddingTop = ( args.paddingTop === undefined ? ".3em": args.paddingTop );
		this.width = ( args.width === undefined ? $( this.selector ).css( "width" ) : args.width );
		this.minWidth = ( this.title.length > 0 ? Math.max( 100, this.title.length * 10 ) : 100 );

		this.height = ( args.height === undefined ? $( this.selector ).css( "height" ) : args.height );
		this.interiorWidth = ( args.interiorWidth === undefined ? "100%": args.interiorWidth );
		this.opacity = ( ( args.opacity === undefined ? 1 : args.opacity ) );
		this.zIndex = ( ( args.zIndex === undefined ? 100000 : args.zIndex ) );
		this.minimized = false;
	};
	
	FloatingPane.prototype.expand = function(){
		var self = this, offset = $( this.wrapper).offset();
		var l =  parseInt( new Number( offset.left ), 10 );
		var width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );
		
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
		var self = this, offset = $( this.wrapper).offset();
		var l =  parseInt( new Number( offset.left ), 10 );
		var width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );

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
	
	/*	FloatingPane.prototype.toggle = function( img ){
		var self = this, icon = ( ( self.selector.css( "display" ) === "none" ) ? "collapse" : "expand" );
		self.eventName = ( ( self.eventName === undefined || self.eventName === "collapse" ) ? "expand" : "collapse" );
		self.selector
			.css( "padding", self.padding )
			.css( "padding-top", self.paddingTop )
			.toggle( 'blind', {}, 200, function(  ) {
				$( img ).attr( "src", self.path + "img/" + icon + ".png");
				$( this ).css( "padding", self.padding );
				self.selector.trigger( self.eventName );
			});
	};	*/



	return{
		Bubble : Bubble,
		CollapsiblePane: CollapsiblePane,
		FloatingPane: FloatingPane
	};
}(jQuery));
gadgetui.input = (function($) {
	
	var _bindToModel = function( obj, model ){
		var bindVar = $( obj ).attr( "gadgetui-bind" );
		// if binding was specified, make it so
		if( bindVar !== undefined && model !== undefined ){
			model.bind( bindVar, $( obj ) );
		}
	};

	

function LookupListInput( args ){
	var self = this, index, obj;

	_renderLabel = function( item ){
		return item.label;
	};

	this.itemRenderer = _renderLabel;
	this.menuItemRenderer = _renderLabel;
	this.lookupList;
	this.emitEvents = true;
	this.model;

	if( args.el === undefined ){
		this.el = $( "input[gadgetui-lookuplist-input='true']", document );
	}else{
		this.el = args.el;
	}
	if( args.config !== undefined ){
		self.config( args.config );
	}
	$.each( this.el,  function( index, obj ){
		val = $( obj ).val();
		// bind to the model if binding is specified
		_bindToModel( obj, self.model );

		$( obj ).wrap( '<div class="gadgetui-lookuplistinput-div ui-widget-content ui-corner-all"></div>');

		_bind( obj, self );

	});

	function _bind( obj, component ){
		var self = component;
		
		$( obj ).parent()
			.on( "click", function(){
				$( obj ).focus();
			})
			.on( "click", "div[class~='gadgetui-lookuplist-input-cancel']", function(e){
				self.remove( obj, $( e.target ).attr( "gadgetui-lookuplist-input-value" ) );
			});
		
		$( obj )
			.autocomplete( {
				minLength : self.minLength,
				source : function( request, response ) {
					response( $.ui.autocomplete.filter( self.lookupList, gadgetui.util.extractLast( request.term ) ) );
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
	
					self.add( this, ui.item );
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
}

LookupListInput.prototype.add = function( el, item ){
	var prop, list, title;
	title =  item.title || "" ;
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

	var self = this, i, obj, prop, list;

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
	var self = this;
	self.model =  (( args.model === undefined) ? self.model : args.model );
	self.func = (( args.func === undefined) ? undefined : args.func );
	self.itemRenderer = (( args.itemRenderer === undefined) ? self.itemRenderer : args.itemRenderer );
	self.menuItemRenderer = (( args.menuItemRenderer === undefined) ? self.menuItemRenderer : args.menuItemRenderer );
	self.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	self.lookupList = (( args.lookupList === undefined) ? true : args.lookupList );
	self.minLength = (( args.minLength === undefined) ? 0 : args.minLength );
	return self;
};


function SelectInput( args ){
	var self = this, val, ph, o;
	self.emitEvents = true;
	self.model;
	self.func;

	if( args.el === undefined ){
		el = $( "select[gadgetui-selectinput='true']", document );
	}else{
		el = args.el;
	}

	if( el.length === 1 && args.object !== undefined ){
		o = args.object;
	}
	if( args.config !== undefined ){
		self.config( args.config );
	}
	$.each( el,  function( index, obj ){
		val = $( obj ).val();
		ph = $( obj ).attr( "placeholder" );
		// bind to the model if binding is specified
		_bindToModel( obj, self.model );

		if( val.length === 0 ){
			if( ph !== undefined && ph.length > 0 ){
				val = ph;
			}else{
				val = " ... ";
			}
		}
		$( obj ).wrap( "<div class='gadgetui-selectinput-div'></div>");
		$( obj ).parent().prepend( "<span>" + val + "</span>");
		$( obj ).hide();

		_bindSelectInput( $( obj ).parent(), self, o  );

	});

	function _bindSelectInput( obj, slctInput, object ) {
		var self = this, oVar,
			span = $( "span", $( obj ) ),
			select = $( "select", obj );
		oVar = ( (object === undefined) ? {} : object );
		
		span
			.on( slctInput.activate, function( ) {
				self = this;
				$( self ).hide( );
				
				select
					.css( "min-width", "10em" )
					.css( "display", "inline" );
			});

		$( obj )			
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
			//.css( "min-width", "10em" )
			.on( "blur", function( ) {
				var self = this, newVal;
				setTimeout( function( ) {
					newVal = $( self ).val( );
					if ( oVar.isDirty === true ) {
						if( newVal.trim().length === 0 ){
							newVal = " ... ";
						}
						oVar[ self.name ] = $( self ).val( );
	
						span
							.text( newVal );
						if( slctInput.model !== undefined && $( self ).attr( "gadgetui-bind" ) === undefined ){	
							// if we have specified a model but no data binding, change the model value
							slctInput.model.set( self.name, oVar[ self.name ] );
						}
	
						oVar.isDirty = false;
						if( emitEvents === true ){
							$( self )
								.trigger( "gadgetui-input-change", [ oVar ] );
						}
						if( slctInput.func !== undefined ){
							slctInput.func( oVar );
						}
					}
					span
						.css( "display", "inline" );
					$( self ).hide( );
				}, 100 );
			})
		
			.on( "keyup", function( event ) {
				var self = this;
				if ( parseInt( event.keyCode, 10 ) === 13 ) {
					$( self ).blur( );
				}
			});

		obj
			.on( "mouseleave", function( ) {
				if ( select.is( ":focus" ) === false ) {
					span
						.css( "display", "inline" );
					select
						.hide( );
				}
			});
	}
	return this;
}


SelectInput.prototype.config = function( args ){
	var self = this;
	self.model =  (( args.model === undefined) ? self.model : args.model );
	self.func = (( args.func === undefined) ? undefined : args.func );
	self.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	self.activate = (( args.activate === undefined) ? "mouseenter" : args.activate );
	return self;
};
	

function TextInput( args ){
	var self = this, val, ph, o, bindVar, lineHeight, minHeight, maxWidth, width, borderSize, paddingLeft, input, style, parentStyle, font;
	self.emitEvents = true;
	self.model;
	self.func;

	if( args.el === undefined ){
		el = $( "input[gadgetui-textinput='true']", document );
	}else{
		el = args.el;
	}

	if( el.length === 1 && args.object !== undefined ){
		o = args.object;
	}

	if( args.config !== undefined ){
		self.config( args.config );
	}

	$.each( el,  function( index, input ){
		// bind to the model if binding is specified
		_bindToModel( input, self.model );

		val = $( input ).val();
		ph = $( input ).attr( "placeholder" );
		$( input )
			.addClass( "gadgetui-textinput" );

		if( val.length === 0 ){
			if( ph !== undefined && ph.length > 0 ){
				val = ph;
			}else{
				val = " ... ";
			}
		}
		
		$( input ).wrap( "<div class='gadgetui-textinput-div'></div>");
		$( input ).parent().prepend( "<div class='gadgetui-inputlabel'><input type='text' class='gadgetui-inputlabelinput' readonly='true' style='border:0;background:none;' value='" + val + "'></div>");
		$( input ).hide();

		lineHeight = $( input ).outerHeight();
		// minimum height
		if( lineHeight > 20 ){
			$( input ).parent()
				.css( "min-height", lineHeight );
		}

		style = window.getComputedStyle( $( input )[0] );
		parentStyle = window.getComputedStyle( $( input ).parent().parent()[0] );
		font = style.fontFamily + " " + style.fontSize + " " + style.fontWeight + " " + style.fontVariant;
		width = $.gadgetui.textWidth( $( input ).val(), font ) + 10;
		//maxWidth = $( input ).parent().width();
		maxWidth = parentStyle.width;
		maxWidth = parseInt( maxWidth.substring( 0, maxWidth.length - 2 ), 10 );
		//console.log( val + ": " + "width: " + width + " maxWidth: " + maxWidth );
		
		if( maxWidth > 10 && self.enforceMaxWidth === true ){
			$( "input", $( input ).parent() )
				.css( "max-width", maxWidth );
			self.maxWidth = maxWidth;
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

		//input = $( "input[class!='gadgetui-inputlabelinput']", $( obj ).parent() );
		//font = $( input ).css( "font-size" ) + " " + $( input ).css( "font-family" );
		$( "input[class='gadgetui-inputlabelinput']", $( input ).parent()  )
			.css( "font-size", style.fontSize )
			//.css( "width", width )
			.css( "border", "1px solid transparent" );

		$( "div[class='gadgetui-inputlabel']", $( input ).parent() )
			.css( "height", lineHeight )
			.css( "padding-left", "2px" )
			.css( "font-size", $( input ).css( "font-size" ) )
			.css( "display", "block" );

		_bindTextInput( $( input ), self, o );
		//console.log( "rendered input" );
	});

	function _bindTextInput( input, txtInput, object ) {
		var self = this, oVar, 
			obj = $( input ).parent(),
			labeldiv = $( "div[class='gadgetui-inputlabel']", obj ),
			label = $( "input", labeldiv ),
			//input = $( "input[class~='gadgetui-textinput']", obj ),
			span = $( "span", obj ),
			font = obj.css( "font-size" ) + " " + obj.css( "font-family" );
		oVar = ( (object === undefined) ? {} : object );

		obj
			.off( "mouseleave" )
			.on( "mouseleave", function( ) {
				if( input.is( ":focus" ) === false ) {
					labeldiv.css( "display", "block" );
					input.hide( );
					//
					$( "input", $( obj ).parent() )
						.css( "max-width",  txtInput.maxWidth );					
				}
			});		

		labeldiv
			.off( txtInput.activate )
			.on( txtInput.activate, function( ) {
				self = this;
				$( self ).hide();
				
				// both input and label
				
				$( "input", obj )
					.css( "max-width",  "" )
					.css( "min-width", "10em" )
					.css( "width", $.gadgetui.textWidth( input.val(), font ) + 10 );

				//just input
				input.css( "display", "block" );
					
				// if we are only showing the input on click, focus on the element immediately
				if( txtInput.activate === "click" ){
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
				var self = this, newVal, txtWidth, labelText;
				setTimeout( function( ) {
					newVal = $( self ).val( );
					if ( oVar.isDirty === true ) {
						if( newVal.length === 0 && $( self ).attr( "placeholder" ) !== undefined ){
							newVal = $( self ).attr( "placeholder" );
						}
						oVar[ self.name ] = $( self ).val( );
						
						txtWidth = $.gadgetui.textWidth( newVal, font );
						if( txtInput.maxWidth < txtWidth ){
							labelText = $.gadgetui.fitText( newVal, font, txtInput.maxWidth );
						}else{
							labelText = newVal;
						}
						label.val( labelText );
						//span.text( newVal );
						if( txtInput.model !== undefined && $( self ).attr( "gadgetui-bind" ) === undefined ){	
							// if we have specified a model but no data binding, change the model value
							txtInput.model.set( self.name, oVar[ self.name ] );
						}
		
						oVar.isDirty = false;
						if( txtInput.emitEvents === true ){
							$( self ).trigger( "gadgetui-input-change", [ oVar ] );
						}
						if( txtInput.func !== undefined ){
							txtInput.func( oVar );
						}
					}

					label.css( "display", "block" );
					labeldiv.css( "display", "block" );
					//$( "img", $( self ).parent( ) ).hide( );

					$( "input", $( obj ).parent() )
						.css( "max-width",  txtInput.maxWidth );
					
					$( self ).hide( );
		
				}, 200 );
			});
		input
			.off( "keyup" )
			.on( "keyup", function( event ) {
				var self = this;
				if ( parseInt( event.keyCode, 10 ) === 13 ) {
					$( self ).blur( );
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
	}
	return this;
}

TextInput.prototype.config = function( args ){
	var self = this;
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
		}
	};
} ());	