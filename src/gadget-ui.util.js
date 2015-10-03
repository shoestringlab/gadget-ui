gadgetui.util = ( function(){

	return{
		split: function( val ) {
			return val.split( /,\s*/ );
		},
		extractLast: function( term ) {
			return this.split( term ).pop();
		},
		getNumberValue: function( pixelValue ){
			return Number( pixelValue.substring( 0, pixelValue.length - 2 ) );
		},

		getRelativeParentOffset: function( selector ){
			var i,
				parents = selector.parentsUntil( "body" ),
				relativeOffsetLeft = 0,
				relativeOffsetTop = 0;

			for( i = 0; i < parents.length; i++ ){
				if( $( parents[ i ] ).css( "position" ) === "relative" ){
					// set the largest offset values of the ancestors
					if( $( parents[ i ] ).offset().left > relativeOffsetLeft ){
						relativeOffsetLeft = $( parents[ i ] ).offset().left;
					}
					
					if( $( parents[ i ] ).offset().top > relativeOffsetTop ){
						relativeOffsetTop = $( parents[ i ] ).offset().top;
					}
				}
			}
			return { left: relativeOffsetLeft, top: relativeOffsetTop };
		},
		Id: function(){
			return ( (Math.random() * 100).toString() ).replace(  /\./g, "" );
		},
		bind : function( selector, model ){
			var bindVar = $( selector ).attr( "gadgetui-bind" );
			// if binding was specified, make it so
			if( bindVar !== undefined && model !== undefined ){
				model.bind( bindVar, $( selector ) );
			}
		}
		
	};
} ());	