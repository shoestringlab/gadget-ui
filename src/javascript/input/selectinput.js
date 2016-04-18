
function SelectInput( selector, options ){
	this.selector = selector;

	this.config( options );
	this.setInitialValue();

	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );

	this.addControl();
	this.addCSS();
	this.selector.style.display = 'none';
	
	this.addBindings();
}

SelectInput.prototype.setInitialValue = function(){
	// this.value set in config()
	this.selector.value = this.value.id;
};

SelectInput.prototype.addControl = function(){
	this.wrapper = document.createElement( "div" );
	this.label = document.createElement( "div" );
	gadgetui.util.addClass( this.wrapper, "gadgetui-selectinput-div" );
	gadgetui.util.addClass( this.label, "gadgetui-selectinput-label" );
	this.label.innerHTML = this.value.text;
	this.selector.parentNode.insertBefore( this.wrapper, this.selector );
	this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild( this.selector );
	this.wrapper.appendChild( this.selector );
	this.selector.parentNode.insertBefore( this.label, this.selector );
};

SelectInput.prototype.addCSS = function(){
	var height, 
		parentstyle,
		css = gadgetui.util.setStyle,
		style = gadgetui.util.getStyle( this.selector );

	css( this.selector, "min-width", "100px" );
	css( this.selector, "font-size", style.fontSize );

	parentstyle = gadgetui.util.getStyle( this.selector.parentNode );
	height = gadgetui.util.getNumberValue( parentstyle.height ) - 2;
	this.label.setAttribute( "style", "" );
	css( this.label, "padding-top", "2px" );
	css( this.label, "height", height + "px" );
	css( this.label, "margin-left", "9px" );	

	if( navigator.userAgent.match( /Edge/ ) ){
		css( this.selector, "margin-left", "5px" );
	}else if( navigator.userAgent.match( /MSIE/ ) ){
		css( this.selector, "margin-top", "0px" );
		css( this.selector, "margin-left", "5px" );
	}
};

SelectInput.prototype.addBindings = function() {
	var self = this,
		css = gadgetui.util.setStyle;

	// setup mousePosition
	if( gadgetui.mousePosition === undefined ){
		document
			.addEventListener( "mousemove", function(ev){ 
				ev = ev || window.event; 
				gadgetui.mousePosition = gadgetui.util.mouseCoords(ev); 
			});
	}

	this.label
		.addEventListener( this.activate, function( event ) {
			css( self.label, "display", 'none' );
			css( self.selector, "display", "inline-block" );
			event.preventDefault();
		});

	this.selector
		.addEventListener( "blur", function( ev ) {
			//setTimeout( function() {
				css( self.label, "display", "inline-block" );
				css( self.selector, "display", 'none' );
			//}, 100 );
		});

	this.selector
		.addEventListener( "change", function( ev ) {
			setTimeout( function() {
				var value = ev.target.value,
					label = ev.target[ ev.target.selectedIndex ].innerHTML;
				
				if( value.trim().length === 0 ){
					value = 0;
				}
	
				self.label.innerText = label;
				if( self.model !== undefined && self.selector.getAttribute( "gadgetui-bind" ) === undefined ){	
					// if we have specified a model but no data binding, change the model value
					self.model.set( this.name, { id: value, text: label } );
				}
	
				if( self.emitEvents === true ){
					gadgetui.util.trigger( self.selector, "gadgetui-input-change", { id: value, text: label } );
				}
				if( self.func !== undefined ){
					self.func( { id: value, text: label } );
				}
				self.value = { id: value, text: label };
			}, 100 );
		});

	this.selector
		.addEventListener( "mouseleave", function( ) {
			if ( self.selector !== document.activeElement ) {
				css( self.label, "display", 'inline-block' );
				css( self.selector, "display", 'none' );
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
			if ( $( self.selector ).is( ":focus" ) === false ) {
				label
					.css( "display", "inline-block" );
				$( self.selector )
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
	this.value = (( options.value === undefined) ? { id: this.selector[ this.selector.selectedIndex ].value, text : this.selector[ this.selector.selectedIndex ].innerHTML } : options.value );
};
