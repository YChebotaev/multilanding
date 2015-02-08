var Matcher = function (rules) {
  this.rules = rules||[];
}

Matcher.prototype.match = function(against) {
  var rule;
  for (var i=0, l=this.rules.length; i<l; i++) {
    rule = this.rules[i];
    if (rule != null && rule.test(against)) return rule;
  }
};

module.exports = function(rules) {
  return new Matcher(rules);
}