# Autosuggest Integration Guide

## Issues Found in Your FormBase Component

### 1. **Config Property Name**
- ❌ `maxResults: 10`
- ✅ `maxSuggestions: 10`

### 2. **Missing Element Reference**
When using `createAtCursor: true`, you need to capture the created element:

```javascript
// After creating the autosuggest
form.components.autosuggest = new autosuggest(null, { ... });

// Store reference to the created element
currentMentionElement = form.components.autosuggest.element;
```

### 3. **Triggering the Autosuggest**
The autosuggest doesn't automatically show suggestions when created. You need to either:
- Focus the element and start typing, OR
- Manually trigger it with `showAll()` method

### 4. **Complete Fixed Implementation**

Here's your corrected `setupMentionHandler`:

```javascript
form.setupMentionHandler = function () {
    let editorElement = form.element.querySelector("[contentEditable]");
    if (editorElement) {
        const userService = a7.services.getService("userService");

        if (!userService) {
            console.warn("userService not available for mention suggestions");
            return;
        }

        let currentMentionElement = null;

        // Handle @ symbol to create inline autosuggest
        editorElement.addEventListener("keydown", function (e) {
            if (e.key === "@") {
                e.preventDefault();

                // Insert @ symbol
                const atSymbol = document.createTextNode("@");
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(atSymbol);
                    range.setStart(atSymbol, 1);
                    range.setEnd(atSymbol, 1);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

                // Create autosuggest at cursor
                form.components.autosuggest = new autosuggest(null, {
                    emitEvents: false,
                    minLength: 0, // Changed from 1 to 0 to show all on creation
                    maxSuggestions: 10, // Fixed: was maxResults
                    datasource: userService.searchUsers,
                    createAtCursor: true,
                    elementType: "span",
                    usePopover: true,
                    popoverOptions: {
                        class: 'mention-autosuggest-popover'
                    },
                    menuItemRenderer: function (item) {
                        var wrapper = document.createElement("div");
                        wrapper.classList.add("gadgetui-autosuggest-item");

                        let icon = document.createElement("div");
                        let img = document.createElement("img");
                        let span = document.createElement("span");
                        span.innerHTML = item.label;
                        img.setAttribute("src", item.pic);
                        img.setAttribute("title", item.nickName);
                        img.setAttribute("class", "profilePic_small");
                        icon.appendChild(img);
                        icon.appendChild(span);

                        wrapper.appendChild(icon);
                        return wrapper;
                    },
                    labelRenderer: function (item) {
                        return `${item.nickName} (${item.username})`;
                    },
                    handler: function (item) {
                        // Replace the mention span with username
                        const username = item.username;
                        const usernameText = document.createTextNode(username);

                        // Remove @ symbol before the mention span
                        const prevNode = currentMentionElement.previousSibling;
                        if (
                            prevNode &&
                            prevNode.nodeType === Node.TEXT_NODE &&
                            prevNode.textContent === "@"
                        ) {
                            prevNode.remove();
                        }

                        // Replace the mention span with username
                        currentMentionElement.replaceWith(usernameText);

                        // Position cursor after username
                        const selection = window.getSelection();
                        const range = document.createRange();
                        range.setStartAfter(usernameText);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);

                        // Cleanup
                        if (form.components.autosuggest) {
                            form.components.autosuggest.destroy();
                            form.components.autosuggest = null;
                        }
                        currentMentionElement = null;

                        editorElement.focus();
                    }
                });

                // IMPORTANT: Store the created element reference
                currentMentionElement = form.components.autosuggest.element;

                // Focus the element and trigger suggestions
                setTimeout(() => {
                    if (currentMentionElement) {
                        currentMentionElement.focus();

                        // Trigger autosuggest to show all results (since minLength is 0)
                        form.components.autosuggest.showAll();
                    }
                }, 10);
            }
        });

        // Clean up on blur if mention wasn't completed
        editorElement.addEventListener("blur", function (e) {
            setTimeout(() => {
                if (
                    currentMentionElement &&
                    document.activeElement !== currentMentionElement &&
                    currentMentionElement.parentNode // Still in DOM
                ) {
                    // Check if empty
                    if (currentMentionElement.textContent.trim() === "") {
                        const prevNode = currentMentionElement.previousSibling;
                        if (
                            prevNode &&
                            prevNode.nodeType === Node.TEXT_NODE &&
                            prevNode.textContent === "@"
                        ) {
                            prevNode.remove();
                        }
                        currentMentionElement.remove();
                    }

                    if (form.components.autosuggest) {
                        form.components.autosuggest.destroy();
                        form.components.autosuggest = null;
                    }
                    currentMentionElement = null;
                }
            }, 200);
        });
    }
};
```

## Key Changes Made:

1. ✅ Changed `maxResults` to `maxSuggestions`
2. ✅ Store element reference: `currentMentionElement = form.components.autosuggest.element`
3. ✅ Set `minLength: 0` to allow showing all results immediately
4. ✅ Focus the element and call `showAll()` to trigger the suggestions
5. ✅ Check if element is still in DOM before cleanup in blur handler

## New Autosuggest Features Available:

### Config Options:
- `createAtCursor`: boolean - Creates element at cursor position
- `elementType`: string - Type of element to create ('span', 'div', etc.)
- `usePopover`: boolean - Uses Popover component for suggestions
- `popoverOptions`: object - Options passed to Popover

### Methods:
- `showAll()`: Manually show all suggestions (useful after creation)
- `search(value, event)`: Search with specific value
- `destroy()`: Clean up the autosuggest instance

## CSS Styling:

You may want to add styles for the mention autosuggest:

```css
.gadgetui-autosuggest-dynamic {
    background: #fff;
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid #4CAF50;
    display: inline-block;
    min-width: 100px;
}

.mention-autosuggest-popover {
    max-height: 300px;
    overflow-y: auto;
}

.gadgetui-autosuggest-item {
    padding: 8px;
    cursor: pointer;
}

.gadgetui-autosuggest-item:hover,
.gadgetui-autosuggest-item.ui-state-focus {
    background-color: #f0f0f0;
}
```
