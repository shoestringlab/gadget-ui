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
    uploadURI: "/test/fileuploader.upload.cfm",
    tags: "file upload",
    willGenerateThumbnails: true
  };

  filedialog = gadgetui.objects.Constructor( gadgetui.input.FileUploader, [ $("#modalDialog"), options ]);
});
