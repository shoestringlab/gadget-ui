import {constructor,toggle} from '/dist/gadget-ui.es.js';


const toggler = constructor( toggle, [ {selector: "#toggler", shape: "round"} ], true );




const toggler2 = constructor( toggle, [ {parentSelector: "#parentDiv", shape: "square"} ], true );
