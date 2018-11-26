function FileItem(args) {
  this.set(args);
}

FileItem.prototype.set = function(args) {
  // filename, size
  this.fileid = args.fileid !== undefined ? args.fileid : "";
  this.filename = args.filename !== undefined ? args.filename : "";
  if (args.filename !== undefined) {
    this.filenameabbr = args.filename.substr(0, 25);
    if (args.filename.length > 25) {
      this.filenameabbr = this.filenameabbr + "...";
    }
  } else {
    this.filenameabbr = "";
  }

  this.filesize = args.filesize !== undefined ? args.filesize : "";
  this.tags = args.tags !== undefined ? args.tags : "";
  this.path = args.path !== undefined ? args.path : "";
  this.created = args.created !== undefined ? args.created : "";
  this.createdStr = args.created !== undefined ? args.createdStr : "";
  this.disabled = args.disabled !== undefined ? args.disabled : 0;
  this.mimetype =
    args.mimetype !== undefined ? args.mimetype : "application/x-unknown";
  this.tile = args.tile !== undefined ? args.tile : "";
};
