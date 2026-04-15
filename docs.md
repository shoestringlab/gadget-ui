# GadgetUI Library Documentation

## Overview

The `gadgetui` library is a JavaScript framework for building interactive UI components, including data binding, display elements, and input controls. It is authored by Robert Munn and licensed under the Mozilla Public License 2.0.

- **Author**: Robert Munn <robert@robertmunn.com>
- **Copyright**: © 2016 Robert Munn
- **License**: [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/)
- **Version**: As of March 03, 2025 (based on current date)

## Table of Contents

- [gadgetui](#gadgetui)
  - [keyCode](#keycode)
- [gadgetui.model](#gadgetuimodel)
  - [BindableObject](#bindableobject)
  - [Model Methods](#model-methods)
- [gadgetui.display](#gadgetuidisplay)
  - [Bubble](#bubble)
  - [CollapsiblePane](#collapsiblepane)
  - [Dialog](#dialog)
  - [FileUploadWrapper](#fileuploadwrapper)
  - [FloatingPane](#floatingpane)
  - [Lightbox](#lightbox)
  - [Menu](#menu)
  - [Modal](#modal)
  - [ProgressBar](#progressbar)
  - [Sidebar](#sidebar)
  - [Tabs](#tabs)
- [gadgetui.input](#gadgetuiinput)
  - [ComboBox](#combobox)
  - [FileUploader](#fileuploader)
  - [LookupListInput](#lookuplistinput)
  - [SelectInput](#selectinput)
  - [TextInput](#textinput)
  - [Toggle](#toggle)
- [gadgetui.objects](#gadgetuiobjects)
  - [Constructor](#constructor)
  - [EventBindings](#eventbindings)
  - [FileItem](#fileitem)
- [gadgetui.util](#gadgetuiutil)

---

## gadgetui

### Description

The root namespace of the GadgetUI library, providing constants and utilities for UI development.

### Properties

#### keyCode

- **Type**: `Object`
- **Description**: A collection of key code constants for common keyboard keys.
- **Fields**:
  - `BACKSPACE`: `8`
  - `COMMA`: `188`
  - `DELETE`: `46`
  - `DOWN`: `40`
  - `END`: `35`
  - `ENTER`: `13`
  - `ESCAPE`: `27`
  - `HOME`: `36`
  - `LEFT`: `37`
  - `PAGE_DOWN`: `34`
  - `PAGE_UP`: `33`
  - `PERIOD`: `190`
  - `RIGHT`: `39`
  - `SPACE`: `32`
  - `TAB`: `9`
  - `UP`: `38`

---

## gadgetui.model

### Description

A module for data binding and state management with memento (undo/redo) support.

### BindableObject

#### Description

A class that binds data to DOM elements and supports state history with memento functionality.

#### Constructor

- **Syntax**: `new BindableObject(data, element)`
- **Parameters**:
  - `data` (`any`): The initial data to bind.
  - `element` (`HTMLElement`, optional): The DOM element to bind to.
- **Description**: Creates a new bindable object with initial data and optionally binds it to an element.

#### Methods

- **`handleEvent(event)`**
  - **Parameters**:
    - `event` (`Event`): The DOM event (typically 'change').
  - **Description**: Handles change events on bound elements, updating data accordingly.

- **`change(value, event, property)`**
  - **Parameters**:
    - `value` (`any`): The new value.
    - `event` (`Event`): The triggering event.
    - `property` (`string`, optional): The specific property to update.
  - **Throws**: `Error` if property is undefined or data is not an object.
  - **Description**: Updates the data and saves a memento.

- **`updateDom(event, value, property)`**
  - **Parameters**:
    - `event` (`Event`): The triggering event.
    - `value` (`any`): The value to set.
    - `property` (`string`, optional): The property to update.
  - **Description**: Updates all bound DOM elements with the new value.

- **`updateDomElement(event, element, value)`**
  - **Parameters**:
    - `event` (`Event`): The triggering event.
    - `element` (`HTMLElement`): The element to update.
    - `value` (`any`): The value to set.
  - **Description**: Updates a specific DOM element based on its tag and value type.

- **`bind(element, property)`**
  - **Parameters**:
    - `element` (`HTMLElement`): The element to bind.
    - `property` (`string`, optional): The property to bind to.
  - **Description**: Binds an element to the data, setting initial value and event listener.

- **`processValue(value)`**
  - **Parameters**: `value` (`any`): The value to process.
  - **Returns**: Processed value (cloned for objects).
  - **Description**: Normalizes and clones the input value.

- **`saveMemento()`**
  - **Description**: Saves the current state to the memento stack.

- **`undo()`**
  - **Returns**: `boolean` - True if undo succeeded.
  - **Description**: Reverts to the previous state.

- **`redo()`**
  - **Returns**: `boolean` - True if redo succeeded.
  - **Description**: Advances to the next state.

- **`rewind()`**
  - **Returns**: `boolean` - True if rewound to start.
  - **Description**: Reverts to the initial state.

- **`fastForward()`**
  - **Returns**: `boolean` - True if fast-forwarded to end.
  - **Description**: Advances to the latest state.

- **`restoreMemento()`**
  - **Description**: Restores the current memento state to data and DOM.

### Model Methods

- **`init(options)`**
  - **Parameters**: `options` (`Object`, optional): `{ maxMementos: number }`.
  - **Description**: Initializes the model with a custom memento limit (default 20).

- **`create(name, value, element)`**
  - **Parameters**:
    - `name` (`string`): The model key.
    - `value` (`any`): The initial value.
    - `element` (`HTMLElement`, optional): The element to bind.
  - **Description**: Creates a new bindable object and stores it.

- **`destroy(name)`**
  - **Parameters**: `name` (`string`): The model key.
  - **Description**: Removes a bindable object from storage.

- **`bind(name, element)`**
  - **Parameters**:
    - `name` (`string`): The model key (e.g., "user.name").
    - `element` (`HTMLElement`): The element to bind.
  - **Description**: Binds an element to a specific property of a model.

- **`exists(name)`**
  - **Parameters**: `name` (`string`): The model key.
  - **Returns**: `boolean` - True if the model exists.
  - **Description**: Checks if a model exists.

- **`get(name)`**
  - **Parameters**: `name` (`string`): The model key (e.g., "user.name").
  - **Returns**: `any` - The value, or undefined if not found.
  - **Description**: Retrieves a value from the model.

- **`set(name, value)`**
  - **Parameters**:
    - `name` (`string`): The model key (e.g., "user.name").
    - `value` (`any`): The value to set.
  - **Throws**: `Error` if base object is uninitialized.
  - **Description**: Sets a value and updates bound elements.

- **`undo(name)`**
- **`redo(name)`**
- **`rewind(name)`**
- **`fastForward(name)`**
  - **Parameters**: `name` (`string`): The model key.
  - **Returns**: `boolean` - True if operation succeeded.
  - **Description**: Memento operations for the specified model.

---

## gadgetui.display

### Description

A module for creating UI display components.

### Bubble

#### Description

A canvas-based speech bubble with customizable text and arrow.

#### Constructor

- **Syntax**: `new Bubble(options)`
- **Parameters**: `options` (`Object`, optional): Configuration options.
- **Options**:
  - `color` (`string`): Text color (default: "#000").
  - `borderWidth` (`number`): Border width (default: 1).
  - `borderColor` (`string`): Border color (default: "#000").
  - `backgroundColor` (`string`): Background color (default: "#f0f0f0").
  - `fontSize` (`number`): Font size (default: 14).
  - `font` (`string`): Font family (default: "Arial").
  - `fontStyle` (`string`): Font style (default: "").
  - `fontWeight` (`number`): Font weight (default: 100).
  - `fontVariant` (`string`): Font variant (default: "").
  - `lineHeight` (`number`): Line height (default: null).
  - `align` (`string`): Text alignment (default: "center").
  - `vAlign` (`string`): Vertical alignment (default: "middle").
  - `justifyText` (`boolean`): Justify text (default: false).

#### Methods

- **`configure(options)`**
  - **Parameters**: `options` (`Object`): Configuration options (see constructor).
  - **Description**: Configures the bubble properties.

- **`setBubble(x, y, width, height, arrowPosition, length, angle)`**
  - **Parameters**:
    - `x` (`number`): X-coordinate.
    - `y` (`number`): Y-coordinate.
    - `width` (`number`): Bubble width.
    - `height` (`number`): Bubble height.
    - `arrowPosition` (`string`): Arrow position (e.g., "topleft").
    - `length` (`number`): Arrow length.
    - `angle` (`number`): Arrow angle in degrees.
  - **Description**: Sets the bubble's position and arrow.

- **`setText(text)`**
  - **Parameters**: `text` (`string`): The text to display.
  - **Description**: Sets the bubble's text.

- **`setPosition(x, y)`**
  - **Parameters**:
    - `x` (`number`): New X-coordinate.
    - `y` (`number`): New Y-coordinate.
  - **Description**: Updates the bubble's position.

- **`setArrow(position, length, angle)`**
  - **Parameters**: See `setBubble`.
  - **Description**: Configures the arrow.

- **`render()`**
  - **Description**: Draws the bubble on the canvas.

- **`attachToElement(selector, position)`**
  - **Parameters**:
    - `selector` (`HTMLElement`): The element to attach to.
    - `position` (`string`): Position relative to the element.
  - **Description**: Attaches the bubble to a DOM element.

- **`destroy()`**
  - **Description**: Removes the bubble from the DOM.

#### Events

- `rendered`

### CollapsiblePane

#### Description

A collapsible container with a header.

#### Constructor

- **Syntax**: `new CollapsiblePane(element, options)`
- **Parameters**:
  - `element` (`HTMLElement`): The content element.
  - `options` (`Object`, optional): Configuration options.
- **Options**:
  - `animate` (`boolean`): Use animation (default: true).
  - `delay` (`number`): Animation delay (default: 300).
  - `title` (`string`): Header title (default: "").
  - `collapse` (`boolean`): Initial collapse state (default: false).
  - `class` (`string`): Custom CSS class.
  - `headerClass` (`string`): Header CSS class.

#### Methods

- **`toggle()`**
  - **Description**: Toggles the pane's collapsed state.

- **`config(options)`**
  - **Parameters**: `options` (`Object`): Configuration options.
  - **Description**: Configures the pane.

#### Events

- `minimized`
- `maximized`

### Dialog

#### Description

A dialog box extending `FloatingPane`.

#### Constructor

- **Syntax**: `new Dialog(element, options)`
- **Parameters**: See `FloatingPane` constructor, plus:
  - `options.buttons` (`Array`): Array of `{ label: string, click: Function }`.

#### Methods

- **`addButtons()`**
  - **Description**: Adds buttons to the dialog.

### FileUploadWrapper

#### Description

Wraps a file upload with a progress bar.

#### Constructor

- **Syntax**: `new FileUploadWrapper(file, element)`
- **Parameters**:
  - `file` (`File`): The file to upload.
  - `element` (`HTMLElement`): The container element.

#### Methods

- **`completeUpload(fileItem)`**
  - **Parameters**: `fileItem` (`FileItem`): The uploaded file data.
  - **Description**: Completes the upload process.

- **`abortUpload(fileItem)`**
  - **Parameters**: `fileItem` (`FileItem`): The aborted file data.
  - **Description**: Aborts the upload process.

#### Events

- `uploadComplete`
- `uploadAborted`

### FloatingPane

#### Description

A draggable, resizable floating container.

#### Constructor

- **Syntax**: `new FloatingPane(element, options)`
- **Parameters**:
  - `element` (`HTMLElement`): The content element.
  - `options` (`Object`, optional): Configuration options.
- **Options**:
  - `message` (`string`): Initial message.
  - `animate` (`boolean`): Use animation (default: true).
  - `delay` (`number`): Animation delay (default: 500).
  - `title` (`string`): Header title.
  - `backgroundColor` (`string`): Background color.
  - `zIndex` (`number`): Z-index (default: max + 1).
  - `width` (`string`): Width.
  - `top` (`number`): Top position.
  - `left` (`number`): Left position.
  - `bottom` (`number`): Bottom position.
  - `right` (`number`): Right position.
  - `class` (`string`): Custom CSS class.
  - `headerClass` (`string`): Header CSS class.
  - `featherPath` (`string`): Path to Feather icons (default: "/node_modules/feather-icons").
  - `enableShrink` (`boolean`): Enable minimize/maximize (default: true).
  - `enableClose` (`boolean`): Enable close button (default: true).

#### Methods

- **`close()`**
  - **Description**: Closes and removes the pane.

- **`expand()`**
  - **Description**: Expands the pane.

- **`minimize()`**
  - **Description**: Minimizes the pane.

#### Events

- `minimized`
- `maximized`
- `moved`
- `closed`

### Lightbox

#### Description

A lightbox for displaying images with navigation.

#### Constructor

- **Syntax**: `new Lightbox(element, options)`
- **Parameters**:
  - `element` (`HTMLElement`): The container element.
  - `options` (`Object`, optional): Configuration options.
- **Options**:
  - `images` (`Array`): Array of image URLs.
  - `featherPath` (`string`): Path to Feather icons.
  - `time` (`number`): Auto-advance interval (default: 3000).
  - `enableModal` (`boolean`): Enable modal view (default: true).

#### Methods

- **`nextImage()`**
- **`prevImage()`**
- **`updateImage()`**
- **`animate()`**
- **`stopAnimation()`**
- **`setModalImage()`**

#### Events

- `showPrevious`
- `showNext`

### Menu

#### Description

A dropdown menu component.

#### Constructor

- **Syntax**: `new Menu(element, options)`
- **Parameters**:
  - `element` (`HTMLElement`): The container element.
  - `options` (`Object`, optional): Configuration options.
- **Options**:
  - `data` (`Array`): Menu data (`{ label, image, link, menuItem }`).
  - `datasource` (`Function`): Async data source.

#### Methods

- **`retrieveData()`**
- **`addControl()`**
- **`addBindings()`**
- **`destroy()`**

#### Events

- `clicked`

### Modal

#### Description

A modal overlay component.

#### Constructor

- **Syntax**: `new Modal(element, options)`
- **Parameters**:
  - `element` (`HTMLElement`): The content element.
  - `options` (`Object`, optional): Configuration options.
- **Options**:
  - `class` (`string`): Custom CSS class.
  - `featherClass` (`string`): Feather icon class (default: "feather").
  - `closeIcon` (`string`): Close icon path (default: Feather x-circle).
  - `autoOpen` (`boolean`): Open on initialization (default: true).

#### Methods

- **`open()`**
- **`close()`**
- **`destroy()`**

#### Events

- `opened`
- `closed`

### ProgressBar

#### Description

A progress bar component.

#### Constructor

- **Syntax**: `new ProgressBar(element, options)`
- **Parameters**:
  - `element` (`HTMLElement`): The container element.
  - `options` (`Object`, optional): Configuration options.
- **Options**:
  - `id` (`string`): Unique identifier.
  - `label` (`string`): Display label.
  - `width` (`string`): Width.

#### Methods

- **`render()`**
- **`start()`**
- **`updatePercent(percent)`**
  - **Parameters**: `percent` (`number`): Progress percentage.
- **`update(text)`**
  - **Parameters**: `text` (`string`): Status text.
- **`destroy()`**

#### Events

- `start`
- `updatePercent`
- `update`

### Sidebar

#### Description

A collapsible sidebar component.

#### Constructor

- **Syntax**: `new Sidebar(selector, options)`
- **Parameters**:
  - `selector` (`HTMLElement`): The content element.
  - `options` (`Object`, optional): Configuration options.
- **Options**:
  - `class` (`string`): Custom CSS class.
  - `featherPath` (`string`): Path to Feather icons.
  - `animate` (`boolean`): Use animation (default: true).
  - `delay` (`number`): Animation delay (default: 300).
  - `toggleTitle` (`string`): Toggle button title (default: "Toggle Sidebar").
  - `minimized` (`boolean`): Initial state.

#### Methods

- **`maximize()`**
- **`minimize()`**

#### Events

- `maximized`
- `minimized`

### Tabs

#### Description

A tabbed interface component.

#### Constructor

- **Syntax**: `new Tabs(element, options)`
- **Parameters**:
  - `element` (`HTMLElement`): The container element.
  - `options` (`Object`, optional): Configuration options.
- **Options**:
  - `direction` (`string`): "horizontal" or "vertical" (default: "horizontal").
  - `events` (`Array`): Custom events (default: ["tabSelected"]).

#### Methods

- **`setActiveTab(activeTab)`**
  - **Parameters**: `activeTab` (`string`): The tab ID to activate.

#### Events

- `tabSelected`

---

## gadgetui.input

### Description

A module for creating interactive input components.

### ComboBox

#### Description

A combo box with dropdown and custom input support.

#### Constructor

- **Syntax**: `new ComboBox(element, options)`
- **Parameters**:
  - `element` (`HTMLElement`): The select element.
  - `options` (`Object`, optional): Configuration options.
- **Options**:
  - `model` (`Object`): Data model.
  - `emitEvents` (`boolean`): Emit events (default: true).
  - `dataProvider` (`Object`): Data source with `refresh` and `data`.
  - `save` (`Function`): Save function for new items.
  - `activate` (`string`): Activation event (default: "mouseenter").
  - `delay` (`number`): Delay in ms (default: 10).
  - `arrowWidth` (`number`): Arrow width (default: 25).
  - `width` (`number`): Width (default: 150).
  - `newOption` (`Object`): Default option (default: `{ text: "...", id: 0 }`).
  - `id` (`number`): Initial ID.
  - `scaleIconHeight` (`boolean`): Scale icon height (default: false).
  - `animate` (`boolean`): Use animation (default: true).
  - `glowColor` (`string`): Glow color (default: "rgb(82, 168, 236)").
  - `animateDelay` (`number`): Animation delay (default: 500).
  - `hideable` (`boolean`): Hideable mode (default: false).

#### Methods

- **`setSelectOptions()`**
- **`find(text)`**
  - **Parameters**: `text` (`string`): Text to find.
  - **Returns**: `any` - ID of the matching item.
- **`getText(id)`**
  - **Parameters**: `id` (`any`): Item ID.
  - **Returns**: `string` - Text of the item.
- **`showLabel()`**
- **`handleInput(inputText)`**
  - **Parameters**: `inputText` (`string`): User input.
- **`triggerSelectChange()`**
- **`setValue(id)`**
  - **Parameters**: `id` (`any`): Value to set.

#### Events

- `change`
- `click`
- `focus`
- `mouseenter`
- `keyup`
- `mouseleave`
- `blur`

### FileUploader

#### Description

A file uploader with drag-and-drop and progress tracking.

#### Constructor

- **Syntax**: `new FileUploader(element, options)`
- **Parameters**:
  - `element` (`HTMLElement`): The container element.
  - `options` (`Object`, optional): Configuration options.
- **Options**:
  - `message` (`string`): Display message.
  - `tags` (`string`): File tags.
  - `uploadURI` (`string`): Upload endpoint.
  - `onUploadComplete` (`Function`): Callback on completion.
  - `willGenerateThumbnails` (`boolean`): Generate thumbnails (default: false).
  - `showUploadButton` (`boolean`): Show upload button (default: true).
  - `showDropZone` (`boolean`): Show drop zone (default: true).
  - `uploadIcon` (`string`): Icon path (default: Feather image).
  - `uploadClass` (`string`): Custom CSS class.
  - `showUploadIcon` (`boolean`): Show icon.
  - `addFileMessage` (`string`): Add file text (default: "Add a File").
  - `dropMessage` (`string`): Drop message (default: "Drop Files Here").
  - `uploadErrorMessage` (`string`): Error message (default: "Upload error.").
  - `useTokens` (`boolean`): Use session tokens (default: false).

#### Methods

- **`render(title)`**
  - **Parameters**: `title` (`string`): Optional title.
- **`processUpload(event, files, dropzone, filedisplay)`**
- **`handleFileSelect(wrappedFiles, evt)`**
- **`generateThumbnails(wrappedFiles)`**
- **`upload(wrappedFiles)`**
- **`uploadFile(wrappedFiles)`**
- **`uploadChunk(wrappedFile, chunks, filepart, parts)`**
- **`handleUploadResponse(json, wrappedFile)`**
- **`handleUploadError(xhr, json, wrappedFile)`**
- **`show(name)`**
  - **Parameters**: `name` (`string`): "dropzone" or other.

#### Events

- `uploadComplete`
- `uploadStart`
- `show`
- `dragover`
- `dragstart`
- `dragenter`
- `dragleave`
- `drop`
