gadget-ui
=========

# JavaScript UI and data binding library 

Gadget-ui is a UI component library that has a built-in model and data-binding mechanism for some of its components.

### Current Release

v 9.7.0

An option has been added to the fileuploader to enable authenticated use of the control with the altseven framework by specifying useTokens = true in the options for the control. This feature may be extended in the future to allow more generalized authentication with other frameworks.

## Installation

`npm install gadget-ui`

## Including the library

The library can be included in traditional JavaScript form using a standard script tag:

`<script src="/node_modules/gadget-ui/dist/gadget-ui.js"></script>`

The library can also be included using module imports, which allows you to only import the components needed for a particular page:

``` javascript
import {lightbox, constructor} from "/node_modules/gadget-ui/dist/gadget-ui.es.js"
```

## Instantiating Components

Use the constructor component to create new instances of a gadget-ui component, as so:

``` javascript
// traditional include
const lightbox = gadgetui.objects.Constructor( gadgetui.display.Lightbox, [ document.getElementById("lightbox"), 
  {images: imageArray, time: 3000, enableModal:false }], true );

// module import
const lightbox = constructor( lightbox, [ document.getElementById("lightbox"), 
  {images: imageArray, time: 3000, enableModal:false }], true );

```

## Dependencies

Gadget-ui has an optional dependency on velocity-animate to animate transitions in the library. Transitions will be ignored if the library is not installed. All other dependencies are solely for development purposes of the library.


***License***

gadget-ui is released under the Mozilla Public License 2.0.
