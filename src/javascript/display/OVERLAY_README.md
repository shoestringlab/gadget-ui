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
| `zIndexOffset` | Number | `1` | Z-index offset above target element |

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

## Example

```javascript
// Create an overlay with custom styling and content
const content = `
    <div style="text-align: center; padding: 20px; color: white;">
        <h3>Loading...</h3>
        <p>Please wait while we process your request.</p>
    </div>
`;

const myOverlay = new overlay(document.getElementById('myElement'), {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    class: 'my-custom-overlay',
    content: content,
    zIndexOffset: 10
});

// Listen for events
myOverlay.on('click', () => {
    console.log('Overlay was clicked');
    myOverlay.hide();
});

myOverlay.on('contentChanged', (overlay, data) => {
    console.log('Content updated:', data.content);
});

// Update content dynamically
setTimeout(() => {
    const newContent = `
        <div style="text-align: center; padding: 20px; color: white;">
            <h3>Complete!</h3>
            <p>Your request has been processed successfully.</p>
        </div>
    `;
    myOverlay.setContent(newContent);
}, 3000);

// Hide the overlay after 6 seconds
setTimeout(() => {
    myOverlay.hide();
}, 6000);

// Clean up when done
// myOverlay.destroy();
```

## Browser Support

The Overlay component supports all modern browsers. It uses:
- `ResizeObserver` for responsive resizing (with fallback)
- Standard DOM APIs for positioning and styling
- Event-driven architecture compatible with all browsers