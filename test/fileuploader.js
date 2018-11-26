
var options = {
  tabs: [
    {
      id: "filedialog_uploader",
      name: "uploader",
      title: "Add Files"
      //onUploadComplete: refresh,
    }
  ],
//  onUploadComplete: refresh,
  uploadURI: "/test/fileuploader.upload.cfm",
  tags: "file upload",
  willGenerateThumbnails: true,
  title: "Upload Files"
};

filedialog = gadgetui.objects.Constructor( gadgetui.input.FileUploader, [ document.querySelector("#modalDialog"), options ]);
