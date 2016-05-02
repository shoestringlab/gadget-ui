

//author - Robert Munn <robertdmunn@gmail.com>

// significant portions of code from jQuery UI
//adapted from jQuery UI autocomplete. modified and re-distributed per MIT License.


function LookupListInput( selector, options ){
	this.selector = selector;
	this.items = [];
	this.config( options );
	this.setIsMultiLine();
	this.addControl();
	this.initSource();
	this.addMenu();
	this.addBindings();
}

LookupListInput.prototype.addControl = function(){
	this.wrapper = document.createElement( "div" );
	if( this.width !== undefined ){
		gadgetui.util.setStyle( this.wrapper, "width", this.width );
	}
	gadgetui.util.addClass( this.wrapper, "gadgetui-lookuplist-input" );
	this.selector.parentNode.insertBefore( this.wrapper, this.selector );
	this.selector.parentNode.removeChild( this.selector );
	this.wrapper.appendChild( this.selector );
};

LookupListInput.prototype.addMenu = function(){
	var div = document.createElement( "div" );
	gadgetui.util.addClass( div, "gadgetui-lookuplist-menu" );
	gadgetui.util.setStyle( div, "display", "none" );
	
	this.menu = {
			element: div
		};
		
	this.wrapper.appendChild( this.menu.element );
};

LookupListInput.prototype.initSource = function(){
	var array, url,
		_this = this;
	if ( this.datasource.constructor === Array ) {
		array = this.datasource;
		this.source = function( request, response ) {
			var content = _this.filter( array, request.term );
			response( content );
		};
	} else if ( typeof this.datasource === "string" ) {
		url = this.datasource;
		this.source = function( request, response ) {
			if ( _this.xhr ) {
				_this.xhr.abort();
			}
			_this.xhr = fetch({
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

LookupListInput.prototype.escapeRegex = function( value ) {
	return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
};

LookupListInput.prototype._filter = function( array, term ) {
	var matcher = new RegExp( this.escapeRegex( term ), "i" );
	return gadgetui.util.grep( array, function( value ) {
		return matcher.test( value.label || value.value || value );
	});
};

LookupListInput.prototype.checkForDuplicate = function( item ) {
	var ix, found = false;
	for( ix = 0; ix < this.items.length; ix++ ){
		if( this.items[ix].value === item.value ){
			found = true;
			break;
		}
	}
	return found;
};

LookupListInput.prototype.makeUnique = function( content ) {
	var ix, results = [];
	for( ix = 0; ix < content.length; ix++ ){
		if( !this.checkForDuplicate( content[ ix ] ) ){
			results.push( content[ ix ] );
		}
	}
	return results;
};

LookupListInput.prototype.setIsMultiLine = function(){
	var nodeName = this.selector.nodeName.toLowerCase(),
	isTextarea = nodeName === "textarea",
	isInput = nodeName === "input";

	this.isMultiLine = isTextarea ? true : isInput ? false : this.selector.getAttribute( "isContentEditable" );
};

LookupListInput.prototype.addBindings = function(){
	var _this = this, suppressKeyPress, suppressKeyPressRepeat, suppressInput, nodeName = this.selector.nodeName.toLowerCase();
	this.isTextarea = nodeName === "textarea";
	this.isInput = nodeName === "input";
	this.wrapper
		.addEventListener( "click", function(){
			_this.selector.focus();
		});

	this.valueMethod = this.selector[ this.isTextarea || this.isInput ? "value" : "innerText" ];
	this.isNewMenu = true;

	this.selector.setAttribute( "autocomplete", "off" );

	this.selector
		.addEventListener( "keydown", function( event ) {
			if ( this.getAttribute( "readOnly" ) ) {
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
				if ( _this.menu.active ) {
					// #6055 - Opera still allows the keypress to occur
					// which causes forms to submit
					suppressKeyPress = true;
					event.preventDefault();
					_this.menu.select( event );
				}
				break;
			case keyCode.BACKSPACE:
				if( !this.value.length && _this.items.length ){
					var selector = this.previousSibling;
					_this.remove( selector );
				}
				break;
			case keyCode.TAB:
				if ( _this.menu.active ) {
					_this.menu.select( event );
				}
				break;
			case keyCode.ESCAPE:
				if ( _this.menu.element.style.display !== 'none' ) {
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
				_this._searchTimeout( event );
				break;
			}
		});

	this.selector
		.addEventListener( "keypress", function( event ) {
			if ( suppressKeyPress ) {
				suppressKeyPress = false;
				if ( !this.isMultiLine || _this.menu.element.style.display !== 'none' ) {
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
			_this._searchTimeout( event );
		});

	this.selector
		.addEventListener( "focus", function( event ) {	
			this.selectedItem = null;
			this.previous = this.value;
		});

	this.selector
		.addEventListener( "blur", function( event ) {	
			if ( this.cancelBlur ) {
				delete this.cancelBlur;
				return;
			}
	
			clearTimeout( this.searching );
			_this.close( event );
			_this._change( event );
		});

	// menu bindings
	this.menu.element.addEventListener("mousedown", function( event ) {
		// prevent moving focus out of the text field
		event.preventDefault();

		// IE doesn't prevent moving focus even with event.preventDefault()
		// so we set a flag to know when we should ignore the blur event
		this.cancelBlur = true;
		gadgetui.util.delay(function() {
			delete this.cancelBlur;
		});

		// clicking on the scrollbar causes focus to shift to the body
		// but we can't detect a mouseup or a click immediately afterward
		// so we have to track the next mousedown and close the menu if
		// the user clicks somewhere outside of the autocomplete
		var menuElement = _this.menu.element;
		if ( !event.target.classList.contains( "gadgetui-lookuplist-item" ) ) {
			gadgetui.util.delay(function() {
				this.document.one( "mousedown", function( event ) {
					if ( event.target !== _this.menu.element &&
							event.target !== menuElement &&
							!gadgetui.util.contains( menuElement, event.target ) ) {
						_this.close();
					}
				});
			});
		}
	});
	
	this.menu.element.addEventListener( "menuselect", function( event ) {	
		var item = event.detail,
			previous = _this.previous;

		// only trigger when focus was lost (click on menu)
		if ( _this.menu.element !== document.activeElement ) {
			_this.menu.element.focus();
			_this.previous = previous;
			// #6109 - IE triggers two focus events and the second
			// is asynchronous, so we need to reset the previous
			// term synchronously and asynchronously :-(
			gadgetui.util.delay(function() {
				_this.previous = previous;
				_this.selectedItem = item;
			});
		}

		//if ( false !== this._trigger( "select", event, { item: item } ) ) {
			_this._value( item.value );
		//}
		// reset the term after the select event
		// this allows custom select handling to work properly
		_this.term = _this._value();

		_this.close( event );
		_this.selectedItem = item;
		if( !_this.checkForDuplicate( item ) ){
			_this.add( item );
		}else{
			
		}
	});
};

LookupListInput.prototype._renderItem = function( item ){
	var itemNode, itemWrapper = document.createElement( "div" );
	gadgetui.util.addClass( itemWrapper, "gadgetui-lookuplist-input-item-wrapper" );
	itemNode = document.createElement( "div" );
	gadgetui.util.addClass( itemNode, "gadgetui-lookuplist-input-item" ); 
	itemNode.innerHTML = this.labelRenderer( item );
	itemWrapper.appendChild( itemNode );
	return itemWrapper;
};

LookupListInput.prototype._renderItemCancel = function( item, wrapper ){
	var	css = gadgetui.util.setStyle,
		itemCancel = document.createElement( "span" ),
		spanLeft = gadgetui.util.getNumberValue( gadgetui.util.getStyle( wrapper, "width" ) )
		+ 6;  // font-size of icon 
		//- 3; // top offset of icon
	
	gadgetui.util.addClass( itemCancel, "oi" );
	itemCancel.setAttribute( 'data-glyph', "circle-x" );
	css( itemCancel, "font-size", 12 );
	css( itemCancel, "opacity", ".5" );
	css( itemCancel, "left", spanLeft );
	css( itemCancel, "position", "absolute" );
	css( itemCancel, "cursor", "pointer"  );
	css( itemCancel, "top", 3 );
	return itemCancel;
};

LookupListInput.prototype.add = function( item ){
	var _this = this,
		prop, list, itemWrapper,
		itemCancel;
	
	itemWrapper = this.itemRenderer( item );
	itemWrapper.setAttribute( "data-value", item.value );
	this.wrapper.insertBefore( itemWrapper, this.selector );
	itemCancel = this.itemCancelRenderer( item, itemWrapper );
	if( itemCancel !== undefined ){
		itemWrapper.appendChild( itemCancel );
		itemCancel.addEventListener( "click", function( event ){
			_this.remove( this.parentNode );
		});
	}
	
	this.selector.value = '';
	this.items.push( item );
	
	if( this.emitEvents === true ){
		gadgetui.util.trigger( this.selector, "gadgetui-lookuplist-input-add", item );
	}

	if( this.func !== undefined ){
		this.func( item, 'add' );
	}
	if( this.model !== undefined ){
		//update the model 
		prop = this.selector.getAttribute( "gadgetui-bind" );
		list = this.model.get( prop );
		if( typeof list === Array ){
			list = [];
		}
		list.push( item );
		this.model.set( prop, list );
	}
};

LookupListInput.prototype.remove = function( selector ){
	//el.parentNode.querySelector( "div[data-value='" + value + "']" ).parentNode.remove();
	var _this = this, removed, ix, prop, list, value = selector.getAttribute( "data-value" );

	selector.parentNode.removeChild( selector );
	// remove from internal array
	for( ix = 0; ix < this.items.length; ix++ ){
		if( this.items[ ix ].value === value ){
			removed = this.items.splice( ix, 1 );
		}
	}
	if( this.model !== undefined ){
		prop = this.selector.getAttribute( "gadgetui-bind" );
		list = this.model.get( prop );
		list.forEach( function( obj, ix ){
			if( obj.value === value ){
				list.splice( ix, 1 );
				if( _this.func !== undefined ){
					_this.func( obj, 'remove' );
				}
				if( _this.emitEvents === true ){
					gadgetui.util.trigger( _this.selector, "gadgetui-lookuplist-input-remove", obj );
				}
				_this.model.set( prop, list );
				return false;
			}
		});
	}
};

LookupListInput.prototype.reset = function(){

	while ( this.wrapper.firstChild && this.wrapper.firstChild !== this.selector ) {
			this.wrapper.removeChild( this.wrapper.firstChild );
	}
	this.items = [];
	if( this.model !== undefined ){
		prop = this.el.getAttribute( "gadget-ui-bind" );
		list = this.model.set( prop, [] );		
	}
};

LookupListInput.prototype.destroy = function() {
	clearTimeout( this.searching );
	//this.selector.removeClass( "gadgetui-lookuplist-input" );
	this.menu.element.remove();
	this.liveRegion.remove();
};

LookupListInput.prototype._setOption = function( key, value ) {
//_setOption: function( key, value ) {
	this._super( key, value );
	if ( key === "source" ) {
		this._initSource();
	}
	if ( key === "appendTo" ) {
		this.menu.element.appendTo( this._appendTo() );
	}
	if ( key === "disabled" && value && this.xhr ) {
		this.xhr.abort();
	}
};

LookupListInput.prototype._appendTo = function() {
//_appendTo: function() {
	var element = this.options.appendTo;

	if ( element ) {
		element = element.jquery || element.nodeType ?
			$( element ) :
			this.document.find( element ).eq( 0 );
	}

	if ( !element || !element[ 0 ] ) {
		element = this.element.closest( ".ui-front" );
	}

	if ( !element.length ) {
		element = this.document[ 0 ].body;
	}

	return element;
};

LookupListInput.prototype._searchTimeout = function( event ) {
	var _this = this;
	clearTimeout( this.searching );
	this.searching = gadgetui.util.delay(function() {

		// Search if the value has changed, or if the user retypes the same value (see #7434)
		var equalValues = this.term === _this.selector.value,
			menuVisible = _this.menu.element.style.display !== 'none',
			modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

		if ( !equalValues || ( equalValues && !menuVisible && !modifierKey ) ) {
			_this.selectedItem = null;
			_this.search( null, event );
		}
	}, this.delay );
};

LookupListInput.prototype.search = function( value, event ) {
	var _this = this;
	value = value != null ? value : _this.selector.value;

	// always save the actual value, not the one passed as an argument
	this.term = this._value();

	if ( value.length < this.minLength ) {
		return this.close( event );
	}

	return this._search( value );
};

LookupListInput.prototype._search = function( value ) {
	this.pending++;
	this.cancelSearch = false;

	this.source( { term: value }, this._response() );
};

LookupListInput.prototype._response = function() {
	//_response: function() {
	var _this = this, 
		index = ++this.requestIndex,
		fn = function( content ) {
				_this.__response( content );

			_this.pending--;
			if ( !_this.pending ) {
				//this.element.removeClass( "ui-autocomplete-loading" );
			}
		},
		proxy = function(){
			return fn.apply( _this, arguments );
		};
	return proxy;
};

LookupListInput.prototype.__response = function( content ) {
	//__response: function( content ) {
	content = this.makeUnique( content );
	
	if ( content && content.length ) {
		content = this._normalize( content );
	}
	//this._trigger( "response", null, { content: content } );
	this.selector.dispatchEvent( new CustomEvent( "response", { content: content } ) );
	if ( !this.disabled && content && content.length && !this.cancelSearch ) {
		this._suggest( content );
		this.selector.dispatchEvent( new Event( "open" ) );
		//this._trigger( "open" );
	} else {
		// use ._close() instead of .close() so we don't cancel future searches
		this._close();
	}
};

LookupListInput.prototype.close = function( event ) {
	this.cancelSearch = true;
	this._close( event );
};

LookupListInput.prototype._close = function( event ) {
	if ( this.menu.element.style.display !== 'none' ) {
		this.menu.element.style.display = 'none';
		this.menu.element.blur();
		this.isNewMenu = true;
		//this.selector.dispatchEvent( event );
		//this._trigger( "close", event );
	}
};

LookupListInput.prototype._change = function( event ) {
	if ( this.previous !== this._value() ) {
	//	this._trigger( "change", event, { item: this.selectedItem } );
		//this.selector.dispatchEvent( event );
	}
};

LookupListInput.prototype._normalize = function( items ) {
	// assume all items have the right format when the first item is complete
	if ( items.length && items[ 0 ].label && items[ 0 ].value ) {
		return items;
	}
	return items.map( function( item ) {
		if ( typeof item === "string" ) {
			return {
				label: item,
				value: item
			};
		}
		item.label = item.label || item.value;
		item.value = item.value || item.label;
		
		return item;
	});
};

LookupListInput.prototype._suggest = function( items ) {
	var div = this.menu.element;
	while (div.firstChild) {
		div.removeChild( div.firstChild );
	}
	this._renderMenu( items );
	this.isNewMenu = true;
	//this.menu.refresh();

	// size and position menu
	div.style.display = 'block';
	this._resizeMenu();
	this.position.of = this.element;
	
	if ( this.autoFocus ) {
	//	this.menu.next();
	}
};

LookupListInput.prototype._resizeMenu = function() {
	var div = this.menu.element;
	// don't change it right now
};

LookupListInput.prototype._renderMenu = function( items ) {
	var _this = this, ix;
/*		items.forEach( function( item, index ) {
		_this._renderItemData( item );
	});	*/
	var maxItems = Math.min( this.maxSuggestions, items.length );
	for( ix = 0; ix < maxItems; ix++ ){
		_this._renderItemData( items[ ix ] );
	}
};

LookupListInput.prototype._renderItemData = function( item ) {
	var _this = this,
		menuItem = this.menuItemRenderer( item );

	menuItem.addEventListener( "click", function( event ){
		var ev = new CustomEvent( "menuselect", { detail: item } );
		_this.menu.element.dispatchEvent( ev );
	});
	this.menu.element.appendChild( menuItem );
	
};

LookupListInput.prototype._renderMenuItem = function( item ) {
	var menuItem = document.createElement( "div" );
	gadgetui.util.addClass( menuItem, "gadgetui-lookuplist-item" );
	menuItem.setAttribute( "value", item.value );
	menuItem.innerText = this.labelRenderer( item );
	return menuItem;
};

LookupListInput.prototype._renderLabel = function( item ) {
	return item.label;
};

LookupListInput.prototype._move = function( direction, event ) {
	if ( !this.menu.element.style.display !== 'none' ) {
		this.search( null, event );
		return;
	}
	if ( this.menu.element.isFirstItem() && /^previous/.test( direction ) ||
			this.menu.element.isLastItem() && /^next/.test( direction ) ) {

		if ( !this.isMultiLine ) {
			this._value( this.term );
		}

		this.menu.blur();
		return;
	}
	this.menu[ direction ]( event );
};

LookupListInput.prototype.widget = function() {
	return this.menu.element;
};

LookupListInput.prototype._value = function() {
	return ( this.isInput ? this.selector.value : this.selector.innerText );      
};

LookupListInput.prototype._keyEvent = function( keyEvent, event ) {
	if ( !this.isMultiLine || this.menu.element.style.display !== 'none' ) {
		this._move( keyEvent, event );

		// prevents moving cursor to beginning/end of the text field in some browsers
		event.preventDefault();
	}
};

LookupListInput.prototype.config = function( options ){
	options = ( options === undefined ? {} : options );
	// if binding but no model was specified, use gadgetui model
	if( this.selector.getAttribute( "gadgetui-bind" ) !== undefined ){
		this.model = (( options.model === undefined) ? gadgetui.model : options.model );
	}
	this.width = (( options.width === undefined) ? undefined : options.width );
	this.func = (( options.func === undefined) ? undefined : options.func );
	this.filter = (( options.filter === undefined) ? this._filter : options.filter );
	this.labelRenderer = (( options.labelRenderer === undefined) ? this._renderLabel : options.labelRenderer );
	this.itemRenderer = (( options.itemRenderer === undefined) ? this._renderItem : options.itemRenderer );
	this.menuItemRenderer = (( options.menuItemRenderer === undefined) ? this._renderMenuItem : options.menuItemRenderer );
	this.itemCancelRenderer = (( options.itemCancelRenderer === undefined) ? this._renderItemCancel : options.itemCancelRenderer );
	this.emitEvents = (( options.emitEvents === undefined) ? true : options.emitEvents );
	this.datasource = (( options.datasource === undefined) ? (( options.lookupList !== undefined ) ? options.lookupList : true ) : options.datasource );
	this.minLength = (( options.minLength === undefined) ? 0 : options.minLength );
	this.disabled = (( options.disabled === undefined) ? false : options.disabled );
	this.maxSuggestions = (( options.maxSuggestions === undefined) ? 20 : options.maxSuggestions );
	this.position = ( options.position === undefined ) ? { my: "left top", at: "left bottom", collision: "none" } : options.position;
	this.autoFocus = (( options.autoFocus === undefined) ? false : options.autoFocus );
	this.requestIndex = 0;
};