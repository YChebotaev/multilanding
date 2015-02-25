var config = require('./config');
var Matcher = require('./lib/matcher');

var matcher = new Matcher(config.params, config.qs);
var rule = matcher.match(config.rules);

global.adTargeting = {
  config: config,
  rule: rule,
  exec: function(){
    return this.rule && this.rule.exec(this.blocks);
  }
};

function exec () {
  return adTargeting.exec.apply(adTargeting, arguments);
}

exec();