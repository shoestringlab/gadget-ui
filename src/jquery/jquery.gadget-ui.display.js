gadgetui.display = (function($) {
	function CollapsiblePane( args ){
		var self = this, wrapper;
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
		wrapper.prepend( '<div class="ui-widget-header ui-corner-all gadget-ui-collapsiblePane-header">' + self.title + '<div><img src="' + self.path + 'img/collapse.png"/></div></div>');
		$( "div div img", wrapper )
			.on( "click", function(){
				var img = this;
				var icon = ( ( self.selector.css( "display" ) === "none" ) ? "collapse" : "expand" );
				self.selector
					.css( "padding", self.padding )
					.css( "padding-top", self.paddingTop )
					.toggle( 'blind', {}, 200, function(  ) {
						$( img ).attr( "src", self.path + "img/" + icon + ".png");
						$( this ).css( "padding", self.padding );
					});
			});
	}

	CollapsiblePane.prototype.config = function( args ){
		this.title = ( args.title === undefined ? "": args.title );
		this.path = ( args.path === undefined ? "/bower_components/gadget-ui/dist/": args.path );
		this.padding = ( args.padding === undefined ? ".5em": args.padding );
		this.paddingTop = ( args.paddingTop === undefined ? ".3em": args.paddingTop );
		this.width = ( args.width === undefined ? $( this.selector ).css( "width" ) : args.width );
		this.interiorWidth = ( args.interiorWidth === undefined ? "100%": args.interiorWidth );
	};

	return{
		CollapsiblePane: CollapsiblePane
	};
}(jQuery));
