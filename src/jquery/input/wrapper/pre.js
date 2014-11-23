gadgetui.input = (function($) {
	
	var _bindToModel = function( obj, model ){
		var bindVar = $( obj ).attr( "gadgetui-bind" );
		// if binding was specified, make it so
		if( bindVar !== undefined && model !== undefined ){
			model.bind( bindVar, $( obj ) );
		}
	};
	