gadget-ui
=========

# JavaScript UI and data binding library 

Gadget-ui is a UI component library that has a built-in model and data-binding mechanism for some of its components.

### Current Release

v 10.0.0-beta

The Tab component now uses an enclosing div around both the tabs and the content divs, and uses the name attribute of content divs instead of id attributes for more flexibility. Note that this is a breaking change so you will need to re-write any use of the Tabs component you have already deployed. 

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
