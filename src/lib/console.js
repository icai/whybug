
const utils = require('./utils');
const copy = require('./copy');
module.exports =  function(api) {
  ["log", "error", "info", "warn"].forEach(function(tmp) {
    var type;
    var fn;
    type = tmp;
    fn = console[type];
    console[type] = function() {
      try {
        var data = {};
        data.type = "console";
        data.time = (new Date).getTime();
        data.method = type;
        data.args = copy.copyWithoutCircle(arguments);
        utils.captureBreadcrumb(api, data);
      } catch (error) {
        console.error(error);
      }
      if ("error" === type && arguments[0] && /^\[non-writable\] modification of global variable ".+" is not allowed when using plugins at app\.json\.$/.test(arguments[0])) {
        if (fn) {
          fn.apply(this, arguments);
        }
        console.error("当使用小程序插件时，微信禁止Whybug重写App/Page/wx等全局变量，请使用whybug.init将silentInject设为true，并使用whybug.notifyError上报onError捕获的错误。详情请查看Whybug文档");
      } else {
        if (fn) {
          fn.apply(this, arguments);
        }
      }
    };
  });
};