module.exports = {

	javascript : {
		files : {
			'dist/<%= pkg.name %>.min.js' : [ '<%= concat.javascript.dest %>' ]
		}
	},
	jquery : {
		files : {
			'dist/jquery.<%= pkg.name %>.min.js' : [ '<%= concat.jquery.dest %>' ]
		}
	}
};
