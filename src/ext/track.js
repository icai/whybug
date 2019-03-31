// WARNING! This file contains some subset of JS that is not supported by type inference.
// You can try checking 'Transpile to ES5' checkbox if you want the types to be inferred
'use strict';
Object.defineProperty(exports, "__esModule", {
  value : true
});
class Uploader {
  constructor(options) {
    this.growingio = options;
    this.messageQueue = [];
    this.uploadingQueue = [];
    this.uploadTimer = null;
    this.projectId = this.growingio.projectId;
    this.appId = this.growingio.appId;
    this.host = this.growingio.host;
    this.url = `${this.host}/projects/${this.projectId}/apps/${this.appId}/collect`;
  }
  upload(key) {
    this.messageQueue.push(key);
    const ARMOR_WIDTH = this.messageQueue.length;
    if (ARMOR_WIDTH > 100) {
      this.messageQueue = this.messageQueue.slice(ARMOR_WIDTH - 100);
    }
    if (!this.uploadTimer) {
      this.uploadTimer = setTimeout(() => {
        this._flush();
        this.uploadTimer = null;
      }, 1e3);
    }
  }
  forceFlush() {
    if (this.uploadTimer) {
      clearTimeout(this.uploadTimer);
      this.uploadTimer = null;
    }
    this._flush();
  }
  _flush() {
    this.uploadingQueue = this.messageQueue.slice();
    this.messageQueue = [];
    if (this.uploadingQueue.length > 0) {
      wx.request({
        url : `${this.url}?stm=${Date.now()}`,
        header : {
          "content-type" : "application/json"
        },
        method : "POST",
        data : this.uploadingQueue,
        success : () => {
          if (this.messageQueue.length > 0) {
            this._flush();
          }
        },
        fail : () => {
          this.messageQueue = this.uploadingQueue.concat(this.messageQueue);
        }
      });
    }
  }
}
var Utils = {
  sdkVer : "1.8.9",
  devVer : 1,
  guid : function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = 16 * Math.random() | 0;
      return ("x" == c ? r : 3 & r | 8).toString(16);
    });
  },
  getScreenHeight : function(params) {
    return Math.round(params.screenHeight * params.pixelRatio);
  },
  getScreenWidth : function(params) {
    return Math.round(params.screenWidth * params.pixelRatio);
  },
  getOS : function(userAgent) {
    if (userAgent) {
      var ua = userAgent.toLowerCase();
      return -1 != ua.indexOf("android") ? "Weixin-Android" : -1 != ua.indexOf("ios") ? "Weixin-iOS" : userAgent;
    }
  },
  getOSV : (canCreateDiscussions) => {
    return `Weixin ${canCreateDiscussions}`;
  },
  isEmpty : (val) => {
    var i;
    for (i in val) {
      if (val.hasOwnProperty(i)) {
        return false;
      }
    }
    return true;
  }
};
class Page$1 {
  constructor() {
    this.queries = {};
  }
  touch(data) {
    this.path = data.route;
    this.time = Date.now();
    this.query = this.queries[data.route] ? this.queries[data.route] : void 0;
  }
  addQuery(query, callback) {
    this.queries[query.route] = callback ? this._getQuery(callback) : null;
  }
  _getQuery(env) {
    return Object.keys(env).map(($1) => {
      return `${$1}=${env[$1]}`;
    }).join("&");
  }
}
const eventTypeMap = {
  tap : ["tap", "click"],
  longtap : ["longtap"],
  input : ["input"],
  blur : ["change", "blur"],
  submit : ["submit"],
  focus : ["focus"]
};
const fnExpRE = /^function[^\(]*\([^\)]+\).*[^\.]+\.([^\(]+)\(.*/;
function getComKey(node) {
  return node && node.$attrs ? node.$attrs.mpcomid : "0";
}
function getVM(id, location) {
  if (void 0 === location) {
    location = [];
  }
  var node = location.slice(1);
  return node.length ? node.reduce(function(child, roundName) {
    var length = child.$children.length;
    var i = 0;
    for (; length > i; i++) {
      var match = child.$children[i];
      if (getComKey(match) === roundName) {
        return child = match;
      }
    }
    return child;
  }, id) : id;
}
function getHandle(i, name, item) {
  if (void 0 === item) {
    item = [];
  }
  var res = [];
  if (!i || !i.tag) {
    return res;
  }
  var vnode = i || {};
  var data = vnode.data;
  if (void 0 === data) {
    data = {};
  }
  var children = vnode.children;
  if (void 0 === children) {
    children = [];
  }
  var _this = vnode.componentInstance;
  if (_this) {
    Object.keys(_this.$slots).forEach(function(key) {
      var val = _this.$slots[key];
      (Array.isArray(val) ? val : [val]).forEach(function(i) {
        res = res.concat(getHandle(i, name, item));
      });
    });
  } else {
    children.forEach(function(i) {
      res = res.concat(getHandle(i, name, item));
    });
  }
  var msg = data.attrs;
  var x = data.on;
  return msg && x && msg.eventid === name && item.forEach(function(kk) {
    var val = x[kk];
    if ("function" == typeof val) {
      res.push(val);
    } else {
      if (Array.isArray(val)) {
        res = res.concat(val);
      }
    }
  }), res;
}
class VueProxy {
  constructor(opt_lastResultName) {
    this.vueVM = opt_lastResultName;
  }
  getHandle(item) {
    var event = item.type;
    var el = item.target;
    if (void 0 === el) {
      el = {};
    }
    var data = (item.currentTarget || el).dataset;
    if (void 0 === data) {
      data = {};
    }
    var s = data.comkey;
    if (void 0 === s) {
      s = "";
    }
    var $el = data.eventid;
    var i = getVM(this.vueVM, s.split(","));
    if (i) {
      var $handle = getHandle(i._vnode, $el, eventTypeMap[event] || [event]);
      if ($handle.length) {
        var result = $handle[0];
        if (result.isProxied) {
          return result.proxiedName;
        }
        try {
          var value = ("" + result).replace("\n", "");
          if (value.match(fnExpRE)) {
            var replaceArr = fnExpRE.exec(value);
            if (replaceArr && replaceArr.length > 1) {
              return replaceArr[1];
            }
          }
        } catch (t) {
        }
        return result.name;
      }
    }
  }
}
class Observer {
  constructor(options) {
    this.growingio = options;
    this.weixin = options.weixin;
    this.currentPage = new Page$1;
    this.scene = null;
    this._sessionId = null;
    this.cs1 = null;
    this.lastPageEvent = void 0;
    this.lastVstArgs = void 0;
    this.lastCloseTime = null;
    this.lastScene = void 0;
    this.keepAlive = options.keepAlive;
    this.isPauseSession = false;
    this._observer = null;
    this.CLICK_TYPE = {
      tap : "clck",
      longpress : "lngprss",
      longtap : "lngprss"
    };
  }
  get sessionId() {
    return null === this._sessionId && (this._sessionId = Utils.guid()), this._sessionId;
  }
  resetSessionId() {
    this._sessionId = null;
  }
  pauseSession() {
    this.isPauseSession = true;
  }
  getVisitorId() {
    return this.weixin.uid;
  }
  getUserId() {
    return this.cs1;
  }
  setUserId(value) {
    var port = value + "";
    if (port && 100 > port.length) {
      this.cs1 = port;
      if (this.lastPageEvent) {
        this._sendEvent(this.lastPageEvent);
      }
    }
  }
  clearUserId() {
    this.cs1 = null;
  }
  collectImp(data, parent = null) {
    if (this.growingio.vue) {
      data = data.$mp.page;
    }
    if (this.growingio.taro) {
      data = data.$scope;
    }
    var src_dest_map = {};
    if (this._observer) {
      this._observer.disconnect();
    }
    this._observer = data.isComponent ? data.createIntersectionObserver({
      observeAll : true
    }) : wx.createIntersectionObserver(data, {
      observeAll : true
    });
    this._relative = parent ? this._observer.relativeTo(parent) : this._observer.relativeToViewport();
    this._relative.observe(".growing_collect_imp", (item) => {
      if (item.id && !src_dest_map[item.id]) {
        this.track(item.dataset.gioTrack && item.dataset.gioTrack.name, item.dataset.gioTrack && item.dataset.gioTrack.properties);
        src_dest_map[item.id] = true;
      }
    });
  }
  appListener(object, e, key) {
    if (!this.isPauseSession) {
      if (this.growingio.debug) {
        console.log("App.", e, Date.now());
      }
      if ("onShow" == e) {
        this._parseScene(key);
        if (!this.lastCloseTime || Date.now() - this.lastCloseTime > this.keepAlive || this.lastScene && this.scene !== this.lastScene) {
          this.resetSessionId();
          this.sendVisitEvent(key, this.growingio.getLocationType);
          this.lastVstArgs = key;
          this.lastPageEvent = void 0;
        } else {
          this.useLastPageTime = true;
        }
      } else {
        if ("onHide" == e) {
          this.lastScene = this.scene;
          this.growingio.forceFlush();
          this.weixin.syncStorage();
          if (!this.isPauseSession) {
            this.lastCloseTime = Date.now();
            this.sendVisitCloseEvent();
          }
        } else {
          if ("onError" == e) {
            this.sendErrorEvent(key);
          }
        }
      }
    }
  }
  pageListener(data, key, options) {
    if (this.growingio.debug && console.log("Page.", data.route, "#", key, Date.now()), "onShow" === key) {
      if (this.isPauseSession) {
        this.isPauseSession = false;
      } else {
        this.currentPage.touch(data);
        this.sendPage(data);
      }
    } else {
      if ("onLoad" === key) {
        if (!Utils.isEmpty(key = options[0])) {
          this.currentPage.addQuery(data, key);
        }
      } else {
        if ("onHide" === key) {
          if (this._observer) {
            this._observer.disconnect();
          }
        } else {
          if ("onShareAppMessage" === key) {
            var key = null;
            var formRef = null;
            if (2 > options.length) {
              if (1 === options.length) {
                if (options[0].from) {
                  key = options[0];
                } else {
                  if (options[0].title) {
                    formRef = options[0];
                  }
                }
              }
            } else {
              key = options[0];
              formRef = options[1];
            }
            this.pauseSession();
            this.sendPageShare(data, key, formRef);
          } else {
            if ("onTabItemTap" === key) {
              this.sendTabClick(options[0]);
            }
          }
        }
      }
    }
  }
  actionListener(data, key) {
    if ("handleProxy" === key && this.growingio.vueRootVMs && this.growingio.vueRootVMs[this.currentPage.path]) {
      let curDockerIdx = (new VueProxy(this.growingio.vueRootVMs[this.currentPage.path])).getHandle(data);
      if (curDockerIdx) {
        key = curDockerIdx;
      }
    }
    if (this.growingio.taroRootVMs && this.growingio.taroRootVMs[key]) {
      key = this.growingio.taroRootVMs[key];
    }
    if (this.growingio.debug) {
      console.log("Click on ", key, Date.now());
    }
    if ("tap" === data.type || "longpress" === data.type) {
      this.sendClick(data, key);
    } else {
      if (-1 !== ["change", "confirm", "blur"].indexOf(data.type)) {
        this.sendChange(data, key);
      } else {
        if ("getuserinfo" === data.type) {
          this.sendClick(data, key);
          if (data.detail && data.detail.userInfo) {
            this.setVisitor(data.detail.userInfo);
          }
        } else {
          if ("getphonenumber" === data.type) {
            this.sendClick(data, key);
          } else {
            if ("contact" === data.type) {
              this.sendClick(data, key);
            } else {
              if ("submit" === data.type) {
                this.sendSubmit(data, key);
              }
            }
          }
        }
      }
    }
  }
  getLocation(artistTrack = "wgs84") {
    this.growingio.getLocation = true;
    this.sendVisitEvent(this.lastVstArgs, artistTrack);
  }
  track(id, options) {
    if (null !== id && void 0 !== id && 0 !== id.length) {
      var params = {
        t : "cstm",
        ptm : this.currentPage.time,
        p : this.currentPage.path,
        q : this.currentPage.query,
        n : id
      };
      if (null !== options && "object" == typeof options) {
        params.var = options;
      }
      this._sendEvent(params);
    }
  }
  identify(options, callback) {
    if (void 0 !== options && 0 !== options.length) {
      this.growingio.login(options);
      this._sendEvent({
        t : "vstr",
        var : {
          openid : options,
          unionid : callback
        }
      });
    }
  }
  setVisitor(key) {
    this._sendEvent({
      t : "vstr",
      var : key
    });
  }
  setUser(callback) {
    this._sendEvent({
      t : "ppl",
      var : callback
    });
  }
  setPage(options) {
    this._sendEvent({
      t : "pvar",
      ptm : this.currentPage.time,
      p : this.currentPage.path,
      q : this.currentPage.query,
      var : options
    });
  }
  setEvar(key) {
    this._sendEvent({
      t : "evar",
      var : key
    });
  }
  sendVisitEvent(object, location = "wgs84") {
    location = -1 !== ["wgs84", "gcj02"].indexOf(location) ? location : "wgs84";
    var config = this.weixin.systemInfo;
    var options = {
      t : "vst",
      tm : Date.now(),
      av : Utils.sdkVer,
      db : config.brand,
      dm : config.model.replace(/<.*>/, ""),
      sh : Utils.getScreenHeight(config),
      sw : Utils.getScreenWidth(config),
      os : Utils.getOS(config.platform),
      osv : Utils.getOSV(config.version),
      l : config.language
    };
    if (this.growingio.appVer && (options.cv = this.growingio.appVer + ""), object.length > 0) {
      var result = object[0];
      options.p = result.path;
      if (!Utils.isEmpty(result.query)) {
        options.q = this.currentPage._getQuery(result.query);
      }
      options.ch = `scn:${this.scene}`;
      if (result.referrerInfo && result.referrerInfo.appId) {
        options.rf = result.referrerInfo.appId;
      }
    }
    this.weixin.getNetworkType().then((res) => {
      if (res) {
        options.nt = res.networkType;
        if (this.growingio.getLocation) {
          this.weixin.requestLocation(location).then(() => {
            if (null != this.weixin.location) {
              options.lat = this.weixin.location.latitude;
              options.lng = this.weixin.location.longitude;
            }
            this._sendEvent(options);
          });
        } else {
          this._sendEvent(options);
        }
      }
    });
  }
  sendVisitCloseEvent() {
    this._sendEvent({
      t : "cls",
      p : this.currentPage.path,
      q : this.currentPage.query
    });
  }
  sendErrorEvent(value) {
    if (value && value.length > 0) {
      let lines = value[0].split("\n");
      if (lines && lines.length > 1) {
        let args = lines[1].split(";");
        if (args && args.length > 1) {
          let parts = args[1].match(/at ([^ ]+) page (.*) function/);
          let option = {
            key : lines[0],
            error : args[0]
          };
          if (parts && parts.length > 2) {
            option.page = parts[1];
            option.function = parts[2];
          }
          this._sendEvent({
            t : "cstm",
            ptm : this.currentPage.time,
            p : this.currentPage.path,
            q : this.currentPage.query,
            n : "onError",
            var : option
          });
        }
      }
    }
  }
  sendPage(context) {
    var data = {
      t : "page",
      tm : this.currentPage.time,
      p : this.currentPage.path,
      q : this.currentPage.query
    };
    if (this.lastPageEvent) {
      data.rp = this.lastPageEvent.p;
      if (this.useLastPageTime) {
        data.tm = this.lastPageEvent.tm;
        this.useLastPageTime = false;
      }
    } else {
      data.rp = this.scene ? `scn:${this.scene}` : null;
    }
    if (context.data && context.data.pvar) {
      data.var = context.data.pvar;
    }
    var i = this.weixin.getPageTitle(context);
    if (i && i.length > 0) {
      data.tl = i;
    }
    this._sendEvent(data);
    this.lastPageEvent = data;
  }
  sendPageShare(callback, options, data) {
    this._sendEvent({
      t : "cstm",
      ptm : this.currentPage.time,
      p : this.currentPage.path,
      q : this.currentPage.query,
      n : "onShareAppMessage",
      var : {
        from : options ? options.from : void 0,
        target : options && options.target ? options.target.id : void 0,
        title : data ? data.title : void 0,
        path : data ? data.path : void 0
      }
    });
  }
  sendClick(e, value) {
    var state = {
      t : this.CLICK_TYPE[e.type] || "clck",
      ptm : this.currentPage.time,
      p : this.currentPage.path,
      q : this.currentPage.query
    };
    var link = e.currentTarget;
    var b = {
      x : `${link.id}#${value}`
    };
    if (link.dataset.title) {
      b.v = link.dataset.title;
    } else {
      if (link.dataset.src) {
        b.h = link.dataset.src;
      }
    }
    if (void 0 !== link.dataset.index) {
      b.idx = /^[\d]+$/.test(link.dataset.index) ? parseInt(link.dataset.index) : -1;
    }
    state.e = [b];
    this._sendEvent(state);
  }
  sendSubmit(items, key) {
    var state = {
      t : "sbmt",
      ptm : this.currentPage.time,
      p : this.currentPage.path,
      q : this.currentPage.query
    };
    state.e = [{
      x : `${items.currentTarget.id}#${key}`
    }];
    this._sendEvent(state);
  }
  sendChange(e, value) {
    var params = {
      t : "chng",
      ptm : this.currentPage.time,
      p : this.currentPage.path,
      q : this.currentPage.query
    };
    var overEl = e.currentTarget;
    var point = {
      x : `${overEl.id}#${value}`
    };
    if (-1 !== ["blur", "change", "confirm"].indexOf(e.type) && overEl.dataset.growingTrack) {
      if (!e.detail.value || 0 === e.detail.value.length) {
        return;
      }
      if ("string" == typeof e.detail.value) {
        point.v = e.detail.value;
      } else {
        if ("[object Array]" === Object.prototype.toString.call(e.detail.value)) {
          point.v = e.detail.value.join(",");
        }
      }
    }
    if (!("change" === e.type && e.detail && e.detail.source && "autoplay" === e.detail.source)) {
      params.e = [point];
      this._sendEvent(params);
    }
  }
  sendTabClick(data) {
    var params = {
      t : "clck",
      ptm : this.currentPage.time,
      p : this.currentPage.path,
      q : this.currentPage.query,
      e : [{
        x : "#onTabItemTap",
        v : data.text,
        idx : data.index,
        h : JSON.stringify(data.pagePath)
      }]
    };
    this._sendEvent(params);
  }
  _sendEvent(data) {
    data.u = this.weixin.uid;
    data.s = this.sessionId;
    data.tm = data.tm || Date.now();
    data.d = this.growingio.appId;
    data.b = "MinP";
    if (null !== this.cs1) {
      data.cs1 = this.cs1;
    }
    this.growingio.upload(data);
  }
  _parseScene(items) {
    if (items.length > 0) {
      var node = items[0];
      if (node.scene) {
        this.scene = node.scene;
      }
    }
  }
}
class Weixin {
  constructor(options) {
    this._location = null;
    this._systemInfo = null;
    this._uid = wx.getStorageSync("_growing_uid_");
    if (this._uid && 36 !== this._uid.length) {
      options.forceLogin = false;
    }
    this._esid = wx.getStorageSync("_growing_esid_");
  }
  get location() {
    return this._location;
  }
  get systemInfo() {
    return null == this._systemInfo && (this._systemInfo = wx.getSystemInfoSync()), this._systemInfo;
  }
  set esid(canCreateDiscussions) {
    this._esid = canCreateDiscussions;
    wx.setStorageSync("_growing_esid_", this._esid);
  }
  get esid() {
    return this._esid || (this._esid = 1), this._esid;
  }
  set uid(uid) {
    this._uid = uid;
    wx.setStorageSync("_growing_uid_", this._uid);
  }
  get uid() {
    return this._uid || (this.uid = Utils.guid()), this._uid;
  }
  syncStorage() {
    if (!wx.getStorageSync("_growing_uid_")) {
      wx.setStorageSync("_growing_uid_", this._uid);
    }
  }
  requestLocation(url) {
    return new Promise((s) => {
      this._getLocation(url).then((g) => {
        return this._location = g, s(g);
      });
    });
  }
  getNetworkType() {
    return new Promise((when) => {
      wx.getNetworkType({
        success : (data) => {
          return when(data);
        },
        fail : () => {
          return when(null);
        }
      });
    });
  }
  getPageTitle(context) {
    var linkTitle = "";
    try {
      if (context.data.title && context.data.title.length > 0 && (linkTitle = Array.isArray(context.data.title) ? context.data.title.join(" ") : context.data.title), 0 === linkTitle.length && __wxConfig) {
        if (__wxConfig.tabBar) {
          var selected_option = __wxConfig.tabBar.list.find((o) => {
            return o.pathPath == context.route || o.pagePath == `${context.route}.html`;
          });
          if (selected_option && selected_option.text) {
            linkTitle = selected_option.text;
          }
        }
        if (0 == linkTitle.length) {
          var nwWin = __wxConfig.page[context.route] || __wxConfig.page[`${context.route}.html`];
          linkTitle = nwWin ? nwWin.window.navigationBarTitleText : __wxConfig.global.window.navigationBarTitleText;
        }
      }
    } catch (t) {
    }
    return linkTitle;
  }
  _getSetting() {
    return new Promise((actionCreator) => {
      wx.getSetting({
        success : actionCreator,
        fail : actionCreator
      });
    });
  }
  _getLocation(name) {
    return new Promise((callback) => {
      wx.getLocation({
        type : name,
        success : callback,
        fail : function() {
          return callback(null);
        }
      });
    });
  }
}
var VdsInstrumentAgent = {
  defaultPageCallbacks : {},
  defaultAppCallbacks : {},
  appHandlers : ["onShow", "onHide", "onError"],
  pageHandlers : ["onLoad", "onShow", "onShareAppMessage", "onTabItemTap", "onHide"],
  actionEventTypes : ["tap", "longpress", "blur", "change", "submit", "confirm", "getuserinfo", "getphonenumber", "contact"],
  originalPage : Page,
  originalApp : App,
  originalComponent : Component,
  originalBehavior : Behavior,
  hook : function(e, cb) {
    return function() {
      var p;
      var err = arguments ? arguments[0] : void 0;
      if (err && err.currentTarget && -1 != VdsInstrumentAgent.actionEventTypes.indexOf(err.type)) {
        try {
          VdsInstrumentAgent.observer.actionListener(err, e);
        } catch (logValues) {
          console.error(logValues);
        }
      }
      if (this._growing_app_ && "onShow" !== e ? p = cb.apply(this, arguments) : this._growing_page_ && -1 === ["onShow", "onLoad", "onTabItemTap", "onHide"].indexOf(e) && (p = cb.apply(this, arguments)), this._growing_app_ && -1 !== VdsInstrumentAgent.appHandlers.indexOf(e)) {
        try {
          VdsInstrumentAgent.defaultAppCallbacks[e].apply(this, arguments);
        } catch (logValues) {
          console.error(logValues);
        }
        if ("onShow" === e) {
          p = cb.apply(this, arguments);
        }
      }
      if (this._growing_page_ && -1 !== VdsInstrumentAgent.pageHandlers.indexOf(e)) {
        var s = Array.prototype.slice.call(arguments);
        if (p) {
          s.push(p);
        }
        try {
          VdsInstrumentAgent.defaultPageCallbacks[e].apply(this, s);
        } catch (logValues) {
          console.error(logValues);
        }
        if (-1 !== ["onShow", "onLoad", "onTabItemTap", "onHide"].indexOf(e)) {
          p = cb.apply(this, arguments);
        } else {
          var req = VdsInstrumentAgent.observer.growingio;
          if (req && req.followShare && p && p.path) {
            p.path = -1 === p.path.indexOf("?") ? p.path + "?suid=" + req.weixin.uid : p.path + "&suid=" + req.weixin.uid;
          }
        }
      }
      return p;
    };
  },
  hookComponent : function(fileIndex, callback) {
    return function() {
      var err = arguments ? arguments[0] : void 0;
      if (err && err.currentTarget && -1 != VdsInstrumentAgent.actionEventTypes.indexOf(err.type)) {
        try {
          VdsInstrumentAgent.observer.actionListener(err, fileIndex);
        } catch (logValues) {
          console.error(logValues);
        }
      }
      return callback.apply(this, arguments);
    };
  },
  instrument : function(data) {
    var k;
    for (k in data) {
      if ("function" == typeof data[k]) {
        data[k] = this.hook(k, data[k]);
      }
    }
    return data._growing_app_ && VdsInstrumentAgent.appHandlers.map(function(carousel) {
      if (!data[carousel]) {
        data[carousel] = VdsInstrumentAgent.defaultAppCallbacks[carousel];
      }
    }), data._growing_page_ && VdsInstrumentAgent.pageHandlers.map(function(carousel) {
      if (!(data[carousel] || "onShareAppMessage" === carousel)) {
        data[carousel] = VdsInstrumentAgent.defaultPageCallbacks[carousel];
      }
    }), data;
  },
  instrumentTaroPageComponent : function(b) {
    if (b.methods) {
      let sysIcons = b.methods;
      for (let i in sysIcons) {
        if ("function" == typeof sysIcons[i] && -1 != VdsInstrumentAgent.pageHandlers.indexOf(i)) {
          const oldSetupComputes = sysIcons[i];
          b.methods[i] = function() {
            return VdsInstrumentAgent.observer.pageListener(this, i, arguments), oldSetupComputes.apply(this, arguments);
          };
        }
      }
    }
    return b;
  },
  instrumentComponent : function(t) {
    if (t.methods) {
      let intCfgs = t.methods;
      for (let k in intCfgs) {
        if ("function" == typeof intCfgs[k]) {
          t.methods[k] = this.hookComponent(k, intCfgs[k]);
        }
      }
    }
    return t;
  },
  GrowingPage : function(data) {
    return data._growing_page_ = true, VdsInstrumentAgent.originalPage(VdsInstrumentAgent.instrument(data));
  },
  GrowingComponent : function(tResult) {
    return VdsInstrumentAgent.originalComponent(VdsInstrumentAgent.instrumentComponent(tResult));
  },
  GrowingBehavior : function(tResult) {
    return VdsInstrumentAgent.originalBehavior(VdsInstrumentAgent.instrumentComponent(tResult));
  },
  GrowingApp : function(data) {
    return data._growing_app_ = true, VdsInstrumentAgent.originalApp(VdsInstrumentAgent.instrument(data));
  },
  initInstrument : function(observer, holdWeak) {
    VdsInstrumentAgent.observer = observer;
    VdsInstrumentAgent.pageHandlers.forEach(function(statisticName) {
      VdsInstrumentAgent.defaultPageCallbacks[statisticName] = function() {
        if (this.__route__) {
          VdsInstrumentAgent.observer.pageListener(this, statisticName, arguments);
        }
      };
    });
    VdsInstrumentAgent.appHandlers.forEach(function(statisticName) {
      VdsInstrumentAgent.defaultAppCallbacks[statisticName] = function() {
        VdsInstrumentAgent.observer.appListener(this, statisticName, arguments);
      };
    });
    if (holdWeak) {
      global.GioPage = VdsInstrumentAgent.GrowingPage;
      global.GioApp = VdsInstrumentAgent.GrowingApp;
      global.GioComponent = VdsInstrumentAgent.GrowingBehavior;
      global.GioBehavior = VdsInstrumentAgent.GrowingBehavior;
    } else {
      Page = function() {
        return VdsInstrumentAgent.GrowingPage(arguments[0]);
      };
      App = function() {
        return VdsInstrumentAgent.GrowingApp(arguments[0]);
      };
      Component = function() {
        return VdsInstrumentAgent.GrowingComponent(arguments[0]);
      };
      Behavior = function() {
        return VdsInstrumentAgent.GrowingBehavior(arguments[0]);
      };
    }
  }
};
if (!Object.getOwnPropertyDescriptors) {
  Object.getOwnPropertyDescriptors = function(obj) {
    const descriptors = {};
    for (let key of Reflect.ownKeys(obj)) {
      descriptors[key] = Object.getOwnPropertyDescriptor(obj, key);
    }
    return descriptors;
  };
}
class GrowingIO {
  constructor() {
    this.uploadingMessages = [];
  }
  init(id, appId, self = {}) {
    this.projectId = id;
    this.appId = appId;
    this.appVer = self.version;
    this.debug = self.debug || false;
    this.forceLogin = self.forceLogin || false;
    this.followShare = self.followShare || false;
    this.usePlugin = self.usePlugin || false;
    this.getLocation = self.getLocation || false;
    this.getLocationType = "object" == typeof self.getLocation && self.getLocation.type || "wgs84";
    this.keepAlive = +self.keepAlive || 3E4;
    this.vue = !!self.vue;
    this.taro = !!self.taro;
    this.stopTrack = !!self.stopTrack;
    this.weixin = new Weixin(this);
    this.esid = this.weixin.esid;
    this.host = "https://wxapi.growingio.com";
    if (self.host && self.host.indexOf("http") >= 0) {
      this.host = "https://" + self.host.slice(self.host.indexOf("://") + 3);
    }
    this.uploader = new Uploader(this);
    this.observer = new Observer(this);
    if (self.vue) {
      this.vueRootVMs = {};
      this._proxyVue(self.vue);
    }
    if (self.taro) {
      this.taroRootVMs = {};
      this._proxyTaro(self.taro);
    }
    if (self.cml) {
      this._proxyCml(self.cml);
    }
    if (!self.stopTrack) {
      this._start();
    }
  }
  setVue(mmCoreSplitViewBlock) {
    if (!this.vueRootVMs) {
      this.vueRootVMs = {};
    }
    this.vue = true;
    this._proxyVue(mmCoreSplitViewBlock);
  }
  setStopTrack(canCreateDiscussions) {
    this.stopTrack = canCreateDiscussions;
  }
  login(user) {
    if (this.forceLogin) {
      var o;
      for (o of this.weixin.uid = user, this.forceLogin = false, this.uploadingMessages) {
        o.u = user;
        this._upload(o);
      }
    }
  }
  upload(server) {
    if (!this.stopTrack) {
      if (this.forceLogin) {
        this.uploadingMessages.push(server);
      } else {
        this._upload(server);
      }
    }
  }
  forceFlush() {
    this.weixin.esid = this.esid;
    this.uploader.forceFlush();
  }
  proxy(name, line) {
    try {
      if ("setVue" === name) {
        this.setVue(line[0]);
      } else {
        if ("setStopTrack" === name) {
          this.setStopTrack(line[0]);
        } else {
          if (this.observer && this.observer[name]) {
            return this.observer[name].apply(this.observer, line);
          }
        }
      }
    } catch (logValues) {
      console.error(logValues);
    }
  }
  _start() {
    VdsInstrumentAgent.initInstrument(this.observer, this.usePlugin);
    try {
      if (global) {
        global.App = App;
        global.Page = Page;
        global.Component = Component;
      }
    } catch (logValues) {
      console.error(logValues);
    }
  }
  _upload(file) {
    file.esid = this.esid++;
    if (this.debug) {
      console.info("generate new event", JSON.stringify(file, 0, 2));
    }
    this.uploader.upload(file);
  }
  _proxyTaro(handler) {
    let diffMeta = this;
    const extend = handler.createComponent;
    handler.createComponent = function(component, e) {
      let Collection = component;
      for (; Collection && Collection.prototype;) {
        const keys = Object.keys(Object.getOwnPropertyDescriptors(Collection.prototype) || {});
        for (let i = 0; keys.length > i; i++) {
          if (keys[i].startsWith("func__")) {
            const baseFilePath = Collection.name;
            const _transactionName = keys[i].slice(6);
            diffMeta.taroRootVMs[keys[i]] = baseFilePath + "_" + ("" + component.prototype[keys[i]]).match(/this\.__triggerPropsFn\("(.+)",/)[1] + "_" + _transactionName;
          }
        }
        Collection = Object.getPrototypeOf(Collection);
      }
      const t = extend(component, e);
      return e && VdsInstrumentAgent.instrumentTaroPageComponent(t), t;
    };
  }
  _proxyCml(appProvider) {
    const $compile = appProvider.createApp;
    appProvider.createApp = function(markup) {
      const rowparams = $compile(markup);
      return VdsInstrumentAgent.GrowingApp(rowparams.options), rowparams;
    };
  }
  _proxyVue(Vue) {
    if (void 0 !== Vue.mixin) {
      let self = this;
      Vue.mixin({
        created : function() {
          if (!this.$options.methods) {
            return;
          }
          const _activeValues = Object.keys(this.$options.methods);
          for (let j of Object.keys(this)) {
            if (!(0 > _activeValues.indexOf(j) || "function" != typeof this[j])) {
              Object.defineProperty(this[j], "proxiedName", {
                value : j
              });
              Object.defineProperty(this[j], "isProxied", {
                value : true
              });
            }
          }
        },
        beforeMount : function() {
          let grid = this.$root;
          if (grid.$mp && "page" === grid.$mp.mpType && grid.$mp.page) {
            self.vueRootVMs[grid.$mp.page.route] = grid;
          }
        }
      });
    }
  }
}
var growingio = new GrowingIO;
var gio = function() {
  var options = arguments[0];
  if (options) {
    var settings = 2 > arguments.length ? [] : [].slice.call(arguments, 1);
    if ("init" !== options) {
      return growingio.proxy(options, settings);
    }
    if (settings.length < 2) {
      console.log("初始化 GrowingIO SDK 失败。请使用 gio('init', '你的GrowingIO项目ID', '你的微信APP_ID', options);");
    } else {
      growingio.init(settings[0], settings[1], settings[2]);
    }
  }
};
console.log("init growingio...");
const GioPage = VdsInstrumentAgent.GrowingPage;
const GioApp = VdsInstrumentAgent.GrowingApp;
const GioComponent = VdsInstrumentAgent.GrowingComponent;
const GioBehavior = VdsInstrumentAgent.GioBehavior;
exports.GioPage = GioPage, exports.GioApp = GioApp, exports.GioComponent = GioComponent, exports.GioBehavior = GioBehavior, exports.default = gio;
