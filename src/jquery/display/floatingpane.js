	function FloatingPane( args ){
		var self = this, img, header;
		self.selector = args.selector;
		if( args.config !== undefined ){
			self.config( args.config );
		}
		
/*			$( self.selector )
			.dialog({
				draggable: true,
				title: self.title,
				width: self.width,
				position: self.position
			});
		
		var pane = $( self.selector ).parent();
		
		pane.css( "opacity", self.opacity );	*/
		
		$( self.selector ).wrap( '<div class="gadget-ui-floatingPane ui-corner-all ui-widget-content"></div>');
		self.wrapper = $( self.selector ).parent();
		//copy width from selector
		self.wrapper.css( "width", self.width )
				.css( "opacity", self.opacity )
				.css( "z-index", self.zIndex );

		//now make the width of the selector to fill the wrapper
		$( self.selector )
			.css( "width", self.interiorWidth )
			.css( "padding", self.padding );

		self.wrapper.prepend( '<div class="ui-widget-header ui-corner-all gadget-ui-floatingPane-header">' + self.title + '<div><img src="' + self.path + 'img/close.png"/></div></div>');
		header = $( "div.gadget-ui-floatingPane-header", self.wrapper );

		// jquery-ui draggable
		self.wrapper.draggable( {addClasses: false } );

		img = $( "div div img", self.wrapper );
		
		img.on("click", function(){
			if( self.minimized ){
				self.expand();
			}else{
				self.minimize();
			}
		});
		
		img.parent()
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
		this.height = ( args.height === undefined ? $( this.selector ).css( "height" ) : args.height );
		this.interiorWidth = ( args.interiorWidth === undefined ? "100%": args.interiorWidth );
		this.opacity = ( ( args.opacity === undefined ? 1 : args.opacity ) );
		this.zIndex = ( ( args.zIndex === undefined ? 100000 : args.zIndex ) );
		this.minimized = false;
	};
	
	FloatingPane.prototype.expand = function(){
		var offset = $( this.wrapper).offset();
		var l =  parseInt( new Number( offset.left ), 10 );
		var width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );
		
		this.wrapper.animate({
			left: l - width + 100 - 8,
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
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		});

		this.minimized = false;
	};

	FloatingPane.prototype.minimize = function(){
		var offset = $( this.wrapper).offset();
		var l =  parseInt( new Number( offset.left ), 10 );
		var width = parseInt( this.width.substr( 0,this.width.length - 2), 10 );

		this.wrapper.animate({
			left: l + width - 100 - 8,
		},{queue: false, duration: 500}, function() {
			// Animation complete.
		});

		this.wrapper.animate({
			width: "100px",
		},{queue: false, duration: 500}, function() {
			// Animation complete.
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
