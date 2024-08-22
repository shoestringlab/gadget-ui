
function FileUploadWrapper(file, selector) {
	var ix,
		id,
		options,
		bindings = gadgetui.objects.EventBindings.getAll();

	id = gadgetui.util.Id();
	options = { id: id, filename: file.name, width: gadgetui.util.getStyle(selector, "width") };
	this.file = file;
	this.id = id;
	this.progressbar = new gadgetui.display.ProgressBar(selector, options);
	this.progressbar.render();
	for (ix = 0; ix < bindings.length; ix++) {
		this[bindings[ix].name] = bindings[ix].func;
	}
}

FileUploadWrapper.prototype.events = ["uploadComplete", "uploadAborted"];

FileUploadWrapper.prototype.completeUpload = function (fileItem) {
	let finish = function () {
		this.progressbar.destroy();
		this.fireEvent("uploadComplete", fileItem);
	}.bind(this);
	setTimeout(finish, 1000);
};

FileUploadWrapper.prototype.abortUpload = function (fileItem) {
	let aborted = function () {
		this.progressbar.destroy();
		this.fireEvent("uploadAborted", fileItem);
	}.bind(this);
	setTimeout(aborted, 1000);
};
