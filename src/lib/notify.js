const utils = require('./utils');
const monitor = require('./monitor');
/**
 * @param {!Object} config
 * @param {!Object} id
 * @param {!Object} branch
 * @return {?}
 */
module.exports =  function(config, id, branch) {
  return function(token, html, obj) {
    try {
      /** @type {!Array<string>} */
      var callbackVals = "2|5|6|1|4|3|0".split("|");
      /** @type {number} */
      var callbackCount = 0;
      while (true) {
        switch(callbackVals[callbackCount++]) {
          case "0":
            /** @type {string} */
            data.type = "notification";
            /** @type {number} */
            data.name = token;
            /** @type {string} */
            data.message = html;
            if (obj && obj.metaData) {
              data.metaData = obj.metaData;
            }
            monitor.sendToWhybug(data, config.filters, config.sampleRate, config.callback);
            continue;
          case "1":
            if (html && "string" != typeof html) {
              return void console.error("whybug.notify()的message参数类型必须为string!");
            }
            continue;
          case "2":
            if (config.silent) {
              return;
            }
            continue;
          case "3":
            var data = base.getEvent(config, id, branch);
            continue;
          case "4":
            if (obj && "object" !== (void 0 === obj ? "undefined" : (typeof obj))) {
              return void console.error("whybug.notify()的option参数类型必须为object!");
            }
            continue;
          case "5":
            if (!token) {
              return void console.error("whybug.notify()必须指定name参数!");
            }
            continue;
          case "6":
            if ("string" != typeof token) {
              return void console.error("whybug.notify()的name参数类型必须为string!");
            }
            continue;
        }
        break;
      }
    } catch (error) {
      console.error(error);
    }
  };
};