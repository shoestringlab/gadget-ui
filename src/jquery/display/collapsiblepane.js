function CollapsiblePane( selector, options ){

	this.selector = selector;
	if( options !== undefined ){
		this.config( options );
	}
	
	this.addControl();
	this.wrapper = $( this.selector ).parent();
	this.addCSS();
	this.addHeader();
	
	this.icon = $( "div div", this.wrapper );
	
	this.addBindings();
	if( this.collapse === true ){
		this.toggle();
	}		
}

CollapsiblePane.prototype.addBindings = function(){
	var that = this, header = $( "div.gadget-ui-collapsiblePane-header", this.wrapper );
	header
		.on( "click", function(){
			that.toggle();
		});

};

CollapsiblePane.prototype.addHeader = function(){
	this.wrapper.prepend( '<div class="ui-widget-header ui-corner-all gadget-ui-collapsiblePane-header">' + this.title + '<div class="ui-icon ui-icon-triangle-1-n"></div></div>');
};

CollapsiblePane.prototype.addCSS = function(){
	
	//copy width from selector
	this.wrapper
		.css( "width", this.width );
	
	//now make the width of the selector to fill the wrapper
	$( this.selector )
		.css( "width", this.interiorWidth )
		.css( "padding", this.padding );
};

CollapsiblePane.prototype.addControl = function(){
	$( this.selector ).wrap( '<div class="gadget-ui-collapsiblePane ui-corner-all ui-widget-content"></div>' );
};

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
	var that = this, add, remove, expandClass = "ui-icon-triangle-1-s", collapseClass = "ui-icon-triangle-1-n";
	if( that.selector.css( "display" ) === "none" ){
		add = collapseClass;
		remove = expandClass;
	}else{
		add = expandClass;
		remove = collapseClass;			
	}
	
	that.eventName = ( ( that.eventName === undefined || that.eventName === "collapse" ) ? "expand" : "collapse" );
	that.selector
		.css( "padding", that.padding )
		.css( "padding-top", that.paddingTop )
		.toggle( 'blind', {}, 200, function(  ) {
			$( that.icon ).addClass( add )
						.removeClass( remove );
			$( this ).css( "padding", that.padding );
			that.selector.trigger( that.eventName );
		});
};
