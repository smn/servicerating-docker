var vumigo = require('vumigo_v02');
var events = vumigo.events;
var Eventable = events.Eventable;
//var Q = require('q');

var SessionLengthHelper = Eventable.extend(function(self, im, params) {
  /**class:SessionLengthHelper

  A helper for common session length calculation tasks.

  :param InteractionMachine im:
    The interaction machine that the metrics should be run on.
  */
  self.im = im;

  self.user = im.user;

  self.now = params.clock || function () { return new Date(); };

  self.metrics_prefix = params.metrics_prefix || 'session_length_helper';

  self.mark = {};

  self.mark.session_start = function () {
    self.user.metadata.session_length_helper = {};
    self.user.metadata.session_length_helper.start = Number(self.now());
    return self;
  };

  self.mark.session_close = function () {
    if(!self.user.metadata.session_length_helper) {
      self.user.metadata.session_length_helper = {};
    }
    self.user.metadata.session_length_helper.stop = Number(self.now());
    return self;
  };

  self.duration = function() {
    data = self.user.metadata.session_length_helper;
    if(data && data.stop && data.start) {
      return data.stop - data.start;
    }
  };

  self.get_today_as_string = function() {
    var today_iso = this.now().toISOString();
    return today_iso.split('T')[0];
  };

  self.ensure_today = function (name) {
    var sentinel_key_name = [self.metrics_prefix, name, 'sentinel'].join('.');
    return self.im
      .api_request('kv.get', {
        key: sentinel_key_name
      })
      .then(function (result) {
        if(result.value != self.get_today_as_string()) {
          return self.reset_for_today(name);
        }
      });
  };

  self.reset_for_today = function (name) {
    var sentinel_key_name = [self.metrics_prefix, name, 'sentinel'].join('.');
    var key_name = [self.metrics_prefix, name].join('.');
    return self.im
      .api_request('kv.set', {
        key: key_name,
        value: 0
      })
      .then(function (result) {
        return self.im.api_request('kv.set', {
          key: sentinel_key_name,
          value: self.get_today_as_string()
        });
      });
  };

  self.store = function(name) {
    return self.im
      .api_request('kv.incr', {
        key: [self.metrics_prefix, name].join('.'),
        amount: self.duration()
      })
      .then(function (result){
        return result.value;
      });
  };

  self.fire_metrics = function (name, result) {
    return self
      .im.metrics.fire.max([self.metrics_prefix, name].join('.'), result);
  };

  self.increment_and_fire = function (fn_or_str) {
    var name = vumigo.utils.maybe_call(fn_or_str, self);
    return self
      .ensure_today(name)
      .then(function (result) {
        return self.store(name);
      })
      .then(function (result) {
        return self.fire_metrics(name, result);
      });
  };

});


this.SessionLengthHelper = SessionLengthHelper;
