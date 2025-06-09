module.exports = {
	javascript: {
		options: {
			sourceMap: true,
			sourceMapName: "<%= pkg.name %>.min.js.map",
			mangle: true,
		},
		files: {
			"dist/<%= pkg.name %>.min.js": ["<%= concat.javascript.dest %>"],
		},
	},
	javascriptes6: {
		options: {
			sourceMap: true,
			sourceMapName: "<%= pkg.name %>.min.es.js.map",
			mangle: true,
		},
		files: {
			"dist/<%= pkg.name %>.min.es.js": ["<%= concat.javascriptes6.dest %>"],
		},
	},
};
