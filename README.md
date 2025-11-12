gadget-ui
=========

# JavaScript UI and data binding library

Gadget-ui is a UI component library that has a built-in model and data-binding mechanism for some of its components.

### Current Release

v 11.4.1

This release adds menu traversal options to the Autosuggest component. It also adds, where appropriate, the event passed to internal functions when fireEvent() is called in various components.

## Installation

`npm install gadget-ui`

## Including the library

The library can be included in traditional JavaScript form using a standard script tag:

`<script src="/node_modules/gadget-ui/dist/gadget-ui.js"></script>`

The library can also be included using module imports, which allows you to only import the components needed for a particular page:

``` javascript
import {lightbox} from "/node_modules/gadget-ui/dist/gadget-ui.es.js"
```

## Instantiating Components

Gadget-ui components are now ES6 classes as of version 11, instantiate as

``` javascript
// traditional import
import { gadgetui } from "/dist/gadget-ui.es.js";

const lb = new gadgetui.display.Lightbox(document.getElementById("lightbox"), {
	images: imageArray,
	time: 3000,
	enableModal: false,
});

// module import of only lightbox
import { lightbox } from "/dist/gadget-ui.es.js";

const lb = new lightbox(document.getElementById("lightbox"), {
	images: imageArray,
	time: 3000,
	enableModal: false,
});
```

## Dependencies

Gadget-ui has an optional dependency on velocity-animate to animate transitions in the library. Transitions will be ignored if the library is not installed.

By default, gadget-ui uses feather-icons in the places icons are used for things like maximizing, minimizing, and closing components. All icons can be replaced by other icons through configuration options.

All other dependencies are solely for development purposes of the library.

## Documentation

Documentation for 11.x is under production.

## Tests

If you clone the repository from Github, you can run the tests locally by running:

``` javascript
$ node index.js
```

from the project root. Then access the tests at http://127.0.0.1:8000/test/11.x/index.htm.

Code in the tests demonstrates how to work with all of the components in the library.


***License***

As of version 11, gadget-ui is released under the MIT License.
