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
