"use strict";
var elems;
var test = {
    title: '',
    summary: '',
    name: '',
    tagline: '',
    planets: [  ]
  };

gadgetui.model.set( "test", test );

  var elementTypes = ['div','span','h1','p'];
  elementTypes.forEach( function( elementType ){
    elems = document.querySelectorAll( elementType + "[gadgetui-bind]" );
    elems.forEach( function( elem ){
      gadgetui.model.bind( elem.getAttribute( "gadgetui-bind" ), elem );
    });
  });

  elems = document.querySelectorAll( "[gadgetui-bind-list]" );

  elems.forEach( function( elem ){
    gadgetui.model.bind( elem.getAttribute( "gadgetui-bind-list" ), elem );
  });

  var test = {
      title: 'Test of Model Binding',
      summary: 'This test demonstrates model binding to various DOM elements.',
      name: 'Gadget-UI',
      tagline: 'Data binding library',
      planets: [ 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Neptune', 'Uranus' ]
    };

  gadgetui.model.set( "test", test );

  function updatePlanets(){
    var planets = gadgetui.model.get("test.planets");
    if( planets.length < 9 ){
      planets.push("Pluto");
      gadgetui.model.set( "test.planets", planets );
    }
  }
