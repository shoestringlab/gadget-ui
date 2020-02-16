function ProgressBar(selector, options) {
  this.selector = selector;
  this.configure(options);
}

ProgressBar.prototype.configure = function(options) {
  this.id = options.id;
  this.filename = options.filename;
  this.width = options.width;
};

ProgressBar.prototype.render = function() {
  var css = gadgetui.util.setStyle;

  var pbDiv = document.createElement( "div" );
  pbDiv.setAttribute( "name", "progressbox_" + this.id );
  gadgetui.util.addClass( pbDiv, "gadgetui-progressbar-progressbox" );

  var fileDiv = document.createElement( "div" );
  fileDiv.setAttribute( "name", "filename" );
  gadgetui.util.addClass( fileDiv, "gadgetui-progressbar-filename" );
  fileDiv.innerText = " " + this.filename + " ";
  pbDiv.appendChild( fileDiv );

  var pbarDiv = document.createElement( "div" );
  gadgetui.util.addClass( pbarDiv, "gadget-ui-progressbar" );
  pbarDiv.setAttribute( "name", "progressbar_" + this.id );
  pbDiv.appendChild( pbarDiv );

  var statusDiv = document.createElement( "div" );
  statusDiv.setAttribute( "name", "statustxt" );
  gadgetui.util.addClass( statusDiv, "statustxt" );
  statusDiv.innertText = "0%";
  pbDiv.appendChild( statusDiv );

  this.selector.appendChild( pbDiv );

  this.progressbox = this.selector.querySelector( "div[name='progressbox_" + this.id + "']" );
  this.progressbar = this.selector.querySelector( "div[name='progressbar_" + this.id + "']" );
  this.statustxt = this.selector.querySelector( "div[name='progressbox_" + this.id + "'] div[name='statustxt']" );
};

ProgressBar.prototype.start = function() {
  var css = gadgetui.util.setStyle;
  css( this.progressbar, "width", "0" );
  this.statustxt.innerHTML = "0%";
};

ProgressBar.prototype.updatePercent = function(percent) {
  var css = gadgetui.util.setStyle;
  var percentage = percent + "%";
  this.percent = percent;
  css( this.progressbar, "width", percentage);
  this.statustxt.innerHTML = percentage;
};

ProgressBar.prototype.update = function(text) {
  this.statustxt.innerHTML = text;
};

ProgressBar.prototype.destroy = function() {
  this.progressbox.parentNode.removeChild( this.progressbox );
};
