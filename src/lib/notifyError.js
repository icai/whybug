const monitor = require('./monitor');
const base = require('./base');
/**
 * @param {!Object} instanceState
 * @param {!Object} breadcrumb
 * @param {!Object} self
 * @return {?}
 */
module.exports =  function(instanceState, breadcrumb, self) {
  return function(err, data) {
    try {
      if (instanceState.silent) {
        return;
      }
      if (!err) {
        return void console.error("whybug.notifyError()必须指定error参数!");
      }
      if (data && "object" !== (void 0 === data ? "undefined" : (typeof data))) {
        return void console.error("whybug.notifyError()的option参数类型必须为object!");
      }
      var result = base.getEvent(instanceState, breadcrumb, self);
      if (err instanceof Error) {
        result.error = {
          name : err.name,
          message : err.message,
          stack : err.stack
        };
      } else {
        /** @type {string} */
        result.error = err;
      }
      /** @type {string} */
      result.type = "caught";
      if (data) {
        if (data.name) {
          result.name = data.name;
        }
        if (data.metaData) {
          result.metaData = data.metaData;
        }
      }
      monitor.sendToWhybug(result, instanceState.filters, instanceState.sampleRate, instanceState.callback);
    } catch (error) {
      console.error(error);
    }
  };
};