# Overlay Component

The Overlay component creates a semi-transparent overlay that covers a specified DOM element with the same dimensions and position.

## Usage

### ES6 Module Import
```javascript
import { overlay } from "/dist/gadget-ui.es.js";

const overlayComponent = new overlay(element, options);
```

### Traditional Import
```javascript
const overlayComponent = new gadgetui.display.Overlay(element, options);
```

## Constructor

```javascript
new Overlay(element, options)
```

**Parameters:**
- `element` (DOM Node): The DOM element to overlay
- `options` (Object): Configuration options

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `backgroundColor` | String | `"rgba(0, 0, 0, 0.5)"` | Overlay background color |
| `class` | String | `false` | Additional CSS class for overlay |
| `autoShow` | Boolean | `true` | Show overlay immediately on creation |
| `clickThrough` | Boolean | `false` | Allow clicks to pass through overlay |
| `content` | String | `""` | HTML content to display inside the overlay |
| `size` | Object/String/Number | `null` | Size of overlay. Can be `{width, height}`, single value for square, or percentage like "50%" |
| `position` | String | `null` | Position relative to element. Can be `"top"`, `"left"`, `"right"`, `"bottom"`, or `null` to cover element |
| `zIndexOffset` | Number | `1` | Z-index offset above target element |

### Size Options

The `size` option accepts multiple formats:

**Object Format:**
```javascript
size: { width: 200, height: 100 }  // Absolute pixels
size: { width: '50%', height: '30%' }  // Percentages
size: { width: '150px', height: '80px' }  // CSS units
```

**Single Value (Square):**
```javascript
size: 100  // Creates 100x100 square
size: '50%'  // Creates 50% x 50% square
size: '80px'  // Creates 80x80 square
```

**Default (Full Element):**
```javascript
size: null  // Covers entire element
```

### Position Options

The `position` option determines where the overlay appears relative to the target element:

**Position Values:**
- `"top"`: Positioned above the element, centered horizontally
- `"left"`: Positioned to the left of the element, centered vertically  
- `"right"`: Positioned to the right of the element, centered vertically
- `"bottom"`: Positioned below the element, centered horizontally
- `null`: Covers the entire element (default)

**Positioning Behavior:**
- When positioned, overlays are centered on the opposite axis
- For example, `"top"` positions are centered horizontally
- `"left"` positions are centered vertically
- Overlays are positioned outside the element boundaries

## Methods

### show()
Shows the overlay if it's currently hidden.

### hide()
Hides the overlay if it's currently visible.

### destroy()
Removes the overlay from the DOM and cleans up all event listeners.

### isVisible()
Returns `true` if the overlay is currently visible, `false` otherwise.

### setContent(htmlContent)
Sets the HTML content of the overlay.

**Parameters:**
- `htmlContent` (String): HTML string to set as the overlay's innerHTML

**Events:** Fires the `contentChanged` event

### getContent()
Returns the current HTML content of the overlay.

### updateStyle(styles)
Updates the overlay's CSS styles.

**Parameters:**
- `styles` (Object): CSS style properties to apply

### updateSizeAndPosition(size, position)
Updates the size and position of the overlay dynamically.

**Parameters:**
- `size` (Object/String/Number): New size specification
- `position` (String): New position (`"top"`, `"left"`, `"right"`, `"bottom"`, or `null`)

## Events

The Overlay component fires the following events:

### `shown`
Fired when the overlay becomes visible.

### `hidden`
Fired when the overlay becomes hidden.

### `click`
Fired when the overlay is clicked (if not `clickThrough`).

**Event data:** `{ originalEvent: MouseEvent }`

### `mouseenter`
Fired when mouse enters the overlay.

**Event data:** `{ originalEvent: MouseEvent }`

### `mouseleave`
Fired when mouse leaves the overlay.

**Event data:** `{ originalEvent: MouseEvent }`

### `contentChanged`
Fired when the overlay content is updated via `setContent()`.

**Event data:** `{ content: String }`

### `destroyed`
Fired when the overlay is destroyed.

## Event Handling

```javascript
const overlayComponent = new overlay(element, options);

overlayComponent.on('shown', () => {
    console.log('Overlay is now visible');
});

overlayComponent.on('click', (overlay, data) => {
    console.log('Overlay clicked', data.originalEvent);
});

overlayComponent.on('destroyed', () => {
    console.log('Overlay has been destroyed');
});
```

## Features

- **Responsive**: Automatically adjusts to element size changes using ResizeObserver
- **Scroll-aware**: Maintains position during scrolling
- **Z-index management**: Automatically positions above target element
- **Click-through option**: Allows interaction with underlying elements
- **Content support**: Display HTML content inside the overlay
- **Dynamic content**: Update content programmatically with `setContent()`
- **Custom styling**: Supports custom CSS classes and styles
- **Event-driven**: Comprehensive event system for interaction handling

## Examples

### Basic Full Overlay
```javascript
// Create an overlay that covers the entire element
const myOverlay = new overlay(document.getElementById('myElement'), {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    class: 'my-custom-overlay',
    zIndexOffset: 10
});
```

### Overlay with Content
```javascript
// Create an overlay with custom styling and content
const content = `
    <div style="text-align: center; padding: 20px; color: white;">
        <h3>Loading...</h3>
        <p>Please wait while we process your request.</p>
    </div>
`;

const loadingOverlay = new overlay(document.getElementById('myElement'), {
    backgroundColor: 'rgba(0, 0, 255, 0.7)',
    content: content
});
```

### Positioned Overlay
```javascript
// Create a small overlay positioned above the element
const tooltipOverlay = new overlay(document.getElementById('myElement'), {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'top',
    size: { width: 200, height: 50 },
    content: '<div style="color: white; text-align: center; padding: 10px;">Tooltip content</div>'
});
```

### Sized Overlay with Percentage
```javascript
// Create an overlay that is 50% width and 30% height of the element
const percentageOverlay = new overlay(document.getElementById('myElement'), {
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    size: { width: '50%', height: '30%' },
    content: '<div style="text-align: center; padding: 15px;">50% x 30% overlay</div>'
});
```

### Square Overlay
```javascript
// Create a 100x100 square overlay positioned to the right
const squareOverlay = new overlay(document.getElementById('myElement'), {
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
    position: 'right',
    size: 100, // Single value creates a square
    content: '<div style="color: white; text-align: center; padding: 35px;">100x100</div>'
});
```

### Event Handling and Dynamic Updates
```javascript
const dynamicOverlay = new overlay(document.getElementById('myElement'), {
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
    content: '<div id="overlay-content">Initial content</div>'
});

// Listen for events
dynamicOverlay.on('click', () => {
    console.log('Overlay was clicked');
    dynamicOverlay.hide();
});

dynamicOverlay.on('contentChanged', (overlay, data) => {
    console.log('Content updated:', data.content);
});

// Update content dynamically
setTimeout(() => {
    dynamicOverlay.setContent('<div>Updated content at ' + new Date().toLocaleTimeString() + '</div>');
}, 3000);

// Update size and position dynamically
setTimeout(() => {
    dynamicOverlay.updateSizeAndPosition(
        { width: 150, height: 80 },
        'bottom'
    );
}, 5000);

// Clean up when done
// dynamicOverlay.destroy();
```

### Size and Position Combinations

```javascript
// Top positioned notification
const notification = new overlay(element, {
    position: 'top',
    size: { width: 300, height: 60 },
    backgroundColor: 'rgba(0, 200, 0, 0.9)',
    content: '<div style="color: white; text-align: center; padding: 15px;">✓ Success!</div>'
});

// Left sidebar overlay
const sidebar = new overlay(element, {
    position: 'left',
    size: { width: 200, height: '100%' },
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    content: '<div style="color: white; padding: 20px;">Sidebar Content</div>'
});

// Bottom status bar
const statusBar = new overlay(element, {
    position: 'bottom',
    size: { width: '100%', height: 40 },
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    content: '<div style="color: white; padding: 10px;">Status: Ready</div>'
});
```

## Browser Support

The Overlay component supports all modern browsers. It uses:
- `ResizeObserver` for responsive resizing (with fallback)
- Standard DOM APIs for positioning and styling
- Event-driven architecture compatible with all browsers