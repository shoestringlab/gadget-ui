module.exports = {

	javascript : {
		options:{
			sourceMap: true,
			sourceMapName: '<%= pkg.name %>.min.js.map',
			mangle: true
			},
		files : {
			'dist/<%= pkg.name %>.min.js' : [ '<%= concat.javascript.dest %>' ]
		}
	},
	javascriptes6 : {
		options:{
			sourceMap: true,
			sourceMapName: '<%= pkg.name %>.min.es.js.map',
			mangle: true
			},
		files : {
			'dist/<%= pkg.name %>.min.es.js' : [ '<%= concat.javascript.dest %>' ]
		}
	},
	jquery : {
		files : {
			'dist/jquery.<%= pkg.name %>.min.js' : [ '<%= concat.jquery.dest %>' ]
		}
	}
};
