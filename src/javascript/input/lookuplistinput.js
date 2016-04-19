
function LookupListInput( selector, options ){
	function _renderLabel( item ){
		return item.label;
	};
	this.itemRenderer = _renderLabel;
	this.menuItemRenderer = _renderLabel;
	this.selector = selector;
	this.items = [];
	this.config( options );
	this.setIsMultiLine();
	this.addControl();
	this.addBindings();
}

LookupListInput.prototype.addControl = function(){
	this.wrapper = document.createElement( "div" );
	
	gadgetui.util.addClass( this.wrapper, "gadgetui-lookuplistinput" );
	this.selector.parentNode.insertBefore( this.wrapper, this.selector );
	this.selector.parentNode.removeChild( this.selector );
	this.wrapper.appendChild( this.selector );
	//$( this.selector ).wrap( '<div class="gadgetui-lookuplistinput-div ui-widget-content ui-corner-all"></div>' );
};

// adapted from jQuery UI autocomplete. modified and re-distributed per MIT License.
LookupListInput.prototype.initSource = function(){
		var array, url,
			that = this;
		if ( typeof this.datasource === Array ) {
			array = this.datasource;
			this.source = function( request, response ) {
				response( that.filter( array, request.term ) );
			};
		} else if ( typeof this.datasource === "string" ) {
			url = this.datasource;
			this.source = function( request, response ) {
				if ( that.xhr ) {
					that.xhr.abort();
				}
				that.xhr = fetch({
					url: url,
					data: request,
					dataType: "json",
					success: function( data ) {
						response( data );
					},
					error: function() {
						response([]);
					}
				});
			};
		} else {
			this.source = this.datasource;
		}
};

//adapted from jQuery UI autocomplete. modified and re-distributed per MIT License.
LookupListInput.prototype.escapeRegex = function( value ) {
	return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
};

//adapted from jQuery UI autocomplete. modified and re-distributed per MIT License.
LookupListInput.prototype.filter = function( array, term ) {
	var matcher = new RegExp( this.escapeRegex( term ), "i" );
	return gadgetui.util.grep( array, function( value ) {
		return matcher.test( value.label || value.value || value );
	});
};

LookupListInput.prototype.setIsMultiLine = function(){
	var nodeName = this.selector.nodeName.toLowerCase(),
	isTextarea = nodeName === "textarea",
	isInput = nodeName === "input";

	this.isMultiLine = isTextarea ? true : isInput ? false : this.selector.getAttribute( "isContentEditable" );
};

LookupListInput.prototype.addBindings = function(){
	var that = this;
	
	this.wrapper
		.addEventListener( "click", function(){
			that.selector.focus();
		});
	
	var suppressKeyPress, suppressKeyPressRepeat, suppressInput;
	
	
	this.valueMethod = this.selector[ isTextarea || isInput ? "value" : "innerText" ];
	this.isNewMenu = true;
	
	this.selector.setAttribute( "autocomplete", "off" );
	
	this.selector
		.addEventListener( "keydown", function( event ) {
			if ( this.selector.prop( "readOnly" ) ) {
				suppressKeyPress = true;
				suppressInput = true;
				suppressKeyPressRepeat = true;
				return;
			}
	
			suppressKeyPress = false;
			suppressInput = false;
			suppressKeyPressRepeat = false;
			var keyCode = gadgetui.keyCode;
			switch ( event.keyCode ) {
			case keyCode.PAGE_UP:
				suppressKeyPress = true;
				this._move( "previousPage", event );
				break;
			case keyCode.PAGE_DOWN:
				suppressKeyPress = true;
				this._move( "nextPage", event );
				break;
			case keyCode.UP:
				suppressKeyPress = true;
				this._keyEvent( "previous", event );
				break;
			case keyCode.DOWN:
				suppressKeyPress = true;
				this._keyEvent( "next", event );
				break;
			case keyCode.ENTER:
				// when menu is open and has focus
				if ( this.menu.active ) {
					// #6055 - Opera still allows the keypress to occur
					// which causes forms to submit
					suppressKeyPress = true;
					event.preventDefault();
					this.menu.select( event );
				}
				break;
			case keyCode.TAB:
				if ( this.menu.active ) {
					this.menu.select( event );
				}
				break;
			case keyCode.ESCAPE:
				if ( this.menu.element.is( ":visible" ) ) {
					if ( !this.isMultiLine ) {
						this._value( this.term );
					}
					this.close( event );
					// Different browsers have different default behavior for escape
					// Single press can mean undo or clear
					// Double press in IE means clear the whole form
					event.preventDefault();
				}
				break;
			default:
				suppressKeyPressRepeat = true;
				// search timeout should be triggered before the input value is changed
				this._searchTimeout( event );
				break;
			}
		});

	this.selector
		.addEventListener( "keypress", function( event ) {
			if ( suppressKeyPress ) {
				suppressKeyPress = false;
				if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
					event.preventDefault();
				}
				return;
			}
			if ( suppressKeyPressRepeat ) {
				return;
			}
	
			// replicate some key handlers to allow them to repeat in Firefox and Opera
			var keyCode = gadgetui.keyCode;
			switch ( event.keyCode ) {
			case keyCode.PAGE_UP:
				this._move( "previousPage", event );
				break;
			case keyCode.PAGE_DOWN:
				this._move( "nextPage", event );
				break;
			case keyCode.UP:
				this._keyEvent( "previous", event );
				break;
			case keyCode.DOWN:
				this._keyEvent( "next", event );
				break;
			}
		});

	this.selector
		.addEventListener( "input", function( event ) {	
			if ( suppressInput ) {
				suppressInput = false;
				event.preventDefault();
				return;
			}
			this._searchTimeout( event );
		});

	this.selector
		.addEventListener( "focus", function( event ) {	
			this.selectedItem = null;
			this.previous = this._value();
		});

	this.selector
		.addEventListener( "blur", function( event ) {	
			if ( this.cancelBlur ) {
				delete this.cancelBlur;
				return;
			}
	
			clearTimeout( this.searching );
			this.close( event );
			this._change( event );
		});
	
	
	
	
	
	
	
	
	
		/*	.addEventListener( "click", "div[class~='gadgetui-lookuplist-input-cancel']", function(e){
			that.remove( that.selector, $( e.target ).attr( "gadgetui-lookuplist-input-value" ) );
		});	*/
	/*	
	$( this.selector )
		.autocomplete( {
			minLength : that.minLength,
			source : function( request, response ) {
				response( $.ui.autocomplete.filter( that.datasource, gadgetui.util.extractLast( request.term ) ) );
			},

			focus : function( ) {
				// prevent value inserted on
				// focus
				return false;
			},
			select : function( event, ui ) {
				var terms = gadgetui.util.split( this.value );
				// remove the current input
				terms.pop( );

				that.add( that.selector, ui.item );
				this.value = '';
				this.focus( );
				return false;
			}
		} ).on( "keydown", function( event ) {
			$( this )
				.css( "width", Math.round( ( $( this ).val( ).length * 0.66 ) + 3 ) + "em" );
	
			if ( event.keyCode === $.ui.keyCode.TAB && $( this ).data( "ui-autocomplete" ).menu.active ) {
				event.preventDefault( );
			}
			if ( event.keyCode === $.ui.keyCode.BACKSPACE && $( this ).val( ).length === 0 ) {
				event.preventDefault();
				var elem = $( this ).prev( "div[class~='gadgetui-lookuplist-input-item-wrapper']" );

				elem.remove( );
			}
		});

	$.ui.autocomplete.prototype._renderItem = function( ul, item){
		if( typeof that.menuItemRenderer === "function"){
			return $( "<li>" )
			.setAttribute( "data-value", item.value )
			.append( $( "<a>" ).text( that.menuItemRenderer( item ) ) )
			.appendTo( ul );
		}else{
			//default jquery-ui implementation
			return $( "<li>" )
			.append( $( "<a>" ).text( item.label ) )
			.appendTo( ul );
		}
	};		*/
};

LookupListInput.prototype.add = function( el, item ){
	var prop, list, itemWrapper, itemCancel, itemNode;

	itemWrapper = document.createElement( "div" );
	gadgetui.util.addClass( itemWrapper, "gadgetui-lookuplistinput-itemwrapper" );
	itemCancel = document.createElement( "div" );
	gadgetui.util.addClass( itemCancel, "gadgetui-lookuplistinput-cancel" );
	itemCancel.setAttribute( "gadgetui-lookuplistinput-value", item.value );
	if( item.title !== undefined ){
		itemCancel.setAttribute( "title", item.title );
	}
	itemNode = document.createElement( "div" );
	gadgetui.util.addClass( itemNode, "gadgetui-lookuplistinput-item" ); 
	itemNode.innerHTML = this.itemRenderer( item );
	itemWrapper.appendChild( itemCancel );
	itemWrapper.appendChild( itemNode );
	itemWrapper.insertBefore( el );
	el.value = '';

	this.items.push( item );
	if( this.emitEvents === true ){
		gadgetui.util.trigger( el, "gadgetui-lookuplistinput-add", item );
	}

	if( this.func !== undefined ){
		this.func( item, 'add' );
	}
	if( this.model !== undefined ){
		//update the model 
		prop = el.getAttribute( "gadgetui-bind" );
		list = this.model.get( prop );
		if( typeof list === Array ){
			list = [];
		}
		list.push( item );
		this.model.set( prop, list );
	}
};

LookupListInput.prototype.remove = function( el, value ){
	el.parentNode.querySelector( "div[gadgetui-lookuplistinput-value='" + value + "']" ).parentNode.remove();

	var that = this, prop, list;

	if( this.model !== undefined ){
		prop = el.getAttribute( "gadgetui-bind" );
		list = this.model.get( prop );
		list.forEach( function( obj, ix ){
			if( obj.value === value ){
				list.splice( ix, 1 );
				if( that.func !== undefined ){
					that.func( obj, 'remove' );
				}
				if( that.emitEvents === true ){
					gadgetui.util.trigger( el, "gadgetui-lookuplistinput-remove", obj );
				}
				that.model.set( prop, list );
				return false;
			}
		});
	}
};

LookupListInput.prototype.reset = function(){
	this.el.parentNode.querySelector( ".gadgetui-lookuplist-input-item-wrapper" ).empty();

	if( this.model !== undefined ){
		prop = this.el.getAttribute( "gadget-ui-bind" );
		list = this.model.get( prop );
		list.length = 0;
	}
};

LookupListInput.prototype.destroy = function() {
	clearTimeout( this.searching );
	//this.selector.removeClass( "gadgetui-lookuplistinput" );
	this.menu.element.remove();
	this.liveRegion.remove();
};

LookupListInput.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	// if binding but no model was specified, use gadgetui model
	if( this.selector.getAttribute( "gadgetui-bind" ) !== undefined ){
		this.model = (( options.model === undefined) ? gadgetui.model : options.model );
	}

	this.func = (( options.func === undefined) ? undefined : options.func );
	this.itemRenderer = (( options.itemRenderer === undefined) ? this.itemRenderer : options.itemRenderer );
	this.menuItemRenderer = (( options.menuItemRenderer === undefined) ? this.menuItemRenderer : options.menuItemRenderer );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.datasource = (( options.datasource === undefined) ? (( options.lookupList !== undefined ) ? options.lookupList : true ) : options.datasource );
	this.minLength = (( options.minLength === undefined) ? 0 : options.minLength );
	return this;
};