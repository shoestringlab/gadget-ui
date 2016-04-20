
function SelectInput( selector, options ){
	this.selector = selector;

	this.config( options );
	this.setInitialValue();

	this.addControl();
	this.addCSS();
	this.selector.css( "display", 'none' );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.label, this.model );
	
	this.addBindings();
}

SelectInput.prototype.setInitialValue = function(){
	// this.value set in config()
	this.selector.val( this.value.id );
};

SelectInput.prototype.addControl = function(){
	$( this.selector ).wrap( "<div class='gadgetui-selectinput-div'></div>");
	$( this.selector ).parent().prepend( "<div class='gadgetui-selectinput-label'>" + this.value.text + "</div>");
	this.label = $( "div[class='gadgetui-selectinput-label']", $( this.selector ).parent() );
	this.label.attr( "gadgetui-bind", this.selector.attr( "gadgetui-bind" ) );
};

SelectInput.prototype.addCSS = function(){
	var height, 
		parentstyle,
		style = gadgetui.util.getStyle( $(this.selector) );

	this.selector.css( "min-width", "100px" );
	this.selector.css( "font-size", style.fontSize );

	parentstyle = gadgetui.util.getStyle( $(this.selector).parent() );
	height = gadgetui.util.getNumberValue( parentstyle.height ) - 2;
	this.label.attr( "style", "" );
	this.label.css( "padding-top", "2px" );
	this.label.css( "height", height + "px" );
	this.label.css( "margin-left", "9px" );	

	if( navigator.userAgent.match( /Edge/ ) ){
		this.selector.css( "margin-left", "5px" );
	}else if( navigator.userAgent.match( /MSIE/ ) ){
		this.selector.css( "margin-top", "0px" );
		this.selector.css( "margin-left", "5px" );
	}
};

SelectInput.prototype.addBindings = function() {
	var _this = this;

	this.label
		.on( this.activate, function( event ) {
			_this.label.css( "display", 'none' );
			_this.selector.css( "display", "inline-block" );
			event.preventDefault();
		});

	this.selector
		.on( "blur", function( ev ) {
			//setTimeout( function() {
				_this.label.css( "display", "inline-block" );
				_this.selector.css( "display", 'none' );
			//}, 100 );
		});

	this.selector
		.on( "change", function( ev ) {
			setTimeout( function() {
				var value = ev.target.value,
					label = ev.target[ ev.target.selectedIndex ].innerHTML;
				
				if( value.trim().length === 0 ){
					value = 0;
				}
	
				_this.label.text( label );
				if( _this.model !== undefined && _this.selector.attr( "gadgetui-bind" ) === undefined ){	
					// if we have specified a model but no data binding, change the model value
					_this.model.set( this.name, { id: value, text: label } );
				}
	
				if( _this.emitEvents === true ){
					gadgetui.util.trigger( _this.selector, "gadgetui-input-change", { id: value, text: label } );
				}
				if( _this.func !== undefined ){
					_this.func( { id: value, text: label } );
				}
				_this.value = { id: value, text: label };
			}, 100 );
		});

	this.selector
		.on( "mouseleave", function( ) {
			if ( _this.selector !== document.activeElement ) {
				_this.label.css( "display", 'inline-block' );
				_this.selector.css( "display", 'none' );
			}
		});
	

/*		function detectLeftButton(evt) {
	    evt = evt || window.event;
	    var button = evt.which || evt.button;
	    return button == 1;
	}
	
	document.onmouseup = function( event ){
		var isLeftClick = detectLeftButton( event );
		if( isLeftClick === true ){
			if ( $( _this.selector ).is( ":focus" ) === false ) {
				label
					.css( "display", "inline-block" );
				$( _this.selector )
					.hide( );
			}			
		}
	};	*/
};

SelectInput.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.model =  (( options.model === undefined) ? undefined : options.model );
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.activate = (( options.activate === undefined) ? "mouseenter" : options.activate );
	this.value = (( options.value === undefined) ? { id: $(this.selector).val(), text : $(this.selector)[0][ $(this.selector)[0].selectedIndex ].innerHTML } : options.value );
};
	