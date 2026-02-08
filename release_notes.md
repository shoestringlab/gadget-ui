
***Release Notes***


11.7.0
======

This release adds size and position options to the Overlay component, including documentation and tests.

11.6.0
======

This release builds out the Overlay component, including documentation and tests.

11.5.0
======

This release adds a destroy method to the lightbox component, and error handling for non-2xx response codes and custom headers to the fileuploader component.

11.4.1
======

- prevent bubbling in close event listener in modal
- cleanup of progressbar layout

11.4.0
======

This release adds menu traversal options to the Autosuggest component. It also adds, where appropriate, the event passed to internal functions when fireEvent() is called in various components.

11.3.0
======

This release adds the Autosuggest component, which can be used to display search suggestions in a drop list from a search input. It also adds a regenerate method to the Menu component to allow the menu to be regenerated dynamically.

Also in this release, the previously broken uglify task has been replaced with a new task that uses the terser plugin. Minified files are now generated with the .min extension.

11.2.0
======

This release adds the Popover component, which can be used to display a context popover with content. It also adds a scroll listener to the Menu component to move the menu with the scroll position. It also adds a beforeUpload function to the FileUploader component to allow custom validation and processing before uploading files. This function can be used to re-size images and perform other work before upload. This release also adds an async option to the datasource function of the LookupListInput component to allow asynchronous remote data retrieval.

11.1.0
======

This release adds options to the fileuploader component to limit file type and size. It also adds a 'key' field to the fileuploadwrapper that can be used to integrate uploads with S3-compatible storage services. It also adds CSS classes to the tabs component to style the tabs.

11.0.1
======

The 11.0 release changes the library into ES6 components for modern syntax. It also removes and unifies configuration options to rationalize them across the library. There have been a few enhancements, but this release is primarily meant to modernize the codebase and set a new direction for the library.

11.0.0-alpha.1
======

All components have now been re-factored as ES6 classes. Some configuration options have been changed. For details on calling components for now, check /test/11.x/index.htm to see how each new component is called and configured. For now, the test code shows you enough to build on.

The basic conversion process is simple. Old code:

``` javascript
			import { floatingpane, constructor } from "/dist/gadget-ui.es.js";

			var fp1 = constructor(
				floatingpane,
				[
					document.querySelector("#fp1"),
					{
						title: "Random Text",
						enableShrink: true,
					},
				],
				true,
			);
```

new code:
``` JavaScript
			import { floatingpane } from "/dist/gadget-ui.es.js";

			var fp1 = new floatingpane(
				document.querySelector("#fp1"),
				{
					title: "Random Text",
					enableShrink: true,
				},
			);
```

No more constructor, events are enabled automatically.

11.0.0-alpha
======

The 11.0 release represents a big departure from the old codebase. The components are being re-factored as ES classes for modern code compatibility, and many options are being simplified and made consistent across the library. For instance, all options involving icons have been unified so you can choose svg or img tags for the icons and so you can specify the file for each icon including its path. There are no detailed docs yet, please check source code for the options.

There is no specific roadmap yet for the release,stay tuned to see how it develops.

10.3.0
======

The feather icons used for controls in the display components have been converted to use <img> tags instead of <svg> tags for maximum compatibility. You can still style the icons using CSS applicable to svgs.

10.2.1
======

This release adds the missing response event to the event listener, and add a suppressSuggestions option to the config of the LookupListInput object so you can suppress the suggestion menu and handle suggestions manually.

10.2.0
======

This release adds an option to the fileuploader called tokenType with a default of "access_token" that uses Authorization: Bearer token headers for requests and expects access_token to be returned in the header of the response. The alternative "X-Token" value for the tokenType option preserves previous functionality for backwards compatibility.


10.1.4
======

Track back.

10.1.3
======

This release fixes a bug with the tabSelected event.

10.1.2
======

This release fixes a styling bug on webkit-based browsers with the Toggle control.

10.1.1
======

Bug fix for Tabs control.

10.1.0
======

This version introduces an improved model with undo,redo,fast forward, and rewind capabilities for any value in the model. It also includes a general cleanup of the codebase for readability and clarity. The test code has been consolidated in the /test folder, except for the index.js in the root if you want to test server-side logic.


10.0.0-release
======

A new input control has been introduced, the Toggle control. Toggle functions like a switch that can turn on or off. It emits a single event, "changed".

10.0.0-beta
======

The Tab component now uses an enclosing div around both the tabs and the content divs, and uses the name attribute of content divs instead of id attributes for more flexibility. Note that this is a breaking change so you will need to re-write any use of the Tabs component you have already deployed.

9.7.0
======

An option has been added to the fileuploader to enable authenticated use of the control with the altseven framework by specifying useTokens = true in the options for the control. This feature may be extended in the future to allow more generalized authentication with other frameworks.


9.6.1
======

Bug fix for lookupListInput not adding selected choices from the list.


9.6.0
======

If you pass in null as the selector, the Dialog control now creates its own div as the base for the control. The FloatingPane and Dialog control now accept a backgroundColor option to set the background color of the dialog.

9.5.0
======

The input controls have added standard event emitters from the Constructor object. With this change, you can simply use `myInputControl.on( "change", function(obj){})` to capture events from the input objects in the standard way for gadget-ui components. Each control has an array of events in <Component>.prototype.events.

9.4.0
======

The Lightbox component has added an `animate()` method that switches to the next image in the array at a given interval `time`, imitating the functionality of an image carousel. Lightbox has also added a modal container that can show an image zoomed to 100% width on the page. Clicking on the image in the lightbox shows the modal. Clicking on the image modal hides the modal. This functionality can be deactivated with enableModal: false in the component options.


9.3.0
======

The Lightbox component has been added to generate a Lightbox from a div with an array of images.

9.1.0
======

The Bubble component has been re-written to use the canvas component. The Bubble now functions correctly and has many more configuration options than previously.

9.0.9
======

Update adds the Sidebar toggle title and updates the test code for all JavaScript components.

9.0.8
======

CSS update for Progress Bar.

9.0.7
======

Add events to the ProgressBar object so it renders correctly.

Add test page for ProgressBar.

9.0.5
======

This release changes the module distribution from using .msj to .es.js files.


9.0.2
======

This release fixes two bugs in the Menu object related to the bind command.


9.0.1
======

This releases fixes a bug in eventbindings.js where events will not fire because an event is called during instantiation before the binding events are created.

9.0.0
======

This release marks a big change. The library is now only distributed as an ES6 module. The .mjs extension files have been removed for easier standardization with web server software.

In terms of functionality, the Modal and Menu objects now have a destroy() method so you can remove the controls programmatically. Also, the Sidebar object now has the option to be initialized in the minimized state.

For anyone interested in modifying the library, the project is configured to be run through either NodeJS > node index.js from the root, or by starting a CFML server from the root (See the excellent CommandBox project by Ortus Solutions if you want an easy and free way to run a CFML server).

8.2.2
======

This release adds options for the FileUploader to hide the dropzone and use a selected icon for the file input. It also adds the option for a user-specified close icon for the Modal component.

8.1.0
======

This release adds oiptions for the FileUploader component to display an image rather than a dropzone or file input.

7.1.0
======

This release adds custom binding events for the display widgets. It also adds open and close methods for the Modal display.



7.0.0
======

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

  - Change to npm publish that publishes just the /dist folder to npm. This is a breaking change for existing implementations, so if you upgrade, update your package
    references.

6.8.0
======

- This release adds a Tabs control for vertical and horizontal tabs.

6.7.0
======

- Adds an autoOpen option for the Modal control
- Adds an image option for the Menu control

6.6.0
======

- Add Menu control
- Add animate option to Sidebar control
- Add delay option to CollapsiblePane, FloatingPane controls


6.5.0
======

- Add Sidebar control.

6.4.0
======

- Add Modal control.

6.3.0
======

- make FloatingPane class additive, not alternate CSS
- make message undefined if not present in options so content in div will be preserved
- make default location of bubble 0,0
- fix center location setting of bubble

6.2.0
======

Release highlights. The Bubble component has been greatly simplified by removing arrows from the component. The arrows have proved unreliable to display correctly outside of controlled conditions, so they have been removed. A future effort may be made to create new Bubble components with arrows using Canvas controls and 2D drawing, but this is by no means certain.

Other highlights:

- Many inline styles have been removed from the Bubble component in favor of CSS classes using options.class.
- class and headerClass in FloatingPane and CollapsiblePane are no longer alternates to the standard CSS classes but rather additive. This changes has been made to minimize the necessary rules in custom classes.
- Bubble now uses Velocity (when available) when closing a bubble element.
- Max/min functions improved in FloatingPane.


6.1.0
======

This release simplifies the code for several of the components in the library and adds some new options to a few of them. According to semver it could be a new major release, but I am releasing it as a minor upgrade since it represents work in progress. Major features of this release:

- Remove many of the inline style options for FloatingPane, CollapsiblePane, and other components.
- Add class and headerClass options for FloatingPane and CollapsiblePane to enable easy overriding of default styles and more flexible styling via CSS classes. Note that you can also use the pre-defined styles and override with !important, which is easier for making minimal changes.
- Add hideable option to ComboBox, SelectInput, TextInput to make hiding the control when not is use optional and false by default.
 - Improve ComboBox control
 		- Fix styling issues with borders and input control.
		- Add new down chevron SVG as dropdown indicator. By default requires feather-icons to be accessible from the client in /node_modules/feather-icons. Change the CSS to pick a different location as needed.
		- Fix combobox export for es6, which was misspelled.
- Upgrade various reported vulnerable devDependencies through npm.

6.0.0
======

This release marks support for ES6, specifically module exports that can be used to import the library in whole or in part. ES6 module support is only available in the plain JavaScript library, as the jQuery-based library is no longer being actively developed.

5.3.0
======

- Removal of containing dialog for plain Javascript FileUploader. Component now renders into a standard div.

5.2.1
======

This release contains a new plain JS control, gadgetui.display.Dialog, plus the plain JS version of FileUploader, ported along with its dependencies from the jQuery version of the library. In addition, the test files have now been modified to use gadgetui.objects.Constructor to instantiate widgets from the library instead of using the "new" keyword.

5.1.0
======

- Working FileUploader under jQuery
- Re-organized tests under /test with more test files for individual components

5.0.0
======

- This release has no new features over 3.1.0 but represents a renewed focus for the library on interactive components. The first of these new components, the FileUploader, will be actively developed in this version. Bugs and minor enhancements may be made in previous releases, but new feature development will go forward in this version.

3.1.0
======

- Bug fix for LookupListInput on reset model values
- Change to FloatingPane to move min/max icon to top left instead of right
- Bug fix for CollapsiblePane collapse initial animation
- Bug fix for Bug fix for FloatingPane expand/collapse initial function
- Change for FloatingPane to maintain left position on expand/collapse

PREVIEW - FileDialog
					- preview of new file upload component FileDialog
					- Please note this component is still considered experimental and may change substantively before official release

3.0.3
======

- Bug fixes for position and minimize/maximize functionality of FloatingPane
- Bug fix for min/max icon position of FloatingPane
- Set FloatingPane inner content height to wrapper height
- Allow FloatingPane content to scroll once inner height set to wrapper height
- hide scrolling of FloatingPane content on minimize

3.0.2
======

- Bug fixes in floating pane styling
- Bug fix in util.getNumberValue - now returns same value if passed a number

3.0.1
======

- Separated docs for jQuery-based and jQuery-free versions
- Clean up code from LookupListInput
- Additional notes in README
- plain JavaScript LookupListInput does not currently support keyboard navigation of the suggestion list

3.0.0
======

- Re-factored LookupListInput using jQuery-UI autocomplete as a base to create jQuery-free component
- First version with the complete set of components available in jQuery-free versions
- Added ability to use custom renderers for menu items, selected items, and cancel icon
- Global replace of "self" with "_this".

2.4.1
======

- global replace of "self" alias for "this" with "that"

2.4.0
======

- Ported all components except LookupListInput to jQuery-free version of code to remove dependencies
- Re-organized SelectInput and TextInput code, eliminated custom object as an option in favor of emitting a generic object in events.
- Added convenience methods to gadgetui.util to replace some functionality that was provided by jQuery
	- css() replacement
	- draggable replacement

2.2.9
======

- fixed selector problem with ComboBox.
- Fixed position bug with ComboBox in some layouts

2.2.8
======

- Remove dependency on jquery.addrule
- Removed use of :before and :after pseudo-selectors
- Added gadgetui-combobox-change event to ComboBox
- Removed hiding text input in ComboBox when showing select since it causes weird layout issues in certain situations


2.2.7
======

- CSS and compatibility fixes for MS Edge and IE 7+
- Verified compatibility with a larger set of browsers- Safari, IE 7+, Firefox, Chrome, Opera, Brave
- addition of Promise polyfill for older browsers
- addition of jQuery 1.x as a dependency for older browser support ( IE < 9.0 )
- Created additional test files for individual components
- Switched primary test page to use jQuery 1.10.x for older browser support.
- Added utility method for getComputedStyle shimming
- Fixed syntax errors that were problematic for older IE support


2.2.5
======

- CSS fix for Bubble to make sure box-sizing is unset in the control

2.2.2
======

- CSS positioning fixes for ComboBox, SelectInput, and TextInput
- Change default border color for ComboBox and TextInput

2.2.0
======

- Positioning fixes for ComboBox related to borderWidth and borderRadius

2.1.0
======

- Added ComboBox control to input package
- Fixed bug in Bubble
- added useActive flag to TextInput to control whether the check for active flag true before activating control
  - This feature enables click on then second click to activate functionality so you can give the control focus without automatically activating it.
- Made significant changes to the model
  - Split updating model value and Dom elements into separate methods
  - Enabled updating a DOM element and having it change the model and then update corresponding bound DOM elements
  - Passing an object to a div or select box to update the value expects { text: textvalue, id: idvalue }
- Enabled binding to a DIV element to update text() value.
- Added dependence on jquery-encode from OWASP to protect inputs from code injection
- Added encode() util method
- Added mouseWithin() and mouseCoords() methods to check programmatically whether the mouse is over a control and therefore the control should have focus.


2.0.4
======

- Added activate delay (in milliseconds) to TextInput

2.0.3
======

- Fix for font variable rename to this.font in TextInput addCSS()

2.0.2
======

- Additional bug fix for TextInput initial width
- Re-factoring of TextInput methods

2.0.1
======

- Bug fix in TextInput where width is not properly set on TextInput labels

2.0.0
======

- moved bindTolModel to util module
- re-factored LookupListInput for readability
- re-factored FloatingPane for readability
- fixed layout issues related to position: relative ancestors for Bubble and FloatingPane
- made selector a required argument for LookupListInput
- Re-factored TextInput and SelectInput
  - only accept a single selector, required
   - function signatures changed


1.6.2
======

- changed Bubble base element from p to div
- added significant debugging to Bubble to learn why position is not always correct
	- note that position is affected by position: relative ancestor elements and
	  they must be accounted for
- fixed issue with FloatingPane height not being exactly correct on restoration from being minimized

1.6.1
======

- Added dependency for jquery.addRule so it will be installed via Bower ( for Bubble support ).
- Added getNumberValue to util package
- Modified SelectInput styling - working on positioning of label/select box

1.5.1
======

- Fixed issues with selectinput positioning/size of label v. select box
- re-factored selectinput code for better readability
- Fixed issue with selectinput not reverting to label until mouseover/out while not selected
	- added document listener mouseup to check whether control has focus and hide select box if it does not

1.5.0
======

- Made gadgetui model the default model for binding.

1.4.5
======

- Fixed formatting for label/input positioning in TextInput.


1.4.4
======

- Fixed bug, min height not set for label div in TextInput.


1.4.3
======

- Fixed bug with missing config for TextInput.

1.4.2
======

- Fixed bugs related to mouseover/mouseout of TextInput
- re-factored TextInput for better readability

1.4.0
======

- Added Bubble UI element

1.3.0
======

- Addition of enforceMaxWidth config setting on TextInput, defaults to false

1.2.7
======

- Adjustments to CSS for TextInput

1.2.6
======

- Bug fix for model/view binding in text input.

1.2.5
======

- Simplified textinput conventions.

1.2.3
======

- Fixed bugs with text width order of font-size and font-family.

1.2.2
======

- Fixed bugs with text width.

1.2.1
======

- Changed default innerWidth of CollapsiblePane from 100% to "".
- Re-worked internals of TextInput and SelectInput for cleaner binding of events.
- Re-worked model setting code to avoid blanking inputs not passed in as changed but bound to elements where a property of an object is being changed but other
  properties of the object are also bound to controls.
- Added functions textWidth and fitText to get text size and fit text into specific width.
- Implemented text fitting functionality in TextInput so label does not overflow its container.

1.1.17
======

- Add type='text' to inputlabel on TextInput

1.1.16
======

- Another bug fix for initial label size of TextInput.

1.1.15
======

- Bug fix for initial label size of TextInput.


1.1.14
======

- Bug fix for label size of TextInput.


1.1.13
======

- Re-worked label, styling, and some internal references for TextInput. Styling for font size and alignment should now be (generally) automatic.


1.1.12
======

- Bug fix for minWidth on FloatingPane

1.1.11
======

- Changed icons to jquery-ui icons.


1.1.10
======

- Added expand/minimize function to header button.

1.1.9
======

- Added z-index option to floatingPane ui component.


1.1.8
======

- Added floatingPane ui component.

1.1.7
======

- Added reset method to LookupListInput control to reset contents of input.

1.1.0
======

- Added LookupListInput control for adding tags, email addresses, etc from a source array through autocomplete function.

1.0.2
======

- Moved CollapsiblePabe.toggle method to object prototype.
- Added collapse config argument to allow pane to start expanded or collapsed.

1.0.1
======

- Added width, interiorWidth to config of CollapsiblePane.
- Modified CollapsiblePane style class names.

1.0.0
======

- Added CollapsiblePane display control.

0.9.0
======

- Changed 'that' to 'self' for naming convention.

- Changed _bind* method signatures to pass in object reference rather than specific properties so signature will not change when properties change.
- Expanded test page with explanatory text and some additional tests of functionality.

0.8.2
======

- Added exception handling around get() method of model to log an error with the key name and return undefined in the case that a requested key does not exist in the model.
