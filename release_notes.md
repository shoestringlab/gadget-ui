		
***Release Notes***

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

