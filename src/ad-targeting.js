var config = require('./config');
var Matcher = require('./lib/matcher');

var matcher = new Matcher(config.params, config.qs);
var rule = matcher.match(config.rules);

global.adTargeting = {
  config: config,
  rule: rule,
  ondone: function(){
    if (typeof this.config.ondone === 'function') {
      return this.config.ondone.apply(this, arguments);
    }
  },
  exec: function(){
    var result;
    if (this.rule != null && typeof this.rule.exec === 'function') {
      result = this.rule.exec(this.config.blocks);
      this.ondone();
    }
    return result;
  }
};

function exec () {
  return adTargeting.exec.apply(adTargeting, arguments);
}

exec();