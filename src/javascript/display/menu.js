function Menu( selector, options ){
  this.selector = selector;
  this.config( options );
  if( this.datasource !== undefined ){
    this.retrieveData();
  }else{
    if( this.data !== undefined ) this.addControl();
    this.addBindings();
  }
}

Menu.prototype.events = ['clicked'];

Menu.prototype.retrieveData = function(){
  this.datasource()
    .then( function( data ){
      this.data = data;
      this.addControl();
    }).bind( this );
};

Menu.prototype.addControl = function(){

  let processItem = function( item, parent ){
    // if there is a label, add the label
    let label = ( item.label !== undefined ? item.label : "" );
    //let element = `<div class="gadget-ui-menu-item">{label}</div>`;
    let element = document.createElement( "div" );
    element.classList.add( "gadget-ui-menu-item" );
    element.innerText = label;
    let image = ( item.image !== undefined ? item.image : "" );
    if( image.length ){
      let imgEl = document.createElement( "img" );
      imgEl.src = image;
      imgEl.classList.add( "gadget-ui-menu-icon" );
      element.appendChild( imgEl );
    }
    if( item.link !== undefined && item.link !== null && ( item.link.length > 0 || typeof item.link === 'function' ) ){
      //element.removeEventListener( "click" );
      element.style.cursor = 'pointer';
      element.addEventListener( "click", function(){
        if( typeof this.fireEvent === 'function' ){
          this.fireEvent( 'clicked', item );
        }
        if( typeof item.link === 'function'){
          item.link();
        }else{
          window.open( item.link );
        }
      }.bind(this));
    }
    // if there is a menuItem, add it
    if( item.menuItem !== undefined ){
      element.appendChild( processMenuItem( item.menuItem, element ) );
    }
    return element;
  }.bind(this);

  let processMenuItem = function( menuItemData, parent ){
    // add <div class="gadget-ui-menu-menuItem"> as child of menu
    let element = document.createElement( "div" );
    element.classList.add( "gadget-ui-menu-menuItem" );
    menuItemData.items.forEach( function( item ){
      element.appendChild( processItem( item, element ) );
    });

    return element;
  };

  let generateMenu = function( menuData ){
    //let element = `<div class="gadget-ui-menu">{menuData.label}</div>`;
    let element = document.createElement( "div" );
    element.classList.add( "gadget-ui-menu" );
    let label = ( menuData.label !== undefined ? menuData.label : "" );
    element.innerText = label;
    let image = ( menuData.image !== undefined ? menuData.image : "" );
    if( image.length ){
      let imgEl = document.createElement( "img" );
      imgEl.src = image;
      imgEl.classList.add( "gadget-ui-menu-icon" );
      element.appendChild( imgEl );
    }
    // process the menuItem
    element.appendChild( processMenuItem( menuData.menuItem, element ) );
    return element;
  };
  let self = this;
  this.data.forEach( function( menu ){
    // for each menu, generate the items and sub-menus
    self.selector.appendChild( generateMenu( menu ) );

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
