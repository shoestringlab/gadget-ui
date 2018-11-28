
var options = {
  uploadURI: "/test/fileuploader.upload.cfm",
  tags: "file upload",
  willGenerateThumbnails: true,
  title: "Upload Files",
  showUploadButton: false
};

filedialog = gadgetui.objects.Constructor( gadgetui.input.FileUploader, [ document.querySelector("#fileUploadDiv"), options ]);
