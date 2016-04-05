
$.gadgetui = {};

$.gadgetui.textWidth = function(text, font) {
	// http://stackoverflow.com/questions/1582534/calculating-text-width-with-jquery
	// based on edsioufi's solution
    if (!$.gadgetui.textWidth.fakeEl) $.gadgetui.textWidth.fakeEl = $('<span id="gadgetui-textWidth">').appendTo(document.body);
    
    var width, htmlText = text || $.fn.val() || $.fn.text();
    if( htmlText.length > 0 ){
    	htmlText = $.gadgetui.textWidth.fakeEl.text(htmlText).html(); //encode to Html
    	if( htmlText === undefined ){
    		htmlText = "";
    	}else{
    		htmlText = htmlText.replace(/\s/g, "&nbsp;"); //replace trailing and leading spaces
    	}
    }
    $.gadgetui.textWidth.fakeEl.html(htmlText).css('font', font || $.fn.css('font'));
    $.gadgetui.textWidth.fakeEl.css( "display", "inline" );
    width = $.gadgetui.textWidth.fakeEl.width();
    $.gadgetui.textWidth.fakeEl.css( "display", "none" );
    return width;
};	

$.gadgetui.fitText = function( text, font, width ){
	var ix, midpoint, txtWidth = $.gadgetui.textWidth( text, font ), ellipsisWidth = $.gadgetui.textWidth( "...", font );
	if( txtWidth < width ){
		return text;
	}else{
		midpoint = Math.floor( text.length / 2 ) - 1;
		while( txtWidth + ellipsisWidth >= width ){
			text = text.slice( 0, midpoint ) + text.slice( midpoint + 1, text.length );
	
			midpoint = Math.floor( text.length / 2 ) - 1;
			txtWidth = $.gadgetui.textWidth( text, font );

		}
		midpoint = Math.floor( text.length / 2 ) - 1;
		text = text.slice( 0, midpoint ) + "..." + text.slice( midpoint, text.length );
		
		//remove spaces around the ellipsis
		while( text.substring( midpoint - 1, midpoint ) === " " ){
			text = text.slice( 0, midpoint - 1 ) + text.slice( midpoint, text.length );
			midpoint = midpoint - 1;
		}
		
		while( text.substring( midpoint + 3, midpoint + 4 ) === " " ){
			text = text.slice( 0, midpoint + 3 ) + text.slice( midpoint + 4, text.length );
			midpoint = midpoint - 1;
		}		
		return text;
	}
};