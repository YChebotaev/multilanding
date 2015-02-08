var _ = {
  groupBy: require('./utils').groupBy,
  forEach: require('./utils').forEach,
  isArray: require('./utils').isArray,
  union:   require('./utils').union
};

var testFnArgs = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'x_variant'
];

var testFnTemplate = function(testExpr){
  var result = [];
  if (_.isArray(testExpr)) {
    testExpr = testExpr.join(' || ');
  } else {
    testExpr = ''+testExpr;
  }

  result.push(
    'try {',
    ' return '+testExpr+';',
    '} catch (err) {',
    ' return false;',
    '}'
  );

  return result.join('\n');
};

var compileTest = function (testExpr) {

  var testFn = new Function(testFnArgs, testFnTemplate(testExpr));

  return function(qs){
    var args = [];
    for (var i=0, l=testFnArgs.length; i<l; i++) {
      args[i] = qs[testFnArgs[i]];
    }
    return testFn.apply(this, args);
  };
}

var compileApply = function (configRule, blocks) {
  return function(){
    _.forEach(configRule, function(val, key){
      if (key === 'test') return;
      var block = (blocks[key]||[])[0];
      if (block != null) block.apply(configRule);
    });
  };
}

var compileRule = function (i, configRule, blocks) {
  var rule = {
    index: i,
    test: function(){return false},
    apply: function(){}
  };

  var test = compileTest(configRule.test);
  if (typeof test === 'function') rule.test = test;

  var apply = compileApply(configRule, blocks);
  if (typeof apply === 'function') rule.apply = apply;

  return rule;
}

var sortRules = function (left, right) {
  return left.index - right.index;
}

var initConfigKeys = function (config) {
  var configKeys = config.keys;
  if (configKeys != null) {
    if (_.isArray(configKeys)) {
      testFnArgs = _.union(testFnArgs, configKeys);
    } else {
      configKeys = (''+configKeys).split(/\s*[\,\;]\s*/);
      testFnArgs = _.union(testFnArgs, configKeys);
    }
  }
};

module.exports = function (config, blocksList) {
  var configRules = config.rules||{};
  var rules = [];
  var configRule;
  var rule;

  initConfigKeys(config)

  var blocks = _.groupBy(blocksList, 'name');
  delete blocks.test;

  for (var i in configRules) {
    if (isNaN(i)) continue;
    configRule = configRules[i];
    i = parseInt(i);
    var ruleConfig = {};

    _.forEach(configRules, function(val, key){
      if (typeof val === 'object') return;
      ruleConfig[key] = val;
    });

    _.forEach(configRule, function(val, key){
      if (typeof val === 'object') return ruleConfig[key] = val;
      if (ruleConfig[key] == null) return ruleConfig[key] = val;
    });

    rule = compileRule(i, ruleConfig, blocks);
    if (rule != null) rules.push(rule);
  }

  rules.sort(sortRules);

  return rules;
}