<!DOCTYPE html>
<html>
<head>
    <title>Overlay Component Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        
        .test-container {
            border: 2px solid #ccc;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            position: relative;
            background-color: #f9f9f9;
        }
        
        .controls {
            background-color: #e8f4f8;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        
        .controls button {
            margin: 5px;
            padding: 8px 15px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .controls button:hover {
            background-color: #0056b3;
        }
        
        .gadgetui-hidden {
            display: none !important;
        }
        
        .gadgetui-overlay {
            transition: opacity 0.3s ease;
        }
        
        .custom-overlay {
            border: 2px dashed #ff6b6b;
            border-radius: 8px;
        }
        
        #log {
            background-color: #f0f0f0;
            padding: 10px;
            height: 200px;
            overflow-y: auto;
            border: 1px solid #ccc;
            font-family: monospace;
            font-size: 12px;
        }
        
        .test-element {
            background-color: lightblue;
            padding: 30px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
        }
        
        .scroll-container {
            height: 300px;
            overflow: auto;
            border: 1px solid #ddd;
            padding: 20px;
            margin: 20px 0;
        }
        
        .tall-content {
            height: 800px;
            background: linear-gradient(to bottom, #ffcccc, #ccffcc);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <h1>Overlay Component Test</h1>
    
    <div class="controls">
        <h3>Basic Overlay Controls</h3>
        <button onclick="createBasicOverlay()">Create Basic Overlay</button>
        <button onclick="createOverlayWithContent()">Create Overlay with Content</button>
        <button onclick="showOverlay()">Show Overlay</button>
        <button onclick="hideOverlay()">Hide Overlay</button>
        <button onclick="updateContent()">Update Content</button>
        <button onclick="destroyOverlay()">Destroy Overlay</button>
        <button onclick="checkVisibility()">Check Visibility</button>
        <button onclick="clearLog()">Clear Log</button>
    </div>
    
    <div class="controls">
        <h3>Position & Size Controls</h3>
        <button onclick="createTopOverlay()">Create Top Position</button>
        <button onclick="createLeftOverlay()">Create Left Position</button>
        <button onclick="createRightOverlay()">Create Right Position</button>
        <button onclick="createBottomOverlay()">Create Bottom Position</button>
        <button onclick="createSizedOverlay()">Create Sized Overlay</button>
        <button onclick="createPercentageOverlay()">Create Percentage Overlay</button>
        <button onclick="createSmallOverlay()">Create Small Fixed Overlay</button>
    </div>
    
    <div class="test-container">
        <h3>Test Element 1 - Basic Functionality</h3>
        <p>This element demonstrates basic overlay functionality. The overlay should cover this entire container with a semi-transparent background.</p>
        <p>Try clicking on the overlay to see the click events.</p>
        <button onclick="alert('Button clicked!')">Test Button</button>
    </div>
    
    <div class="controls">
        <h3>Custom Overlay Controls</h3>
        <button onclick="createCustomOverlay()">Create Custom Overlay</button>
        <button onclick="createClickThroughOverlay()">Create Click-Through Overlay</button>
    </div>
    
    <div class="test-container">
        <h3>Test Element 2 - Custom Styling</h3>
        <p>This element demonstrates custom overlay styling with different colors and borders.</p>
        <input type="text" placeholder="Test input field" style="width: 200px; padding: 5px;">
        <select><option>Option 1</option><option>Option 2</option></select>
    </div>
    
    <div class="scroll-container">
        <div class="tall-content">
            <div class="test-element">
                <h3>Scrollable Test Element</h3>
                <p>This element tests overlay positioning during scrolling.</p>
                <p>The overlay should follow this element as you scroll.</p>
            </div>
        </div>
    </div>
    
    <div class="controls">
        <h3>Scrollable Overlay Controls</h3>
        <button onclick="createScrollableOverlay()">Create Overlay on Scrollable Element</button>
    </div>
    
    <div class="test-container" id="resizable-element" style="resize: both; overflow: auto; min-height: 100px;">
        <h3>Resizable Test Element</h3>
        <p>This element can be resized. The overlay should adjust to follow size changes.</p>
        <p>Grab the corner to resize and see how the overlay adapts.</p>
    </div>
    
    <div class="controls">
        <h3>Resizable Overlay Controls</h3>
        <button onclick="createResizableOverlay()">Create Overlay on Resizable Element</button>
    </div>
    
    <h3>Event Log</h3>
    <div id="log"></div>
    
    <script type="module">
        import { gadgetui } from "/dist/gadget-ui.es.js";
        
        let basicOverlay = null;
        let customOverlay = null;
        let scrollableOverlay = null;
        let resizableOverlay = null;
        
        function log(message) {
            const logElement = document.getElementById('log');
            const timestamp = new Date().toLocaleTimeString();
            logElement.innerHTML += `[${timestamp}] ${message}<br>`;
            logElement.scrollTop = logElement.scrollHeight;
        }
        
        window.createBasicOverlay = function() {
            if (basicOverlay) {
                basicOverlay.destroy();
            }
            
            const element = document.querySelector('.test-container');
            basicOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(255, 0, 0, 0.3)'
            });
            
            basicOverlay.on('click', (overlay, data) => {
                log('Basic overlay clicked');
            });
            
            basicOverlay.on('shown', () => {
                log('Basic overlay shown');
            });
            
            basicOverlay.on('hidden', () => {
                log('Basic overlay hidden');
            });
            
            log('Basic overlay created');
        };
        
        window.createOverlayWithContent = function() {
            if (basicOverlay) {
                basicOverlay.destroy();
            }
            
            const element = document.querySelector('.test-container');
            const content = `
                <div style="padding: 15px; text-align: center; color: white; font-weight: bold;">
                    <h4>Overlay Content</h4>
                    <p>This is interactive HTML content!</p>
                    <button onclick="log('Content button clicked!')" style="padding: 5px 10px; background: white; color: black; border: none; border-radius: 3px; cursor: pointer;">Click Me</button>
                </div>
            `;
            
            basicOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(0, 100, 200, 0.8)',
                content: content
            });
            
            basicOverlay.on('click', (overlay, data) => {
                log('Content overlay clicked');
            });
            
            basicOverlay.on('shown', () => {
                log('Content overlay shown');
            });
            
            basicOverlay.on('hidden', () => {
                log('Content overlay hidden');
            });
            
            basicOverlay.on('contentChanged', (overlay, data) => {
                log('Content changed');
            });
            
            log('Overlay with content created');
        };
        
        window.updateContent = function() {
            if (basicOverlay) {
                const newContent = `
                    <div style="padding: 15px; text-align: center; color: yellow; font-weight: bold;">
                        <h4>Updated Content!</h4>
                        <p>Content updated at: ${new Date().toLocaleTimeString()}</p>
                        <button onclick="log('Updated content button clicked!')" style="padding: 5px 10px; background: yellow; color: black; border: none; border-radius: 3px; cursor: pointer;">New Button</button>
                    </div>
                `;
                basicOverlay.setContent(newContent);
                log('Overlay content updated');
            } else {
                log('No overlay exists - create one first');
            }
        };
        
        window.createTopOverlay = function() {
            if (basicOverlay) {
                basicOverlay.destroy();
            }
            
            const element = document.querySelector('.test-container');
            basicOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(255, 165, 0, 0.8)',
                position: 'top',
                size: { width: 200, height: 60 },
                content: '<div style="padding: 15px; text-align: center; color: white; font-weight: bold;">⬆️ Top Position</div>'
            });
            
            log('Top position overlay created (200x60)');
        };
        
        window.createLeftOverlay = function() {
            if (basicOverlay) {
                basicOverlay.destroy();
            }
            
            const element = document.querySelector('.test-container');
            basicOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(255, 0, 128, 0.8)',
                position: 'left',
                size: { width: 80, height: 120 },
                content: '<div style="padding: 15px; text-align: center; color: white; font-weight: bold;">⬅️ Left</div>'
            });
            
            log('Left position overlay created (80x120)');
        };
        
        window.createRightOverlay = function() {
            if (basicOverlay) {
                basicOverlay.destroy();
            }
            
            const element = document.querySelector('.test-container');
            basicOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(0, 255, 128, 0.8)',
                position: 'right',
                size: { width: 80, height: 120 },
                content: '<div style="padding: 15px; text-align: center; color: white; font-weight: bold;">➡️ Right</div>'
            });
            
            log('Right position overlay created (80x120)');
        };
        
        window.createBottomOverlay = function() {
            if (basicOverlay) {
                basicOverlay.destroy();
            }
            
            const element = document.querySelector('.test-container');
            basicOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(128, 0, 255, 0.8)',
                position: 'bottom',
                size: { width: 200, height: 60 },
                content: '<div style="padding: 15px; text-align: center; color: white; font-weight: bold;">⬇️ Bottom Position</div>'
            });
            
            log('Bottom position overlay created (200x60)');
        };
        
        window.createSizedOverlay = function() {
            if (basicOverlay) {
                basicOverlay.destroy();
            }
            
            const element = document.querySelector('.test-container');
            basicOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(255, 100, 0, 0.8)',
                size: { width: 150, height: 100 },
                content: '<div style="padding: 15px; text-align: center; color: white;">150x100</div>'
            });
            
            log('Sized overlay created (150x100)');
        };
        
        window.createPercentageOverlay = function() {
            if (basicOverlay) {
                basicOverlay.destroy();
            }
            
            const element = document.querySelector('.test-container');
            basicOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(0, 255, 255, 0.7)',
                size: { width: '75%', height: '50%' },
                content: '<div style="padding: 15px; text-align: center; color: black; font-weight: bold;">75% x 50%</div>'
            });
            
            log('Percentage sized overlay created (75% x 50%)');
        };
        
        window.createSmallOverlay = function() {
            if (basicOverlay) {
                basicOverlay.destroy();
            }
            
            const element = document.querySelector('.test-container');
            basicOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(255, 0, 64, 0.9)',
                size: 50,
                position: 'top',
                content: '<div style="padding: 10px; text-align: center; color: white;">50x50</div>'
            });
            
            log('Small square overlay created (50x50 at top)');
        };
        
        window.createCustomOverlay = function() {
            if (customOverlay) {
                customOverlay.destroy();
            }
            
            const element = document.querySelectorAll('.test-container')[1];
            customOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(0, 255, 0, 0.2)',
                class: 'custom-overlay',
                zIndexOffset: 10
            });
            
            customOverlay.on('click', (overlay, data) => {
                log('Custom overlay clicked');
            });
            
            log('Custom overlay created');
        };
        
        window.createClickThroughOverlay = function() {
            if (customOverlay) {
                customOverlay.destroy();
            }
            
            const element = document.querySelectorAll('.test-container')[1];
            customOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                clickThrough: true
            });
            
            log('Click-through overlay created - you should be able to interact with elements underneath');
        };
        
        window.createScrollableOverlay = function() {
            if (scrollableOverlay) {
                scrollableOverlay.destroy();
            }
            
            const element = document.querySelector('.test-element');
            scrollableOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(255, 165, 0, 0.4)'
            });
            
            scrollableOverlay.on('shown', () => {
                log('Scrollable overlay shown - try scrolling the container');
            });
            
            log('Scrollable overlay created');
        };
        
        window.createResizableOverlay = function() {
            if (resizableOverlay) {
                resizableOverlay.destroy();
            }
            
            const element = document.getElementById('resizable-element');
            resizableOverlay = new gadgetui.display.Overlay(element, {
                backgroundColor: 'rgba(128, 0, 128, 0.3)'
            });
            
            resizableOverlay.on('shown', () => {
                log('Resizable overlay shown - try resizing the container');
            });
            
            log('Resizable overlay created');
        };
        
        window.showOverlay = function() {
            if (basicOverlay) {
                basicOverlay.show();
            } else {
                log('No basic overlay exists - create one first');
            }
        };
        
        window.hideOverlay = function() {
            if (basicOverlay) {
                basicOverlay.hide();
            } else {
                log('No basic overlay exists - create one first');
            }
        };
        
        window.destroyOverlay = function() {
            if (basicOverlay) {
                basicOverlay.destroy();
                basicOverlay = null;
                log('Basic overlay destroyed');
            } else {
                log('No basic overlay exists');
            }
        };
        
        window.checkVisibility = function() {
            if (basicOverlay) {
                const visible = basicOverlay.isVisible();
                log(`Basic overlay is ${visible ? 'visible' : 'hidden'}`);
            } else {
                log('No basic overlay exists');
            }
        };
        
        window.clearLog = function() {
            document.getElementById('log').innerHTML = '';
        };
        
        // Log initial message
        log('Overlay test page loaded. Click buttons to test overlay functionality.');
    </script>
</body>
</html>