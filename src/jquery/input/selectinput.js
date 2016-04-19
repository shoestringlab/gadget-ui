
function SelectInput( selector, options ){
	this.selector = selector;

	this.config( options );
	this.setInitialValue();

	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );

	this.addControl();
	this.addCSS();
	this.selector.css( "display", 'none' );
	
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
};

SelectInput.prototype.addCSS = function(){
	var height, 
		parentstyle,
		style = gadgetui.util.getStyle( $(this.selector)[0] );

	this.selector.css( "min-width", "100px" );
	this.selector.css( "font-size", style.fontSize );

	parentstyle = gadgetui.util.getStyle( $(this.selector).parent()[0] );
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
	var that = this;

	// setup mousePosition
	if( gadgetui.mousePosition === undefined ){
		document
			.addEventListener( "mousemove", function(ev){ 
				ev = ev || window.event; 
				gadgetui.mousePosition = gadgetui.util.mouseCoords(ev); 
			});
	}

	this.label
		.on( this.activate, function( event ) {
			that.label.css( "display", 'none' );
			that.selector.css( "display", "inline-block" );
			event.preventDefault();
		});

	this.selector
		.on( "blur", function( ev ) {
			//setTimeout( function() {
				that.label.css( "display", "inline-block" );
				that.selector.css( "display", 'none' );
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
	
				that.label.text( label );
				if( that.model !== undefined && that.selector.attr( "gadgetui-bind" ) === undefined ){	
					// if we have specified a model but no data binding, change the model value
					that.model.set( this.name, { id: value, text: label } );
				}
	
				if( that.emitEvents === true ){
					gadgetui.util.trigger( that.selector, "gadgetui-input-change", { id: value, text: label } );
				}
				if( that.func !== undefined ){
					that.func( { id: value, text: label } );
				}
				that.value = { id: value, text: label };
			}, 100 );
		});

	this.selector
		.on( "mouseleave", function( ) {
			if ( that.selector !== document.activeElement ) {
				that.label.css( "display", 'inline-block' );
				that.selector.css( "display", 'none' );
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
			if ( $( that.selector ).is( ":focus" ) === false ) {
				label
					.css( "display", "inline-block" );
				$( that.selector )
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
	