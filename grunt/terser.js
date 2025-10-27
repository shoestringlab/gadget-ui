module.exports = {
	javascript: {
		options: {
			sourceMap: true,
			mangle: true,
		},
		files: {
			"dist/<%= pkg.name %>.min.js": ["<%= concat.javascript.dest %>"],
		},
	},
	javascriptes6: {
		options: {
			sourceMap: true,
			mangle: true,
		},
		files: {
			"dist/<%= pkg.name %>.min.es.js": ["<%= concat.javascriptes6.dest %>"],
		},
	},
};
