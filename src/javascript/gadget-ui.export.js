// Display components
import { Bubble } from './display/bubble.js';
import { CollapsiblePane } from './display/collapsiblepane.js';
import { Dialog } from './display/dialog.js';
import { FileUploadWrapper } from './display/fileuploadwrapper.js';
import { FloatingPane } from './display/floatingpane.js';
import { Lightbox } from './display/lightbox.js';
import { Menu } from './display/menu.js';
import { Modal } from './display/modal.js';
import { Overlay } from './display/overlay.js';
import { Popover } from './display/popover.js';
import { ProgressBar } from './display/progressbar.js';
import { Sidebar } from './display/sidebar.js';
import { Tabs } from './display/tabs.js';

// Input components
import { Autosuggest } from './input/autosuggest.js';
import { ComboBox } from './input/combobox.js';
import { FileUploader } from './input/fileuploader.js';
import { LookupListInput } from './input/lookuplistinput.js';
import { SelectInput } from './input/selectinput.js';
import { TextInput } from './input/textinput.js';
import { Toggle } from './input/toggle.js';

// Objects
import { Component } from '../objects/component.js';
import { Constructor } from '../objects/constructor.js';
import { EventBindings } from '../objects/eventbindings.js';
import { FileItem } from '../objects/fileitem.js';

// Model
import model from './gadget-ui.model.js';

// Utilities
import * as util from './gadget-ui.util.js';
import { keyCode } from './gadget-ui.util.js';

// Named exports for ES module consumers
export {
	Bubble,
	CollapsiblePane,
	Dialog,
	FileUploadWrapper,
	FloatingPane,
	Lightbox,
	Menu,
	Modal,
	Overlay,
	Popover,
	ProgressBar,
	Sidebar,
	Tabs,
	Autosuggest,
	ComboBox,
	FileUploader,
	LookupListInput,
	SelectInput,
	TextInput,
	Toggle,
	Component,
	Constructor,
	EventBindings,
	FileItem,
	model,
	util,
	keyCode,
};

// Namespaced export for backward compatibility
export const gadgetui = {
	display: {
		Bubble,
		CollapsiblePane,
		Dialog,
		FileUploadWrapper,
		FloatingPane,
		Lightbox,
		Menu,
		Modal,
		Overlay,
		Popover,
		ProgressBar,
		Sidebar,
		Tabs,
	},
	input: {
		Autosuggest,
		ComboBox,
		FileUploader,
		LookupListInput,
		SelectInput,
		TextInput,
		Toggle,
	},
	objects: {
		Component,
		Constructor,
		EventBindings,
		FileItem,
	},
	model,
	util,
	keyCode,
};
