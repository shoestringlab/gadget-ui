function ComboBox( selector, options ){

	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;
	this.config( options );
	this.setSaveFunc();
	this.setDataProviderRefresh();
	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	this.addControl();
	this.setCSS();
	this.addBehaviors();
	this.setStartingValues();
}

ComboBox.prototype.addControl = function(){
	var css = gadgetui.util.setStyle;
	this.comboBox = gadgetui.util.createElement( "div" );
	this.input = gadgetui.util.createElement( "input" );
	this.label = gadgetui.util.createElement( "div" );
	this.inputWrapper = gadgetui.util.createElement( "div" );
	this.selectWrapper = gadgetui.util.createElement( "div" );

	gadgetui.util.addClass( this.comboBox, "gadgetui-combobox" );	
	gadgetui.util.addClass( this.input, "gadgetui-combobox-input" );
	gadgetui.util.addClass( this.label, "gadgetui-combobox-label" );
	gadgetui.util.addClass( this.inputWrapper, "gadgetui-combobox-inputwrapper" );
	gadgetui.util.addClass( this.selectWrapper,"gadgetui-combobox-selectwrapper" );

	this.selector.parentNode.insertBefore( this.comboBox, this.selector );
	this.selector.parentNode.removeChild( this.selector );
	this.comboBox.appendChild( this.label );
	
	this.selectWrapper.appendChild( this.selector );
	this.comboBox.appendChild( this.selectWrapper );
	this.inputWrapper.appendChild( this.input );
	this.comboBox.appendChild( this.inputWrapper );
	this.label.setAttribute( "data-id", this.id );
	this.label.innerHTML = this.text;
	this.input.setAttribute( "placeholder", this.newOption.text );
	this.input.setAttribute( "type", "text" );
	this.input.setAttribute( "name", "custom" );
	
	css( this.comboBox, "opacity", ".0" );
};

ComboBox.prototype.setCSS = function(){
	var _this = this,

	promise = new Promise(
		function( resolve, reject ){
			_this.getArrowWidth( resolve, reject );
		});
	promise
		.then( function(){
			_this.addCSS();
		});
	promise['catch']( function( message ){
			// use width of default icon
			_this.arrowWidth = 22;
			console.log( message );
			_this.addCSS();
		});
};

ComboBox.prototype.getArrowWidth = function( resolve, reject ){
	var _this = this, 
		img = new Image();
		img.onload = function() {
			_this.arrowWidth = this.width;
			resolve();
		};
		img.onerror = function(){
			reject( "Icon was not loaded." );
		};
		img.src = this.arrowIcon;
};

ComboBox.prototype.addCSS = function(){
	var css = gadgetui.util.setStyle;
	gadgetui.util.addClass( this.selector, "gadgetui-combobox-select" );
	css( this.selector, "width", this.width + "px" ); 
	css( this.selector, "border",  0 ); 
	css( this.selector, "display",  "inline" ); 
	css( this.comboBox, "position",  "relative" ); 

	var styles = gadgetui.util.getStyle( this.selector ),
		inputWidth = this.selector.clientWidth,
		inputWidthAdjusted,
		inputLeftOffset = 0,
		selectMarginTop = 0,
		selectLeftPadding = 0,
		leftOffset = 0,
		inputWrapperTop = this.borderWidth,
		inputLeftMargin,
		leftPosition;
  
	leftPosition = this.borderWidth + 4;

	if( this.borderRadius > 5 ){
		selectLeftPadding = this.borderRadius - 5;
		leftPosition = leftPosition + selectLeftPadding;
	}
	inputLeftMargin = leftPosition;
	inputWidthAdjusted = inputWidth - this.arrowWidth - this.borderRadius - 4;
	console.log( navigator.userAgent );
	if( navigator.userAgent.match( /(Safari)/ ) && !navigator.userAgent.match( /(Chrome)/ )){
		inputWrapperTop = this.borderWidth - 2;
		selectLeftPadding = (selectLeftPadding < 4 ) ? 4 : this.borderRadius - 1;
		selectMarginTop = 1;
	}else if( navigator.userAgent.match( /Edge/ ) ){
		selectLeftPadding = (selectLeftPadding < 1 ) ? 1 : this.borderRadius - 4;
		inputLeftMargin--;
	}else if( navigator.userAgent.match( /MSIE/) ){
		selectLeftPadding = (selectLeftPadding < 1 ) ? 1 : this.borderRadius - 4;
	}else if( navigator.userAgent.match( /Trident/ ) ){
		selectLeftPadding = (selectLeftPadding < 2 ) ? 2 : this.borderRadius - 3;
	}else if( navigator.userAgent.match( /Chrome/ ) ){
		selectLeftPadding = (selectLeftPadding < 4 ) ? 4 : this.borderRadius - 1;
		selectMarginTop = 1;
	}

	// positioning 
	css( this.selector, "margin-top", selectMarginTop + "px" ); 
	css( this.selector, "padding-left", selectLeftPadding + "px" ); 
	
	
	css( this.inputWrapper, "position",  "absolute" ); 
	css( this.inputWrapper, "top", inputWrapperTop + "px" );
	css( this.inputWrapper,"left",leftOffset + "px" );

	css( this.input, "display",  "inline" ); 
	css( this.input,"padding-left",inputLeftOffset + "px" );
	css( this.input,"margin-left",inputLeftMargin + "px" );
	css( this.input, "width", inputWidthAdjusted + "px" ); 

	css( this.label, "position",  "absolute" ); 
	css( this.label,"left",leftPosition + "px" );
	css( this.label,"top",( this.borderWidth + 1 ) + "px" );
	css( this.label, "margin-left", 0 );

	css( this.selectWrapper, "display",  "inline" ); 
	css( this.selectWrapper, "position",  "absolute" ); 
	css( this.selectWrapper, "padding-bottom",  "1px" ); 
	css( this.selectWrapper, "left", 0 );

	//appearance 
	css( this.comboBox, "font-size", styles.fontSize );	

	css( this.selectWrapper, "background-color", this.backgroundColor );
	css( this.selectWrapper, "border-color", this.borderColor ); 
	css( this.selectWrapper, "border-style", this.borderStyle ); 
	css( this.selectWrapper, "border-width", this.borderWidth ); 
	css( this.selectWrapper, "border-radius", this.borderRadius + "px" ); 

	css( this.input, "border", 0 );
	css( this.input, "font-size", styles.fontSize );
	css( this.input, "background-color", this.inputBackground );


	css( this.label, "font-family", styles.fontFamily );
	css( this.label, "font-size", styles.fontSize );
	css( this.label, "font-weight", styles.fontWeight );
	// add rules for arrow Icon
	//we're doing this programmatically so we can skin our arrow icon
	if( navigator.userAgent.match( /Firefox/) ){
		
		css( this.selectWrapper, "background-image",  "url('" + this.arrowIcon + "')" ); 
		css( this.selectWrapper, "background-repeat",  "no-repeat" ); 
		css( this.selectWrapper, "background-position",  "right center" ); 

		if( this.scaleIconHeight === true ){
			css( this.selectWrapper, background-size,  this.arrowWidth + "px " + inputHeight + "px" ); 
		}
	}
	css( this.selector, "-webkit-appearance",  "none" ); 
	css( this.selector, "-moz-appearance",  "window" ); 
	css( this.selector, "background-image",  "url('" + this.arrowIcon + "')" ); 
	css( this.selector, "background-repeat",  "no-repeat" ); 
	css( this.selector, "background-position",  "right center" ); 

	if( this.scaleIconHeight === true ){
		css( this.selector, "background-size",  this.arrowWidth + "px " + inputHeight + "px" ); 
	}

	css( this.inputWrapper, "display", 'none' );
	css( this.selectWrapper, "display", 'none' );
	css( this.comboBox, "opacity",  1 ); 
};

ComboBox.prototype.setSelectOptions = function(){
	var _this = this, id, text, option;

	
	while (_this.selector.options.length > 0) {                
		_this.selector.remove(0);
    }      
	//console.log( "append new option" );
	option = gadgetui.util.createElement( "option" );
	option.value = _this.newOption.id;
	option.text = _this.newOption.text;
	_this.selector.add( option );

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
};

ComboBox.prototype.find = function( text ){
	var ix;
	for( ix = 0; ix < this.dataProvider.data.length; ix++ ){
		if( this.dataProvider.data[ix].text === text ){
			return this.dataProvider.data[ix].id;
		}
	}
	return;
};

ComboBox.prototype.getText = function( id ){
	var ix, 
		compId = parseInt( id, 10 );
	if( isNaN( compId ) === true ){
		compId = id;
	}
	for( ix = 0; ix < this.dataProvider.data.length; ix++ ){
		if( this.dataProvider.data[ix].id === compId ){
			return this.dataProvider.data[ix].text;
		}
	}
	return;
};
ComboBox.prototype.showLabel = function(){
	var css = gadgetui.util.setStyle;
	css( this.label, "display", "inline-block" );
	css( this.selectWrapper, "display", 'none' );
	css( this.inputWrapper, "display", 'none' );
};

ComboBox.prototype.addBehaviors = function( obj ) {
	var _this = this;

	this.comboBox
		.addEventListener( this.activate, function( ) {
			setTimeout( function( ) {
				if( _this.label.style.display != "none" ){
					console.log( "combo mouseenter ");
					//_this.label.style.display = "none" );
					_this.selectWrapper.style.display = "inline";
					_this.label.style.display = "none";
					if( _this.selector.selectedIndex <= 0 ) {
						_this.inputWrapper.style.display = "inline";
					}
				}
			}, _this.delay );
		});
	this.comboBox
		.addEventListener( "mouseleave", function( ) {
			console.log( "combo mouseleave ");
			if ( _this.selector != document.activeElement && _this.input != document.activeElement ) {
				_this.showLabel();
			}
		});

	_this.input
		.addEventListener( "click", function( e ){
			console.log( "input click ");
		});
	_this.input
		.addEventListener( "keyup", function( event ) {
			console.log( "input keyup");
			if ( event.which === 13 ) {
				var inputText =  gadgetui.util.encode( _this.input.value );
				_this.handleInput( inputText );
			}
		});
	_this.input
		.addEventListener( "blur", function( ) {
			console.log( "input blur" );

			if( gadgetui.util.mouseWithin( _this.selector, gadgetui.mousePosition ) === true ){
				_this.inputWrapper.style.display = 'none';
				_this.selector.focus();
			}else{
				_this.showLabel();
			}
		});

	this.selector
		.addEventListener( "mouseenter", function( ev ){
			_this.selector.style.display = "inline";
		});
	this.selector
		.addEventListener( "click", function( ev ){
			console.log( "select click");
			ev.stopPropagation();
		});
	this.selector
		.addEventListener( "change", function( event ) {
			var idx = ( event.target.selectedIndex >= 0 ) ? event.target.selectedIndex : 0;
			if( parseInt( event.target[ idx ].value, 10 ) !== parseInt( _this.id, 10 ) ){
				console.log( "select change");
				if( event.target.selectedIndex > 0 ){
					_this.inputWrapper.style.display = 'none';
					_this.setValue( event.target[ event.target.selectedIndex ].value );
				}else{
					_this.inputWrapper.style.display = 'block';
					_this.setValue( _this.newOption.value );
					_this.input.focus();
				}
				gadgetui.util.trigger( _this.selector, "gadgetui-combobox-change", { id: event.target[ event.target.selectedIndex ].value, text: event.target[ event.target.selectedIndex ].innerHTML } );
			}
		});
	this.selector
		.addEventListener( "blur", function( event ) {
			console.log( "select blur ");
			event.stopPropagation();
			setTimeout( function( ) {
				//if( _this.emitEvents === true ){

				if( _this.input !== document.activeElement ){
					_this.showLabel();
				}
			}, 200 );
		});
	
/*		$( "option", this.selector
		.on( "mouseenter", function( ev ){
			console.log( "option mouseenter" );
			if( _this.selector.css( "display" ) !== "inline" ){
				_this.selector.style.display = "inline";
			}
		});	*/
};

ComboBox.prototype.handleInput = function( inputText ){
	var id = this.find( inputText ),
		css = gadgetui.util.setStyle;
	if( id !== undefined ){
		this.selector.value = id;
		this.label.innerText = inputText;
		this.selector.focus();
		this.input.value = '';
		css( this.inputWrapper, "display", 'none' );
	}
	else if ( id === undefined && inputText.length > 0 ) {
		this.save( inputText );
	}
};

ComboBox.prototype.triggerSelectChange = function(){
	console.log("select change");
	var ev = new Event( "change", {
	    view: window,
	    bubbles: true,
	    cancelable: true
	  });
	this.selector.dispatchEvent( ev );
};

ComboBox.prototype.setSaveFunc = function(){
	var _this = this;

	if( this.save !== undefined ){
		var save = this.save;
		this.save = function( text ) {
			var _this = this,
				func,  
				promise, 
				args = [ text ],
				value = this.find( text );
			if( value === undefined ){	
				console.log( "save: " + text );

				promise = new Promise(
						function( resolve, reject ){
							args.push( resolve );
							args.push( reject );
							func = save.apply(_this, args);
							console.log( func );
						});
				promise.then(
						function( value ){
							function callback(){
								// trigger save event if we're triggering events 
								//if( _this.emitEvents === true ){
								gadgetui.util.trigger( _this.selector, "gadgetui-combobox-save", { id: value, text: text } );
									//_this.selector.dispatchEvent( new Event( "gadgetui-combobox-save" ), { id: value, text: text } );
								//}
								_this.input.value = '';
								_this.inputWrapper.style.display = 'none';
								_this.id = value;
								_this.dataProvider.refresh();
							}
							if( _this.animate === true && typeof Velocity !== "undefined" ){
								Velocity( _this.selectWrapper, {
									boxShadow: '0 0 5px ' + _this.glowColor,
									borderColor: _this.glowColor
								  }, _this.animateDelay / 2, function(){
									 _this.selectWrapper.style.borderColor = _this.glowColor;
								  } );							
								Velocity( _this.selectWrapper, {
									boxShadow: 0,
									borderColor: _this.borderColor
								  }, _this.animateDelay / 2, callback );
							}else{
								callback();
							}
						});
				promise['catch']( function( message ){
					_this.input.value= '';
					_this.inputWrapper.hide();
					console.log( message );
					_this.dataProvider.refresh();

				});
			}
		    return func;
		};
	}
};

ComboBox.prototype.setStartingValues = function(){
	( this.dataProvider.data === undefined ) ? this.dataProvider.refresh() : this.setControls();
};

ComboBox.prototype.setControls = function(){
	console.log( this );
	this.setSelectOptions();
	this.setValue( this.id );	
	this.triggerSelectChange();
};

ComboBox.prototype.setValue = function( id ){
	var text = this.getText( id );
	console.log( "setting id:" + id );
	// value and text can only be set to current values in this.dataProvider.data, or to "New" value
	this.id = ( text === undefined ? this.newOption.id : id );
	text = ( text === undefined ? this.newOption.text : text );

	this.text = text;
	this.label.innerText = this.text;
	this.selector.value = this.id;
};

ComboBox.prototype.setDataProviderRefresh = function(){
	var _this = this,
		promise,
		refresh = this.dataProvider.refresh,
		func;
	this.dataProvider.refresh = function(){
		var scope = this;
		if( refresh !== undefined ){
			promise = new Promise(
					function( resolve, reject ){
						var args = [ scope, resolve, reject ];
						func = refresh.apply( this, args );
					});
			promise
				.then( function(){
					gadgetui.util.trigger( _this.selector, "gadgetui-combobox-refresh" );
					//_this.selector.dispatchEvent( new Event( "gadgetui-combobox-refresh" ) );
					_this.setControls();
				});
			promise['catch']( function( message ){
					console.log( "message" );
					_this.setControls();
				});
		}
		return func;
	};
};

ComboBox.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	this.model =  (( options.model === undefined) ? this.model : options.model );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.dataProvider = (( options.dataProvider === undefined) ? undefined : options.dataProvider );
	this.save = (( options.save === undefined) ? undefined : options.save );
	this.activate = (( options.activate === undefined) ? "mouseenter" : options.activate );
	this.delay = (( options.delay === undefined) ? 10 : options.delay );
	this.inputBackground = (( options.inputBackground === undefined) ? "#ffffff" : options.inputBackground );
	this.borderWidth = (( options.borderWidth === undefined) ? 1 : options.borderWidth );
	this.borderColor = (( options.borderColor === undefined) ? "#d0d0d0" : options.borderColor );
	this.borderStyle = (( options.borderStyle === undefined) ? "solid" : options.borderStyle );
	this.borderRadius = (( options.borderRadius === undefined) ? 5 : options.borderRadius );
	this.width = (( options.width === undefined) ? 150 : options.width );
	this.newOption = (( options.newOption === undefined) ? { text: "...", id: 0 } : options.newOption );
	this.id = (( options.id === undefined) ? this.newOption.id : options.id );
	this.arrowIcon = (( options.arrowIcon === undefined) ? "/bower_components/gadget-ui/dist/img/arrow.png" : options.arrowIcon );
	this.scaleIconHeight = (( options.scaleIconHeight === undefined) ? false : options.scaleIconHeight );
	this.animate = (( options.animate === undefined) ? true : options.animate );
	this.glowColor = (( options.glowColor === undefined ) ? 'rgb(82, 168, 236)' : options.glowColor );
	this.animateDelay = (( options.animateDelay === undefined ) ? 500 : options.animateDelay );
	this.border = this.borderWidth + "px " + this.borderStyle + " " + this.borderColor;
	this.saveBorder = this.borderWidth + "px " + this.borderStyle + " " + this.glowColor;
};