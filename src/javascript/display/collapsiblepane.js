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
