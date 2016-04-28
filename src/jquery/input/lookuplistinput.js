
function LookupListInput( selector, options ){
	function _renderLabel( item ){
		return item.label;
	};
	this.itemRenderer = _renderLabel;
	this.menuItemRenderer = _renderLabel;
	this.emitEvents = true;
	
	this.selector = selector;
	
	if( options !== undefined ){
		this.config( options );
	}
	
	//gadgetui.util.bind( this.selector, this.model );
	$( this.selector ).wrap( '<div class="gadgetui-lookuplistinput-div ui-widget-content ui-corner-all"></div>' );
	this.addBindings();
}

LookupListInput.prototype.addBindings = function(){
	var _this = this;

	$( this.selector ).parent()
		.on( "click", function(){
			$( _this ).focus();
		})
		.on( "click", "div[class~='gadgetui-lookuplist-input-cancel']", function(e){
			_this.remove( _this.selector, $( e.target ).attr( "gadgetui-lookuplist-input-value" ) );
		});

	$( this.selector )
		.autocomplete( {
			minLength : _this.minLength,
			source : function( request, response ) {
				response( $.ui.autocomplete.filter( _this.datasource, gadgetui.util.extractLast( request.term ) ) );
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

				_this.add( _this.selector, ui.item );
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
		if( typeof _this.menuItemRenderer === "function"){
			return $( "<li>" )
			.attr( "data-value", item.value )
			.append( $( "<a>" ).text( _this.menuItemRenderer( item ) ) )
			.appendTo( ul );
		}else{
			//default jquery-ui implementation
			return $( "<li>" )
			.append( $( "<a>" ).text( item.label ) )
			.appendTo( ul );
		}
	};	
};

LookupListInput.prototype.add = function( el, item ){
	var prop, list;
	$( "<div class='gadgetui-lookuplist-input-item-wrapper'><div class='gadgetui-lookuplist-input-cancel ui-corner-all ui-widget-content' gadgetui-lookuplist-input-value='" + item.value + "'><div class='gadgetui-lookuplist-input-item'>" + this.itemRenderer( item ) + "</div></div></div>" )
		.insertBefore( el );
	$( el ).val('');
	if( item.title !== undefined ){
		$( "div[class~='gadgetui-lookuplist-input-cancel']", $( el ).parent() ).last().attr( "title", item.title );
	}
	if( this.emitEvents === true ){
		$( el ).trigger( "gadgetui-lookuplistinput-add", [ item ] );
	}
	if( this.func !== undefined ){
		this.func( item, 'add' );
	}
	if( this.model !== undefined ){
		//update the model 
		prop = $( el ).attr( "gadgetui-bind" );
		list = this.model.get( prop );
		if( $.isArray( list ) === false ){
			list = [];
		}
		list.push( item );
		this.model.set( prop, list );
	}
};

LookupListInput.prototype.remove = function( el, value ){
	$( "div[gadgetui-lookuplist-input-value='" + value + "']", $( el ).parent() ).parent().remove();

	var _this = this, prop, list;

	if( this.model !== undefined ){
		prop = $( el ).attr( "gadgetui-bind" );
		list = this.model.get( prop );
		$.each( list, function( i, obj ){
			if( obj.value === value ){
				list.splice( i, 1 );
				if( _this.func !== undefined ){
					_this.func( obj, 'remove' );
				}
				if( _this.emitEvents === true ){
					$( el ).trigger( "gadgetui-lookuplistinput-remove", [ obj ] );
				}
				_this.model.set( prop, list );
				return false;
			}
		});
	}
};

LookupListInput.prototype.reset = function(){
	$( ".gadgetui-lookuplist-input-item-wrapper", $(  this.el ).parent() ).empty();

	if( this.model !== undefined ){
		prop = $( this.el ).attr( "gadget-ui-bind" );
		list = this.model.get( prop );
		list.length = 0;
	}
};

LookupListInput.prototype.config = function( args ){
	// if binding but no model was specified, use gadgetui model
	if( $( this.selector ).attr( "gadgetui-bind" ) !== undefined ){
		this.model = (( args.model === undefined) ? gadgetui.model : args.model );
	}
	this.func = (( args.func === undefined) ? undefined : args.func );
	this.itemRenderer = (( args.itemRenderer === undefined) ? this.itemRenderer : args.itemRenderer );
	this.menuItemRenderer = (( args.menuItemRenderer === undefined) ? this.menuItemRenderer : args.menuItemRenderer );
	this.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	this.datasource = (( args.datasource === undefined) ? (( args.lookupList !== undefined ) ? args.lookupList : true ) : args.datasource );
	this.minLength = (( args.minLength === undefined) ? 0 : args.minLength );
	return this;
};	
