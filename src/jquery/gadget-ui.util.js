gadgetui.util = (function() {

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

  function FileUploadWrapper(file, selector) {
    var ix,
      id,
      options,
      bindings = EventBindings.getAll();

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

  var _generateThumbnails = function(
      wrappedFiles,
      evt,
      func,
      tags,
      args,
      callbackFunc
    ) {
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
                  callbackFunc(wrappedFiles, evt, func, tags, args);
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
                  callbackFunc(wrappedFiles, evt, func, tags, args);
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
              callbackFunc(wrappedFiles, evt, func, tags, args);
            }
            break;
        }
      });
    },
    _handleFileSelect = function(
      wrappedFiles,
      evt,
      func,
      selector,
      tags,
      args,
      callback
    ) {
      evt.stopPropagation();
      evt.preventDefault();
      _upload(wrappedFiles, evt, func, tags, args);

      //_generateThumbnails(wrappedFiles, evt, func, tags, args, callback);
    },
    _upload = function(wrappedFiles, evt, func, tags, args) {
      $.each(wrappedFiles, function(ix, wrappedFile) {
        wrappedFile.progressbar.start();
      });

      _uploadFile(wrappedFiles, func, tags, args);
    },
    _uploadFile = function(wrappedFiles, func, tags, args) {
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
          _uploadChunk(wrappedFiles[j], chunks, 1, parts, func, tags, args);
        }
      };
      // process files
      process();
    },
    _uploadChunk = function(
      wrappedFile,
      chunks,
      filepart,
      parts,
      func,
      tags,
      args
    ) {
      var xhr = new XMLHttpRequest(),
        response,
        /* token,
        response;*/
        tags = tags === undefined ? "" : tags;
      if (wrappedFile.file.type.substr(0, 5) === "image") {
        tags = "image " + tags;
      }

      xhr.onreadystatechange = function() {
        var json;
        /*token = xhr.getResponseHeader("X-Token");

        if (token !== undefined && token !== null) {
          app.model.set("token", token);
          sessionStorage.token = token;
        }*/

        if (xhr.readyState === 4) {
          response = xhr.response;

          if (filepart <= parts) {
            wrappedFile.progressbar.updatePercent(
              parseInt(filepart / parts * 100, 10)
            );
          }
          if (filepart < parts) {
            //console.log( xhr.getResponseHeader( "X-Id" ) );
            wrappedFile.id = xhr.getResponseHeader("X-Id");
            filepart++;
            _uploadChunk(
              wrappedFile,
              chunks,
              filepart,
              parts,
              func,
              tags,
              args
            );
          } else {
            try {
              json = {
                data: $.parseJSON(response)
              };
            } catch (e) {
              json = {};
            }

            /*  _getStats();*/
            _handleUploadResponse(json, func, wrappedFile, args);
          }
        }
      };

      xhr.open("POST", args.uploadURI, true);
      //xhr.setRequestHeader("X-Token", app.model.get("token"));
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
        wrappedFile.tile !== undefined && wrappedFile.tile.length > 0
          ? true
          : false
      );
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      xhr.send(chunks[filepart - 1]);
    },
    _handleUploadResponse = function(json, func, wrappedFile, args) {
      var fileItem = gadgetui.util.Constructor(
        gadgetui.util.FileItem,
        [
          {
            mimetype: json.data.mimetype,
            fileid: json.data.fileId,
            filename: json.data.filename,
            filesize: json.data.filesize,
            tags: json.data.tags,
            created: json.data.created,
            createdStr: json.data.created,
            disabled: json.data.disabled,
            path: json.data.path
          }
        ],
        false
      );

      // fire completeUpload event so upload dialog can clean itself up
      wrappedFile.completeUpload(fileItem);

      if (func !== undefined) {
        func(fileItem);
      }
    };

  return {
    Constructor: Constructor,
    EventBindings: EventBindings,
    FileItem: FileItem,
    FileUploadWrapper: FileUploadWrapper,
    handleFileSelect: _handleFileSelect,
    upload: _upload,
    split: function(val) {
      return val.split(/,\s*/);
    },
    extractLast: function(term) {
      return this.split(term).pop();
    },
    getNumberValue: function(pixelValue) {
      return Number(pixelValue.substring(0, pixelValue.length - 2));
    },

    addClass: function(sel, className) {
      if (sel.classList) {
        sel.classList.add(className);
      } else {
        sel.className += " " + className;
      }
    },

    getOffset: function(selector) {
      var rect = selector.getBoundingClientRect();

      return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft
      };
    },

    getRelativeParentOffset: function(selector) {
      var i,
        parents = selector.parentsUntil("body"),
        relativeOffsetLeft = 0,
        relativeOffsetTop = 0;

      for (i = 0; i < parents.length; i++) {
        if (parents[i].style.position === "relative") {
          var offset = gadgetui.util.getOffset(parents[i]);
          // set the largest offset values of the ancestors
          if (offset.left > relativeOffsetLeft) {
            relativeOffsetLeft = offset.left;
          }

          if (offset.top > relativeOffsetTop) {
            relativeOffsetTop = offset.top;
          }
        }
      }
      return { left: relativeOffsetLeft, top: relativeOffsetTop };
    },
    Id: function() {
      return (Math.random() * 100).toString().replace(/\./g, "");
    },
    bind: function(selector, model) {
      var bindVar = selector[0].getAttribute("gadgetui-bind");

      // if binding was specified, make it so
      if (bindVar !== undefined && model !== undefined) {
        model.bind(bindVar, selector);
      }
    },
    encode: function(input, options) {
      var result,
        canon = true,
        encode = true,
        encodeType = "html";
      if (options !== undefined) {
        canon = options.canon === undefined ? true : options.canon;
        encode = options.encode === undefined ? true : options.encode;
        //enum (html|css|attr|js|url)
        encodeType =
          options.encodeType === undefined ? "html" : options.encodeType;
      }
      if (canon) {
        result = $.encoder.canonicalize(input);
      }
      if (encode) {
        switch (encodeType) {
          case "html":
            result = $.encoder.encodeForHTML(result);
            break;
          case "css":
            result = $.encoder.encodeForCSS(result);
            break;
          case "attr":
            result = $.encoder.encodeForHTMLAttribute(result);
            break;
          case "js":
            result = $.encoder.encodeForJavascript(result);
            break;
          case "url":
            result = $.encoder.encodeForURL(result);
            break;
        }
      }
      return result;
    },
    mouseCoords: function(ev) {
      // from http://www.webreference.com/programming/javascript/mk/column2/
      if (ev.pageX || ev.pageY) {
        return { x: ev.pageX, y: ev.pageY };
      }
      return {
        x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y: ev.clientY + document.body.scrollTop - document.body.clientTop
      };
    },
    mouseWithin: function(selector, coords) {
      var rect = selector[0].getBoundingClientRect();
      return coords.x >= rect.left &&
        coords.x <= rect.right &&
        coords.y >= rect.top &&
        coords.y <= rect.bottom
        ? true
        : false;
    },
    getStyle: function(el, prop) {
      if (window.getComputedStyle !== undefined) {
        if (prop !== undefined) {
          return window.getComputedStyle(el[0], null).getPropertyValue(prop);
        } else {
          return window.getComputedStyle(el[0], null);
        }
      } else {
        if (prop !== undefined) {
          return el[0].currentStyle[prop];
        } else {
          return el[0].currentStyle;
        }
      }
    },

    		textWidth : function( text, style ) {
    			// http://stackoverflow.com/questions/1582534/calculating-text-width-with-jquery
    			// based on edsioufi's solution
    			if ( !gadgetui.util.textWidthEl ) {
    				gadgetui.util.textWidthEl = document.createElement( "div" );
    				gadgetui.util.textWidthEl.setAttribute( "id",
    						"gadgetui-textWidth" );
    				gadgetui.util.textWidthEl.setAttribute( "style",
    						"display: none;" );
    				document.body.appendChild( gadgetui.util.textWidthEl );
    			}
    			// gadgetui.util.fakeEl = $('<span
    			// id="gadgetui-textWidth">').appendTo(document.body);

    			// var width, htmlText = text || selector.value ||
    			// selector.innerHTML;
    			var width, htmlText = text;
    			if ( htmlText.length > 0 ) {
    				// htmlText =
    				// gadgetui.util.TextWidth.fakeEl.text(htmlText).html();
    				// //encode to Html
    				gadgetui.util.textWidthEl.innerText = htmlText;
    				if ( htmlText === undefined ) {
    					htmlText = "";
    				} else {
    					htmlText = htmlText.replace( /\s/g, "&nbsp;" ); // replace
    																	// trailing
    																	// and
    																	// leading
    																	// spaces
    				}
    			}
    			gadgetui.util.textWidthEl.innertText = htmlText;
    			// gadgetui.util.textWidthEl.style.font = font;
    			// gadgetui.util.textWidthEl.html( htmlText ).style.font = font;
    			// gadgetui.util.textWidthEl.html(htmlText).css('font', font ||
    			// $.fn.css('font'));
    			gadgetui.util.textWidthEl.style.fontFamily = style.fontFamily;
    			gadgetui.util.textWidthEl.style.fontSize = style.fontSize;
    			gadgetui.util.textWidthEl.style.fontWeight = style.fontWeight;
    			gadgetui.util.textWidthEl.style.fontVariant = style.fontVariant;
    			gadgetui.util.textWidthEl.style.display = "inline";

    			width = gadgetui.util.textWidthEl.offsetWidth;
    			gadgetui.util.textWidthEl.style.display = "none";
    			return width;
    		}
  };
})();
