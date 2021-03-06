function ComboBox( selector, options ){

	this.emitEvents = true;
	this.model = gadgetui.model;
	this.func;

	this.selector = selector;
	this.config( options );
	this.setSaveFunc();
	this.setDataProviderRefresh();

	this.addControl();
	this.setCSS();
	// bind to the model if binding is specified
	gadgetui.util.bind( this.selector, this.model );
	// bind to the model if binding is specified
	gadgetui.util.bind( this.label, this.model );
	this.addBehaviors();
	this.setStartingValues();
}

ComboBox.prototype.addControl = function(){
	$( this.selector )
		.wrap( "<div class='gadgetui-combobox'></div>")
		.wrap( "<div class='gadgetui-combobox-selectwrapper'></div>")
		.parent().parent()
		.append( "<div class='gadgetui-combobox-inputwrapper'><input class='gadgetui-combobox-input' value='' name='custom' type='text' placeholder='" + this.newOption.text + "'/></div>" )
		.prepend( "<div class='gadgetui-combobox-label' data-id='" + this.id +  "'>" + this.text + "</div>");

	this.comboBox = $( this.selector ).parent().parent();
	this.input = $( "input[class='gadgetui-combobox-input']", $( this.selector ).parent().parent() );
	this.label = $( "div[class='gadgetui-combobox-label']", $( this.selector ).parent().parent() );
	this.label.attr( "gadgetui-bind", this.selector.attr( "gadgetui-bind" ) );	

	this.inputWrapper = $( "div[class='gadgetui-combobox-inputwrapper']", $( this.selector ).parent().parent() );
	this.selectWrapper = $( "div[class='gadgetui-combobox-selectwrapper']", $( this.selector ).parent().parent() );
	this.comboBox.css( "opacity", ".0" );
	// set placeholder shim
	if( $.isFunction( this.input.placeholder) ){
		 this.input.placeholder();
	}
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

	this.selector
		.addClass( "gadgetui-combobox-select" )
		.css( "width", this.width )
		.css( "border", 0 )
		.css( "display", "inline" );

	this.comboBox
		.css( "position", "relative" );

	var rules,
		styles = gadgetui.util.getStyle( this.selector ),
		wrapperStyles = gadgetui.util.getStyle( this.selectWrapper ),
		inputWidth = this.selector[0].clientWidth,
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
	this.selector
		.css( "margin-top", selectMarginTop )
		.css( "padding-left", selectLeftPadding );

	this.inputWrapper
		.css( "position", "absolute" )
		.css( "top", inputWrapperTop )
		.css( "left", leftOffset );	

	this.input
		.css( "display", "inline" )
		.css( "padding-left", inputLeftOffset )
		.css( "margin-left",  inputLeftMargin )
		.css( "width", inputWidthAdjusted );

	this.label
		.css( "position", "absolute" )
		.css( "left", leftPosition )
		.css( "top", this.borderWidth + 1 )
		.css( "margin-left", 0 );

	this.selectWrapper
		.css( "display", "inline" )
		.css( "position", "absolute" )
		.css( "padding-bottom", "1px" )
		.css( "left", 0 );

	//appearance 
	this.comboBox
		.css( "font-size", styles.fontSize );	

	this.selectWrapper
		.css( "background-color", this.backgroundColor )
		.css( "border", this.border )
		.css( "border-radius", this.borderRadius );

	this.input
		.css( "border", 0 )
		.css( "font-size", styles.fontSize )
		.css( "background-color", this.inputBackground );

	this.label
		.css( "font-family", styles.fontFamily )
		.css( "font-size", styles.fontSize )
		.css( "font-weight", styles.fontWeight );
	// add rules for arrow Icon
	//we're doing this programmatically so we can skin our arrow icon
	if( navigator.userAgent.match( /Firefox/) ){
		
		this.selectWrapper
			.css( 'background-image', 'url(' + this.arrowIcon + ')')
			.css('background-repeat', 'no-repeat' )
			.css('background-position', 'right center' );

		if( this.scaleIconHeight === true ){
			this.selectWrapper
				.css( "background-size", this.arrowWidth + "px " + inputHeight + "px" );
		}
	}
	this.selector
		.css( '-webkit-appearance', 'none' )
		.css( '-moz-appearance', 'window')
		.css( "background-image", "url('" + this.arrowIcon + "')" )
		.css( 'background-repeat', 'no-repeat' )
		.css( 'background-position', 'right center' );


	if( this.scaleIconHeight === true ){
		this.selectWrapper
			.css( "background-size", this.arrowWidth + "px " + inputHeight + "px" );
	}

	this.inputWrapper.hide();
	this.selectWrapper.hide();
	this.comboBox.css( "opacity", "1" );
};

ComboBox.prototype.setSelectOptions = function(){
	var _this = this, id, text;

	$( _this.selector )
		.empty();
	//console.log( "append new option" );
	$( _this.selector )
		.append( "<option value='" + _this.newOption.id + "'>" + _this.newOption.text + "</option>" );

	$.each( this.dataProvider.data, function( ix, obj ){
		id = obj.id;
		text = obj.text;
		if( text === undefined ){ 
			text = id; 
		}
		//console.log( "append " + text );
		$( _this.selector )
			.append( "<option value=" + id + ">" + text );
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
	this.label.css( "display", "inline-block" );
	this.selectWrapper.hide();
	this.inputWrapper.hide();
};

ComboBox.prototype.addBehaviors = function( obj ) {
	var _this = this;

	$( this.comboBox )
		.on( this.activate, function( ) {
			setTimeout( function( ) {
				if( _this.label.css( "display" ) != "none" ){
					console.log( "combo mouseenter ");
					//_this.label.css( "display", "none" );
					_this.selectWrapper.css( "display", "inline" );
					_this.label.css( "display", "none" );
					if( _this.selector.prop('selectedIndex') <= 0 ) {
						_this.inputWrapper.css( "display", "inline" );
					}
				//	_this.selector
				//		.css( "display", "inline" );
				}
			}, _this.delay );
		})
		.on( "mouseleave", function( ) {
			console.log( "combo mouseleave ");
			if ( _this.selector.is( ":focus" ) === false && _this.input.is( ":focus" ) === false ) {
				_this.showLabel();
			}
		});

	_this.input
		.on( "click", function( e ){
			console.log( "input click ");
		})
		.on( "keyup", function( event ) {
			console.log( "input keyup");
			if ( event.which === 13 ) {
				var inputText =  gadgetui.util.encode( _this.input.val() );
				_this.handleInput( inputText );
			}
		})
		.on( "blur", function( ) {
			console.log( "input blur" );

			if( gadgetui.util.mouseWithin( _this.selector, gadgetui.mousePosition ) === true ){
				_this.inputWrapper.hide();
				_this.selector.focus();
			}else{
				_this.showLabel();
			}
		});

	this.selector
		.on( "mouseenter", function( ev ){
			_this.selector.css( "display", "inline" );
		})
		.on( "click", function( ev ){
			console.log( "select click");
			ev.stopPropagation();
		})
		.on( "change", function( event ) {
			var idx = ( event.target.selectedIndex >= 0 ) ? event.target.selectedIndex : 0;
			if( parseInt( event.target[ idx ].value, 10 ) !== parseInt( _this.id, 10 ) ){
				console.log( "select change");
				if( event.target.selectedIndex > 0 ){
					_this.inputWrapper.hide();
					_this.setValue( event.target[ event.target.selectedIndex ].value );
				}else{
					_this.inputWrapper.show();
					_this.setValue( _this.newOption.value );
					_this.input.focus();
				}
				$( _this.selector )
					.trigger( "gadgetui-combobox-change", [ { id: event.target[ event.target.selectedIndex ].value, text: event.target[ event.target.selectedIndex ].innerHTML } ] );
	
				console.log( "label:" + _this.label.text() );
			}
		})

		.on( "blur", function( event ) {
			console.log( "select blur ");
			event.stopPropagation();
			setTimeout( function( ) {
				//if( _this.emitEvents === true ){

				if( _this.input.is( ":focus" ) === false ){
					_this.showLabel();
				}
			}, 200 );
		} );
	
	$( "option", this.selector )
		.on( "mouseenter", function( ev ){
			console.log( "option mouseenter" );
			if( _this.selector.css( "display" ) !== "inline" ){
				_this.selector.css( "display", "inline" );
			}
		});
};

ComboBox.prototype.handleInput = function( inputText ){
	var id = this.find( inputText );
	if( id !== undefined ){
		this.selector.val( id );
		this.label.text( inputText );
		this.selector.focus();
		this.input.val('');
		this.inputWrapper.hide();
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
	this.selector[0].dispatchEvent( ev );
};

ComboBox.prototype.setSaveFunc = function(){
	var _this = this;

	if( $.isFunction( this.save ) === true ){
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
									_this.selector.trigger( "gadgetui-combobox-save", { id: value, text: text } );
								//}
								_this.input.val( "" );
								_this.inputWrapper.hide();
								_this.id = value;
								_this.dataProvider.refresh();
							}
							if( _this.animate === true ){
								_this.selectWrapper.animate({
									boxShadow: '0 0 5px ' + _this.glowColor,
									borderColor: _this.glowColor
								  }, _this.animateDelay / 2 );							
								_this.selectWrapper.animate({
									boxShadow: 0,
									borderColor: _this.borderColor
								  }, _this.animateDelay / 2, callback );
							}else{
								callback();
							}
						});
				promise['catch']( function( message ){
					_this.input.val( "" );
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
	this.label.text( this.text );
	this.selector.val( this.id );
};

ComboBox.prototype.setDataProviderRefresh = function(){
	var _this = this,
		promise,
		refresh = this.dataProvider.refresh,
		func;
	this.dataProvider.refresh = function(){
		var scope = this;
		if( $.isFunction( refresh ) === true ){
			promise = new Promise(
					function( resolve, reject ){
						var args = [ scope, resolve, reject ];
						func = refresh.apply( this, args );
					});
			promise
				.then( function(){
					_this.selector.trigger( "gadgetui-combobox-refresh" );
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

ComboBox.prototype.config = function( args ){
	if( args !== undefined ){
		this.model =  (( args.model === undefined) ? this.model : args.model );
		this.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
		this.dataProvider = (( args.dataProvider === undefined) ? undefined : args.dataProvider );
		this.save = (( args.save === undefined) ? undefined : args.save );
		this.activate = (( args.activate === undefined) ? "mouseenter" : args.activate );
		this.delay = (( args.delay === undefined) ? 10 : args.delay );
		this.inputBackground = (( args.inputBackground === undefined) ? "#ffffff" : args.inputBackground );
		this.borderWidth = (( args.borderWidth === undefined) ? 1 : args.borderWidth );
		this.borderColor = (( args.borderColor === undefined) ? "#d0d0d0" : args.borderColor );
		this.borderStyle = (( args.borderStyle === undefined) ? "solid" : args.borderStyle );
		this.borderRadius = (( args.borderRadius === undefined) ? 5 : args.borderRadius );
		this.border = this.borderWidth + "px " + this.borderStyle + " " + this.borderColor;
		this.width = (( args.width === undefined) ? 150 : args.width );
		this.newOption = (( args.newOption === undefined) ? { text: "...", id: 0 } : args.newOption );
		this.id = (( args.id === undefined) ? this.newOption.id : args.id );
		this.arrowIcon = (( args.arrowIcon === undefined) ? "/bower_components/gadget-ui/dist/img/arrow.png" : args.arrowIcon );
		this.scaleIconHeight = (( args.scaleIconHeight === undefined) ? false : args.scaleIconHeight );
		this.animate = (( args.animate === undefined) ? true : args.animate );
		this.glowColor = (( args.glowColor === undefined ) ? 'rgb(82, 168, 236)' : args.glowColor );
		this.animateDelay = (( args.animateDelay === undefined ) ? 500 : args.animateDelay );
	}
};