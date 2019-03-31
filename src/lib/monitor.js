const filter = require('./filter');
const utils = require('./utils');
const copy = require('./copy');

const { instanceState } = require('./config');

let obj = {};

 /**
  * 
  * 获取扩展参数
  */
obj.sendToWhybug = function (data, filters, sampleRate, callback) {
  data.metaData = copy.copyWithoutCircle(data.metaData);
  if (callback && 'function' == typeof callback) {
    var value = Object.assign({}, data);
    delete value.breadcrumbs;
    callback(value);
  }
  if (!filter.isFiltered(data, filters)) {
    if (utils.isSampled(sampleRate)) {
      wx.request({
        url: instanceState.url,
        method: "POST",
        data: data
      });
    }
  }
};

module.exports =  obj;