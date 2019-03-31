
const app = require('./app');
const page = require('./page');
const consol = require('./console');
const request = require('./request');
const base = require('./base');

/**
 * @param {!Object} context
 * @param {?} breadcrumb
 * @param {?} name
 * @return {?}
 */
let loaded = false;
module.exports =  function(context, breadcrumb, name) {
  return function(options) {
    loaded = true;
    if(options && 'object' === (typeof options)) {
      ["apikey", "appVersion", "releaseStage", "metaData", "filters", "silent", "monitorHttpData", "monitorMethodCall",
       "monitorMethodArguments", "methodWhitelist", "setUserInfo", "sampleRate", "silentBehavior", "silentApp", 
       "silentPage", "callback", 'silentHttp', 'url'].forEach(function(k) {
        context[k] = options[k];
      });
      if (!(options.silentConsole || options.silentBehavior)) {
        consol(breadcrumb);
      }
      if (!(options.silentInject || options.silent)) {
        app(context, breadcrumb, name);
        page(context, breadcrumb);
      }
      // if (!options.silentHttp) {
      // }
      request(context, breadcrumb, name);

      base.getNetworkType();
      if (options.setSystemInfo) {
        base.getSystemInfo();
      }
      if (options.setLocation) {
        base.getLocation();
      }
    }
  };
};
setTimeout(function() {
  if (false === loaded) {
    console.error("请使用whybug.init初始化!");
  }
}, 1e3);