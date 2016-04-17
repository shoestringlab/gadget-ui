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

FloatingPane.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.title = ( options.title === undefined ? "": options.title );
	this.path = ( options.path === undefined ? "/bower_components/gadget-ui/dist/": options.path );
	this.position = ( options.position === undefined ? { my: "right top", at: "right top", of: window } : options.position );
	this.padding = ( options.padding === undefined ? "15px": options.padding );
	this.paddingTop = ( options.paddingTop === undefined ? ".3em": options.paddingTop );
	this.width = ( options.width === undefined ? gadgetui.util.getStyle( this.selector, "width" ) : options.width );
	this.minWidth = ( this.title.length > 0 ? Math.max( 100, this.title.length * 10 ) + 20 : 100 );

	this.height = ( options.height === undefined ? gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector, "height" ) ) + ( gadgetui.util.getNumberValue( this.padding ) * 2 ) : options.height );
	this.interiorWidth = ( options.interiorWidth === undefined ? "": options.interiorWidth );
	this.opacity = ( ( options.opacity === undefined ? 1 : options.opacity ) );
	this.zIndex = ( ( options.zIndex === undefined ? 100000 : options.zIndex ) );
	this.minimized = false;
	this.relativeOffsetLeft = 0;
	this.borderColor = ( options.borderColor === undefined ? "silver": options.borderColor );
	this.headerColor = ( options.headerColor === undefined ? "black": options.headerColor );
	this.headerBackgroundColor = ( options.headerBackgroundColor === undefined ? "silver": options.headerBackgroundColor );
	this.borderRadius = ( options.borderRadius === undefined ? 6 : options.borderRadius );	
};
