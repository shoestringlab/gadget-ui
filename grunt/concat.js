module.exports = {

	javascript : {
		src : [ 'src/gadget-ui.js','src/javascript/gadget-ui.model.js','src/javascript/gadget-ui.input.js', 'src/gadget-ui.util.js' ],
		dest : 'dist/<%= pkg.name %>.js'
	},
	jquery : {
		src : [ 'src/gadget-ui.js','src/jquery/jquery.gadget-ui.model.js', 'src/jquery/fn.js',
		        'src/jquery/display/wrapper/pre.js', 'src/jquery/display/*.js', 'src/jquery/display/wrapper/post.js',
			    'src/jquery/input/wrapper/pre.js', 'src/jquery/input/*.js', 'src/jquery/input/wrapper/post.js',
		        'src/gadget-ui.util.js' ],
		dest : 'dist/jquery.<%= pkg.name %>.js'
	},
	css : {
		src : [ 'src/css/*.css' ],
		dest : 'dist/gadget-ui.css'
	}
};
