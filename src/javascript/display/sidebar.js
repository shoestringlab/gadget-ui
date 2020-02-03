
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
  this.animate = (( options.animate === undefined) ? true : options.animate );
  this.delay = ( ( options.delay === undefined ? 300 : options.delay ) );
};

Sidebar.prototype.addControl = function(){
  this.wrapper = document.createElement( "div" );
  if( this.class ){
    gadgetui.util.addClass( this.wrapper, this.class );
  }
  gadgetui.util.addClass( this.wrapper, "gadgetui-sidebar" );

  this.span = document.createElement( "span" );
  gadgetui.util.addClass( this.span, "gadgetui-right-align" );
  gadgetui.util.addClass( this.span, "gadgetui-sidebar-toggle" );
  this.span.innerHTML = `<svg class="feather" name="chevron">
      <use xlink:href="${this.featherPath}/dist/feather-sprite.svg#chevron-left"/>
    </svg>`;

  this.selector.parentNode.insertBefore( this.wrapper, this.selector );
  this.selector.parentNode.removeChild( this.selector );
  this.wrapper.appendChild( this.selector );
  this.wrapper.insertBefore( this.span, this.selector );
  this.width = this.wrapper.offsetWidth;
};

Sidebar.prototype.addBindings = function(){
  let self = this;

  this.span.addEventListener( "click", function( event ){
    self.minimized = !self.minimized;

    if( self.minimized ){
      gadgetui.util.addClass( self.selector, "gadgetui-sidebarContent-minimized" );
      if( typeof Velocity != 'undefined' && this.animate ){

        Velocity( self.wrapper, {
          width: 25
        },{ queue: false, duration: self.delay, complete: function() {
          //_this.icon.setAttribute( "data-glyph", icon );
          gadgetui.util.addClass( self.wrapper, "gadgetui-sidebar-minimized" );
          }
        });
      }else{
        gadgetui.util.addClass( self.wrapper, "gadgetui-sidebar-minimized" );
      }

    }else{
      gadgetui.util.removeClass( self.wrapper, "gadgetui-sidebar-minimized" );

      if( typeof Velocity != 'undefined' && this.animate ){
        Velocity( self.wrapper, {
          width: self.width
        },{ queue: false, duration: self.delay, complete: function() {
          //_this.icon.setAttribute( "data-glyph", icon );
          gadgetui.util.removeClass( self.selector, "gadgetui-sidebarContent-minimized" );
          }
        });
      }else{
        gadgetui.util.removeClass( self.selector, "gadgetui-sidebarContent-minimized" );
      }
    }
    self.setChevron( self.minimized );
  });
};

Sidebar.prototype.setChevron = function( minimized ){
  let chevron = ( minimized ? "chevron-right" : "chevron-left" );
  let svg = this.wrapper.querySelector( "svg" );
  svg.innerHTML = `<use xlink:href="${this.featherPath}/dist/feather-sprite.svg#${chevron}"/>`;
}
