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
			const wrappedFile = gadgetui.objects.Constructor(
				gadgetui.display.FileUploadWrapper,
				[file, filedisplay, true],
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

	handleFileSelect(wrappedFiles, evt) {
		evt.preventDefault();
		evt.stopPropagation();
		this.willGenerateThumbnails
			? this.generateThumbnails(wrappedFiles)
			: this.upload(wrappedFiles);
	}

	generateThumbnails(wrappedFiles) {
		this.upload(wrappedFiles); // Placeholder for future thumbnail generation
	}

	upload(wrappedFiles) {
		wrappedFiles.forEach((wrappedFile) => {
			this.fireEvent("uploadStart");
			wrappedFile.progressbar.start();
		});
		this.uploadFile(wrappedFiles);
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
