module.exports = {
	dist: {
		files: { src: ["Gruntfile.js", "src/**/*.js"] },
		options: {
			// options here to override JSHint defaults
			globals: {
				console: true,
				module: true,
				document: true,
			},
		},
	},
};
