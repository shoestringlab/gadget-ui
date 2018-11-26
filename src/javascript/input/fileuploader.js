

function FileUploader(selector, options) {
  this.selector = selector;
  this.dlg = "";
  this.droppedFiles = [];
  this.configure(options);
  this.render(options.title);
  this.setEventHandlers();
  this.setDimensions();
}

FileUploader.prototype.render = function(title) {
  var self = this,
    data,
    options,
    dialogContent,
    title = title,
    files;

  var renderUploader = function(tab) {
    options = {
      title: title,
      close: "Close",
      addFile: "Add a File",
      dropMessage: "Drop files here or click 'Add a File' ",
      fileSelectLbl: ""
    };
    var tabDiv = document.querySelector("div[name='" + tab.name + "']", self.selector);
    tabDiv.innerHTML =
      '<div style="padding:10px;"><div name="dropzone" class="gadgetui-filedialog-dropzone" id="dropzone"><p>' +
      options.dropMessage +
      '</p></div><div name="filedisplay" class="gadgetui-filedialog-filedisplay" style="display:none;"></div><div class="buttons full"><div class="fileUpload"><input type="file" name="fileselect" class="upload" title="' +
      options.fileSelectLbl +
      '"></div><input type="button" class="ui-corner-all btn btn-primary" name="close" value="' +
      options.close +
      '"/></div></div>';

    self.renderDropZone(tab);
  };

  data = {
    title: title,
    close: "Close",
    tabs: self.tabs
  };

  if (self.tabs.length > 1) {
    dialogContent =
      '<div name="filedialogTabs" class="gadgetui-filedialog-tabdialog"><ul>';
    var links = "";
    var tabs = "";
    self.tabs.forEach( function(tab) {
      links += '<li><a href="#' + tab.id + '">' + tab.name + "</a></li>";
      tabs += '<div id="' + tab.id + '" name="' + tab.name + '"></div>';
    });
    dialogContent += links + "</ul>" + tabs + "</div>";
  } else {
    dialogContent =
      '<div id="' +
      self.tabs[0].id +
      '" name="' +
      self.tabs[0].name +
      '"></div>';
  }
  self.selector.innerHTML = dialogContent;
/*   self.dlg = self.selector.dialog({
    autoOpen: false, // set this to false so we can
    // manually open it
    dialogClass: "noTitleBar",
    closeOnEscape: true,
    draggable: true,
    width: 500,
    minHeight: 300,
    height: 500,
    modal: true,
    resizable: true,
    title: title,
    close: function(event, ui) {
      self.selector.empty();
    }
  }); */
  self.dlg = gadgetui.objects.Constructor( gadgetui.display.Dialog, [
    self.selector,
    {
      title: title,
      width: 500,
      minHeight: 300,
      height: 500,
      enableClose: true,
      enableShrink: false
    }
  ])

  renderUploader(self.tabs[0]);
};

FileUploader.prototype.configure = function(options) {
  //this.mode = options.mode === undefined ? "filelocker" : options.mode;
  this.tabs = options.tabs === undefined ? [] : options.tabs;
  // may be undefined
  this.message = options.message;
  this.tags = options.tags;
  this.uploadURI = options.uploadURI;
  this.onUploadComplete = options.onUploadComplete;
  this.willGenerateThumbnails = (options.willGenerateThumbnails !== undefined && options.willGenerateThumbnails !== null ? options.willGenerateThumbnails : false );
};

FileUploader.prototype.setDimensions = function() {
  var css = gadgetui.util.setStyle;
  var dlgHeight = gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector, "height" ) ),
    dlgWidth =  gadgetui.util.getNumberValue( gadgetui.util.getStyle( this.selector, "width" ) ),
    dropzone = document.querySelector("div[class='gadgetui-filedialog-dropzone']", this.selector),
    filedisplay = document.querySelector(
      "div[class='gadgetui-filedialog-filedisplay']",
      this.selector
    ),
    buttons = document.querySelector("div[class~='buttons']", this.selector);

  this.tabs.forEach( function( tab ) {
    css( document.querySelector("#" + tab.id), "height", dlgHeight - 75);
  });
  css( dropzone, "height", dlgHeight -  gadgetui.util.getNumberValue( gadgetui.util.getStyle(buttons, "height" ) ) - 100);
  css( dropzone, "width", dlgWidth );

  css( filedisplay, "height", dlgHeight - gadgetui.util.getNumberValue( gadgetui.util.getStyle( buttons, "height") ) - 100);
  css(filedisplay, "width", dlgWidth);
};

FileUploader.prototype.setEventHandlers = function() {
  var self = this,
    listeners = function(options) {
      switch (options.name) {
        case "uploader":
          document.querySelector("input[name='fileselect']", self.selector).addEventListener("change", function(
            evt
          ) {
            var dropzone = document.querySelector("div[name='dropzone']", self.selector),
              filedisplay = document.querySelector("div[name='filedisplay']", self.selector);

            self.processUpload(
              evt,
              evt.target.files,
              dropzone,
              filedisplay,
              options
            );
          });
          break;
        case "filebrowser":
          break;
      }
    };

  this.tabs.forEach( function(tab) {
    listeners(tab);
  });

  document.querySelector("input[name='close']", this.selector).addEventListener("click", function() {
    self.close();
  });
};

FileUploader.prototype.renderDropZone = function(options) {
  // if we decide to drop files into a drag/drop zone

  var dropzone = document.querySelector("div[name='dropzone']", this.selector),
    filedisplay = document.querySelector("div[name='filedisplay']", this.selector),
    self = this;

  dropzone.addEventListener("dragenter", function(e) {
      dropzone.addClass("highlighted");

      e.preventDefault();
      e.stopPropagation();
    });

    dropzone.addEventListener("dragleave", function(e) {
      e.stopPropagation();
      e.preventDefault();
      dropzone.removeClass("highlighted");
    });

    dropzone.addEventListener("dragover", function(e) {
      self.handleDragOver(e);
    });

    dropzone.addEventListener("drop", function(ev) {
      ev.stopPropagation();
      ev.preventDefault();

      self.processUpload(
        ev,
        ev.originalEvent.dataTransfer.files,
        dropzone,
        filedisplay,
        options
      );
    });
};

FileUploader.prototype.processUpload = function(event, files, dropzone, filedisplay, options){
  var self = this,
    wrappedFile;
  var css = gadgetui.util.setStyle;
  self.uploadingFiles = [];

  for( var idx = 0; idx < files.length; idx++){
    wrappedFile = gadgetui.objects.Constructor(
      gadgetui.display.FileUploadWrapper, [files[idx], filedisplay,
      true
    ]);

    self.uploadingFiles.push(wrappedFile);
    wrappedFile.on("uploadComplete", function(fileWrapper) {
      var ix;
      for (ix = 0; ix < self.uploadingFiles.length; ix++) {
        if (self.uploadingFiles[ix].id === fileWrapper.id) {
          self.uploadingFiles.splice(ix, 1);
        }
      }
      if (self.uploadingFiles.length === 0) {
        self.show("dropzone");
        self.setDimensions();
      }
    });
  }

  gadgetui.util.removeClass( dropzone, "highlighted");

  css( dropzone, "display", "none" );
  css( filedisplay, "display", "table-cell" );

  self.handleFileSelect( self.uploadingFiles, event );
};

FileUploader.prototype.handleFileSelect = function( wrappedFiles, evt ){
  evt.stopPropagation();
  evt.preventDefault();
  var self = this;

  if( self.willGenerateThumbnails ){
    self.generateThumbnails( wrappedFiles );
  }else{
    self.upload( wrappedFiles );
  }
};

FileUploader.prototype.generateThumbnails = function( wrappedFiles ){
  // not going to convert this functionality right now
  this.upload( wrappedFiles );
};

/*
FileUploader.prototype.generateThumbnails = function( wrappedFiles ){
  var self = this;
  var pdfThumbnail = function(wrappedFile, idx) {
      var pdfURL = URL.createObjectURL(wrappedFile.file);
      wrappedFile.progressbar.update(" - generating thumbnail");
      PDFJS.getDocument(pdfURL).then(function(pdf) {
        pdf.getPage(1).then(function(page) {
          var renderContext,
            viewport = page.getViewport(0.5),
            canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };

          page.render(renderContext).then(function() {
            //set to draw behind current content
            ctx.globalCompositeOperation = "destination-over";

            //set background color
            ctx.fillStyle = "#ffffff";

            //draw background / rect on entire canvas
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            var img = canvas.toDataURL();
            wrappedFile = $.extend(wrappedFile, { tile: img });
            if (idx === wrappedFiles.length - 1) {
              self.upload( wrappedFiles );
            }
          });
        });
      });
    },
    imageThumbnail = function(wrappedFile, idx) {
      try {
        wrappedFile.progressbar.update(" - generating thumbnail");
        $.canvasResize(wrappedFile.file, {
          width: 200,
          height: 0,
          crop: false,
          quality: 80,
          callback: function(data, width, height) {
            //file.progressbar.update( " - generated thumbnail" );
            wrappedFile = $.extend(wrappedFile, { tile: data });
            if (idx === wrappedFiles.length - 1) {
              self.upload( wrappedFiles );
            }
          }
        });
      } catch (ev) {
        //could not parse image
      }
    };

  $.each(wrappedFiles, function(ix, wrappedFile) {
    switch (wrappedFile.file.type) {
      case "application/pdf":
        pdfThumbnail(wrappedFile, ix);
        break;
      case "image/jpg":
      case "image/jpeg":
      case "image/png":
      case "image/gif":
        imageThumbnail(wrappedFile, ix);
        break;
      default:
        //console.log( "Could not generate tile on client." );
        wrappedFile.progressbar.update(
          "Could not generate thumbnail on client"
        );
        wrappedFile = $.extend(wrappedFile, { tile: "" });
        if (ix === wrappedFiles.length - 1) {
          self.upload( wrappedFiles );
        }
        break;
    }
  });
};
 */

FileUploader.prototype.upload = function( wrappedFiles ) {
  wrappedFiles.forEach( function( wrappedFile ) {
    wrappedFile.progressbar.start();
  });

  this.uploadFile( wrappedFiles );
};

FileUploader.prototype.uploadFile = function( wrappedFiles ) {
  var self = this;
  var process = function() {
    var blob,
      chunks = [],
      BYTES_PER_CHUNK,
      SIZE,
      parts,
      start,
      end,
      chunk,
      j;

    for (j = 0; j < wrappedFiles.length; j++) {
      blob = wrappedFiles[j].file;
      chunks = [];
      BYTES_PER_CHUNK = 1024 * 1024;
      // 1MB chunk sizes.
      SIZE = blob.size;
      parts = Math.ceil(SIZE / BYTES_PER_CHUNK);
      start = 0;
      end = BYTES_PER_CHUNK;

      while (start < SIZE) {
        if (blob.hasOwnProperty("mozSlice")) {
          chunk = blob.mozSlice(start, end);
        } else if (blob.hasOwnProperty("webkitSlice")) {
          chunk = blob.webkitSlice(start, end);
        } else {
          chunk = blob.slice(start, end);
        }

        chunks.push(chunk);

        start = end;
        end = start + BYTES_PER_CHUNK;
      }

      // start the upload process
      self.uploadChunk(wrappedFiles[j], chunks, 1, parts );
    }
  };
  // process files
  process();
};

FileUploader.prototype.uploadChunk = function( wrappedFile, chunks, filepart, parts ) {
  var xhr = new XMLHttpRequest(),
    self = this,
    response,
    tags = self.tags === undefined ? "" : self.tags;

  if (wrappedFile.file.type.substr(0, 5) === "image") {
    tags = "image " + tags;
  }

  xhr.onreadystatechange = function() {
    var json;

    if (xhr.readyState === 4) {
      response = xhr.response;

      if (filepart <= parts) {
        wrappedFile.progressbar.updatePercent(
          parseInt(filepart / parts * 100, 10)
        );
      }
      if (filepart < parts) {
        wrappedFile.id = xhr.getResponseHeader("X-Id");
        filepart++;
        self.uploadChunk(
          wrappedFile,
          chunks,
          filepart,
          parts
        );
      } else {
        try {
          json = {
            data: JSON.parse(response)
          };
        } catch (e) {
          json = {};
        }

        self.handleUploadResponse(json, wrappedFile );
      }
    }
  };

  xhr.open("POST", self.uploadURI, true);
  if (filepart === 1) {
    xhr.setRequestHeader("X-Tags", tags);
  }
  xhr.setRequestHeader("X-Id", wrappedFile.id);
  xhr.setRequestHeader("X-FileName", wrappedFile.file.name);
  xhr.setRequestHeader("X-FileSize", wrappedFile.file.size);
  xhr.setRequestHeader("X-FilePart", filepart);
  xhr.setRequestHeader("X-Parts", parts);
  xhr.setRequestHeader(
    "X-MimeType",
    wrappedFile.file.type || "application/octet-stream"
  );
  xhr.setRequestHeader(
    "X-HasTile",
    wrappedFile.tile !== undefined && wrappedFile.tile.length > 0 ?
    true :
    false
  );
  xhr.setRequestHeader("Content-Type", "application/octet-stream");

  xhr.send(chunks[filepart - 1]);
};

FileUploader.prototype.handleUploadResponse = function(json, wrappedFile ) {
  var self = this;
  var fileItem = gadgetui.objects.Constructor(
    gadgetui.objects.FileItem, [{
      mimetype: json.data.mimetype,
      fileid: json.data.fileId,
      filename: json.data.filename,
      filesize: json.data.filesize,
      tags: json.data.tags,
      created: json.data.created,
      createdStr: json.data.created,
      disabled: json.data.disabled,
      path: json.data.path
    }],
    false
  );

  // fire completeUpload event so upload dialog can clean itself up
  wrappedFile.completeUpload(fileItem);

  if ( self.onUploadComplete !== undefined) {
    self.onUploadComplete(fileItem);
  }
};

FileUploader.prototype.show = function(name) {
  var css = gadgetui.util.setStyle;
  var dropzone = document.querySelector("div[class='gadgetui-filedialog-dropzone']", this.selector),
    filedisplay = document.querySelector(
      "div[class='gadgetui-filedialog-filedisplay']",
      this.selector
    );
  if (name === "dropzone") {
    css( dropzone, "display", "table-cell");
    css( filedisplay, "display", "none");
  } else {
    css( filedisplay, "display", "table-cell");
    css( dropzone, "display", "none");
  }
};

FileUploader.prototype.handleDragOver = function(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.originalEvent.dataTransfer.dropEffect = "copy";
  // Explicitly show this is a copy.
};

FileUploader.prototype.close = function() {
  this.dlg.close();
};
