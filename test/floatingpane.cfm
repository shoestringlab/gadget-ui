<!doctype html>
<html>
	<head>
		<title>gadget-ui FloatingPane Test</title>
		 <script src='../bower_components/lazyloader/dist/lazy.1.0.0.min.js'></script>
		 <script>
		 	lazy.load(['floatingpane.js < ../dist/gadget-ui.js',  "/bower_components/velocity/velocity.js", '../dist/gadget-ui.css', "/bower_components/open-iconic/font/css/open-iconic.css" ], function(){
  				console.log('All files have been loaded');
			});
		 </script>

		<style>
			body {font-size: 1em;}
			input, select, select option{ font-size: 1em;}
		</style>

	</head>

	<body>
		<p>Test the FloatingPane control.</p>


	<div style="width:900px" name="collapser">
	FloatingPane.prototype.config = function( options ){
		options = ( options === undefined ? {} : options );
		this.title = ( options.title === undefined ? "": options.title );
		this.path = ( options.path === undefined ? "/bower_components/gadget-ui/dist/": options.path );
		this.position = ( options.position === undefined ? { my: "right top", at: "right top", of: window } : options.position );
		this.padding = ( options.padding === undefined ? "15px": options.padding );
		this.paddingTop = ( options.paddingTop === undefined ? ".3em": options.paddingTop );
		this.width = ( options.width === undefined ? gadgetui.util.getStyle( this.selector, "width" ) : options.width );
		this.minWidth = ( this.title.length > 0 ? Math.max( 100, this.title.length * 10 ) + 20 : 100 );

		this.height = ( options.height === undefined ? gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector, "height" ) ) + ( gadgetui.util.getNumberValue( this.padding ) * 2 ) : options.height );
		this.interiorWidth = ( options.interiorWidth === undefined ? "": options.interiorWidth );
		this.opacity = ( ( options.opacity === undefined ? 1 : options.opacity ) );
		this.zIndex = ( ( options.zIndex === undefined ? 100000 : options.zIndex ) );
		this.minimized = false;
		this.relativeOffsetLeft = 0;
		this.borderColor = ( options.borderColor === undefined ? "silver": options.borderColor );
		this.headerColor = ( options.headerColor === undefined ? "black": options.headerColor );
		this.headerBackgroundColor = ( options.headerBackgroundColor === undefined ? "silver": options.headerBackgroundColor );
		this.borderRadius = ( options.borderRadius === undefined ? 6 : options.borderRadius );
	};

	</div>

	</body>
</html>