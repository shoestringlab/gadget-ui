module.exports = {
	dist : {
		files : [ '<%= jshint.files %>' ],
		tasks : [ 'jshint', 'qunit' ]
	}		
};
