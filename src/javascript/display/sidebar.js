
function Sidebar( selector, options ){
  this.selector = selector;
  this.minimized = false;
  this.config( options );
  this.addControl();
  this.addBindings();
}

Sidebar.prototype.config = function( options ){
  this.class = ( ( options.class === undefined ? false : options.class ) );
	this.featherPath = options.featherPath || "/node_modules/feather-icons";
};

Sidebar.prototype.addControl = function(){
  this.wrapper = document.createElement( "div" );
  if( this.class ){
    gadgetui.util.addClass( this.wrapper, this.class );
  }
  gadgetui.util.addClass( this.wrapper, "gadgetui-sidebar" );

  this.span = document.createElement( "span" );
  gadgetui.util.addClass( this.span, "right-align" );
  gadgetui.util.addClass( this.span, "gadgetui-sidebar-toggle" );
  this.span.innerHTML = `<svg class="feather" name="chevron">
      <use xlink:href="${this.featherPath}/dist/feather-sprite.svg#chevron-left"/>
    </svg>`;

  this.selector.parentNode.insertBefore( this.wrapper, this.selector );
  this.selector.parentNode.removeChild( this.selector );
  this.wrapper.appendChild( this.selector );
  this.wrapper.insertBefore( this.span, this.selector );
};

Sidebar.prototype.addBindings = function(){
  let self = this;

  this.span.addEventListener( "click", function( event ){
    self.minimized = !self.minimized;
    if( self.minimized ){
      gadgetui.util.addClass( self.wrapper, "gadgetui-sidebar-minimized" );
      gadgetui.util.addClass( self.selector, "gadgetui-sidebarContent-minimized" );
    }else{
      gadgetui.util.removeClass( self.wrapper, "gadgetui-sidebar-minimized" );
      gadgetui.util.removeClass( self.selector, "gadgetui-sidebarContent-minimized" );
    }
    self.setChevron( self.minimized );
  });
};

Sidebar.prototype.setChevron = function( minimized ){
  let chevron = ( minimized ? "chevron-right" : "chevron-left" );
  let svg = this.wrapper.querySelector( "svg" );
  svg.innerHTML = `<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#${chevron}"/>`;
}
