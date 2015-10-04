
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

	$( this.selector )
		.css( "border", "0px 2px" )
		.css( "min-width", "10em" )
		.css( "font-size", "1em" );

	//style = window.getComputedStyle( $( selector )[0] );
	parentstyle = window.getComputedStyle( $( this.selector ).parent()[0] );
	height = gadgetui.util.getNumberValue( parentstyle.height ) - 2;
	label
		.css( "padding-top", "2px" )
		.css( "height", height )
		.css( "margin-left", "9px");

};

SelectInput.prototype.addBindings = function() {
	var self = this, 
		oVar,
		control = $( this.selector ).parent(),
		label = $( "div[class='gadgetui-selectinput-label']", control );

	oVar = ( (this.o === undefined) ? {} : this.o );

	label
		.off( this.activate )
		.on( this.activate, function( ) {
			$( this ).hide();
			
			$( self.selector ).css( "display", "inline-block" );
		});

	control
		.off( "change" )
		.on( "change", function( e ) {
			var value = e.target.value;
			if( value.trim().length === 0 ){
				value = " ... ";
			}
			oVar.isDirty = true;
			label
				.text( value );
		});

	$( this.selector )
		.off( "blur" )
		//.css( "min-width", "10em" )
		.on( "blur", function( ) {
			var newVal;
			setTimeout( function() {
				newVal = $( this ).val( );
				if ( oVar.isDirty === true ) {
					if( newVal.trim().length === 0 ){
						newVal = " ... ";
					}
					oVar[ this.name ] = $( this ).val( );

					label
						.text( newVal );
					if( self.model !== undefined && $( this ).attr( "gadgetui-bind" ) === undefined ){	
						// if we have specified a model but no data binding, change the model value
						self.model.set( this.name, oVar[ this.name ] );
					}

					oVar.isDirty = false;
					if( self.emitEvents === true ){
						$( this )
							.trigger( "gadgetui-input-change", [ oVar ] );
					}
					if( self.func !== undefined ){
						self.func( oVar );
					}
				}
				label
					.css( "display", "inline-block" );
				$( this ).hide( );
			}, 100 );
		})
		.off( "keyup" )
		.on( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				$( this ).blur( );
			}
		});

	control
		.off( "mouseleave" )
		.on( "mouseleave", function( ) {
			if ( $( this ).is( ":focus" ) === false ) {
				label
					.css( "display", "inline-block" );
				$( this )
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
	