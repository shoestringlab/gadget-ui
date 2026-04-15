# Gadget-UI Documentation

## Overview

Gadget-UI is a JavaScript UI component library version 11.5.1 featuring built-in model and data-binding mechanisms. The library provides a comprehensive set of UI components with ES6 class-based architecture and supports both traditional script tag inclusion and modern ES6 module imports.

## Architecture

### Core Modules

#### Model System (`gadget-ui.model.js`)
The model system provides reactive data binding with undo/redo functionality:

- **BindableObject**: Core class for data binding with DOM elements
- **Memento Pattern**: Supports undo/redo operations (default 20 mementos)
- **Event System**: Change events propagate through the binding system
- **Data Types**: Supports primitives, objects, arrays, and Maps

Key features:
- Two-way data binding between JavaScript objects and DOM elements
- Automatic DOM updates when model data changes
- Support for nested object properties (`user.name`, `user.address.street`)
- Comprehensive undo/redo with `undo()`, `redo()`, `rewind()`, `fastForward()`

#### Utilities (`gadget-ui.util.js`)
Comprehensive utility library providing:

- **DOM Manipulation**: Element creation, styling, positioning
- **Browser Detection**: Cross-browser compatibility helpers
- **Text Processing**: Text width calculation, fitting, and canvas text rendering
- **Event Handling**: Mouse coordinate tracking, draggable elements
- **CSS Management**: Dynamic style application and computation

#### Component Base
All components extend a base `Component` class providing:
- Event firing and handling system
- Configuration management
- Lifecycle management

## Component Categories

### Display Components

#### Lightbox (`display/lightbox.js`)
Image gallery component with slideshow capabilities.

**Constructor**: `new Lightbox(element, options)`

**Options**:
- `images`: Array of image URLs
- `time`: Auto-advance interval (default: 3000ms)
- `enableModal`: Modal view on click (default: true)
- `leftIcon/rightIcon`: Navigation icons
- `iconClass`: CSS class for icons
- `iconType`: Icon type ('img' or 'svg')

**Events**: `showPrevious`, `showNext`, `close`, `destroy`

**Features**:
- Smooth transitions between images
- Modal fullscreen view
- Automatic slideshow with controls
- Customizable navigation icons

#### FloatingPane (`display/floatingpane.js`)
Draggable floating panel component.

#### Modal (`display/modal.js`)
Modal dialog overlay component.

#### Dialog (`display/dialog.js`)
Interactive dialog component.

#### CollapsiblePane (`display/collapsiblepane.js`)
Expandable/collapsible content panel.

#### Bubble (`display/bubble.js`)
Tooltip/bubble popup component.

#### Menu (`display/menu.js`)
Dropdown menu component.

#### ProgressBar (`display/progressbar.js`)
Progress indication component.

#### Sidebar (`display/sidebar.js`)
Collapsible sidebar navigation.

#### Tabs (`display/tabs.js`)
Tabbed interface component.

#### Popover (`display/popover.js`)
Popover tooltip component.

#### Overlay (`display/overlay.js`)
General overlay component.

### Input Components

#### TextInput (`input/textinput.js`)
Enhanced text input with auto-width and validation.

**Constructor**: `new TextInput(selector, options)`

**Options**:
- `hideable`: Hide/show behavior on interaction
- `maxWidth`: Maximum width constraint
- `minWidth`: Minimum width (default: 100)
- `enforceMaxWidth`: Strict width enforcement
- `emitEvents`: Event emission control
- `model`: Model instance for binding

**Features**:
- Dynamic width adjustment based on content
- Model binding integration
- Custom styling and behavior
- Text overflow handling with ellipsis

#### ComboBox (`input/combobox.js`)
Enhanced select with custom option addition.

**Constructor**: `new ComboBox(element, options)`

**Options**:
- `dataProvider`: Data source with refresh capability
- `save`: Function to handle new option creation
- `newOption`: Default option for custom entries
- `hideable`: Show/hide behavior
- `animate`: Animation support with Velocity.js
- `arrowWidth`: Dropdown arrow width

**Events**: `gadgetui-combobox-change`, `gadgetui-combobox-save`, `gadgetui-combobox-refresh`

**Features**:
- Add custom options dynamically
- Asynchronous data loading
- Animated transitions
- Cross-browser compatibility

#### SelectInput (`input/selectinput.js`)
Enhanced select dropdown component.

#### Autosuggest (`input/autosuggest.js`)
Auto-complete suggestion component.

#### LookupListInput (`input/lookuplistinput.js`)
Multi-select with lookup functionality.

#### FileUploader (`input/fileuploader.js`)
File upload component with progress tracking.

#### Toggle (`input/toggle.js`)
Toggle switch component.

## Model Binding System

### Creating Models
```javascript
// Initialize model system
gadgetui.model.init({ maxMementos: 50 });

// Create a model
gadgetui.model.create("user", { 
    name: "John", 
    email: "john@example.com" 
});
```

### Binding to DOM Elements
```javascript
// Automatic binding via attribute
<div gadgetui-bind="user.name"></div>

// Manual binding
gadgetui.model.bind("user.email", document.getElementById("email"));
```

### Data Operations
```javascript
// Get values
const name = gadgetui.model.get("user.name");
const user = gadgetui.model.get("user");

// Set values
gadgetui.model.set("user.name", "Jane");
gadgetui.model.set("user", { name: "Bob", age: 30 });

// Undo/redo operations
gadgetui.model.undo("user");
gadgetui.model.redo("user");
```

### Supported Element Types
- **Input Elements**: text, email, number, etc.
- **Select Elements**: Single and multiple select
- **List Elements**: ul, ol, select option population
- **Text Elements**: div, span, h1-h6, p, label, etc.

## Installation and Usage

### Traditional Script Tag
```html
<script src="/node_modules/gadget-ui/dist/gadget-ui.js"></script>
```

### ES6 Modules
```javascript
// Import entire library
import { gadgetui } from "/dist/gadget-ui.es.js";

// Import specific components
import { lightbox, TextInput } from "/dist/gadget-ui.es.js";
```

### Component Instantiation
```javascript
// Using full import
const lb = new gadgetui.display.Lightbox(element, options);

// Using component import
const lb = new lightbox(element, options);
```

## Dependencies

### Runtime Dependencies
- **feather-icons**: Default icon set (optional, configurable)
- **velocity-animate**: Animation library (optional, fallback available)

### Development Dependencies
- Grunt build system
- QUnit testing framework
- Express server for development

## Testing

### Running Tests Locally
```bash
# Start test server
node index.js

# Access tests at
http://127.0.0.1:8000/test/11.x/index.htm
```

### Test Structure
- `/test/11.x/main.js`: Primary test suite demonstrating all components
- `/test/11.x/lightbox.js`: Lightbox component tests
- `/test/11.x/modelbinding.js`: Model binding tests
- Component-specific test files for each major component

## Browser Support

Gadget-UI supports all modern browsers with specific compatibility handling for:
- Chrome/Chromium
- Firefox
- Safari
- Edge (Legacy and Chromium)
- Internet Explorer (limited support)

## Configuration

### Global Configuration
```javascript
// Model system configuration
gadgetui.model.init({
    maxMementos: 50  // Default: 20
});
```

### Component Configuration
Each component accepts extensive configuration options for:
- Styling and appearance
- Behavior and interaction
- Event handling
- Data binding
- Animation settings

## Events

### Custom Events
Components fire custom events for user interactions:
- `gadgetui-input-change`: Input value changes
- `gadgetui-combobox-save`: New option saved
- `gadgetui-combobox-change`: Selection changed
- Component-specific events as documented

### Event Handling
```javascript
element.addEventListener("gadgetui-input-change", (event, data) => {
    console.log("Input changed:", data.text);
});
```

## Best Practices

### Model Binding
- Use meaningful model names and property paths
- Initialize models before binding elements
- Leverage undo/redo for user-friendly editing

### Component Usage
- Import only needed components for optimal bundle size
- Configure components appropriately for use case
- Handle events for responsive user interaction

### Performance
- Use model binding for complex forms
- Configure appropriate memento limits
- Leverage lazy loading for large datasets

## License

Gadget-UI is released under the MIT License as of version 11.