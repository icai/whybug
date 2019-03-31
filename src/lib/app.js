


const utils = require('./utils');
const monitor = require('./monitor');
const base = require('./base');

/**
 * @param {!Object} data
 * @param {!Object} breadcrumb
 * @param {!Object} client
 * @return {undefined}
 */
module.exports =  function (data, breadcrumb, client) {
  var app = {};
  var handle = App;
  app.onLaunch = function (options) {
    data.scene = options && options.scene;
    var result = {
      type: "function",
      time: (new Date).getTime(),
      belong: "App",
      method: "onLaunch",
      path: options && options.path,
      query: options && options.query,
      scene: options && options.scene
    };
    utils.captureBreadcrumb(breadcrumb, result, data.silentBehavior);
  };

  app.onShow = function (options) {
    data.scene = options && options.scene;
    var result = {
      type: "function",
      time: (new Date).getTime(),
      belong: "App",
      method: "onShow",
      path: options && options.path,
      query: options && options.query,
      scene: options && options.scene
    };
    utils.captureBreadcrumb(breadcrumb, result, data.silentBehavior);
  };
  app.onHide = function () {
    var entry = {
      type: "function",
      time: (new Date).getTime(),
      belong: "App",
      method: "onHide",
      route: data.currentPage && data.currentPage.route,
      options: data.currentPage && data.currentPage.options
    };
    utils.captureBreadcrumb(breadcrumb, entry, data.silentBehavior);
  };

  app.onError = function (err) {
    if (err) {
      var s = base.getEvent(data, breadcrumb, client);
      /** @type {string} */
      s.error = err;
      /** @type {string} */
      s.type = "uncaught";
      monitor.sendToWhybug(s, data.filters, data.sampleRate, data.callback);
    }
  };

  App = function (data) {
    Object.keys(app).forEach(function (keys) {
      var _ = {};
      var item;
      var type;
      var handler;
      var fn;
      handler = app[type = keys];
      fn = (item = data)[type];
      item[type] = function () {
        try {
          handler.apply(this, arguments);
        } catch (error) {
          console.error(error);
        }
        return fn && fn.apply(this, arguments);
      };
    });
    handle(data);
  };
};