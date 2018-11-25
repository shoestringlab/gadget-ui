
function FileUploadWrapper(file, selector) {
  var ix,
    id,
    options,
    bindings = gadgetui.objects.EventBindings.getAll();

  id = gadgetui.util.Id();
  options = { id: id, filename: file.name, width: selector.width() };
  this.file = file;
  this.id = id;
  this.progressbar = new gadgetui.display.ProgressBar(selector, options);
  this.progressbar.render();
  for (ix = 0; ix < bindings.length; ix++) {
    this[bindings[ix].name] = bindings[ix].func;
  }
}

FileUploadWrapper.prototype.events = ["uploadComplete"];

FileUploadWrapper.prototype.completeUpload = function(fileItem) {
  this.progressbar.destroy();
  this.fireEvent("uploadComplete", fileItem);
};
