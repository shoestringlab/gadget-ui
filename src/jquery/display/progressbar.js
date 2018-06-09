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
  $(this.selector).append(
    '<div class="gadgetui-progressbar-progressbox" name="progressbox_' +
      this.id +
      '" style="display:none;"><div name="filename" class="gadgetui-progressbar-filename">' +
      this.filename +
      '</div><div class="progressbar" name="progressbar_' +
      this.id +
      '"></div ><div name="statustxt" class="statustxt">0%</div></div>'
  );
  this.progressbox = $(
    "div[name='progressbox_" + this.id + "']",
    this.selector
  );
  this.progressbar = $(
    "div[name='progressbar_" + this.id + "']",
    this.selector
  );
  this.statustxt = $(
    "div[name='statustxt']",
    $("div[name='progressbox_" + this.id + "']", this.selector)
  );
  this.progressbox.css("display", "inline-block").css("width", this.width);
};

ProgressBar.prototype.start = function() {
  this.progressbar.width(0);
  this.statustxt.html("0%");
};

ProgressBar.prototype.updatePercent = function(percent) {
  var percentage = percent + "%";
  this.percent = percent;
  this.progressbar.width(percentage);
  this.statustxt.html(percentage);
  if (percent > 50) {
    this.statustxt.css("color", "#fff");
  }
};

ProgressBar.prototype.update = function(text) {
  this.statustxt.html(text);
};

ProgressBar.prototype.destroy = function() {
  this.progressbox.remove();
};
