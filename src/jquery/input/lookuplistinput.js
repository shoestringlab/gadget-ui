
function LookupListInput( args ){
	var self = this, index, obj;

	_renderLabel = function( item ){
		return item.label;
	};

	this.itemRenderer = _renderLabel;
	this.menuItemRenderer = _renderLabel;
	this.lookupList;
	this.emitEvents = true;
	this.model;

	if( args.el === undefined ){
		this.el = $( "input[gadgetui-lookuplist-input='true']", document );
	}else{
		this.el = args.el;
	}
	if( args.config !== undefined ){
		self.config( args.config );
	}
	$.each( this.el,  function( index, obj ){
		val = $( obj ).val();
		// bind to the model if binding is specified
		_bindToModel( obj, self.model );

		$( obj ).wrap( '<div class="gadgetui-lookuplistinput-div ui-widget-content ui-corner-all" style="width:100%;"></div>');

		_bind( obj, self );

	});
	
	function _bind( obj, component ){
		var self = component;
		
		$( obj ).parent()
			.on( "click", function(){
				$( obj ).focus();
			})
			.on( "click", "div[class~='gadgetui-lookuplist-input-cancel']", function(e){
				self.remove( obj, $( e.target ).attr( "gadgetui-lookuplist-input-value" ) );
			});
		
		$( obj )

		.on( "keydown", function( event ) {
			if ( event.keyCode === $.ui.keyCode.TAB && $( this ).data( "ui-autocomplete" ).menu.active ) {
				event.preventDefault( );
			}
		} ).autocomplete( {
			minLength : self.minLength,
			source : function( request, response ) {
				response( $.ui.autocomplete.filter( self.lookupList, gadgetui.util.extractLast( request.term ) ) );
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

				self.add( this, ui.item );
				this.value = '';
				this.focus( );
				return false;
			}
		} ).on( "keydown", function( event ) {
			$( this ).css( "width", Math.round( ( $( this ).val( ).length * 0.66 ) + 3 ) + "em" );
	
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
			if( typeof self.menuItemRenderer === "function"){
				return $( "<li>" )
				.attr( "data-value", item.value )
				.append( $( "<a>" ).text( self.menuItemRenderer( item ) ) )
				.appendTo( ul );
			}else{
				//default jquery-ui implementation
				return $( "<li>" )
				.append( $( "<a>" ).text( item.label ) )
				.appendTo( ul );
			}
		};	
	};
}

LookupListInput.prototype.add = function( el, item ){
	var prop, list, title;
	title =  item.title || "" ;
	$( "<div class='gadgetui-lookuplist-input-item-wrapper'><div class='gadgetui-lookuplist-input-cancel ui-corner-all ui-widget-content' gadgetui-lookuplist-input-value='" + item.value + "'><div class='gadgetui-lookuplist-input-item'>" + this.itemRenderer( item ) + "</div></div></div>" )
		.insertBefore( el );
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
		prop = $( el ).attr( "gadget-ui-bind" );
		list = this.model.get( prop );
		list.push( item );
	}
};

LookupListInput.prototype.remove = function( el, value ){
	$( "div[gadgetui-lookuplist-input-value='" + value + "']", $( el ).parent() ).remove();

	var self = this, i, obj, prop, list;

	if( this.model !== undefined ){
		prop = $( el ).attr( "gadget-ui-bind" );
		list = this.model.get( prop );
		$.each( list, function( i, obj ){
			if( obj.value === value ){
				list.splice( i, 1 );
				if( self.func !== undefined ){
					self.func( obj, 'remove' );
				}
				return false;
			}
		});
	}
};

LookupListInput.prototype.config = function( args ){
	var self = this;
	self.model =  (( args.model === undefined) ? self.model : args.model );
	self.func = (( args.func === undefined) ? undefined : args.func );
	self.itemRenderer = (( args.itemRenderer === undefined) ? self.itemRenderer : args.itemRenderer );
	self.menuItemRenderer = (( args.menuItemRenderer === undefined) ? self.menuItemRenderer : args.menuItemRenderer );
	self.emitEvents = (( args.emitEvents === undefined) ? true : args.emitEvents );
	self.lookupList = (( args.lookupList === undefined) ? true : args.lookupList );
	self.minLength = (( args.minLength === undefined) ? 0 : args.minLength );
	return self;
};
