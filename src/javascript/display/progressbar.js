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
/*   document.querySelector(this.selector).append(
    '<div class="gadgetui-progressbar-progressbox" name="progressbox_' +
      this.id +
      '" style="display:none;"><div name="filename" class="gadgetui-progressbar-filename">' +
      this.filename +
      '</div><div class="progressbar" name="progressbar_' +
      this.id +
      '"></div ><div name="statustxt" class="statustxt">0%</div></div>'
  ); */
  var pbDiv = document.createElement( "div" );
  pbDiv.setAttribute( "name", "progressbox_" + this.id );
  gadgetui.util.addClass( pbDiv, "gadgetui-progressbar-progressbox" );
  css( pbDiv, "display", "none" );

  var fileDiv = document.createElement( "div" );
  fileDiv.setAttribute( "name", "filename" );
  gadgetui.util.addClass( fileDiv, "gadgetui-progressbar-filename" );
  fileDiv.innerText = this.filename;
  pbDiv.appendChild( fileDiv );

  var pbarDiv = document.createElement( "div" );
  gadgetui.util.addClass( pbarDiv, "progressbar" );
  pbarDiv.setAttribute( "name", "progressbar_" + this.id );
  pbDiv.appendChild( pbarDiv );

  var statusDiv = document.createElement( "div" );
  statusDiv.setAttribute( "name", "statustxt" );
  gadgetui.util.addClass( statusDiv, "statustxt" );
  statusDiv.innertText = "0%";
  pbDiv.appendChild( statusDiv );

  this.selector.appendChild( pbDiv );

  this.progressbox = document.querySelector(
    "div[name='progressbox_" + this.id + "']",
    this.selector
  );
  this.progressbar = document.querySelector(
    "div[name='progressbar_" + this.id + "']",
    this.selector
  );
  this.statustxt = document.querySelector( "div[name='statustxt']", document.querySelector("div[name='progressbox_" + this.id + "']", this.selector) );
  css( this.progressbox, "display", "inline-block" );
  css( this.progressbox, "width", this.width );
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
  if (percent > 50) {
    css(this.statustxt,"color", "#fff");
  }
};

ProgressBar.prototype.update = function(text) {
  this.statustxt.innerHTML = text;
};

ProgressBar.prototype.destroy = function() {
  this.progressbox.parentNode.removeChild( this.progressbox );
};
