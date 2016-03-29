<!doctype html>
<html>
	<head>
		<title>gadget-ui ComboBox Test</title>
		 <script src='../bower_components/lazyloader/dist/lazy.1.0.0.min.js'></script>
		 <script>
		 	lazy.load(['combobox.js < ../bower_components/jquery.addrule/jquery.addrule.js < ../bower_components/jquery-encoder/dist/jquery.jquery-encoder.min.js < ../bower_components/jquery-encoder/libs/class.min.js < ../bower_components/jquery-ui/jquery-ui.min.js < ../dist/jquery.gadget-ui.js < ../bower_components/jquery/dist/jquery.min.js', '../dist/gadget-ui.css', '../bower_components/jquery-ui/themes/humanity/jquery-ui.min.css'], function(){
  				console.log('All files have been loaded');
}			);
		 </script>

		<style>
			body {font-size: 2em;}
			input, select, select option{ font-size: 2em;}
		</style>

	</head>

	<body>
		<p>Test the ComboBox control.</p>

		<p>Select your favorite breakfast food, or enter something new:</p>
	<div style="margin-left: 50px;">

		<select name="foods" gadgetui-bind="user.food">

		</select>
	</div>

	</body>
</html>