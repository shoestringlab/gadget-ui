module.exports = {
	dist : {
		files :{ src: [ 'Gruntfile.js', 'src/**/*.js' ]},
		options : {
			// options here to override JSHint defaults
			globals : {
				jQuery : true,
				console : true,
				module : true,
				document : true
			}
		}
	}
};
