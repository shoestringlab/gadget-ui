	function FloatingPane( args ){
		var self = this, wrapper, img, header;
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
		wrapper = $( self.selector ).parent();
		//copy width from selector
		wrapper.css( "width", self.width )
				.css( "opacity", self.opacity );

		//now make the width of the selector to fill the wrapper
		$( self.selector )
			.css( "width", self.interiorWidth )
			.css( "padding", self.padding );

		wrapper.prepend( '<div class="ui-widget-header ui-corner-all gadget-ui-floatingPane-header">' + self.title + '<div><img src="' + self.path + 'img/close.png"/></div></div>');
		header = $( "div.gadget-ui-floatingPane-header", wrapper );

		// jquery-ui draggable
		wrapper.draggable( {addClasses: false } );

		img = $( "div div img", wrapper );
		
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
		this.interiorWidth = ( args.interiorWidth === undefined ? "100%": args.interiorWidth );
		this.opacity = ( ( args.opacity === undefined ? 1 : args.opacity ) );
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
