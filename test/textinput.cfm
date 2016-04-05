<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
	<head>
		<title>gadget-ui Gadget-UI Loading Test</title>
		  <script src='../bower_components/lazyloader/dist/lazy.1.0.0.min.js'></script>
 	 <script>
		 	lazy.load(['textinput.js < ../bower_components/jquery-shadow-animation/jquery.animate-shadow-min.js < ../bower_components/jquery.addrule/jquery.addrule.js < ../bower_components/jquery-encoder/dist/jquery.jquery-encoder.min.js < ../bower_components/jquery-encoder/libs/class.min.js < ../dist/jquery.gadget-ui.js < ../bower_components/jquery-placeholder/jquery.placeholder.js < ../bower_components/promise-polyfill/promise.js < ../bower_components/jquery-legacy/jquery.js', '../dist/gadget-ui.css', '../bower_components/jquery-ui/themes/humanity/jquery-ui.min.css'], function(){
  				console.log('All files have been loaded');
			});
		 </script>

		<style>
			body {font-size: 2em;}
			input, select, select option{ font-size: 1em;}
		</style>

	</head>

	<body>
		loading gadget-ui...
		<br>
		<br>
			<form>
				<div>
					First Name - bound to user.firstname<br/>
					<input name="firstname" type="text" class="gadgetui-textinput" gadgetui-textinput="true" gadgetui-bind="user.firstname" value=""/>
				</div>
			</form>
	</body>
</html>