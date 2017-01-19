function FloatingPane( selector, options ){

	this.selector = selector;
	if( options !== undefined ){
		this.config( options );
	}
	
	this.addControl();
	this.addHeader();
	this.maxmin = this.wrapper.querySelector( "div.oi" );
	
	this.addCSS();

	// now set height to computed height of control _this has been created
	this.height = gadgetui.util.getStyle( this.wrapper, "height" );

	this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset( this.selector ).left;
	this.addBindings();
}

FloatingPane.prototype.addBindings = function(){
	var _this = this;

	var dragger = gadgetui.util.draggable( this.wrapper );

	this.maxmin.addEventListener( "click", function(){
		if( _this.minimized ){
			_this.expand();
		}else{
			_this.minimize();
		}
	});
};

FloatingPane.prototype.addHeader = function(){
	var css = gadgetui.util.setStyle;
	this.header = document.createElement( "div" );
	this.header.innerHTML = this.title;
	gadgetui.util.addClass( this.header, 'gadget-ui-floatingPane-header' );
	//this.header.setAttribute( "style",
	css( this.header, "padding",  "2px 0px 2px .5em" );
	css( this.header, "text-align",  "left" );
	css( this.header, "border-radius", this.borderRadius );
	css( this.header, "border",  "1px solid "  + this.borderColor );
	css( this.header, "background", this.headerBackgroundColor );
	css( this.header, "color",  this.headerColor );
	css( this.header, "font-weight",  "bold" );
	css( this.header, "font",  this.font );

	this.icon = document.createElement( "div" );
	gadgetui.util.addClass( this.icon, "oi" );
	this.header.insertBefore( this.icon, undefined );
	this.wrapper.insertBefore( this.header, this.selector );
	this.icon.setAttribute( 'data-glyph', "fullscreen-exit" );
	this.header.appendChild( this.icon );	
};

FloatingPane.prototype.addCSS = function(){
	var css = gadgetui.util.setStyle;
	//copy width from selector
	css( this.wrapper, "width",  this.width );
	css( this.wrapper, "border",  "1px solid "  + this.borderColor );
	css( this.wrapper, "border-radius", this.borderRadius );
	css( this.wrapper, "min-width", this.minWidth );
	css( this.wrapper, "opacity", this.opacity );
	css( this.wrapper, "z-index", this.zIndex );
	css( this.wrapper, "position", this.position );
	if( this.top !== undefined ) css( this.wrapper, "top", this.top );
	if( this.left !== undefined )css( this.wrapper, "left", this.left );
	if( this.bottom !== undefined ) css( this.wrapper, "bottom", this.bottom );
	if( this.right !== undefined )css( this.wrapper, "right", this.right );

	//now make the width of the selector to fill the wrapper
	css( this.selector, "width", this.interiorWidth );
	css( this.selector, "padding", this.padding );
	
	css( this.maxmin, "float", "right" );
	css( this.maxmin, "display", "inline" );
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
	
	var _this = this,
		css = gadgetui.util.setStyle,
		offset = gadgetui.util.getOffset( this.wrapper ),
		lx =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( gadgetui.util.getNumberValue( this.width ), 10 );
	
	if( typeof Velocity != 'undefined' && this.animate ){
		
		Velocity( this.wrapper, {
			left: lx - width + _this.minWidth
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
			_this.icon.setAttribute( "data-glyph", "fullscreen-exit" );
		}
		});
	}else{
		css( this.wrapper, "left", ( lx - width + this.minWidth ) );
		css( this.wrapper, "width", this.width );
		css( this.wrapper, "height", this.height );
		this.icon.setAttribute( "data-glyph", "fullscreen-exit" );
	}
	this.minimized = false;
};

FloatingPane.prototype.minimize = function(){
	// when minimizing and maximizing, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position
	
	var _this = this,
		css = gadgetui.util.setStyle,
		offset = gadgetui.util.getOffset( this.wrapper ),
		lx =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( gadgetui.util.getNumberValue( this.width ), 10 );

	if( typeof Velocity != 'undefined' && this.animate ){

		Velocity( this.wrapper, {
			left: lx + width - _this.minWidth
		},{queue: false, duration: 500}, function() {
	
		});

		Velocity( this.wrapper, {
			width: _this.minWidth
		},{queue: false, duration: 500, complete: function() {
			_this.icon.setAttribute( "data-glyph", "fullscreen-enter" );
			}
		});

		Velocity( this.wrapper, {
			height: "50px"
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		});
	}else{
		css( this.wrapper, "left", ( lx + width - this.minWidth ) );
		css( this.wrapper, "width", this.minWidth );
		css( this.wrapper, "height", "50px" );
		this.icon.setAttribute( "data-glyph", "fullscreen-enter" );
	}
	this.minimized = true;
};

FloatingPane.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.animate = (( options.animate === undefined) ? true : options.animate );
	this.title = ( options.title === undefined ? "": options.title );
	this.path = ( options.path === undefined ? "/bower_components/gadget-ui/dist/": options.path );
	this.position = ( options.position === undefined ? "absolute" : options.position );
	this.padding = ( options.padding === undefined ? 15: options.padding );
	this.paddingTop = ( options.paddingTop === undefined ? ".3em": options.paddingTop );
	this.width = ( options.width === undefined ? gadgetui.util.getStyle( this.selector, "width" ) : options.width );
	this.minWidth = ( this.title.length > 0 ? Math.max( 100, this.title.length * 10 ) + 20 : 100 );
	this.top = ( options.top === undefined ? undefined: options.top );
	this.left = ( options.left === undefined ? undefined : options.left );
	this.bottom = ( options.bottom === undefined ? undefined : options.bottom );
	this.right = ( options.right === undefined ? undefined : options.right );	
	this.height = ( options.height === undefined ? gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector, "height" ) ) + ( gadgetui.util.getNumberValue( this.padding ) * 2 ) : options.height );
	this.interiorWidth = ( options.interiorWidth === undefined ? "": options.interiorWidth );
	this.opacity = ( ( options.opacity === undefined ? 1 : options.opacity ) );
	this.zIndex = ( ( options.zIndex === undefined ? gadgetui.util.getMaxZIndex() + 1 : options.zIndex ) );
	this.minimized = false;
	this.relativeOffsetLeft = 0;
	this.borderColor = ( options.borderColor === undefined ? "silver": options.borderColor );
	this.headerColor = ( options.headerColor === undefined ? "black": options.headerColor );
	this.headerBackgroundColor = ( options.headerBackgroundColor === undefined ? "silver": options.headerBackgroundColor );
	this.borderRadius = ( options.borderRadius === undefined ? 6 : options.borderRadius );	
};
