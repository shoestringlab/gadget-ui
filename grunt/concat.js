module.exports = {

	javascript : {
		src : [ 'src/gadget-ui.js','src/javascript/gadget-ui.model.js','src/javascript/gadget-ui.input.js' ],
		dest : 'dist/<%= pkg.name %>.js'
	},
	jquery : {
		src : [ 'src/gadget-ui.js','src/jquery/jquery.gadget-ui.model.js','src/jquery/jquery.gadget-ui.input.js' ],
		dest : 'dist/jquery.<%= pkg.name %>.js'
	},
	css : {
		src : [ 'src/css/*.css' ],
		dest : 'dist/gadget-ui.css'
	}
};
