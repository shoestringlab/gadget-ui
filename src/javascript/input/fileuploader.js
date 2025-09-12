class FileUploader extends Component {
	constructor(element, options = {}) {
		super();
		this.element = element;
		this.droppedFiles = [];
		this.configure(options);
		this.render(options.title);
		this.setEventHandlers();
		this.setDimensions();
		this.token = this.useTokens && sessionStorage ? sessionStorage.token : null;
	}

	render(title = "") {
		const css = gadgetui.util.setStyle;
		const uploadClass =
			`gadgetui-fileuploader-uploadIcon ${this.uploadClass || ""}`.trim();
		const icon = this.uploadIcon.includes(".svg")
			? `<svg name="gadgetui-fileuploader-uploadIcon" class="${uploadClass}"><use xlink:href="${this.uploadIcon}"/></svg>`
			: `<img name="gadgetui-fileuploader-uploadIcon" class="${uploadClass}" src="${this.uploadIcon}">`;

		this.element.innerHTML = `
      <div class="gadgetui-fileuploader-wrapper">
        <div name="gadgetui-fileuploader-dropzone" class="gadgetui-fileuploader-dropzone">
          <div name="gadgetui-fileuploader-filedisplay" class="gadgetui-fileuploader-filedisplay" style="display:none;"></div>
          <div class="gadgetui-fileuploader-dropmessage" name="gadgetui-fileuploader-dropMessageDiv">${this.dropMessage}</div>
        </div>
        <div class="buttons full">
          <div class="gadgetui-fileuploader-fileUpload" name="gadgetui-fileuploader-fileUpload">
            <label>${icon}<input type="file" name="gadgetui-fileuploader-fileselect" class="gadgetui-fileuploader-upload" title=""></label>
          </div>
        </div>
      </div>
    `.trim();

		if (!this.showUploadButton)
			css(
				this.element.querySelector(
					'input[name="gadgetui-fileuploader-fileselect"]',
				),
				"display",
				"none",
			);
		if (!this.showDropZone)
			css(
				this.element.querySelector(
					'div[name="gadgetui-fileuploader-dropzone"]',
				),
				"display",
				"none",
			);
		if (!this.showUploadIcon) {
			const iconSelector = this.element.querySelector(
				'[name="gadgetui-fileuploader-uploadIcon"]',
			);
			if (iconSelector) css(iconSelector, "display", "none");
		}

		this.renderDropZone();
	}

	configure(options) {
		this.message = options.message;
		this.tags = options.tags || "";
		this.uploadURI = options.uploadURI;
		this.onUploadComplete = options.onUploadComplete;
		this.willGenerateThumbnails = options.willGenerateThumbnails ?? false;
		this.showUploadButton = options.showUploadButton ?? true;
		this.showDropZone = options.showDropZone ?? true;
		this.uploadIcon =
			options.uploadIcon ||
			"/node_modules/feather-icons/dist/feather-sprite.svg#image";
		this.uploadClass = options.uploadClass || "";
		this.showUploadIcon = !!(options.uploadIcon && options.showUploadIcon);
		this.addFileMessage = options.addFileMessage || "Add a File";
		this.dropMessage = options.dropMessage || "Drop Files Here";
		this.uploadErrorMessage = options.uploadErrorMessage || "Upload error.";
		this.useTokens = options.useTokens ?? false;
		this.tokenType = options.tokenType ?? "access_token"; // old default is 'X-Token' for backward compatibility
		this.allowedFileTypes = options.allowedFileTypes || null; // New option for file type restrictions
		this.allowedExtensions = options.allowedExtensions || null; // New option for file extension restrictions
		this.invalidFileTypeMessage =
			options.invalidFileTypeMessage ||
			"Invalid file type. Please select a valid file.";
		this.maxFileSize = options.maxFileSize || null; // New option for global file size limit
		this.maxFileSizeByType = options.maxFileSizeByType || null; // New option for file type specific limits
		this.fileSizeExceededMessage =
			options.fileSizeExceededMessage ||
			"File size exceeds the maximum allowed limit.";
	}

	setDimensions() {
		const css = gadgetui.util.setStyle;
		const dropzone = this.element.querySelector(
			".gadgetui-fileuploader-dropzone",
		);
		const filedisplay = this.element.querySelector(
			".gadgetui-fileuploader-filedisplay",
		);
		const buttons = this.element.querySelector(".buttons");
		// Height and width calculations could be added here if needed
	}

	setEventHandlers() {
		this.element
			.querySelector('input[name="gadgetui-fileuploader-fileselect"]')
			.addEventListener("change", (evt) => {
				const dropzone = this.element.querySelector(
					'div[name="gadgetui-fileuploader-dropzone"]',
				);
				const filedisplay = this.element.querySelector(
					'div[name="gadgetui-fileuploader-filedisplay"]',
				);
				this.processUpload(evt, evt.target.files, dropzone, filedisplay);
			});
	}

	renderDropZone() {
		const dropzone = this.element.querySelector(
			'div[name="gadgetui-fileuploader-dropzone"]',
		);
		const filedisplay = this.element.querySelector(
			'div[name="gadgetui-fileuploader-filedisplay"]',
		);

		this.element.addEventListener("dragstart", (ev) => {
			ev.dataTransfer.setData("text", "data");
			ev.dataTransfer.effectAllowed = "copy";
			this.fireEvent("dragstart");
		});

		dropzone.addEventListener("dragenter", (ev) => {
			ev.preventDefault();
			ev.stopPropagation();
			dropzone.classList.add("highlighted");
			this.fireEvent("dragenter");
		});

		dropzone.addEventListener("dragleave", (ev) => {
			ev.preventDefault();
			ev.stopPropagation();
			dropzone.classList.remove("highlighted");
			this.fireEvent("dragleave");
		});

		dropzone.addEventListener("dragover", (ev) => {
			this.handleDragOver(ev);
			ev.dataTransfer.dropEffect = "copy";
			this.fireEvent("dragover");
		});

		dropzone.addEventListener("drop", (ev) => {
			ev.preventDefault();
			ev.stopPropagation();
			this.fireEvent("drop");
			this.processUpload(ev, ev.dataTransfer.files, dropzone, filedisplay);
		});
	}

	processUpload(event, files, dropzone, filedisplay) {
		const css = gadgetui.util.setStyle;
		this.uploadingFiles = [];
		css(filedisplay, "display", "inline");

		Array.from(files).forEach((file) => {
			// Validate file type before processing
			if (!this.validateFileType(file)) {
				this.handleInvalidFileType(file);
				return;
			}

			// Validate file size before processing
			if (!this.validateFileSize(file)) {
				this.handleFileSizeExceeded(file);
				return;
			}

			const wrappedFile = new gadgetui.display.FileUploadWrapper(
				file,
				filedisplay,
			);

			this.uploadingFiles.push(wrappedFile);
			wrappedFile.on("uploadComplete", (fileWrapper) => {
				const index = this.uploadingFiles.findIndex(
					(f) => f.id === fileWrapper.id,
				);
				if (index !== -1) this.uploadingFiles.splice(index, 1);
				if (!this.uploadingFiles.length) {
					if (this.showDropZone) this.show("dropzone");
					this.setDimensions();
				}

				this.fireEvent("uploadComplete");
			});
		});

		dropzone.classList.remove("highlighted");
		this.handleFileSelect(this.uploadingFiles, event);
	}

	validateFileType(file) {
		// If no restrictions are set, allow all files
		if (!this.allowedFileTypes && !this.allowedExtensions) {
			return true;
		}

		// Check file extension if allowedExtensions is specified
		if (this.allowedExtensions) {
			const fileExtension = file.name.split(".").pop().toLowerCase();
			if (Array.isArray(this.allowedExtensions)) {
				if (!this.allowedExtensions.includes(fileExtension)) {
					return false;
				}
			} else {
				// If it's a string, check if it matches the extension
				if (this.allowedExtensions !== fileExtension) {
					return false;
				}
			}
		}

		// Check MIME type if allowedFileTypes is specified
		if (this.allowedFileTypes) {
			if (Array.isArray(this.allowedFileTypes)) {
				if (!this.allowedFileTypes.includes(file.type)) {
					return false;
				}
			} else {
				// If it's a string, check if it matches the MIME type
				if (this.allowedFileTypes !== file.type) {
					return false;
				}
			}
		}

		return true;
	}

	handleInvalidFileType(file) {
		// Show error message for invalid file types
		const errorMessage = this.invalidFileTypeMessage;

		// Create an error display element or use existing one
		const errorDiv = document.createElement("div");
		errorDiv.className = "gadgetui-fileuploader-error";
		errorDiv.innerText = `${errorMessage} (${file.name})`;

		// Add the error message to the file display area
		const filedisplay = this.element.querySelector(
			".gadgetui-fileuploader-filedisplay",
		);
		filedisplay.appendChild(errorDiv);

		// Fire an event for invalid file type
		this.fireEvent("invalidFileType", { file: file, message: errorMessage });
	}

	validateFileSize(file) {
		// If no size limits are set, allow all files
		if (!this.maxFileSize && !this.maxFileSizeByType) {
			return true;
		}

		// Check global file size limit if set
		if (this.maxFileSize && file.size > this.maxFileSize) {
			return false;
		}

		// Check file type specific limits if set
		if (this.maxFileSizeByType) {
			// Find the appropriate limit for this file type
			let limit = null;

			// If maxFileSizeByType is an array of objects with type and size properties
			if (Array.isArray(this.maxFileSizeByType)) {
				const fileTypeConfig = this.maxFileSizeByType.find(
					(config) =>
						config.type === file.type ||
						(config.extensions &&
							config.extensions.includes(
								file.name.split(".").pop().toLowerCase(),
							)),
				);
				limit = fileTypeConfig ? fileTypeConfig.size : null;
			}
			// If maxFileSizeByType is an object mapping MIME types to limits
			else if (typeof this.maxFileSizeByType === "object") {
				limit =
					this.maxFileSizeByType[file.type] ||
					this.maxFileSizeByType[file.name.split(".").pop().toLowerCase()] ||
					null;
			}

			if (limit && file.size > limit) {
				return false;
			}
		}

		return true;
	}

	handleFileSizeExceeded(file) {
		// Show error message for files exceeding size limits
		const errorMessage = this.fileSizeExceededMessage;

		// Create an error display element or use existing one
		const errorDiv = document.createElement("div");
		errorDiv.className = "gadgetui-fileuploader-error";
		errorDiv.innerText = `${errorMessage} (${file.name})`;

		// Add the error message to the file display area
		const filedisplay = this.element.querySelector(
			".gadgetui-fileuploader-filedisplay",
		);
		filedisplay.appendChild(errorDiv);

		// Fire an event for file size exceeded
		this.fireEvent("fileSizeExceeded", { file: file, message: errorMessage });
	}

	handleFileSelect(wrappedFiles, evt) {
		evt.preventDefault();
		evt.stopPropagation();

		// Filter out invalid files from the upload list
		const validFiles = wrappedFiles.filter(
			(file) => file.isValid !== false && file.sizeValid !== false,
		);

		this.willGenerateThumbnails
			? this.generateThumbnails(validFiles)
			: this.upload(validFiles);
	}

	generateThumbnails(wrappedFiles) {
		this.upload(wrappedFiles); // Placeholder for future thumbnail generation
	}

	upload(wrappedFiles) {
		// Filter out invalid files from the upload list
		const validFiles = wrappedFiles.filter(
			(file) => file.isValid !== false && file.sizeValid !== false,
		);

		if (validFiles.length === 0) {
			// If no valid files, don't start upload process
			this.fireEvent("uploadComplete");
			return;
		}

		validFiles.forEach((wrappedFile) => {
			this.fireEvent("uploadStart");
			wrappedFile.progressbar.start();
		});
		this.uploadFile(validFiles);
	}

	uploadFile(wrappedFiles) {
		wrappedFiles.forEach((wrappedFile) => {
			const blob = wrappedFile.file;
			const BYTES_PER_CHUNK = 1024 * 1024; // 1MB chunks
			const parts = Math.ceil(blob.size / BYTES_PER_CHUNK);
			const chunks = [];
			let start = 0;

			while (start < blob.size) {
				const end = Math.min(start + BYTES_PER_CHUNK, blob.size);
				chunks.push(blob.slice(start, end)); // Modern slice method
				start = end;
			}

			this.uploadChunk(wrappedFile, chunks, 1, parts);
		});
	}

	uploadChunk(wrappedFile, chunks, filepart, parts) {
		const xhr = new XMLHttpRequest();
		const tags = this.tags;

		xhr.onreadystatechange = () => {
			if (xhr.readyState !== 4) return;

			if (xhr.status !== 200) {
				this.handleUploadError(xhr, {}, wrappedFile);
			} else {
				if (this.useTokens && sessionStorage) {
					if (this.tokenType === "X-Token") {
						this.token = xhr.getResponseHeader("X-Token");
					} else {
						this.token = xhr.getResponseHeader("access_token");
					}

					sessionStorage.token = this.token;
				}

				if (filepart <= parts) {
					wrappedFile.progressbar.updatePercent(
						Math.round((filepart / parts) * 100),
					);
				}

				if (filepart < parts) {
					wrappedFile.id = xhr.getResponseHeader("X-Id");
					wrappedFile.key = xhr.getResponseHeader("X-Key");
					this.uploadChunk(wrappedFile, chunks, filepart + 1, parts);
				} else {
					let json;
					try {
						json = { data: JSON.parse(xhr.response) };
					} catch (e) {
						json = {};
						this.handleUploadError(xhr, json, wrappedFile);
						return;
					}
					if (json.data) this.handleUploadResponse(json, wrappedFile);
					else this.handleUploadError(xhr, json, wrappedFile);
				}
			}
		};

		xhr.open("POST", this.uploadURI, true);
		xhr.setRequestHeader("X-Tags", tags);
		xhr.setRequestHeader("X-Id", wrappedFile.id || "");
		xhr.setRequestHeader("X-Key", wrappedFile.key || "");
		xhr.setRequestHeader("X-FileName", wrappedFile.file.name);
		xhr.setRequestHeader("X-FileSize", wrappedFile.file.size);
		xhr.setRequestHeader("X-FilePart", filepart);
		xhr.setRequestHeader("X-Parts", parts);
		if (this.useTokens && this.token)
			if (this.tokenType === "X-Token") {
				xhr.setRequestHeader("X-Token", this.token);
			} else {
				xhr.setRequestHeader("Authorization", "Bearer " + this.token);
			}
		xhr.setRequestHeader(
			"X-MimeType",
			wrappedFile.file.type || "application/octet-stream",
		);
		xhr.setRequestHeader("X-HasTile", !!wrappedFile.tile?.length);
		xhr.setRequestHeader("Content-Type", "application/octet-stream");
		xhr.send(chunks[filepart - 1]);
	}

	handleUploadResponse(json, wrappedFile) {
		const fileItem = gadgetui.objects.Constructor(
			gadgetui.objects.FileItem,
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
					path: json.data.path,
				},
			],
			false,
		);

		wrappedFile.completeUpload(fileItem);
		if (this.onUploadComplete) this.onUploadComplete(fileItem);
	}

	handleUploadError(xhr, json, wrappedFile) {
		wrappedFile.progressbar.progressbox.innerText = this.uploadErrorMessage;
		wrappedFile.abortUpload(wrappedFile);
	}

	show(name) {
		const css = gadgetui.util.setStyle;
		const dropzone = this.element.querySelector(
			".gadgetui-fileuploader-dropzone",
		);
		const filedisplay = this.element.querySelector(
			".gadgetui-fileuploader-filedisplay",
		);

		if (name === "dropzone") {
			css(dropzone, "display", "table-cell");
			css(filedisplay, "display", "none");
		} else {
			css(filedisplay, "display", "table-cell");
			css(dropzone, "display", "none");
		}
	}

	handleDragOver(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		evt.dataTransfer.dropEffect = "copy";
	}
}
