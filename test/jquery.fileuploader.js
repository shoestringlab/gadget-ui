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
    uploadURI: "/test/jquery.filedialog.upload.cfm",
    tags: "file upload",
    willGenerateThumbnails: true
  };

  filedialog = new gadgetui.input.FileDialog($("#modalDialog"), options);
});
