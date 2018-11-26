$(document).ready(function() {
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
    uploadURI: "/test/jquery.fileuploader.upload.cfm",
    tags: "file upload",
    willGenerateThumbnails: true
  };

  filedialog = new gadgetui.input.FileUploader($("#modalDialog"), options);
});
