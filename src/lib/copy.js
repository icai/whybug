

var next = function(item, type) {
  if (Array.isArray(item)) {
    return item;
  }
  if (Symbol.iterator in Object(item)) {
    return function(obj, data) {
      /** @type {!Array} */
      var current = [];
      /** @type {boolean} */
      var options = true;
      /** @type {boolean} */
      var id = false;
      var value = void 0;
      try {
        var iter;
        var self = obj[Symbol.iterator]();
        for (; !(options = (iter = self.next()).done) && (current.push(iter.value), !data || current.length !== data); options = true) {
        }
      } catch (x) {
        id = true;
        value = x;
      } finally {
        try {
          if (!options && self.return) {
            self.return();
          }
        } finally {
          if (id) {
            throw value;
          }
        }
      }
      return current;
    }(item, type);
  }
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
};

var value = false;
try {
  var systemInfo = wx.getSystemInfoSync();
  if ("ios" === systemInfo.platform) {
    if (parseInt(systemInfo.system.match(/iOS (\d+)\./)[1]) < 11) {
      value = true;
    }
  }
} catch (error) {
  console.error(error);
}
let _export = {};
_export.copyWithoutCircle = function(obj) {
  let check = function(data) {
    try {
      JSON.stringify(data);
    } catch (error) {
      return !(!error.message.includes("Converting circular structure to JSON") && !error.message.includes("JSON.stringify cannot serialize cyclic structures"));
    }
    return false;
  }(obj);
  if(obj && "object" === (void 0 === obj ? "undefined" : typeof obj) && check) {
    if(value) {
      return {};
    } else {
      return function build(data, specset) {
        try {
          var result = {};
          return Object.entries(data).forEach(function(level) {
            var result = next(level, 2);
            var name = result[0];
            var value = result[1];
            if ("object" === (void 0 === value ? "undefined" : typeof value ) && null !== value) {
              if (specset.has(value)) {
                /** @type {string} */
                result[name] = "property removed because of circular structure";
              } else {
                if (10 < specset.size) {
                  /** @type {string} */
                  result[name] = "property removed to avoid deep recursion";
                } else {
                  specset.add(value);
                  result[name] = build(value, specset);
                }
              }
            } else {
              result[name] = value;
            }
          }), result;
        } catch (x) {
          return data;
        }
      }(obj, new Set([obj]))
    }

  } else {
    return obj;
  }
};

module.exports =  _export;