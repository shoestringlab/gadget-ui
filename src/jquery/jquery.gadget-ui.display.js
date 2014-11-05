gadgetui.display = (function($) {
	function CollapsiblePane( args ){
		var self = this, wrapper;
		self.selector = args.selector;
		if( args.config !== undefined ){
			self.config( args.config );
		}
		
		$( self.selector ).wrap( '<div class="collapsiblePane ui-corner-all ui-widget-content"></div>');
		wrapper = $( self.selector ).parent();
		//copy width from selector
		wrapper.css( "width", $( self.selector ).css( "width" ) );
		//now make the width of the selector 100% to fill the wrapper
		$( self.selector )
			.css( "width", "100%" )
			.css( "padding", self.padding );
		wrapper.prepend( '<div class="ui-widget-header ui-corner-all collapsiblePane-header">' + self.title + '<div><img src="' + self.path + 'img/collapse.png"/></div></div>');
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
	};

	return{
		CollapsiblePane: CollapsiblePane,
	};
}(jQuery));
