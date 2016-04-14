module.exports = {

	javascript : {
		src : [ 'src/gadget-ui.js','src/javascript/gadget-ui.model.js','src/polyfill.js',
		        'src/javascript/display/wrapper/pre.js', 'src/javascript/display/*.js', 'src/javascript/display/wrapper/post.js',
			   	'src/javascript/input/wrapper/pre.js', 'src/javascript/input/*.js', 'src/javascript/input/wrapper/post.js',
		        'src/javascript/gadget-ui.util.js' ],
		dest : 'dist/<%= pkg.name %>.js'
	},
	jquery : {
		src : [ 'src/gadget-ui.js','src/jquery/jquery.gadget-ui.model.js', 'src/jquery/fn.js','src/polyfill.js',
		        'src/jquery/display/wrapper/pre.js', 'src/jquery/display/*.js', 'src/jquery/display/wrapper/post.js',
			    'src/jquery/input/wrapper/pre.js', 'src/jquery/input/*.js', 'src/jquery/input/wrapper/post.js',
		        'src/jquery/gadget-ui.util.js' ],
		dest : 'dist/jquery.<%= pkg.name %>.js'
	},
	css : {
		src : [ 'src/css/*.css' ],
		dest : 'dist/gadget-ui.css'
	}
};
