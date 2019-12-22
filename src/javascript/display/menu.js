function Menu( selector, options ){
  this.selector = selector;
  this.config( options );
  if( this.datasource !== undefined ){
    this.retrieveData();
  }else{
    if( this.data !== undefined ) this.addControl();
    this.addBindingss();
  }
}

Menu.prototype.retrieveData = function(){
  this.datasource()
    .then( function( data ){
      this.data = data;
      this.addControl();
    }).bind( this );
};

Menu.prototype.addControl = function(){
  this.data.forEach( function( menu ){
    
  });
};

Menu.prototype.addBindings = function(){

	let menus = this.selector.querySelectorAll(".gadget-ui-menu");
	// each menu needs to be initialized
	menus.forEach( function( mu ){
		let menuItem = mu.querySelector( "div[class='gadget-ui-menu-menuItem']" );

		let items = menuItem.querySelectorAll( "div[class='gadget-ui-menu-item']" );

		// get the menuItems inside the root
		let menuItems = menuItem.querySelectorAll( "div[class='gadget-ui-menu-menuItem']" );

		// loop over the items
		items.forEach( function( item ){
			// find if there is a menuItem inside the item class
			let mItem = item.querySelector( "div[class='gadget-ui-menu-menuItem']");

			// add a hover event listener for each item
			item.addEventListener( "mouseenter", function( evt ){
				if( mItem !== null){
					mItem.classList.add( "gadget-ui-menu-hovering" );
				}
        item.classList.add( "gadget-ui-menu-selected" );
        let children = item.parentNode.children;
        for( var ix = 0; ix < children.length; ix++ ){
          if( children[ix] !== item ){
            children[ix].classList.remove( "gadget-ui-menu-selected" );
          }
        }

				evt.preventDefault();
			});

			item.addEventListener( "mouseleave", function( evt ){
				if( mItem !== null){
					mItem.classList.remove( "gadget-ui-menu-hovering" );
				}
			});
		});

		// add hover event listener to the root menuItem
		mu.addEventListener( "mouseenter", function(event){
			menuItem.classList.add( "gadget-ui-menu-hovering" );
		});
		// add mouseleave event listener to root menuItem
		mu.addEventListener( "mouseleave", function( event ){
			menuItem.classList.remove( "gadget-ui-menu-hovering" );
		});

    // add listeners to the menu items under the root
		menuItems.forEach( function( mItem ){
			mItem.addEventListener( "mouseenter", function( ev ){
				mItem.classList.add( "gadget-ui-menu-hovering" );
			});
			mItem.addEventListener( "mouseleave", function( evt ){
        if( mItem.parentNode.classList.toString().indexOf( "selected" ) < 0 ){
			    mItem.classList.remove( "gadget-ui-menu-hovering" );
        }
			});
		});
	});
};

Menu.prototype.config = function( options ){
  this.data = ( options.data !== undefined ? options.data : undefined );
  this.datasource = ( options.datasource !== undefined ? options.datasource : undefined );
};
