gadget-ui
=========

JavaScript UI and data binding library

Current Release

v 9.0.8

Notes

v 9.0.0

This release changes the module distribution from using .msj to .es.js files.

In terms of functionality, the Modal and Menu objects now have a destroy() method so you can remove the controls programmatically. Also, the Sidebar object now has the option to be initialized in the minimized state.

v 8.2.2

This release adds options for the FileUploader to hide the dropzone and use a selected icon for the file input. It also adds the option for a user-specified close icon for the Modal component.

v 8.1.0

This release adds oiptions for the FileUploader component to display an image rather than a dropzone or file input.

v 7.1.0

This release adds custom binding events for the display widgets. It also adds open and close methods for the Modal display.

v 7.0.0

This release represents a significant step forward for the gadget-ui library. Among the major changes:
  - a NodeJS package for tests has been created so developers who want to run tests on the package without installing a CFML engine may do so easily. Simply run:
        $ node index.js
    from the root of the project, then access the test home at http://127.0.0.1:8000/index.htm

  - significant upgrades to the FileUploader component:
    - properly reset the control after an upload or error.
    - better sizing and positioning for the dropzone of the uploader
    - clearer positioning and styling for the progress bar
    - addition of abortUpload method and uploadAborted event that can be listened to

  - a much simplified TextInput control that is more reliable in styling and positioning, lighter in weight without losing any functionality
  - a NodeJS test for the FileUploader component demonstrating how to save a file from the FileUploader on the server filesystem using NodeJS and MariaDB.

  - Change to npm publish that publishes just the /dist folder to npm.

v 6.8.0

This release adds a Tabs control for vertical and horizontal tabs.

v 6.7.0

This release adds an autoOpen option for the Modal control and an image option for the Menu control.

v 6.6.0

This release adds the Menu control, adds animation options to the Sidebar control, and adds a custom animation delay option to CollapsiblePane and FloatingPane.

v 6.5.1

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
