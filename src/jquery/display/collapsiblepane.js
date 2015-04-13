	function CollapsiblePane( args ){
		var self = this, wrapper, header;
		self.selector = args.selector;
		if( args.config !== undefined ){
			self.config( args.config );
		}
		
		$( self.selector ).wrap( '<div class="gadget-ui-collapsiblePane ui-corner-all ui-widget-content"></div>');
		wrapper = $( self.selector ).parent();
		//copy width from selector
		wrapper.css( "width", self.width );
		
		//now make the width of the selector to fill the wrapper
		$( self.selector )
			.css( "width", self.interiorWidth )
			.css( "padding", self.padding );
		wrapper.prepend( '<div class="ui-widget-header ui-corner-all gadget-ui-collapsiblePane-header">' + self.title + '<div class="ui-icon ui-icon-triangle-1-n"></div></div>');
		header = $( "div.gadget-ui-collapsiblePane-header", wrapper );
		self.icon = $( "div div", wrapper );
		header.on( "click", function(){
				self.toggle();
			});
		if( self.collapse === true ){
			self.toggle();
		}
	}

	CollapsiblePane.prototype.config = function( args ){
		this.title = ( args.title === undefined ? "": args.title );
		this.path = ( args.path === undefined ? "/bower_components/gadget-ui/dist/": args.path );
		this.padding = ( args.padding === undefined ? ".5em": args.padding );
		this.paddingTop = ( args.paddingTop === undefined ? ".3em": args.paddingTop );
		this.width = ( args.width === undefined ? $( this.selector ).css( "width" ) : args.width );
		this.interiorWidth = ( args.interiorWidth === undefined ? "": args.interiorWidth );
		this.collapse = ( ( args.collapse === undefined || args.collapse === false ? false : true ) );
	};
	
	CollapsiblePane.prototype.toggle = function(){
		var self = this, add, remove, expandClass = "ui-icon-triangle-1-s", collapseClass = "ui-icon-triangle-1-n";
		if( self.selector.css( "display" ) === "none" ){
			add = collapseClass;
			remove = expandClass;
		}else{
			add = expandClass;
			remove = collapseClass;			
		}
		
		self.eventName = ( ( self.eventName === undefined || self.eventName === "collapse" ) ? "expand" : "collapse" );
		self.selector
			.css( "padding", self.padding )
			.css( "padding-top", self.paddingTop )
			.toggle( 'blind', {}, 200, function(  ) {
				$( self.icon ).addClass( add )
							.removeClass( remove );
				$( this ).css( "padding", self.padding );
				self.selector.trigger( self.eventName );
			});
	};
