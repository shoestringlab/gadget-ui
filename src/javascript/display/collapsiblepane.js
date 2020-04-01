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

CollapsiblePane.prototype.events = ['minimized','maximized'];


CollapsiblePane.prototype.addControl = function(){
	var pane = document.createElement( "div" );


	if( this.class ){
		gadgetui.util.addClass( pane, this.class );
	}
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

	gadgetui.util.addClass( header, "gadget-ui-collapsiblePane-header" );
	if( this.headerClass ){
		gadgetui.util.addClass( header, this.headerClass );
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
	this.newEventName = ( this.collapsed ? "minimized" : "maximized" );
	var ev = new Event( this.eventName );
	this.selector.dispatchEvent( ev );

	if( typeof Velocity != 'undefined' && this.animate ){

		Velocity( this.wrapper, {
			height: myHeight
		},{ queue: false, duration: _this.delay, complete: function() {
			//_this.icon.setAttribute( "data-glyph", icon );
			}
		});
		Velocity( this.selector, {
			height: selectorHeight
		},{ queue: false, duration: _this.delay, complete: function() {
			if( typeof _this.fireEvent === 'function' ){
				_this.fireEvent( _this.newEventName );
			}
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
	this.delay = ( ( options.delay === undefined ? 300 : options.delay ) );
	this.title = ( options.title === undefined ? "": options.title );
	this.width = gadgetui.util.getStyle( this.selector, "width" );
	this.collapse = ( ( options.collapse === undefined ? false : options.collapse ) );
	this.collapsed = ( ( options.collapse === undefined ? true :!  options.collapse ) );
	this.class = ( ( options.class === undefined ? false : options.class ) );
	this.headerClass = ( ( options.headerClass === undefined ? false : options.headerClass ) );
};
