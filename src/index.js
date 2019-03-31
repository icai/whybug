
const init = require('./lib/init');
const notify = require('./lib/notify');
const notifyError = require('./lib/notifyError');
const request = require('./lib/request');
const { instanceState, breadcrumb, self } =  require('./lib/config')
self.init = init(instanceState, breadcrumb, self);
self.notify = notify(instanceState, breadcrumb, self);
self.notifyError = notifyError(instanceState, breadcrumb, self);
self.request = request.request;
module.exports = self;