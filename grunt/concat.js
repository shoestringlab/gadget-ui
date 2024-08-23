module.exports = {

	javascript : {
		options: {
		      sourceMap: true
		    },
		src : [ 'src/gadget-ui.js','src/javascript/gadget-ui.model.js','src/polyfill.js',
		        'src/javascript/display/wrapper/pre.js', 'src/javascript/display/*.js', 'src/javascript/display/wrapper/post.js',
			   		'src/javascript/input/wrapper/pre.js', 'src/javascript/input/*.js', 'src/javascript/input/wrapper/post.js',
						'src/objects/wrapper/pre.js', 'src/objects/*.js', 'src/objects/wrapper/post.js',
		        'src/javascript/gadget-ui.util.js' ],
		dest : 'dist/<%= pkg.name %>.js'
	},
	javascriptes6 : {
		options: {
		      sourceMap: true
		    },
		src : [ 'src/gadget-ui.js','src/javascript/gadget-ui.model.js','src/polyfill.js',
		        'src/javascript/display/wrapper/pre.js', 'src/javascript/display/*.js', 'src/javascript/display/wrapper/post.js',
			   		'src/javascript/input/wrapper/pre.js', 'src/javascript/input/*.js', 'src/javascript/input/wrapper/post.js',
						'src/objects/wrapper/pre.js', 'src/objects/*.js', 'src/objects/wrapper/post.js',
		        'src/javascript/gadget-ui.util.js','src/javascript/gadget-ui.export.js' ],
		dest : 'dist/<%= pkg.name %>.es.js'
	},
	jquery : {
		options: {
		      sourceMap: true
		    },
		src : [ 'src/gadget-ui.js','src/jquery/jquery.gadget-ui.model.js', 'src/jquery/fn.js','src/polyfill.js',
		        'src/jquery/display/wrapper/pre.js', 'src/jquery/display/*.js', 'src/jquery/display/wrapper/post.js',
			    	'src/jquery/input/wrapper/pre.js', 'src/jquery/input/*.js', 'src/jquery/input/wrapper/post.js',
						'src/objects/wrapper/pre.js', 'src/objects/*.js', 'src/objects/wrapper/post.js',
		        'src/jquery/gadget-ui.util.js' ],
		dest : 'dist/jquery.<%= pkg.name %>.js'
	},
	css : {
		options: {
		      sourceMap: true
		    },
		src : [ 'src/css/gadget-ui*.css' ],
		dest : 'dist/gadget-ui.css'
	},
	jquerycss : {
		options: {
		      sourceMap: true
		    },
		src : [ 'src/css/jquery*.css' ],
		dest : 'dist/jquery.gadget-ui.css'
	}

};
