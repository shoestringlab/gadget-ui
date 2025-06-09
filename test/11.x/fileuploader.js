var options = {
	uploadURI: "/test/fileuploader.upload.cfm",
	tags: "file upload",
	willGenerateThumbnails: true,
	title: "Upload Files",
	showUploadButton: true,
};

filedialog = new gadgetui.input.FileUploader(
	document.querySelector("#fileUploadDiv"),
	options,
);
