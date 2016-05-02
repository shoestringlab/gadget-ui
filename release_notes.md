		
***Release Notes***

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

