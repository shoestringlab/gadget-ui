
function SelectInput( selector, options ){
	this.selector = selector;

	this.config( options );
	this.setSelectOptions();
	this.setInitialValue( options );

	this.addControl();
	this.addCSS();
	this.selector.style.display = 'none';

	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.label, this.model );
	this.addBindings();
}

SelectInput.prototype.setInitialValue = function( options ){
	this.value = ( options.value || { id: this.selector.options[this.selector.selectedIndex||0].value, text: this.selector.options[this.selector.selectedIndex||0].innerHTML } );
	this.selector.value = this.value.id;
};

SelectInput.prototype.addControl = function(){
	var _this = this;
	this.wrapper = document.createElement( "div" );
	this.label = document.createElement( "div" );
	gadgetui.util.addClass( this.wrapper, "gadgetui-selectinput-div" );
	gadgetui.util.addClass( this.label, "gadgetui-selectinput-label" );
	this.label.setAttribute( "gadgetui-bind", this.selector.getAttribute( "gadgetui-bind" ) );
	this.label.innerHTML = this.value.text;
	this.selector.parentNode.insertBefore( this.wrapper, this.selector );
	this.wrapper = this.selector.previousSibling;
	this.selector.parentNode.removeChild( this.selector );
	this.wrapper.appendChild( this.selector );
	this.selector.parentNode.insertBefore( this.label, this.selector );
};

SelectInput.prototype.setSelectOptions = function(){
	var _this = this, id, text, option;
	if( this.selector.getAttribute( "gadgetui-bind-options" ) !== null || this.dataProvider !== undefined ){
		while (_this.selector.options.length > 0) {
			_this.selector.remove(0);
	  }

		if( this.selector.getAttribute( "gadgetui-bind-options" ) !== null ){
			// use the gadgetui-ui-bind attribute to populate the select box from the model
			var optionsArray = this.model.get( this.selector.getAttribute( "gadgetui-bind-options" ) );
			optionsArray.forEach( function( item ){
				var opt = document.createElement("option");
				opt.value = item.id;
				opt.text = item.text;
				_this.selector.add( opt );
			});
		}else if( this.dataProvider !== undefined ){
			// use the dataProvider option to populate the select if provided
			this.dataProvider.data.forEach( function( obj ){
				id = obj.id;
				text = obj.text;
				if( text === undefined ){
					text = id;
				}
				option = gadgetui.util.createElement( "option" );
				option.value = id;
				option.text = text;

				_this.selector.add( option );
			});
		}
	}
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
	var _this = this,
		css = gadgetui.util.setStyle;

	this.label
		.addEventListener( this.activate, function( event ) {
			css( _this.label, "display", 'none' );
			css( _this.selector, "display", "inline-block" );
			event.preventDefault();
		});

	this.selector
		.addEventListener( "blur", function( ev ) {
			//setTimeout( function() {
				css( _this.label, "display", "inline-block" );
				css( _this.selector, "display", 'none' );
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

				_this.label.innerText = label;
				if( _this.model !== undefined && _this.selector.getAttribute( "gadgetui-bind" ) === undefined ){
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
		.addEventListener( "mouseleave", function( ) {
			if ( _this.selector !== document.activeElement ) {
				css( _this.label, "display", 'inline-block' );
				css( _this.selector, "display", 'none' );
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
	this.dataProvider =  (( options.dataProvider === undefined) ? undefined : options.dataProvider );
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.activate = (( options.activate === undefined) ? "mouseenter" : options.activate );
};
