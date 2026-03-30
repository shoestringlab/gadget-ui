module.exports = {
	dist: {
		files: { src: ["Gruntfile.js", "src/**/*.js"] },
		options: {
			esversion: 11,
			module: true,
			globals: {
				console: true,
				module: true,
				document: true,
			},
		},
	},
};
