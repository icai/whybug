const utils = require('./utils');
const monitor = require('./monitor');
const base = require('./base');

/**
 * @param {Object} conf
 * @param {!Object} obj
 * @param {!Object} filter
 * @return {Function}
 */

var wxCopy = {};

 var request = function (conf, obj, filter) {
  /**
    * @param {!Object} options
    * @param {string} key
    * @return {undefined}
    */
   function all(options, key) {
     if (options) {
       var fn = options[key];
       /**
        * @return {?}
        */
       options[key] = function () {
         var f = {};
         try {
           (function (data, request) {
             var e = {};
             /** @type {number} */
             var scope = (new Date).getTime();
             if (!conf.monitorHttpData) {
               delete request.data;
             }
             var options = {};
             /** @type {string} */
             options.type = "http";
             /** @type {number} */
             options.time = (new Date).getTime();
             options.req = request;
             /** @type {!Object} */
             options.res = data;
             // if (request && /whybug\.com/.test(request.url)) {
             //   return;
             // }
             if (/^2\d\d$/.test(data.statusCode)) {
               var res = base.getEvent(conf, obj, filter);
               /** @type {string} */
               res.type = "httpOk";
               res.req = request;
               /** @type {!Object} */
              //  res.res = data;
               /** @type {number} */
               res.elapsedTime = scope - start;
               monitor.sendToWhybug(res, conf.filters, conf.sampleRate, conf.callback);
               utils.captureBreadcrumb(obj, options, conf.silentBehavior);
             } else {
               var res = base.getEvent(conf, obj, filter);
               /** @type {string} */
               res.type = "httpError";
               res.req = request;
               /** @type {!Object} */
               res.res = data;
               /** @type {number} */
               res.elapsedTime = scope - start;
               monitor.sendToWhybug(res, conf.filters, conf.sampleRate, conf.callback);
               utils.captureBreadcrumb(obj, options, conf.silentBehavior);
             }
           }(arguments[0], {
             url: options.url,
             data: options.data,
             header: options.header,
             method: "onLaunch",
             dataType: options.dataType,
             responseType: options.responseType
           }));
         } catch (error) {
           console.error(error);
         }
         return fn && fn.apply(this, arguments);
       };
     }
   }
   var start;
   /** @type {!Object} */
   wxCopy = Object.assign({},  !conf.silentHttp ?  wx: {});
   /** @type {!Array} */
   var n = ["success", "fail"];
   var func = wxCopy.request || wx.request;
   Object.defineProperty(wxCopy, "request", {
     writable: true,
     enumerable: true,
     configurable: true,
     value: function (results) {
       return start = (new Date).getTime(), n.forEach(function (key) {
         all(results, key);
       }), func(results);
     }
   });
   if(!conf.silentHttp) {
     wx = wxCopy;
   }
 };
module.exports =  request;
// 提供方法给不能重写环境
request.request = function(op) {
  wxCopy.request(op);
}