var EventBindings = {
  on: function(event, func) {
    if (this.events[event] === undefined) {
      this.events[event] = [];
    }
    this.events[event].push(func);
    return this;
  },

  off: function(event) {
    // clear listeners
    this.events[event] = [];
    return this;
  },

  fireEvent: function(key, args) {
    var self = this;
    $.each(this.events[key], function(ix, func) {
      func(self, args);
    });
  },

  getAll: function() {
    return [
      { name: "on", func: this.on },
      { name: "off", func: this.off },
      { name: "fireEvent", func: this.fireEvent }
    ];
  }
};
