gadget-ui
=========

JavaScript UI and data binding library

v 6.5.0

This release adds a Sidebar control, gadgetui.display.Sidebar. This control wraps a left-side menu with a div that enables collapsing the menu to the left side of the screen to save space.

v 6.4.0

This release adds a Modal window control, gadgetui.display.Modal. The modal control creates a window with a close icon in the upper right corner.

v 6.3.0

This release continues the process of cleaning up inline styling in the display components, reducing legacy code and overall code size, and converting icons to use the feather icons library. See the release notes for details. This version represents work in progress that will ultimately lead to in a v 7.0.0 release.

v 6.1.0

This release removes inline styling options for many controls, adds optional CSS class overrides, and improves controls like the ComboBox with better styling. See the release notes for details. This version represents work in progress that will ultimately lead to in a v 7.0.0 release.

v 6.0.0

This release adds ES6 module support. Use /dist/gadget-ui.es6.js for ES6 module support. See /test/floatingpane.htm and /test/fileuploader.htm for example usage. Version has been upped to 6.0.0 to mark the inclusion of ES6 module support.

v 5.2.1

This release contains a new plain JS control, gadgetui.display.Dialog, plus the plain JS version of FileUploader, ported along with its dependencies from the jQuery version of the library. In addition, the test files have now been modified to use gadgetui.objects.Constructor to instantiate widgets from the library instead of using the "new" keyword.

v 5.1.0

This release contains the first working version of gadgetui.input.FileUploader for multi-part, multi-file upload capability. Please review the example code at /test/jquery.fileuploader.htm for usage.


v 5.0.0

New development will proceed in 5.0. Previous releases will be limited to bug fixes and possibly backports of enhancements.

**What's New**

This release contains some bug fixes for existing components, including pulling some implementation details from the plain JavaScript version to the jQuery version for consistency. It also contains a significant new component called FileUploader that enables multi-part, multi-file uploads using AJAX.

This library is very much experimental, but semver and release tags are being used faithfully to provide developers with guidance on stability of features and the API.

**Why version 3.0.0?**

In semantic versioning, incrementing the leftmost version number is meant to designate a major change to the software that creates API incompatibilities with
previous versions. The API change for version 3.0.0 mainly affects LookupListInput, which now has more options in the jQuery-free version than in the jQuery version, but
also lacks some functionality of the jQuery version, such as keyboard navigation of the suggestion list.  The version change is also being used to mark a departure from the
focus on the jQuery-based library to to jQuery-free library, which only has a dependency on open-iconic and represents a better direction for the library. The jQuery-free
version of the library can be used equally well by jQuery-based and plain JavaScript applications.

As of v 3.0.0, gadget-ui comes in two distinct flavors:

- a jQuery-based version that is dependent on jQuery, partially on jQuery-UI, and partially on additional libraries.
- a plain JavaScript version that only has a dependency on open-iconic icons and optional dependency on Velocity (to enable animations) and polyfills for promises and queryselector


jQuery-free version

The options for this version of the code are largely the same. The primary difference is that you pass components native HTML elements as selectors instead of using jQuery selectors.
The LookupListInput in this version of the code has a few new features that the jQuery version lacks. Look at test/lookuplistinput.advanced.htm for an example.

[jQuery version](jquery.MD)

***License***

gadget-ui is released under the Mozilla Public License 2.0.
