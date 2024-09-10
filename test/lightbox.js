import {gadgetui} from '/dist/gadget-ui.es.js';

const imageArray = [
    '/test/img/1.jpg',
    '/test/img/2.jpg',
    '/test/img/3.jpg',
    '/test/img/4.jpg',
    '/test/img/5.jpg'
];

const lightbox = gadgetui.objects.Constructor( gadgetui.display.Lightbox, [ document.getElementById("lightbox"), {images: imageArray }], true );

