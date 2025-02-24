function FileUploadWrapper(file, element) {
	const id = gadgetui.util.Id()
	const options = {
		id: id,
		filename: file.name,
		width: gadgetui.util.getStyle(element, 'width'),
	}
	const bindings = gadgetui.objects.EventBindings.getAll()

	this.file = file
	this.id = id
	this.progressbar = new gadgetui.display.ProgressBar(element, options)
	this.progressbar.render()

	bindings.forEach((binding) => {
		this[binding.name] = binding.func
	})
}

FileUploadWrapper.prototype.events = ['uploadComplete', 'uploadAborted']

FileUploadWrapper.prototype.completeUpload = function (fileItem) {
	const finish = () => {
		this.progressbar.destroy()
		this.fireEvent('uploadComplete', fileItem)
	}
	setTimeout(finish, 1000)
}

FileUploadWrapper.prototype.abortUpload = function (fileItem) {
	const aborted = () => {
		this.progressbar.destroy()
		this.fireEvent('uploadAborted', fileItem)
	}
	setTimeout(aborted, 1000)
}
