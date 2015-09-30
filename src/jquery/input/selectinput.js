
function SelectInput( args ){
	var self = this, val, o;
	self.emitEvents = true;
	self.model = gadgetui.model;
	self.func;

	el = this.setElements( args.el );

	if( el.length === 1 && args.object !== undefined ){
		o = args.object;
	}

	if( args.config !== undefined ){
		self.config( args.config );
	}

	$.each( el,  function( index, selector ){
		val = self.setInitialValue( selector );

		// bind to the model if binding is specified
		_bindToModel( selector, self.model );

		self.addControl( selector, val );
		self.addCSS( selector );
		$( selector ).hide();
		
		self.addBindings( $( selector ).parent(), o  );
	});

	return this;
}

SelectInput.prototype.setElements = function( el ){
	if( el === undefined ){
		el = $( "select[gadgetui-selectinput='true']", document );
	}
	return el;
};


SelectInput.prototype.setInitialValue = function( selector ){
	var val = $( selector ).val(),
		ph = $( selector ).attr( "placeholder" );

	if( val.length === 0 ){
		if( ph !== undefined && ph.length > 0 ){
			val = ph;
		}else{
			val = " ... ";
		}
	}
	return val;
};

SelectInput.prototype.addControl = function( selector, val ){
	$( selector ).wrap( "<div class='gadgetui-selectinput-div'></div>");
	$( selector ).parent().prepend( "<div class='gadgetui-selectinput-label'>" + val + "</div>");
};

SelectInput.prototype.addCSS = function( selector ){
	var height, 
		parentstyle,
		span = $( "div[class='gadgetui-selectinput-label']", $( selector ).parent() );

	$( selector )
		.css( "border", "0px 2px" )
		.css( "min-width", "10em" )
		.css( "font-size", "1em" );

	//style = window.getComputedStyle( $( selector )[0] );
	parentstyle = window.getComputedStyle( $( selector ).parent()[0] );
	//height = _getNumericValue( style.lineHeight ) + _getNumericValue( style.borderBottomWidth ) + _getNumericValue( style.borderTopWidth );
	height = gadgetui.util.getNumberValue( parentstyle.height ) - 2;
	span
		.css( "padding-top", "2px" )
		.css( "height", height )
		.css( "margin-left", "9px");

};

SelectInput.prototype.addBindings = function( selector, object ) {
	var self = this, oVar,
		span = $( "div[class='gadgetui-selectinput-label']", $( selector ) ),
		select = $( "select", selector );

	oVar = ( (object === undefined) ? {} : object );

	span
		.off( this.activate )
		.on( this.activate, function( ) {
			$( this ).hide();
			
			select.css( "display", "inline-block" );
		});

	$( selector )
		.off( "change" )
		.on( "change", function( e ) {
			var value = e.target.value;
			if( value.trim().length === 0 ){
				value = " ... ";
			}
			oVar.isDirty = true;
			span
				.text( value );
		});

	select
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

					span
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
				span
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

	selector
		.off( "mouseleave" )
		.on( "mouseleave", function( ) {
			if ( select.is( ":focus" ) === false ) {
				span
					.css( "display", "inline-block" );
				select
					.hide( );
			}
		});
	
/*		function detectLeftButton(event) {
	    if ('buttons' in event) {
	        return event.buttons === 1;
	    } else if ('which' in event) {
	        return event.which === 1;
	    } else {
	        return event.button === 1;
	    }
	}	*/

	function detectLeftButton(evt) {
	    evt = evt || window.event;
	    var button = evt.which || evt.button;
	    return button == 1;
	}
	
	document.onmouseup = function( event ){
		var isLeftClick = detectLeftButton( event );
		if( isLeftClick === true ){
			if ( select.is( ":focus" ) === false ) {
				span
					.css( "display", "inline-block" );
				select
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
};
	