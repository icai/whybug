 /**
   * @param {!Object} items
   * @param {!Object} args
   * @return {?}
   */
  function update(items, args) {
    if (!items) {
      return false;
    }
    if (!args) {
      return false;
    }
    if (Object.keys && !Object.keys(args).length) {
      return false;
    }
    var i;
    for (i in args) {
      if (args.hasOwnProperty(i)) {
        if (args[i].constructor === RegExp) {
          if (!args[i].test(items[i])) {
            return false;
          }
        } else {
          if (args[i].constructor === Object) {
            if (!update(items[i], args[i])) {
              return false;
            }
          } else {
            if (args[i].constructor !== String || "inexistence" !== args[i]) {
              return false;
            }
            if (items.hasOwnProperty(i)) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  let _exports = {}
  /**
   * @param {!Object} data
   * @param {!Object} value
   * @return {?}
   */
  _exports.isFiltered = function(data, value) {
    if (!value || !value.length) {
      return false;
    }
    /** @type {number} */
    var i = 0;
    for (; i < value.length; i++) {
      if (update(data, value[i])) {
        return true;
      }
    }
    return false;
  };

 module.exports =  _exports;