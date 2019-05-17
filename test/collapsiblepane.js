import {gadgetui} from '/dist/gadget-ui.es6.js';

var collapser = gadgetui.objects.Constructor( gadgetui.display.CollapsiblePane, [ document.querySelector( "div[name='collapser']"),
		{
			title : "Random Text",
			path : "/dist/",
			collapse: true,
			class: 'myPane',
			headerClass: 'myHeader'
		}]);

	var collapser2 = gadgetui.objects.Constructor( gadgetui.display.CollapsiblePane, [ document.querySelector( "div[name='collapser2']"),
			{
				title : "Random Title",
				path : "/dist/",
				collapse: true
			}]);
