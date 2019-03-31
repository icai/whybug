
/**
 * @param {!Object} args
 * @param {!Object} obj
 * @param {?} signatureOnly
 * @return {undefined}
 */
let obj = {};
obj.captureBreadcrumb = function (args, obj, signatureOnly) {
  if (!signatureOnly) {
    args.push(obj);
    if (20 < args.length) {
      args.shift();
    }
  }
};
/**
 * @return {?}
 */
obj.getCurrentPage = function () {
  var pages = getCurrentPages();
  if (pages.length) {
    return pages[pages.length - 1];
  }
};
/**
 * @param {?} obj
 * @return {?}
 */
obj.isSampled = function (obj) {
  return !obj && 0 !== obj || (obj = parseFloat(obj), !!isNaN(obj) || Math.random() <= obj);
};


module.exports =  obj;