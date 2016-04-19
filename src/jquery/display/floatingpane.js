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
	this.height = gadgetui.util.getStyle( $( this.selector ).parent()[0], "height" );

	this.relativeOffsetLeft = gadgetui.util.getRelativeParentOffset( this.selector ).left;
	this.addBindings();
}

FloatingPane.prototype.addBindings = function(){
	var that = this;
	// jquery-ui draggable
	this.wrapper.draggable( {addClasses: false } );
	
	this.maxmin.on( "click", function(){
		if( that.minimized ){
			that.expand();
		}else{
			that.minimize();
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

	this.height = ( args.height === undefined ? gadgetui.util.getNumberValue( gadgetui.util.getStyle( $( this.selector )[0], "height" ) ) + ( gadgetui.util.getNumberValue( this.padding ) * 2 ) : args.height );
	this.interiorWidth = ( args.interiorWidth === undefined ? "": args.interiorWidth );
	this.opacity = ( ( args.opacity === undefined ? 1 : args.opacity ) );
	this.zIndex = ( ( args.zIndex === undefined ? 100000 : args.zIndex ) );
	this.minimized = false;
	this.relativeOffsetLeft = 0;
};

FloatingPane.prototype.expand = function(){
	// when minimizing and expanding, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position
	
	var that = this, 
		offset = $( this.wrapper).offset(),
		l =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );
	
	
	
	this.wrapper.animate({
		left: l - width + that.minWidth
	},{queue: false, duration: 500}, function() {
		// Animation complete.
	});

	this.wrapper.animate({
		width: this.width
	},{queue: false, duration: 500}, function() {
		// Animation complete.
	});

	this.wrapper.animate({
		height: this.height
	},{queue: false, duration: 500, complete: function() {
		that.maxmin
		.removeClass( "ui-icon-arrow-4-diag" )
		.addClass( "ui-icon-arrow-4" );
	}
	});

	this.minimized = false;
};

FloatingPane.prototype.minimize = function(){
	// when minimizing and maximizing, we must look up the ancestor chain to see if there are position: relative elements.
	// if so, we must subtract the offset left of the ancestor to get the pane back to its original position
	
	var that = this, offset = $( this.wrapper).offset(),
		l =  parseInt( new Number( offset.left ), 10 ) - this.relativeOffsetLeft,
		width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );

	this.wrapper.animate({
		left: l + width - that.minWidth
	},{queue: false, duration: 500}, function() {

	});

	this.wrapper.animate({
		width: that.minWidth
	},{queue: false, duration: 500, complete: function() {
		that.maxmin
		.removeClass( "ui-icon-arrow-4" )
		.addClass( "ui-icon-arrow-4-diag" );
		}
	});

	this.wrapper.animate({
		height: "50px"
	},{queue: false, duration: 500}, function() {
		// Animation complete.
	});

	this.minimized = true;

};