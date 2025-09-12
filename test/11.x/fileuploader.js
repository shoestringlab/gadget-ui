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

// new FileUploader(element, {
//   allowedFileTypes: ['image/jpeg', 'image/png'],
//   allowedExtensions: ['.jpg', '.png', '.gif'],
//   invalidFileTypeMessage: "Only images are allowed"
// });

// // Global size limit
// new FileUploader(element, {
//   maxFileSize: 5 * 1024 * 1024 // 5MB
// });

// // Type-specific limits
// new FileUploader(element, {
//   maxFileSizeByType: [
//     { type: 'image/jpeg', size: 2 * 1024 * 1024 }, // 2MB for JPEG images
//     { type: 'application/pdf', size: 10 * 1024 * 1024 } // 10MB for PDFs
//   ]
// });

// // Combined global and specific limits
// new FileUploader(element, {
//   maxFileSize: 10 * 1024 * 1024, // 10MB default
//   maxFileSizeByType: {
//     'image/jpeg': 2 * 1024 * 1024, // 2MB for JPEGs
//     'application/pdf': 5 * 1024 * 1024 // 5MB for PDFs
//   }
// });
