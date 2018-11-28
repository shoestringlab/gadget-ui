function FileUploader(selector, options) {
  this.selector = selector;
  //this.dlg = "";
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
    title = title,
    files;

  var renderUploader = function() {
    var css = gadgetui.util.setStyle;
    var options = {
      title: title,
      addFile: self.addFileMessage,
      dropMessage: self.dropMessage,
      fileSelectLbl: ""
    };
    //var tabDiv = document.querySelector("div[name='" + tab.name + "']", self.selector);
    self.selector.innerHTML =
      '<div style="padding:10px;" class="gadgetui-fileuploader-wrapper"><div name="dropzone" class="gadgetui-fileuploader-dropzone" id="dropzone"><div class="gadgetui-fileuploader-dropmessage" name="dropMessageDiv">' +
      options.dropMessage +
      '</span></div></div><div name="filedisplay" class="gadgetui-fileuploader-filedisplay" style="display:none;"></div><div class="buttons full"><div class="fileUpload" name="fileUpload"><input type="file" name="fileselect" class="upload" title="' +
      options.fileSelectLbl +
      '"></div></div>';

      if( self.showUploadButton === false ){
        css( document.querySelector( "div[name='fileUpload']", self.selector ), "display", "none" );
      }

      var left = gadgetui.util.getNumberValue( gadgetui.util.getStyle( self.selector, "width" ) ) - ( gadgetui.util.textWidth( document.querySelector( "div[name='dropMessageDiv']", self.selector ).innerText, self.selector.style ) );
      var top = gadgetui.util.getNumberValue( gadgetui.util.getStyle( self.selector, "height" ) ) / 2;
      css( document.querySelector( "div[name='dropMessageDiv']", self.selector ), "left", left );
      css( document.querySelector( "div[name='dropMessageDiv']", self.selector ), "top", top );

    self.renderDropZone();
  };

  renderUploader();
};

FileUploader.prototype.configure = function(options) {
  // may be undefined
  this.message = options.message;
  this.tags = options.tags;
  this.uploadURI = options.uploadURI;
  this.onUploadComplete = options.onUploadComplete;
  this.willGenerateThumbnails = (options.willGenerateThumbnails !== undefined && options.willGenerateThumbnails !== null ? options.willGenerateThumbnails : false);
  this.showUploadButton = ( options.showUploadButton !== undefined ? options.showUploadButton : true );
  this.addFileMessage = ( options.addFileMessage !== undefined ? options.addFileMessage : "Add a File" );
  this.dropMessage = ( options.dropMessage !== undefined ? options.dropMessage : "Drop Files Here" );

};

FileUploader.prototype.setDimensions = function() {
  var css = gadgetui.util.setStyle;
  var uHeight = gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "height")),
    uWidth = gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "width")),
    dropzone = document.querySelector("div[class='gadgetui-fileuploader-dropzone']", this.selector),
    filedisplay = document.querySelector(
      "div[class='gadgetui-fileuploader-filedisplay']",
      this.selector
    ),
    buttons = document.querySelector("div[class~='buttons']", this.selector);

  css(dropzone, "height", uHeight - gadgetui.util.getNumberValue(gadgetui.util.getStyle(buttons, "height")) - 100);
  css(dropzone, "width", uWidth);

  css(filedisplay, "height", uHeight - gadgetui.util.getNumberValue(gadgetui.util.getStyle(buttons, "height")) - 100);
  css(filedisplay, "width", uWidth);
};

FileUploader.prototype.setEventHandlers = function() {
  var self = this;
  document.querySelector("input[name='fileselect']", self.selector).addEventListener("change", function(evt) {
    var dropzone = document.querySelector("div[name='dropzone']", self.selector),
      filedisplay = document.querySelector("div[name='filedisplay']", self.selector);

    self.processUpload(
      evt,
      evt.target.files,
      dropzone,
      filedisplay
    );
  });
};

FileUploader.prototype.renderDropZone = function() {
  // if we decide to drop files into a drag/drop zone

  var dropzone = document.querySelector("div[name='dropzone']", this.selector),
    filedisplay = document.querySelector("div[name='filedisplay']", this.selector),
    self = this;

    document.addEventListener( "dragstart", function( ev ){
      ev.dataTransfer.setData("text",  "data");
      ev.dataTransfer.effectAllowed = "copy";
    });

  dropzone.addEventListener("dragenter", function(ev) {
    gadgetui.util.addClass( dropzone, "highlighted");

    ev.preventDefault();
    ev.stopPropagation();
  });

  dropzone.addEventListener("dragleave", function(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    gadgetui.util.removeClass( dropzone,"highlighted");
  });

  dropzone.addEventListener("dragover", function(ev) {
    self.handleDragOver(ev);
    ev.dataTransfer.dropEffect = "copy";
  });

  dropzone.addEventListener("drop", function(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    self.processUpload(
      ev,
      ev.dataTransfer.files,
      dropzone,
      filedisplay
    );
  });
};

FileUploader.prototype.processUpload = function(event, files, dropzone, filedisplay) {
  var self = this,
    wrappedFile;
  var css = gadgetui.util.setStyle;
  self.uploadingFiles = [];

  for (var idx = 0; idx < files.length; idx++) {
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

  gadgetui.util.removeClass(dropzone, "highlighted");

  css(dropzone, "display", "none");
  css(filedisplay, "display", "table-cell");

  self.handleFileSelect(self.uploadingFiles, event);
};

FileUploader.prototype.handleFileSelect = function(wrappedFiles, evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var self = this;

  if (self.willGenerateThumbnails) {
    self.generateThumbnails(wrappedFiles);
  } else {
    self.upload(wrappedFiles);
  }
};

FileUploader.prototype.generateThumbnails = function(wrappedFiles) {
  // not going to convert this functionality right now
  this.upload(wrappedFiles);
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

FileUploader.prototype.upload = function(wrappedFiles) {
  wrappedFiles.forEach(function(wrappedFile) {
    wrappedFile.progressbar.start();
  });

  this.uploadFile(wrappedFiles);
};

FileUploader.prototype.uploadFile = function(wrappedFiles) {
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
      self.uploadChunk(wrappedFiles[j], chunks, 1, parts);
    }
  };
  // process files
  process();
};

FileUploader.prototype.uploadChunk = function(wrappedFile, chunks, filepart, parts) {
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

        self.handleUploadResponse(json, wrappedFile);
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

FileUploader.prototype.handleUploadResponse = function(json, wrappedFile) {
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

  if (self.onUploadComplete !== undefined) {
    self.onUploadComplete(fileItem);
  }
};

FileUploader.prototype.show = function(name) {
  var css = gadgetui.util.setStyle;
  var dropzone = document.querySelector("div[class='gadgetui-fileuploader-dropzone']", this.selector),
    filedisplay = document.querySelector(
      "div[class='gadgetui-fileuploader-filedisplay']",
      this.selector
    );
  if (name === "dropzone") {
    css(dropzone, "display", "table-cell");
    css(filedisplay, "display", "none");
  } else {
    css(filedisplay, "display", "table-cell");
    css(dropzone, "display", "none");
  }
};

FileUploader.prototype.handleDragOver = function(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = "copy";
  // Explicitly show this is a copy.
};
