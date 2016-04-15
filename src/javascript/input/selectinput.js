
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
		style = gadgetui.util.getStyle( this.selector );

	this.selector.style.minWidth = "100px";
	this.selector.style.fontSize = style.fontSize;

	parentstyle = gadgetui.util.getStyle( this.selector.parentNode );
	height = gadgetui.util.getNumberValue( parentstyle.height ) - 2;
	this.label.setAttribute( "style", "" );
	this.label.style.paddingTop = "2px";
	this.label.style.height = height + "px";
	this.label.style.marginLeft = "9px";	

	if( navigator.userAgent.match( /Edge/ ) ){
		this.selector.style.marginLeft = "5px";
	}else if( navigator.userAgent.match( /MSIE/ ) ){
		this.selector.style.marginTop = "0px";
		this.selector.style.marginLeft = "5px";
	}
};

SelectInput.prototype.addBindings = function() {
	var self = this;

	this.label
		.addEventListener( this.activate, function( event ) {
			self.label.style.display = 'none';
			self.selector.style.display = "inline-block";
			event.preventDefault();
		});

	this.selector
		.addEventListener( "blur", function( ev ) {
			var value, label;
			setTimeout( function() {
				value = self.selector.value;
				label = self.selector[ self.selector.selectedIndex ].innerHTML;
				
				if( value.trim().length === 0 ){
					value = " ... ";
				}

				self.label.innerText = label;
				if( self.model !== undefined && self.selector.getAttribute( "gadgetui-bind" ) === undefined ){	
					// if we have specified a model but no data binding, change the model value
					self.model.set( this.name, { id: value, text: label } );
				}

				if( self.emitEvents === true ){
					self.selector.dispatchEvent( new Event( "gadgetui-input-change" ), { id: value, text: label } );
				}
				if( self.func !== undefined ){
					self.func( { id: value, text: label } );
				}
				self.value = { id: value, text: label };
				self.label.style.display = "inline-block";
				self.selector.style.display = 'none';
			}, 100 );
		});
/*		this.selector
		.addEventListener( "keyup", function( event ) {
			if ( parseInt( event.which, 10 ) === 13 ) {
				self.selector.blur();
			}
		});	*/

	this.wrapper
		.addEventListener( "mouseleave", function( ) {
			if ( self.selector !== document.activeElement ) {
				self.label.style.display = 'inline-block';
				self.selector.style.display = 'none';
			}
		});

	this.selector
		.addEventListener( "change", function( ev ) {
			var value = ev.target.value,
				label = ev.target[ ev.target.selectedIndex ].innerHTML;
			if( label.trim().length === 0 ){
				label = " ... ";
			}
			self.label.innerText = label;
			self.value = { id: value, text: label };
			
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
	this.model =  (( options.model === undefined) ? undefined : options.model );
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.activate = (( options.activate === undefined) ? "mouseenter" : options.activate );
	this.value = (( options.value === undefined) ? { id: this.selector[ this.selector.selectedIndex ].value, text : this.selector[ this.selector.selectedIndex ].innerHTML } : options.value );
};
