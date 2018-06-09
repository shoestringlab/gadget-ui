$(document).ready(function() {
  var options = {
    tabs: [
      {
        id: "filedialog_uploader",
        name: "uploader",
        title: "Add Files",
        func: "file.uploadFile",
        funcArgs: { uploadURI: "/test/jquery.filedialog.upload.cfm" },
        tags: "file upload"
      }
    ]
  };

  filedialog = new gadgetui.input.FileDialog($("#modalDialog"), options);
});
