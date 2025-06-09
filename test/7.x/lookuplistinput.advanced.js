import {gadgetui} from '/dist/gadget-ui.es.js';

		var user = {
			icons : []
		};

		var lookuplist = [{label:"account-login.png"},{label:"account-logout.png"},{label:"action-redo.png"},{label:"action-undo.png"},{label:"align-center.png"},{label:"align-left.png"},{label:"align-right.png"},{label:"aperture.png"},{label:"arrow-bottom.png"},{label:"arrow-circle-bottom.png"},{label:"arrow-circle-left.png"},{label:"arrow-circle-right.png"},{label:"arrow-circle-top.png"},{label:"arrow-left.png"},{label:"arrow-right.png"},{label:"arrow-thick-bottom.png"},{label:"arrow-thick-left.png"},{label:"arrow-thick-right.png"},{label:"arrow-thick-top.png"},{label:"arrow-top.png"},{label:"audio.png"},{label:"audio-spectrum.png"},{label:"badge.png"},{label:"ban.png"},{label:"bar-chart.png"},{label:"basket.png"},{label:"battery-empty.png"},{label:"battery-full.png"},{label:"beaker.png"},{label:"bell.png"},{label:"bluetooth.png"},{label:"bold.png"},{label:"bolt.png"},{label:"book.png"},{label:"bookmark.png"},{label:"box.png"},{label:"briefcase.png"},{label:"british-pound.png"},{label:"browser.png"},{label:"brush.png"},{label:"bug.png"},{label:"bullhorn.png"},{label:"calculator.png"},{label:"calendar.png"},{label:"camera-slr.png"},{label:"caret-bottom.png"},{label:"caret-left.png"},{label:"caret-right.png"},{label:"caret-top.png"},{label:"cart.png"},{label:"chat.png"},{label:"check.png"},{label:"chevron-bottom.png"},{label:"chevron-left.png"},{label:"chevron-right.png"},{label:"chevron-top.png"},{label:"circle-check.png"},{label:"circle-x.png"},{label:"clipboard.png"},{label:"clock.png"},{label:"cloud.png"},{label:"cloud-download.png"},{label:"cloud-upload.png"},{label:"cloudy.png"},{label:"code.png"},{label:"cog.png"},{label:"collapse-down.png"},{label:"collapse-left.png"},{label:"collapse-right.png"},{label:"collapse-up.png"},{label:"command.png"},{label:"comment-square.png"},{label:"compass.png"},{label:"contrast.png"},{label:"copywriting.png"},{label:"credit-card.png"},{label:"crop.png"},{label:"dashboard.png"},{label:"data-transfer-download.png"},{label:"data-transfer-upload.png"},{label:"delete.png"},{label:"dial.png"},{label:"document.png"},{label:"dollar.png"},{label:"double-quote-sans-left.png"},{label:"double-quote-sans-right.png"},{label:"double-quote-serif-left.png"},{label:"double-quote-serif-right.png"},{label:"droplet.png"},{label:"eject.png"},{label:"elevator.png"},{label:"ellipses.png"},{label:"envelope-closed.png"},{label:"envelope-open.png"},{label:"euro.png"},{label:"excerpt.png"},{label:"expand-down.png"},{label:"expand-left.png"},{label:"expand-right.png"},{label:"expand-up.png"},{label:"external-link.png"},{label:"eye.png"},{label:"eyedropper.png"},{label:"file.png"},{label:"fire.png"},{label:"flag.png"},{label:"flash.png"},{label:"folder.png"},{label:"fork.png"},{label:"fullscreen-enter.png"},{label:"fullscreen-exit.png"},{label:"globe.png"},{label:"graph.png"},{label:"grid-four-up.png"},{label:"grid-three-up.png"},{label:"grid-two-up.png"},{label:"hard-drive.png"},{label:"header.png"},{label:"headphones.png"},{label:"heart.png"},{label:"home.png"},{label:"image.png"},{label:"inbox.png"},{label:"infinity.png"},{label:"info.png"},{label:"italic.png"},{label:"justify-center.png"},{label:"justify-left.png"},{label:"justify-right.png"},{label:"key.png"},{label:"laptop.png"},{label:"layers.png"},{label:"lightbulb.png"},{label:"link-broken.png"},{label:"link-intact.png"},{label:"list.png"},{label:"list-rich.png"},{label:"location.png"},{label:"lock-locked.png"},{label:"lock-unlocked.png"},{label:"loop.png"},{label:"loop-circular.png"},{label:"loop-square.png"},{label:"magnifying-glass.png"},{label:"map.png"},{label:"map-marker.png"},{label:"media-pause.png"},{label:"media-play.png"},{label:"media-record.png"},{label:"media-skip-backward.png"},{label:"media-skip-forward.png"},{label:"media-step-backward.png"},{label:"media-step-forward.png"},{label:"media-stop.png"},{label:"medical-cross.png"},{label:"menu.png"},{label:"microphone.png"},{label:"minus.png"},{label:"monitor.png"},{label:"moon.png"},{label:"move.png"},{label:"musical-note.png"},{label:"paperclip.png"},{label:"pencil.png"},{label:"people.png"},{label:"person.png"},{label:"phone.png"},{label:"pie-chart.png"},{label:"pin.png"},{label:"play-circle.png"},{label:"plus.png"},{label:"power-standby.png"},{label:"print.png"},{label:"project.png"},{label:"pulse.png"},{label:"puzzle-piece.png"},{label:"question-mark.png"},{label:"rain.png"},{label:"random.png"},{label:"reload.png"},{label:"resize-both.png"},{label:"resize-height.png"},{label:"resize-width.png"},{label:"rss.png"},{label:"rss-alt.png"},{label:"script.png"},{label:"share.png"},{label:"share-boxed.png"},{label:"shield.png"},{label:"signal.png"},{label:"signpost.png"},{label:"sort-ascending.png"},{label:"sort-descending.png"},{label:"spreadsheet.png"},{label:"star.png"},{label:"sun.png"},{label:"tablet.png"},{label:"tag.png"},{label:"tags.png"},{label:"target.png"},{label:"task.png"},{label:"terminal.png"},{label:"text.png"},{label:"thumb-down.png"},{label:"thumb-up.png"},{label:"timer.png"},{label:"transfer.png"},{label:"trash.png"},{label:"underline.png"},{label:"vertical-align-bottom.png"},{label:"vertical-align-center.png"},{label:"vertical-align-top.png"},{label:"video.png"},{label:"volume-high.png"},{label:"volume-low.png"},{label:"volume-off.png"},{label:"warning.png"},{label:"wifi.png"},{label:"wrench.png"},{label:"x.png"},{label:"yen.png"},{label:"zoom-in.png"},{label:"zoom-out.png"}];


		function renderItem( item ){
			var wrapper = document.createElement( "div" );
			gadgetui.util.setStyle( wrapper, "padding-right", 20 );
			gadgetui.util.setStyle( wrapper, "position", "relative" );
			gadgetui.util.setStyle( wrapper, "display", "inline-block" );
			var icon = document.createElement( "div" );
			gadgetui.util.setStyle( wrapper, "width", 64 );
			gadgetui.util.setStyle( wrapper, "margin", 3 );
			gadgetui.util.setStyle( icon, "width", 64 );
			gadgetui.util.setStyle( wrapper, "border", "1px solid silver" );
			var img = document.createElement( "img" );
			img.setAttribute( "src", "/node_modules/open-iconic/png/" + item.label.replace( ".png", "-8x.png") );
			img.setAttribute( "title", item.label );
			icon.appendChild( img );

			wrapper.appendChild( icon );
			return wrapper;
		}

		function renderMenuItem( item ){
			var wrapper = document.createElement( "div" );
			gadgetui.util.setStyle( wrapper, "padding-right", 20 );
			gadgetui.util.setStyle( wrapper, "display", "block" );
			gadgetui.util.addClass( wrapper, "gadgetui-lookuplist-item" );

			var icon = document.createElement( "div" );
			//gadgetui.util.setStyle( wrapper, "width", 64 );
			gadgetui.util.setStyle( wrapper, "margin", 3 );
			//gadgetui.util.setStyle( icon, "width", 64 );
			var img = document.createElement( "img" );
			img.setAttribute( "src", "/node_modules/open-iconic/png/" + item.label.replace( ".png", "-4x.png") );
			img.setAttribute( "title", item.label );
			gadgetui.util.setStyle( img, "margin-right", 5 );
			var label = document.createElement( "span" );
			gadgetui.util.setStyle( label, "font-size", ".7em" );
			label.innerText = item.label;

			icon.appendChild( img );
			icon.appendChild( label );

			wrapper.appendChild( icon );
			return wrapper;
		}
		// set the model first if we're using auto data-binding
		gadgetui.model.set("user", user);

		var ll = gadgetui.objects.Constructor( gadgetui.input.LookupListInput,
			[ document.querySelector( "input[name='icons']" ),
			{
				emitEvents : false,
				datasource : lookuplist,
				model : gadgetui.model,
				itemRenderer: renderItem,
				menuItemRenderer: renderMenuItem,
				width: 500
			}
		]
		);

		function logChanges(obj) {
			console.log(obj);
			showModel();
		}

		var reset = document.querySelector("input[name='resetLookupList']");
		reset.addEventListener("click", function() {
			ll.reset();
		});
