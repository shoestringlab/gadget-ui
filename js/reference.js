_bindSmartInput = function( obj, contact ) {

	$( "span", $( obj ) ).on( "mouseenter", function( ) {
		$( $( this ) ).hide( );

		if ( this.className === "fullname" ) {
			$( "img[name='detailEditorIcon']", $( this ).parent( ) ).css( "display", "inline" );
		}
		$( $( this ).parent( ) )
		// .attr( "class",
		// "ui-widget-content
		// ui-corner-all inline" )
		.on( "mouseleave", function( ) {
			if ( $( "input", $( this ) ).is( ":focus" ) === false ) {
				$( "span", $( this ) ).css( "display", "inline" );
				$( "input", $( this ) ).hide( );
				// hide the
				// trashcan
				// icon
				$( "img", $( this ) ).hide( );
				if ( $( "input", $( this ) ).attr( "name" ) === "fullname" ) {
					$( "img[name='detailEditorIcon']", $( this ) ).hide( );
				}
			}
		} );
		$( "input", $( this ).parent( ) ).css( "min-width", "10em" ).css( "width", Math.round( $( "input", $( this ).parent( ) ).val( ).length * 0.66 ) + "em" ).css( "display", "inline" ).on( "blur", function( ) {
			var that = this, newVal, name, entityArray;
			setTimeout( function( ) {
				newVal = $.encoder.encodeForHTML( $.encoder.canonicalize( $( that ).val( ) ) );
				if ( contact.isDirty === true ) {
					if ( that.name === "fullname" ) {
						name = $.NameParse.parse( $( that ).val( ) );
						$.each( name, function( key, value ) {
							contact[ key.toLowerCase( ) ] = $.encoder.encodeForHTML( $.encoder.canonicalize( value ) );
						} );
						_saveContact( contact );
					}
					else if ( that.name.substring( 0, 6 ) === 'entity' ) {
						entityArray = that.name.split( "_" );

						contact.entities[ entityArray[ 3 ] ].entityvalue = $.encoder.encodeForHTML( $.encoder.canonicalize( $( that ).val( ) ) );
						// contact.entities[
						// entityArray[
						// 3 ]
						// ].change();
						$.publish( "addressbook.saveEntity", [ contact, entityArray[ 3 ] ] );

					}
					else {
						contact[ that.name ] = $.encoder.encodeForHTML( $.encoder.canonicalize( $( that ).val( ) ) );
						_saveContact( contact );
					}

					$( "span", $( that ).parent( ) ).text( newVal );
					contact.change( );

					legacyAvatar.model.set( "activeContact", contact );
					contact.isDirty = false;
				}
				$( "span", $( that ).parent( ) ).css( "display", "inline" );
				$( "img", $( that ).parent( ) ).hide( );
				$( that ).hide( );
				if ( that.name === "fullname" ) {
					$( "img[name='detailEditorIcon']", $( that ).parent( ) ).hide( );
				}
			}, 200 );

		} ).on( "change", function( ) {
			contact.isDirty = true;
		} ).on( "keyup", function( event ) {
			if ( parseInt( event.keyCode, 10 ) === 13 ) {
				$( this ).blur( );
			}
			$( this ).css( "width", Math.round( $( "input", $( this ).parent( ) ).val( ).length * 0.66 ) + "em" );
		} );
		// show the trashcan icon
		$( "img", $( this ).parent( ) ).css( "display", "inline" );
	} );
};

_bindSmartLabel = function( obj, contact ) {

	$( "label", $( obj ) ).on( "mouseenter", function( ) {
		$( $( this ) ).hide( );
		var entityTypeLabels, entityArray = $( this ).attr( "for" ).split( "_" );

		$( $( this ).parent( ) ).on( "mouseleave", function( ) {
			if ( $( "select", $( this ) ).is( ":focus" ) === false && $( "input", $( this ).parent( ).parent( ) ).is( ":focus" ) === false ) {
				$( "label", $( this ) ).css( "display", "inline" );
				$( "select", $( this ) ).hide( );
				$( "input", $( this ).parent( ).parent( ) ).hide( );
			}
		} );
		entityTypeLabels = legacyAvatar.model.get( "entityTypeLabels" );
		if ( entityTypeLabels.DATA.label.indexOf( contact.entities[ entityArray[ 3 ] ].entitylabel ) === -1 ) {
			$( "input", $( this ).parent( ) ).css( "display", "inline" );
		}

		$( "input", $( this ).parent( ) ).on( "blur", function( ) {
			var newVal = $.encoder.encodeForHTML( $.encoder.canonicalize( $( this ).val( ) ) );
			if ( newVal.length === 0 ) {
				$( "select", $( this ).parent( ).parent( ) ).val( ',' );
				$( "select", $( this ).parent( ).parent( ) ).blur( );
				newVal = contact.entities[ entityArray[ 3 ] ].entitytypeshort;
			}

			if ( contact.entities[ entityArray[ 3 ] ].entitylabel !== newVal ) {
				contact.entities[ entityArray[ 3 ] ].entitylabel = newVal;
				contact.entities[ entityArray[ 3 ] ].change( );

				$.publish( "addressbook.saveEntity", [ contact, entityArray[ 3 ] ] );
				$( "label", $( this ).parent( ).parent( ) ).text( newVal );
				contact.change( );

				legacyAvatar.model.set( "activeContact", contact );
				contact.isDirty = false;
			}
			$( this ).hide( );
			$( "select", $( this ).parent( ).parent( ) ).hide( );
			$( "label", $( this ).parent( ).parent( ) ).css( "display", "inline" );

		} ).on( "keyup", function( event ) {
			if ( event.keyCode === 13 ) {
				var newVal = $.encoder.encodeForHTML( $.encoder.canonicalize( $( this ).val( ) ) );
				// var
				// entityArray
				// =
				// this.name.split("_");
				contact.entities[ entityArray[ 3 ] ].entitylabel = newVal;
				contact.entities[ entityArray[ 3 ] ].change( );
				$.publish( "addressbook.saveEntity", [ contact, entityArray[ 3 ] ] );
				$( "label", $( this ).parent( ).parent( ) ).text( newVal );
				contact.change( );

				legacyAvatar.model.set( "activeContact", contact );
				contact.isDirty = false;
				$( this ).hide( );
				$( "select", $( this ).parent( ).parent( ) ).hide( );
				$( "label", $( this ).parent( ).parent( ) ).css( "display", "inline" );
			}
		} );
		// .css( "display", "inline" );
		$( "select", $( this ).parent( ) )
		// .css( "min-width",
		// "10em")
		// .css( "width",
		// Math.round( $( "select",
		// $( this ).parent()
		// ).val().length * .66 ) +
		// "em")
		.css( "display", "inline" ).on( "change", function( event ) {
			// console.log(
			// event );
			var that = this, newVal = event.target.value.split( "," );
			if ( parseInt( newVal[ 0 ], 10 ) === 0 ) {
				$( "input", $( that ).parent( ).parent( ) ).css( "display", "inline" ).focus( );
			}
			else {
				$( "input", $( that ).parent( ).parent( ) ).hide( );
			}
		} ).on( "blur", function( event ) {
			var that = this;
			if ( parseInt( event.target.value
			.split(",")[ 0 ], 10 ) === 0 ) {
				// if the
				// custom
				// value is
				// selected,
				// just
				// return
				return;
			}
			// var
			// entityArray =
			// that.name.split("_");

			setTimeout( function( ) {
				var newVal = $( that ).val( ).split( ',' ), label = newVal[ 1 ], saveValue = newVal[ 1 ];
				if ( contact.isDirty === true ) {
					if ( label.length === 0 ) {
						label = contact.entities[ entityArray[ 3 ] ].entitytypeshort;
						saveValue = '';
					}
					if ( label !== "custom" ) {
						// not
						// a
						// custom
						// value,
						// so
						// blank
						// the
						// custom
						// input
						$( "input", $( that ).parent( ).parent( ) ).val( '' );
					}

					contact.entities[ entityArray[ 3 ] ].entitylabel = saveValue;
					contact.entities[ entityArray[ 3 ] ].change( );
					$.publish( "addressbook.saveEntity", [ contact, entityArray[ 3 ] ] );
					$( "label", $( that ).parent( ).parent( ) ).text( label );
					contact.change( );

					legacyAvatar.model.set( "activeContact", contact );
					contact.isDirty = false;

				}
				$( "label", $( that ).parent( ).parent( ) ).css( "display", "inline" );

				$( that ).hide( );

				$( "input", $( that ).parent( ).parent( ) ).hide( );

			}, 200 );

		} ).on( "change", function( ) {
			contact.isDirty = true;
		} );

	} );
};