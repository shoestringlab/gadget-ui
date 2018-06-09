$.subscribe("filelocker.uploadFile", function(evt, data) {
  //$.publish( "main.showNotification" );
  gadgetui.util.upload(data.wrappedFiles, data.func, data.tags, data.args);
});
