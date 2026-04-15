import { Id, getStyle } from '../gadget-ui.util.js';
import { EventBindings } from '../../objects/eventbindings.js';
import { ProgressBar } from './progressbar.js';

export function FileUploadWrapper(file, element, key = "") {
	const id = Id();
	const options = {
		id: id,
		key: key,
		filename: file.name,
		width: getStyle(element, "width"),
	};
	const bindings = EventBindings.getAll();

	this.file = file;
	this.id = id;
	this.key = key;
	this.progressbar = new ProgressBar(element, options);
	this.progressbar.render();

	bindings.forEach((binding) => {
		this[binding.name] = binding.func;
	});
}

FileUploadWrapper.prototype.events = ["uploadComplete", "uploadAborted"];

FileUploadWrapper.prototype.completeUpload = function (fileItem) {
	const finish = () => {
		this.progressbar.destroy();
		this.fireEvent("uploadComplete", fileItem);
	};
	setTimeout(finish, 1000);
};

FileUploadWrapper.prototype.abortUpload = function (fileItem) {
	const aborted = () => {
		this.progressbar.destroy();
		this.fireEvent("uploadAborted", fileItem);
	};
	setTimeout(aborted, 1000);
};
