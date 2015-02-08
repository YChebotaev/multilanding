var ini = require('ini');
var queryString = require('query-string');

require('currentscript');

var initBlocks = require('./init-blocks');
var initRules = require('./init-rules');
var initMatcher = require('./init-matcher');
var getTextContent = require('./get-text-content');

(function(window, document){

  var currentScript = document.currentScript;

  if (currentScript == null) currentScript = document._currentScript();
  
  var config = (function(currentScript){
    var configStr = getTextContent(currentScript)||'';
    var config = {};
    try {
      configStr = configStr.replace(/[\r\n]+\s+/gi, '\n');
      config = ini.parse(configStr);
    } catch (e) {
      window.console && console.warn(e);
    }
    return config;
  })(currentScript);

  var blocks = initBlocks(config);

  var rules = initRules(config, blocks);

  var qs = queryString.parse(window.location.search);
  var matcher = initMatcher(rules);
  var currentRule = matcher.match(qs);
  if (currentRule != null) {
    currentRule.apply(qs);
  }
  
})(window, window.document);