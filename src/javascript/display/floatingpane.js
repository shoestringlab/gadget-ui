function FloatingPane( selector, options ){
	this.selector = selector;
	if( options !== undefined ){
		this.config( options );
	}

	this.setup( options );
}

FloatingPane.prototype.setup = function( options ){
	this.addControl();
	this.addHeader();
	if( this.enableShrink ){
		this.maxmin = this.wrapper.querySelector( "div.oi[name='maxmin']" );
	}
	// need to be computed after header is done
	this.minWidth = ( this.title.length > 0 ? gadgetui.util.textWidth( this.title, this.header.style ) + 50 : 100 );
	var paddingPx = ( parseInt( gadgetui.util.getNumberValue( this.padding ), 10 ) * 2 );
	// 6 px is padding + border of header
	var headerHeight = gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.header, "height" ) ) + 6;
	//set height by setting width on selector to get content height at that width
	gadgetui.util.setStyle( this.selector, "width", this.width - paddingPx );
	this.height = ( options.height === undefined ? gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector, "height" ) ) + paddingPx + headerHeight + 10 : options.height );

	this.addCSS();

	// now set height to computed height of control _this has been created
	this.height = gadgetui.util.getStyle( this.wrapper, "height" );

	this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset( this.selector ).left;
	this.addBindings();
	if( this.enableShrink ){
		this.minimize();
		this.expand();
	}
};

FloatingPane.prototype.addBindings = function(){
	var _this = this;

	var dragger = gadgetui.util.draggable( this.wrapper );

	this.wrapper.addEventListener( "drag_end", function( event ){
		_this.top = event.detail.top;
		_this.left = event.detail.left;
		_this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset( _this.selector ).left;
		console.log( _this );
	});

	if( this.enableShrink ){
		this.maxmin.addEventListener( "click", function( event ){
			if( _this.minimized ){
				_this.expand();
			}else{
				_this.minimize();
			}
		});
	}
	if( this.enableClose ){
		this.closeIcon.addEventListener( "click", function(){ _this.close.apply( _this ) } );
	}
};

FloatingPane.prototype.close = function(){
	this.wrapper.parentNode.removeChild( this.wrapper );
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

	if( this.enableShrink ){
		this.icon = document.createElement( "div" );
		gadgetui.util.addClass( this.icon, "oi" );
		this.icon.setAttribute( "name", "maxmin" );
		this.header.insertBefore( this.icon, undefined );
		this.wrapper.insertBefore( this.header, this.selector );
		this.icon.setAttribute( 'data-glyph', "fullscreen-exit" );
		this.header.appendChild( this.icon );
	}else{
		this.wrapper.insertBefore( this.header, this.selector );
	}

	if( this.enableClose ){
		this.closeIcon = document.createElement( "div" );
		this.closeIcon.setAttribute( "name", "closeIcon" );
		css( this.closeIcon, "float", "right" );
		css( this.closeIcon, "display", "inline-block" );
		css( this.closeIcon, "margin-right", "3px" );
		gadgetui.util.addClass( this.closeIcon, "oi" );
		this.header.appendChild( this.closeIcon );
		this.closeIcon.setAttribute( 'data-glyph', "circle-x" );
	}
};

FloatingPane.prototype.addCSS = function(){
	var css = gadgetui.util.setStyle;
	css( this.selector, "overflow", this.overflow );
	//copy width from selector
	css( this.wrapper, "width",  this.width );
	//css( this.wrapper, "height",  this.height );
	css( this.wrapper, "border",  "1px solid "  + this.borderColor );
	css( this.wrapper, "border-radius", this.borderRadius );
	css( this.wrapper, "min-width", this.minWidth );
	css( this.wrapper, "opacity", this.opacity );
	css( this.wrapper, "z-index", this.zIndex );
	css( this.wrapper, "position", this.position );
	css( this.wrapper, "background", gadgetui.util.getStyle( this.selector, "background" ) );
	css( this.wrapper, "background-color", gadgetui.util.getStyle( this.selector, "background-color" ) );
	if( this.top !== undefined ) css( this.wrapper, "top", this.top );
	if( this.left !== undefined )css( this.wrapper, "left", this.left );
	if( this.bottom !== undefined ) css( this.wrapper, "bottom", this.bottom );
	if( this.right !== undefined )css( this.wrapper, "right", this.right );

	//now make the width of the selector to fill the wrapper
	css( this.selector, "width", this.interiorWidth );
	css( this.selector, "padding", this.padding );
	css( this.selector, "height", this.height );
	css( this.selector, "border-radius", "0 0 " + this.borderRadius + "px " + this.borderRadius + "px" );
	if( this.enableShrink ){
		css( this.maxmin, "float", "left" );
		css( this.maxmin, "display", "inline" );
	}
};

FloatingPane.prototype.addControl = function(){
	var fp = document.createElement( "div" );
	gadgetui.util.addClass( fp, "gadget-ui-floatingPane" );
	fp.draggable = true;
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
		parentPaddingLeft = parseInt( gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.wrapper.parentElement, "padding-left" ) ), 10 ),
		lx =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft - parentPaddingLeft,
		width = parseInt( gadgetui.util.getNumberValue( this.width ), 10 );

	if( typeof Velocity != 'undefined' && this.animate ){

		/* Velocity( this.wrapper, {
			left: lx - width + _this.minWidth
			//left : this.left
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		}); */

		Velocity( this.wrapper, {
			width: this.width
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		});

		Velocity( this.selector, {
			height: this.height
		},{queue: false, duration: 500, complete: function() {
			_this.icon.setAttribute( "data-glyph", "fullscreen-exit" );
			css( _this.selector, "overflow", "scroll" );
		}
		});
	}else{
		//css( this.wrapper, "left", ( lx - width + this.minWidth ) );
		//css( this.wrapper, "left", ( this.left ) );
		css( this.wrapper, "width", this.width );
		css( this.selector, "height", this.height );
		this.icon.setAttribute( "data-glyph", "fullscreen-exit" );
		css( this.selector, "overflow", "scroll" );
	}

	this.minimized = false;
};

FloatingPane.prototype.minimize = function(){
	// when minimizing and maximizing, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position

	var _this = this,
		css = gadgetui.util.setStyle,
		offset = gadgetui.util.getOffset( this.wrapper ),
		parentPaddingLeft = parseInt( gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.wrapper.parentElement, "padding-left" ) ), 10 ),
		lx =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft - parentPaddingLeft,
		width = parseInt( gadgetui.util.getNumberValue( this.width ), 10 );

	css( this.selector, "overflow", "hidden" );

	if( typeof Velocity != 'undefined' && this.animate ){

/* 		Velocity( this.wrapper, {
			left: lx + width - _this.minWidth
		},{queue: false, duration: 500}, function() {

		}); */

		Velocity( this.wrapper, {
			width: _this.minWidth
		},{queue: false, duration: 500, complete: function() {
			_this.icon.setAttribute( "data-glyph", "fullscreen-enter" );
			}
		});

		Velocity( this.selector, {
			height: "50px"
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		});
	}else{
		//css( this.wrapper, "left", ( lx + width - this.minWidth ) );
		css( this.wrapper, "width", this.minWidth );
		css( this.selector, "height", "50px" );
		this.icon.setAttribute( "data-glyph", "fullscreen-enter" );
	}
	this.minimized = true;
};

FloatingPane.prototype.config = function( options ){
	var css = gadgetui.util.setStyle;
	options = ( options === undefined ? {} : options );
	this.animate = (( options.animate === undefined) ? true : options.animate );
	this.title = ( options.title === undefined ? "": options.title );
	this.path = ( options.path === undefined ? "/bower_components/gadget-ui/dist/": options.path );
	this.position = ( options.position === undefined ? "absolute" : options.position );
	this.padding = ( options.padding === undefined ? 15: options.padding );
	this.paddingTop = ( options.paddingTop === undefined ? ".3em": options.paddingTop );
	this.width = ( options.width === undefined ? gadgetui.util.getStyle( this.selector, "width" ) : options.width );
	//this.minWidth = ( this.title.length > 0 ? gadgetui.util.textWidth( this.title ) + 30 : 100 );
	this.top = ( options.top === undefined ? undefined: options.top );
	this.left = ( options.left === undefined ? undefined : options.left );
	this.bottom = ( options.bottom === undefined ? undefined : options.bottom );
	this.right = ( options.right === undefined ? undefined : options.right );
	this.interiorWidth = ( options.interiorWidth === undefined ? "": options.interiorWidth );
	this.opacity = ( ( options.opacity === undefined ? 1 : options.opacity ) );
	this.zIndex = ( ( options.zIndex === undefined ? gadgetui.util.getMaxZIndex() + 1 : options.zIndex ) );
	this.minimized = false;
	this.relativeOffsetLeft = 0;
	this.borderColor = ( options.borderColor === undefined ? "silver": options.borderColor );
	this.headerColor = ( options.headerColor === undefined ? "black": options.headerColor );
	this.headerBackgroundColor = ( options.headerBackgroundColor === undefined ? "silver": options.headerBackgroundColor );
	this.borderRadius = ( options.borderRadius === undefined ? 6 : options.borderRadius );
	this.enableShrink = ( options.enableShrink !== undefined ? options.enableShrink : true );
	this.enableClose = ( options.enableClose !== undefined ? options.enableClose : true );
	this.overflow = ( options.overflow !== undefined ? options.overflow : "hidden" );
};
