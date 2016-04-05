
function SelectInput( selector, options ){
	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;

	if( options !== undefined ){
		this.config( options );
	}

	this.setInitialValue();

	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );

	this.addControl();
	this.addCSS();
	$( this.selector ).hide();
	
	this.addBindings();
}

SelectInput.prototype.setInitialValue = function(){
	var val = $( this.selector ).val(),
		ph = $( this.selector ).attr( "placeholder" );

	if( val.length === 0 ){
		if( ph !== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}
	this.value = val;
};

SelectInput.prototype.addControl = function(){
	$( this.selector ).wrap( "<div class='gadgetui-selectinput-div'></div>");
	$( this.selector ).parent().prepend( "<div class='gadgetui-selectinput-label'>" + this.value + "</div>");
};

SelectInput.prototype.addCSS = function(){
	var height, 
		parentstyle,
		label = $( "div[class='gadgetui-selectinput-label']", $( this.selector ).parent() );

	/*	$( this.selector )
		.css( "border", "1px solid silver" );	*/

	$( this.selector )
		.css( "min-width", "10em" );
	$( this.selector )
		.css( "font-size", "1em" );

	parentstyle = gadgetui.util.getStyle( $( this.selector ).parent()[0] );
	height = gadgetui.util.getNumberValue( parentstyle.height ) - 2;
	label
		.css( "padding-top", "2px" )
		.css( "height", height )
		.css( "margin-left", "9px");

	if( navigator.userAgent.match( /Edge/ ) ){
		this.selector
			.css( "margin-left", "5px" );
	}else if( navigator.userAgent.match( /MSIE/ ) ){
		this.selector
		.css( "margin-top", "0px")
		.css( "margin-left", "5px" );
/*				.css( "margin-top", "1px")
			.css( "margin-left", "6px" );	*/
	}
};

SelectInput.prototype.addBindings = function() {
	var self = this, 
		oVar,
		control = $( self.selector ).parent(),
		label = $( "div[class='gadgetui-selectinput-label']", control );

	oVar = ( (self.o === undefined) ? {} : self.o );

	label
		.off( this.activate )
		.on( this.activate, function( ) {
			$( this ).hide();
			
			$( self.selector ).css( "display", "inline-block" );
		});

	control
		.off( "change" )
		.on( "change", function( ev ) {
			var value = ev.target.value;
			if( value.trim().length === 0 ){
				value = " ... ";
			}
			oVar.isDirty = true;
			label
				.text( value );
		});

	$( self.selector )
		.off( "blur" )
		//.css( "min-width", "10em" )
		.on( "blur", function( ev ) {
			var newVal;
			setTimeout( function() {
				newVal = $( self.selector ).val();
				if ( oVar.isDirty === true ) {
					if( newVal.trim().length === 0 ){
						newVal = " ... ";
					}
					oVar[ this.name ] = $( self.selector ).val();

					label
						.text( newVal );
					if( self.model !== undefined && $( self.selector ).attr( "gadgetui-bind" ) === undefined ){	
						// if we have specified a model but no data binding, change the model value
						self.model.set( this.name, oVar[ this.name ] );
					}

					oVar.isDirty = false;
					if( self.emitEvents === true ){
						$( self.selector )
							.trigger( "gadgetui-input-change", [ oVar ] );
					}
					if( self.func !== undefined ){
						self.func( oVar );
					}
				}
				label
					.css( "display", "inline-block" );
				$( self.selector ).hide( );
			}, 100 );
		})
		.off( "keyup" )
		.on( "keyup", function( event ) {
			if ( parseInt( event.which, 10 ) === 13 ) {
				$( self.selector ).blur();
			}
		});

	control
		.off( "mouseleave" )
		.on( "mouseleave", function( ) {
			if ( $( self.selector ).is( ":focus" ) === false ) {
				label
					.css( "display", "inline-block" );
				$( self.selector )
					.hide( );
			}
		});

	function detectLeftButton(evt) {
	    evt = evt || window.event;
	    var button = evt.which || evt.button;
	    return button == 1;
	}
	
	document.onmouseup = function( event ){
		var isLeftClick = detectLeftButton( event );
		if( isLeftClick === true ){
			if ( $( self.selector ).is( ":focus" ) === false ) {
				label
					.css( "display", "inline-block" );
				$( self.selector )
					.hide( );
			}			
		}
	};
};

SelectInput.prototype.config = function( options ){
	this.model =  (( options.model === undefined) ? this.model : options.model );
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.activate = (( options.activate === undefined) ? "mouseenter" : options.activate );

	if( options.object !== undefined ){
		this.o = options.object;
	}
};
	