const utils = require("./utils");

/**
 * @param {!Object} config
 * @param {!Object} callback
 * @return {undefined}
 */
module.exports =  function(config, callback) {
  /**
   * @param {!Object} match
   * @param {string} name
   * @return {undefined}
   */
  function fn(match, name) {
    var userMethod = match[name];
    /**
     * @return {?}
     */
    match[name] = function() {
      var x = {};
      try {
        if (!("onLoad" !== name && "onShow" !== name)) {
          config.currentPage = utils.getCurrentPage();
        }
        var result = {};
        /** @type {string} */
        result.type = "function";
        /** @type {number} */
        result.time = (new Date).getTime();
        /** @type {string} */
        result.belong = "Page";
        /** @type {string} */
        result.method = name;
        result.route = config.currentPage && config.currentPage.route;
        result.options = config.currentPage && config.currentPage.options;
        if ("onLoad" === name) {
          /** @type {!Arguments} */
          result.args = arguments;
        }
        if (config.monitorMethodArguments && !get(lifeCircle, name)) {
          /** @type {!Arguments} */
          result.args = arguments;
        }
        if (function(value) {
          var c = config.methodWhitelist;
          var e = config.methodBlacklist;
          if ("onPageScroll" === value) {
            return false;
          }
          return c && c.length ? Boolean(get(c, value)) : !e || !e.length || Boolean(!get(e, value));
        }(name)) {
          utils.captureBreadcrumb(callback, result, config.silentBehavior);
        }
      } catch (error) {
        console.error(error);
      }
      return userMethod && userMethod.apply(this, arguments);
    };
  }
  /**
   * @param {!Array} n
   * @param {string} o
   * @return {?}
   */
  function get(n, o) {
      /** @type {number} */
      var i = 0;
      for (; i < n.length; i++) {
        if (n[i] === o) {
          return true;
        }
      }
      return false;
  }
  /** @type {!Array} */
  var lifeCircle = ["onLoad", "onShow", "onReady", "onHide", "onUnload", "onPullDownRefresh", "onReachBottom", "onShareAppMessage"];
  var oldPage = Page;
  Page = function(args) {
    lifeCircle.forEach(function(long) {
      if (args[long]) {
        fn(args, long);
      }
    });
    if (config.monitorMethodCall) {
      Object.keys(args).forEach(function(params) {
        if (!("function" != typeof args[params] || get(lifeCircle, params))) {
          fn(args, params);
        }
      });
    }
    oldPage(args);
  };
};