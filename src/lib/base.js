const utils = require("./utils");
const copy = require("./copy");
const self = {};
self.notifierVersion = "1.0.0";
let system = {};
system.getEvent = function(data, breadcrumb, res) {
  self.scene = data.scene;
  self.apikey = data.apikey;
  self.appVersion = data.appVersion;
  self.releaseStage = data.releaseStage;
  self.metaData = res.metaData || data.metaData;
  /** @type {!Object} */
  self.breadcrumbs = breadcrumb;
  /** @type {number} */
  self.time = (new Date).getTime();
  if (!data.silentApp) {
    self.App = copy.copyWithoutCircle(getApp());
  }
  if (!data.silentPage) {
    self.Page = copy.copyWithoutCircle(utils.getCurrentPage());
  }
  if (!self.userInfo) {
    if (res.userInfo) {
      self.userInfo = res.userInfo;
    } else {
      if (data.setUserInfo) {
        wx.getUserInfo({
          success : function(res) {
            self.userInfo = res.userInfo;
          }
        });
      }
    }
  }
  return self;
};
system.getNetworkType = function() {
  wx.getNetworkType({
    success : function(e) {
      self.networkType = e.networkType;
    }
  });
};
system.getSystemInfo = function() {
  wx.getSystemInfo({
    success : function(res) {
      self.systemInfo = res;
    }
  });
};
system.getLocation = function() {
  wx.getLocation({
    type : "wgs84",
    success : function(locationInfo) {
      self.locationInfo = locationInfo;
    }
  });
};
module.exports =  system;
