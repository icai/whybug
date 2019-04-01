import monitor from './monitor';
import base from './base';
/**
 * @param {!Object} config
 * @param {!Object} id
 * @param {!Object} branch
 * @return {?}
 */
export default function(config, id, branch) {
  return function(token, html, obj) {
    try {

      if (config.silent) {
        return;
      }
      
      if (!token) {
        return void console.error("whybug.notify()必须指定name参数!");
      }

      if ("string" != typeof token) {
        return void console.error("whybug.notify()的name参数类型必须为string!");
      }

      if (html && "string" != typeof html) {
        return void console.error("whybug.notify()的message参数类型必须为string!");
      }

      if (obj && "object" !== (void 0 === obj ? "undefined" : (typeof obj))) {
        return void console.error("whybug.notify()的option参数类型必须为object!");
      }
      var data = base.getEvent(config, id, branch);
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
    } catch (error) {
      console.error(error);
    }
  };
};