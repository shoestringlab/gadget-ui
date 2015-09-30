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

		// now set height to computed height of control that has been created
		self.height = window.getComputedStyle( $( this.selector ).parent()[0] ).height;

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
		this.padding = ( args.padding === undefined ? "15px": args.padding );
		this.paddingTop = ( args.paddingTop === undefined ? ".3em": args.paddingTop );
		this.width = ( args.width === undefined ? $( this.selector ).css( "width" ) : args.width );
		this.minWidth = ( this.title.length > 0 ? Math.max( 100, this.title.length * 10 ) : 100 );

		this.height = ( args.height === undefined ? gadgetui.util.getNumberValue( window.getComputedStyle( $( this.selector )[0] ).height ) + ( gadgetui.util.getNumberValue( this.padding ) * 2 ) : args.height );
		this.interiorWidth = ( args.interiorWidth === undefined ? "": args.interiorWidth );
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