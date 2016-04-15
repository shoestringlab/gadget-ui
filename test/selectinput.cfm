<!doctype html>
<html>
	<head>
		<title>gadget-ui SelectInput Test</title>
		 <script src='../bower_components/lazyloader/dist/lazy.1.0.0.min.js'></script>
		 <script>
		 	lazy.load(['selectinput.js < ../dist/gadget-ui.js' ,'../dist/gadget-ui.css'], function(){
  				console.log('All files have been loaded');
			});
		 </script>

		<style>
			body {
			font-size: 1em;
			font-family:Arial, serif;
			}
			input, select, select option{
			font-size: 1em;
			font-family:Arial, serif;}
		</style>

	</head>

	<body>
		<p>Test the SelectInput control.</p>

		<p>What is your current role:</p>
	<div style="margin-left: 50px;">

	<select name="role" class="gadgetui-selectinput" gadgetui-bind="user.role">
		<option value="0">choose ...</option>
		<option value="1">Friend</option>
		<option value="2">Sibling</option>
		<option value="3">co-worker</option>
		<option value="4">President</option>
	</select>
	</div>

	</body>
</html>