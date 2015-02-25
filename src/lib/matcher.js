function Matcher (params, qs) {
  var args = this.args = [];
  for (var i=0, l=params.length; i<l; i++) {
    args[i] = qs[params[i]];
  }
  this.qs = qs;
}

Matcher.prototype.args = [];

Matcher.prototype.Rule = require('./rule');

Matcher.prototype.createRule = function(rule){
  return new this.Rule(rule, this.args);
};

Matcher.prototype.match = function(rules) {
  var rule;
  for (var i=0, l=rules.length; i<l; i++) {
    rule = rules[i];
    if (this.test(rule)) {
      return this.createRule(rule);
    }
  }
};

Matcher.prototype.test = function(rule) {
  var arg, against;
  for (var i=0, l=this.args.length; i<l; i++) {
    arg = this.args[i];
    against = rule[i];
    if (arg !== against) return false;
  }
  return true;
};

module.exports = Matcher;