module.exports = {
	dist: {
		files: ["src/**/*.js"],
		tasks: ["newer:concat", "newer:terser"],
	},
};
