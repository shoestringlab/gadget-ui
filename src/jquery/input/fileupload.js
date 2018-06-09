var fileUpload = (function($) {
  "use strict";

  var EventBindings = {
    on: function(event, func) {
      if (this.events[event] === undefined) {
        this.events[event] = [];
      }
      this.events[event].push(func);
      return this;
    },

    off: function(event) {
      // clear listeners
      this.events[event] = [];
      return this;
    },

    fireEvent: function(key, args) {
      var self = this;
      $.each(this.events[key], function(ix, func) {
        func(self, args);
      });
    },

    getAll: function() {
      return [
        { name: "on", func: this.on },
        { name: "off", func: this.off },
        { name: "fireEvent", func: this.fireEvent }
      ];
    }
  };

  /*
	 * pop up file dialog for file upload
	 */

  function FileDialog(selector, options) {
    this.selector = selector;
    this.dlg = "";
    this.droppedFiles = [];
    this.configure(options);
    this.render(options.title);
    this.setEventHandlers();
    this.dlg.dialog("open");
    this.setDimensions();
  }

  FileDialog.prototype.render = function(title) {
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
      $("div[name='" + tab.name + "']", self.selector).html(
        '<div style="padding:10px;"><div name="dropzone" class="gadgetui-filedialog-dropzone" id="dropzone"><p>' +
          options.dropMessage +
          '</p></div><div name="filedisplay" class="gadgetui-filedialog-filedisplay" style="display:none;"></div><div class="buttons full"><div class="fileUpload"><input type="file" name="fileselect" class="upload" title="' +
          options.fileSelectLbl +
          '"></div><input type="button" class="ui-corner-all btn btn-primary" name="close" value="' +
          options.close +
          '"/></div></div>'
      );

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
      $.each(self.tabs, function(idx, tab) {
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
    self.selector.html(dialogContent);
    self.dlg = self.selector.dialog({
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
    });

    if (self.tabs.length > 1) {
      $("div[name='filedialogTabs']", self.selector).tabs({
        heightStyle: "content"
      });

      $.each(this.tabs, function(ix, tab) {
        if (tab.name === "filebrowser") {
          /*files = app.model.get("fileLocker");
		      if (self.fileList === undefined) {
		        $("#" + tab.id)
		          .html($.Mustache.render("listLayout", {}))
		          .css("font-size", "0.85em");

		        options = {
		          selector: $("div[class~='displayPanel']", "#" + tab.id),
		          sortDirection: 1,
		          sortBy: "filename",
		          tileView: "tileview",
		          listView: "listview",
		          recycling: "recycling",
		          filelocker: "filelocker",
		          display: "listview",
		          viewState: "filelocker",

		          //pagingFunc : "filelocker.renderFiles",
		          columns: [
		            {
		              name: "filename",
		              css: "span_7_of_12"
		            },
		            {
		              name: "filesize",
		              css: "span_2_of_12"
		            },
		            {
		              name: "actions",
		              css: "span_1_of_12"
		            }
		          ],
		          edit: false,
		          message: self.message
		        };
		        self.fileList = new app.ui.FileList(files, options);
		        self.fileList.selector.parent().trigger("renderList");
		      }*/
        } else if (tab.name === "uploader") {
          renderUploader(tab);
        }
      });
    } else {
      renderUploader(self.tabs[0]);
    }
  };

  FileDialog.prototype.configure = function(options) {
    //this.mode = options.mode === undefined ? "filelocker" : options.mode;
    this.tabs = options.tabs === undefined ? [] : options.tabs;
    // may be undefined
    this.message = options.message;
  };

  FileDialog.prototype.setDimensions = function() {
    var dlgHeight = this.selector.height(),
      dlgWidth = this.selector.width(),
      dropzone = $("div[class='gadgetui-filedialog-dropzone']", this.selector),
      filedisplay = $(
        "div[class='gadgetui-filedialog-filedisplay']",
        this.selector
      ),
      buttons = $("div[class~='buttons']", this.selector);

    $.each(this.tabs, function(ix, tab) {
      $("#" + tab.id).css("height", dlgHeight - 75);
    });
    dropzone
      .css("height", dlgHeight - buttons.height() - 100)
      .css("width", dlgWidth);

    filedisplay
      .css("height", dlgHeight - buttons.height() - 100)
      .css("width", dlgWidth);
  };

  FileDialog.prototype.setEventHandlers = function() {
    var self = this,
      listeners = function(options) {
        switch (options.name) {
          case "uploader":
            $("input[name='fileselect']", self.selector).on("change", function(
              evt
            ) {
              var dropzone = $("div[name='dropzone']", self.selector),
                filedisplay = $("div[name='filedisplay']", self.selector);

              self.processUpload(
                evt,
                evt.target.files,
                dropzone,
                filedisplay,
                options
              );
            });
            /*.on("mouseenter", function() {
	              $("input[name='upload']", self.selector).addClass(
	                "gadgetui-blueButtonHover"
	              );
	            })
	            .on("mouseleave", function(e) {
	              $("input[name='upload']", self.selector).removeClass(
	                "gadgetui-blueButtonHover"
	              );
	            });*/
            break;
          case "filebrowser":
            break;
        }
      };

    $.each(this.tabs, function(ix, tab) {
      listeners(tab);
    });

    $("input[name='close']", this.selector).on("click", function() {
      self.close();
    });

    /*  this.selector.on("dialogresize", function(event, ui) {
	    $.throttle(250, self.setDimensions());
	  });*/
  };

  FileDialog.prototype.renderDropZone = function(options) {
    // if we decide to drop files into a drag/drop zone

    var dropzone = $("div[name='dropzone']", this.selector),
      filedisplay = $("div[name='filedisplay']", this.selector),
      self = this;

    dropzone
      .off("dragover")
      .off("drop")
      .off("dragenter")
      .off("dragleave")
      .on("dragenter", function(e) {
        dropzone.addClass("highlighted");

        e.preventDefault();
        e.stopPropagation();
      })

      .on("dragleave", function(e) {
        e.stopPropagation();
        e.preventDefault();
        dropzone.removeClass("highlighted");
      })

      .on("dragover", function(e) {
        self.handleDragOver(e);
      })

      .on("drop", function(ev) {
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

  FileDialog.prototype.processUpload = function(
    event,
    files,
    dropzone,
    filedisplay,
    options
  ) {
    var self = this,
      wrappedFile;

    self.uploadingFiles = [];
    $.each(files, function(idx, file) {
      wrappedFile = gadgetui.util.Constructor(
        gadgetui.input.fileupload.FileUploadWrapper,
        [file, filedisplay],
        true
      );

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
    });

    dropzone.removeClass("highlighted");

    dropzone.hide();
    filedisplay.css("display", "table-cell");

    _handleFileSelect(
      self.uploadingFiles,
      event,
      options.func,
      self.selector,
      options.tags,
      options.funcArgs,
      gadgetui.util.upload
    );
  };

  FileDialog.prototype.show = function(name) {
    var dropzone = $(
        "div[class='gadgetui-filedialog-dropzone']",
        this.selector
      ),
      filedisplay = $(
        "div[class='gadgetui-filedialog-filedisplay']",
        this.selector
      );
    if (name === "dropzone") {
      dropzone.css("display", "table-cell");
      filedisplay.css("display", "none");
    } else {
      filedisplay.css("display", "table-cell");
      dropzone.css("display", "none");
    }
  };

  FileDialog.prototype.handleDragOver = function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.originalEvent.dataTransfer.dropEffect = "copy";
    // Explicitly show this is a copy.
  };

  FileDialog.prototype.close = function() {
    this.dlg.dialog("close");
  };

  function Constructor(constructor, args, addBindings) {
    var ix, returnedObj, obj, bindings;

    if (addBindings === true) {
      bindings = EventBindings.getAll();
      for (ix = 0; ix < bindings.length; ix++) {
        if (constructor.prototype[bindings[ix].name] === undefined) {
          constructor.prototype[bindings[ix].name] = bindings[ix].func;
        }
      }
    }

    // construct the object
    obj = Object.create(constructor.prototype);
    returnedObj = constructor.apply(obj, args);
    if (returnedObj === undefined) {
      returnedObj = obj;
    }

    if (addBindings === true) {
      // create specified event list from prototype
      returnedObj.events = {};
      for (ix = 0; ix < constructor.prototype.events.length; ix++) {
        returnedObj.events[constructor.prototype.events[ix]] = [];
      }
    }

    return returnedObj;
  }

  function FileUploadWrapper(file, selector) {
    var ix,
      id,
      options,
      bindings = EventBindings.getAll();

    id = gadgetui.util.id();
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
})(jQuery);
