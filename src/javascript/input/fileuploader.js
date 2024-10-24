function FileUploader(selector, options) {
	this.selector = selector;
	//this.dlg = "";
	this.droppedFiles = [];
	this.configure(options);
	this.render(options.title);
	this.setEventHandlers();
	this.setDimensions();
	this.token = (sessionStorage && this.useTokens ? sessionStorage.token : null );

}

FileUploader.prototype.events = ['uploadComplete', 'uploadStart', 'show', 'dragover', 'dragstart', 'dragenter', 'dragleave', 'drop'];

FileUploader.prototype.render = function (title) {
	var data,
		options,
		title = title,
		files;

	var renderUploader = function () {
		var css = gadgetui.util.setStyle;
		var options = {
			title: title,
			addFile: this.addFileMessage,
			dropMessage: this.dropMessage,
			fileSelectLbl: ""
		};

		var uploadClass = "gadgetui-fileuploader-uploadIcon";
		if (this.uploadClass.length) {
			uploadClass += " " + this.uploadClass;
		}

		var icon = "";
		if (this.uploadIcon.indexOf(".svg")) {
			icon = '<svg name="gadgetui-fileuploader-uploadIcon" class="' + uploadClass + '"><use xlink:href="' + this.uploadIcon + '"/></svg>'
		} else {
			icon = '<img name="gadgetui-fileuploader-uploadIcon" class="' + uploadClass + '" src="' + this.uploadIcon + '">';
		}

		this.selector.innerHTML =
			'<div class="gadgetui-fileuploader-wrapper"><div name="gadgetui-fileuploader-dropzone" class="gadgetui-fileuploader-dropzone"><div name="gadgetui-fileuploader-filedisplay" class="gadgetui-fileuploader-filedisplay" style="display:none;"></div><div class="gadgetui-fileuploader-dropmessage" name="gadgetui-fileuploader-dropMessageDiv">' +
			options.dropMessage +
			'</span></div></div><div class="buttons full"><div class="gadgetui-fileuploader-fileUpload" name="gadgetui-fileuploader-fileUpload"><label>' + icon + '<input type="file" name="gadgetui-fileuploader-fileselect" class="gadgetui-fileuploader-upload" title="' +
			options.fileSelectLbl +
			'"></label></div></div></div>';

		if (this.showUploadButton === false) {
			css(this.selector.querySelector("input[name='gadgetui-fileuploader-fileselect']"), "display", "none");
		}
		if (this.showDropZone === false) {
			css(this.selector.querySelector("div[name='gadgetui-fileuploader-dropzone']"), "display", "none");
		}
		if (this.showUploadIcon === false) {
			let iconSelector = this.selector.querySelector("img[name='gadgetui-fileuploader-uploadIcon']");
			if (iconSelector === null) {
				iconSelector = this.selector.querySelector("svg[name='gadgetui-fileuploader-uploadIcon']");
			}
			css(iconSelector, "display", "none");
		}

		this.renderDropZone();
	}.bind(this);

	renderUploader();
};

FileUploader.prototype.configure = function (options) {
	// may be undefined
	this.message = options.message;
	this.tags = options.tags;
	this.uploadURI = options.uploadURI;
	this.onUploadComplete = options.onUploadComplete;
	this.willGenerateThumbnails = (options.willGenerateThumbnails !== undefined && options.willGenerateThumbnails !== null ? options.willGenerateThumbnails : false);
	this.showUploadButton = (options.showUploadButton !== undefined ? options.showUploadButton : true);
	this.showDropZone = (options.showDropZone !== undefined ? options.showDropZone : true);
	this.uploadIcon = (options.uploadIcon !== undefined ? options.uploadIcon : '/node_modules/feather-icons/dist/feather-sprite.svg#image');
	this.uploadClass = (options.uploadClass !== undefined ? options.uploadClass : "");
	this.showUploadIcon = (options.uploadIcon !== undefined && options.showUploadIcon !== undefined && options.showUploadIcon ? true : false);
	this.addFileMessage = (options.addFileMessage !== undefined ? options.addFileMessage : "Add a File");
	this.dropMessage = (options.dropMessage !== undefined ? options.dropMessage : "Drop Files Here");
	this.uploadErrorMessage = (options.uploadErrorMessage !== undefined ? options.uploadErrorMessage : "Upload error.");
	this.useTokens = (options.useTokens !== undefined ? options.useTokens : false );
};

FileUploader.prototype.setDimensions = function () {
	var css = gadgetui.util.setStyle;
	var uHeight = gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "height")),
		uWidth = gadgetui.util.getNumberValue(gadgetui.util.getStyle(this.selector, "width")),
		dropzone = this.selector.querySelector("div[class='gadgetui-fileuploader-dropzone']"),
		filedisplay = this.selector.querySelector("div[class='gadgetui-fileuploader-filedisplay']"),
		buttons = this.selector.querySelector("div[class~='buttons']");
};

FileUploader.prototype.setEventHandlers = function () {
	this.selector.querySelector("input[name='gadgetui-fileuploader-fileselect']").addEventListener("change", function (evt) {
		var dropzone = this.selector.querySelector("div[name='gadgetui-fileuploader-dropzone']"),
			filedisplay = this.selector.querySelector("div[name='gadgetui-fileuploader-filedisplay']");

		this.processUpload(
			evt,
			evt.target.files,
			dropzone,
			filedisplay
		);
	}.bind(this));
};

FileUploader.prototype.renderDropZone = function () {
	// if we decide to drop files into a drag/drop zone
	let _this = this;
	var dropzone = this.selector.querySelector("div[name='gadgetui-fileuploader-dropzone']"),
		filedisplay = this.selector.querySelector("div[name='gadgetui-fileuploader-filedisplay']");

	this.selector.addEventListener("dragstart", function (ev) {
		ev.dataTransfer.setData("text", "data");
		ev.dataTransfer.effectAllowed = "copy";
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('dragstart');
		}
	});

	dropzone.addEventListener("dragenter", function (ev) {
		gadgetui.util.addClass(dropzone, "highlighted");

		ev.preventDefault();
		ev.stopPropagation();
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('dragenter');
		}
	});

	dropzone.addEventListener("dragleave", function (ev) {
		ev.stopPropagation();
		ev.preventDefault();
		gadgetui.util.removeClass(dropzone, "highlighted");
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('dragleave');
		}
	});

	dropzone.addEventListener("dragover", function (ev) {
		this.handleDragOver(ev);
		ev.dataTransfer.dropEffect = "copy";
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('dragover');
		}
	}.bind(this));

	dropzone.addEventListener("drop", function (ev) {
		ev.stopPropagation();
		ev.preventDefault();
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('drop');
		}
		this.processUpload(
			ev,
			ev.dataTransfer.files,
			dropzone,
			filedisplay
		);
	}.bind(this));
};

FileUploader.prototype.processUpload = function (event, files, dropzone, filedisplay) {
	var wrappedFile;
	var css = gadgetui.util.setStyle;
	this.uploadingFiles = [];
	css(filedisplay, "display", "inline");

	for (var idx = 0; idx < files.length; idx++) {
		wrappedFile = gadgetui.objects.Constructor(
			gadgetui.display.FileUploadWrapper, [files[idx], filedisplay,
			true
		]);

		this.uploadingFiles.push(wrappedFile);
		wrappedFile.on("uploadComplete", function (fileWrapper) {
			var ix;
			for (ix = 0; ix < this.uploadingFiles.length; ix++) {
				if (this.uploadingFiles[ix].id === fileWrapper.id) {
					this.uploadingFiles.splice(ix, 1);
				}
			}
			if (this.uploadingFiles.length === 0) {
				if (this.showDropZone) this.show("dropzone");
				this.setDimensions();
			}
			if (typeof this.fireEvent === 'function') {
				this.fireEvent('uploadComplete');
			}
		}.bind(this));
	}

	gadgetui.util.removeClass(dropzone, "highlighted");

	this.handleFileSelect(this.uploadingFiles, event);
};

FileUploader.prototype.handleFileSelect = function (wrappedFiles, evt) {
	evt.stopPropagation();
	evt.preventDefault();

	if (this.willGenerateThumbnails) {
		this.generateThumbnails(wrappedFiles);
	} else {
		this.upload(wrappedFiles);
	}
};

FileUploader.prototype.generateThumbnails = function (wrappedFiles) {
	// not going to convert this functionality right now
	this.upload(wrappedFiles);
};

FileUploader.prototype.upload = function (wrappedFiles) {
	var _this = this;
	wrappedFiles.forEach(function (wrappedFile) {
		if (typeof _this.fireEvent === 'function') {
			_this.fireEvent('uploadStart');
		}
		wrappedFile.progressbar.start();
	});

	this.uploadFile(wrappedFiles);
};

FileUploader.prototype.uploadFile = function (wrappedFiles) {

	var process = function () {
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
			this.uploadChunk(wrappedFiles[j], chunks, 1, parts);
		}
	}.bind(this);
	// process files
	process();
};

FileUploader.prototype.uploadChunk = function (wrappedFile, chunks, filepart, parts) {
	var xhr = new XMLHttpRequest(),
		response,
		tags = this.tags === undefined ? "" : this.tags;

	/*   if (wrappedFile.file.type.substr(0, 5) === "image") {
		tags = "image " + tags;
	  } */

	xhr.onreadystatechange = function () {
		var json;

		if (xhr.readyState === 4) {
			if (parseInt(xhr.status, 10) !== 200) {
				this.handleUploadError(xhr, {}, wrappedFile);
			} else {
				response = xhr.response;
				// set token
				console.log( xhr.getResponseHeader('X-Token') );
				if( sessionStorage && this.useTokens ){
					sessionStorage.token = xhr.getResponseHeader('X-Token');
					this.token = sessionStorage.token;
				}

				if (filepart <= parts) {
					wrappedFile.progressbar.updatePercent(
						parseInt(filepart / parts * 100, 10)
					);
				}
				if (filepart < parts) {
					wrappedFile.id = xhr.getResponseHeader("X-Id");

					filepart++;
					this.uploadChunk(
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
						this.handleUploadError(xhr, json, wrappedFile);
					}

					if (json.data !== null && json.data !== undefined) {
						this.handleUploadResponse(json, wrappedFile);
					} else {
						this.handleUploadError(xhr, json, wrappedFile);
					}

				}
			}

		}
	}.bind(this);

	xhr.open("POST", this.uploadURI, true);
	xhr.setRequestHeader("X-Tags", tags);
	xhr.setRequestHeader("X-Id", wrappedFile.id);
	xhr.setRequestHeader("X-FileName", wrappedFile.file.name);
	xhr.setRequestHeader("X-FileSize", wrappedFile.file.size);
	xhr.setRequestHeader("X-FilePart", filepart);
	xhr.setRequestHeader("X-Parts", parts);

	if( sessionStorage && this.useTokens ){
		//let token = sessionStorage.token;
		xhr.setRequestHeader("X-Token", this.token);
	}

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

FileUploader.prototype.handleUploadResponse = function (json, wrappedFile) {



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

	if (this.onUploadComplete !== undefined) {
		this.onUploadComplete(fileItem);
	}
};

FileUploader.prototype.handleUploadError = function (xhr, json, wrappedFile) {
	wrappedFile.progressbar.progressbox.innerText = this.uploadErrorMessage;
	wrappedFile.abortUpload(wrappedFile);
};

FileUploader.prototype.show = function (name) {
	var css = gadgetui.util.setStyle;
	var dropzone = this.selector.querySelector("div[class='gadgetui-fileuploader-dropzone']"),
		filedisplay = this.selector.querySelector("div[class='gadgetui-fileuploader-filedisplay']");
	if (name === "dropzone") {
		css(dropzone, "display", "table-cell");
		css(filedisplay, "display", "none");
	} else {
		css(filedisplay, "display", "table-cell");
		css(dropzone, "display", "none");
	}
};

FileUploader.prototype.handleDragOver = function (evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = "copy";
	// Explicitly show this is a copy.
};
