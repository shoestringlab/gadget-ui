function Constructor(constructor, args, addBindings) {
  var ix, returnedObj, obj, bindings;

  if (addBindings === true) {
    bindings = EventBindings.getAll();
    for (ix = 0; ix < bindings.length; ix++) {
      if (constructor.prototype[bindings[ix].name] === undefined) {
        constructor.prototype[bindings[ix].name] = bindings[ix].func;
      }
    }
  }

  // construct the object
  obj = Object.create(constructor.prototype);
  returnedObj = constructor.apply(obj, args);
  if (returnedObj === undefined) {
    returnedObj = obj;
  }

  if (addBindings === true) {
    // create specified event list from prototype
    returnedObj.events = {};
    for (ix = 0; ix < constructor.prototype.events.length; ix++) {
      returnedObj.events[constructor.prototype.events[ix]] = [];
    }
  }

  return returnedObj;
}
