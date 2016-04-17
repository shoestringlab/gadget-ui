<!doctype html>
<html>
	<head>
		<title>gadget-ui ComboBox Test</title>
		 <script src='../bower_components/lazyloader/dist/lazy.1.0.0.min.js'></script>
		 <script>
		 	lazy.load(['combobox.js < ../dist/gadget-ui.js', '/bower_components/velocity/velocity.js', '../dist/gadget-ui.css'], function(){
  				console.log('All files have been loaded');
			});
		 </script>

		<style>
			body {font-size: 2em;}
			input, select, select option{ font-size: 1em;}
		</style>

	</head>

	<body>
		<p>Test the ComboBox control.</p>

		<p>Select your favorite breakfast food, or enter something new:</p>
	<div style="margin-left: 50px;">

		<select name="food" gadgetui-bind="user.food">

		</select>
	</div>

	</body>
</html>