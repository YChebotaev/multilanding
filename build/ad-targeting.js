(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * document.currentScript
 * Polyfill for `document.currentScript`.
 * Copyright (c) 2015 James M. Greene
 * Licensed MIT
 * http://jsfiddle.net/JamesMGreene/9DFc9/
 * v0.1.7
 */
(function() {


var hasStackBeforeThrowing = false,
    hasStackAfterThrowing = false;
(function() {
  try {
    var err = new Error();
    hasStackBeforeThrowing = typeof err.stack === "string" && !!err.stack;
    throw err;
  }
  catch (thrownErr) {
    hasStackAfterThrowing = typeof thrownErr.stack === "string" && !!thrownErr.stack;
  }
})();


// This page's URL
var pageUrl = window.location.href;

// Live NodeList collection
var scripts = document.getElementsByTagName("script");

// Get script object based on the `src` URL
function getScriptFromUrl(url) {
  if (typeof url === "string" && url) {
    for (var i = 0, len = scripts.length; i < len; i++) {
      if (scripts[i].src === url) {
        return scripts[i];
      }
    }
  }
  return null;
}

// If there is only a single inline script on the page, return it; otherwise `null`
function getSoleInlineScript() {
  var script = null;
  for (var i = 0, len = scripts.length; i < len; i++) {
    if (!scripts[i].src) {
      if (script) {
        return null;
      }
      script = scripts[i];
    }
  }
  return script;
}

// Get the configured default value for how many layers of stack depth to ignore
function getStackDepthToSkip() {
  var depth = 0;
  if (
    typeof _currentScript !== "undefined" &&
    _currentScript &&
    typeof _currentScript.skipStackDepth === "number"
  ) {
    depth = _currentScript.skipStackDepth;
  }
  return depth;
}

// Get the currently executing script URL from an Error stack trace
function getScriptUrlFromStack(stack, skipStackDepth) {
  var url, matches, remainingStack,
      ignoreMessage = typeof skipStackDepth === "number";
  skipStackDepth = ignoreMessage ? skipStackDepth : getStackDepthToSkip();
  if (typeof stack === "string" && stack) {
    if (ignoreMessage) {
      matches = stack.match(/(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
    }
    else {
      matches = stack.match(/^(?:|[^:@]*@|.+\)@(?=data:text\/javascript|blob|http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);

      if (!(matches && matches[1])) {
        matches = stack.match(/\)@(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
      }
    }

    if (matches && matches[1]) {
      if (skipStackDepth > 0) {
        remainingStack = stack.slice(stack.indexOf(matches[0]) + matches[0].length);
        url = getScriptUrlFromStack(remainingStack, (skipStackDepth - 1));
      }
      else {
        url = matches[1];
      }
    }
  }
  return url;
}

// Get the currently executing `script` DOM element
function _currentScript() {
  // Yes, this IS actually possible
  if (scripts.length === 0) {
    return null;
  }

  if (scripts.length === 1) {
    return scripts[0];
  }

  if ("readyState" in scripts[0]) {
    for (var i = scripts.length; i--; ) {
      if (scripts[i].readyState === "interactive") {
        return scripts[i];
      }
    }
  }

  if (document.readyState === "loading") {
    return scripts[scripts.length - 1];
  }

  var stack,
      e = new Error();
  if (hasStackBeforeThrowing) {
    stack = e.stack;
  }
  if (!stack && hasStackAfterThrowing) {
    try {
      throw e;
    }
    catch (err) {
      // NOTE: Cannot use `err.sourceURL` or `err.fileName` as they will always be THIS script
      stack = err.stack;
    }
  }
  if (stack) {
    var url = getScriptUrlFromStack(stack);
    var script = getScriptFromUrl(url);
    if (!script && url === pageUrl) {
      script = getSoleInlineScript();
    }
    return script;
  }

  return null;
}


// Configuration
_currentScript.skipStackDepth = 1;



// Inspect the polyfill-ability of this browser
var needsPolyfill = !("currentScript" in document);
var canDefineGetter = document.__defineGetter__;
var canDefineProp = typeof Object.defineProperty === "function" &&
  (function() {
    var result;
    try {
      Object.defineProperty(document, "_xyz", {
        get: function() {
          return "blah";
        },
        configurable: true
      });
      result = document._xyz === "blah";
      delete document._xyz;
    }
    catch (e) {
      result = false;
    }
    return result;
  })();


// Add the "private" property for testing, even if the real property can be polyfilled
document._currentScript = _currentScript;

// Polyfill it!
if (needsPolyfill) {
  if (canDefineProp) {
    Object.defineProperty(document, "currentScript", {
      get: _currentScript
    });
  }
  else if (canDefineGetter) {
    document.__defineGetter__("currentScript", _currentScript);
  }
}

})();

},{}],2:[function(require,module,exports){
(function (process){

exports.parse = exports.decode = decode
exports.stringify = exports.encode = encode

exports.safe = safe
exports.unsafe = unsafe

var eol = process.platform === "win32" ? "\r\n" : "\n"

function encode (obj, opt) {
  var children = []
    , out = ""

  if (typeof opt === "string") {
    opt = {
      section: opt,
      whitespace: false
    }
  } else {
    opt = opt || {}
    opt.whitespace = opt.whitespace === true
  }

  var separator = opt.whitespace ? " = " : "="

  Object.keys(obj).forEach(function (k, _, __) {
    var val = obj[k]
    if (val && Array.isArray(val)) {
        val.forEach(function(item) {
            out += safe(k + "[]") + separator + safe(item) + "\n"
        })
    }
    else if (val && typeof val === "object") {
      children.push(k)
    } else {
      out += safe(k) + separator + safe(val) + eol
    }
  })

  if (opt.section && out.length) {
    out = "[" + safe(opt.section) + "]" + eol + out
  }

  children.forEach(function (k, _, __) {
    var nk = dotSplit(k).join('\\.')
    var section = (opt.section ? opt.section + "." : "") + nk
    var child = encode(obj[k], {
      section: section,
      whitespace: opt.whitespace
    })
    if (out.length && child.length) {
      out += eol
    }
    out += child
  })

  return out
}

function dotSplit (str) {
  return str.replace(/\1/g, '\u0002LITERAL\\1LITERAL\u0002')
         .replace(/\\\./g, '\u0001')
         .split(/\./).map(function (part) {
           return part.replace(/\1/g, '\\.')
                  .replace(/\2LITERAL\\1LITERAL\2/g, '\u0001')
        })
}

function decode (str) {
  var out = {}
    , p = out
    , section = null
    , state = "START"
           // section     |key = value
    , re = /^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/i
    , lines = str.split(/[\r\n]+/g)
    , section = null

  lines.forEach(function (line, _, __) {
    if (!line || line.match(/^\s*[;#]/)) return
    var match = line.match(re)
    if (!match) return
    if (match[1] !== undefined) {
      section = unsafe(match[1])
      p = out[section] = out[section] || {}
      return
    }
    var key = unsafe(match[2])
      , value = match[3] ? unsafe((match[4] || "")) : true
    switch (value) {
      case 'true':
      case 'false':
      case 'null': value = JSON.parse(value)
    }

    // Convert keys with '[]' suffix to an array
    if (key.length > 2 && key.slice(-2) === "[]") {
        key = key.substring(0, key.length - 2)
        if (!p[key]) {
          p[key] = []
        }
        else if (!Array.isArray(p[key])) {
          p[key] = [p[key]]
        }
    }

    // safeguard against resetting a previously defined
    // array by accidentally forgetting the brackets
    if (Array.isArray(p[key])) {
      p[key].push(value)
    }
    else {
      p[key] = value
    }
  })

  // {a:{y:1},"a.b":{x:2}} --> {a:{y:1,b:{x:2}}}
  // use a filter to return the keys that have to be deleted.
  Object.keys(out).filter(function (k, _, __) {
    if (!out[k] || typeof out[k] !== "object" || Array.isArray(out[k])) return false
    // see if the parent section is also an object.
    // if so, add it to that, and mark this one for deletion
    var parts = dotSplit(k)
      , p = out
      , l = parts.pop()
      , nl = l.replace(/\\\./g, '.')
    parts.forEach(function (part, _, __) {
      if (!p[part] || typeof p[part] !== "object") p[part] = {}
      p = p[part]
    })
    if (p === out && nl === l) return false
    p[nl] = out[k]
    return true
  }).forEach(function (del, _, __) {
    delete out[del]
  })

  return out
}

function isQuoted (val) {
  return (val.charAt(0) === "\"" && val.slice(-1) === "\"")
         || (val.charAt(0) === "'" && val.slice(-1) === "'")
}

function safe (val) {
  return ( typeof val !== "string"
         || val.match(/[\r\n]/)
         || val.match(/^\[/)
         || (val.length > 1
             && isQuoted(val))
         || val !== val.trim() )
         ? JSON.stringify(val)
         : val.replace(/;/g, '\\;').replace(/#/g, "\\#")
}

function unsafe (val, doUnesc) {
  val = (val || "").trim()
  if (isQuoted(val)) {
    // remove the single quotes before calling JSON.parse
    if (val.charAt(0) === "'") {
      val = val.substr(1, val.length - 2);
    }
    try { val = JSON.parse(val) } catch (_) {}
  } else {
    // walk the val to find the first not-escaped ; character
    var esc = false
    var unesc = "";
    for (var i = 0, l = val.length; i < l; i++) {
      var c = val.charAt(i)
      if (esc) {
        if ("\\;#".indexOf(c) !== -1)
          unesc += c
        else
          unesc += "\\" + c
        esc = false
      } else if (";#".indexOf(c) !== -1) {
        break
      } else if (c === "\\") {
        esc = true
      } else {
        unesc += c
      }
    }
    if (esc)
      unesc += "\\"
    return unesc
  }
  return val
}

}).call(this,require("/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":13}],3:[function(require,module,exports){
/*!
	query-string
	Parse and stringify URL query strings
	https://github.com/sindresorhus/query-string
	by Sindre Sorhus
	MIT License
*/
(function () {
	'use strict';
	var queryString = {};

	queryString.parse = function (str) {
		if (typeof str !== 'string') {
			return {};
		}

		str = str.trim().replace(/^(\?|#)/, '');

		if (!str) {
			return {};
		}

		return str.trim().split('&').reduce(function (ret, param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			var key = parts[0];
			var val = parts[1];

			key = decodeURIComponent(key);
			// missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

			if (!ret.hasOwnProperty(key)) {
				ret[key] = val;
			} else if (Array.isArray(ret[key])) {
				ret[key].push(val);
			} else {
				ret[key] = [ret[key], val];
			}

			return ret;
		}, {});
	};

	queryString.stringify = function (obj) {
		return obj ? Object.keys(obj).map(function (key) {
			var val = obj[key];

			if (Array.isArray(val)) {
				return val.map(function (val2) {
					return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
				}).join('&');
			}

			return encodeURIComponent(key) + '=' + encodeURIComponent(val);
		}).join('&') : '';
	};

	if (typeof define === 'function' && define.amd) {
		define(function() { return queryString; });
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = queryString;
	} else {
		window.queryString = queryString;
	}
})();

},{}],4:[function(require,module,exports){
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
},{"./get-text-content":7,"./init-blocks":8,"./init-matcher":9,"./init-rules":10,"currentscript":1,"ini":2,"query-string":3}],5:[function(require,module,exports){
var _ = {
  isArray: require('./utils').isArray,
  bindMethodContext: require('./utils').bindMethodContext
};

var ApplyStrategy = function(block) {
  var Super = this.constructor;
  var _this = this;
  var _onvariant = this.onvariant;
  this.block = block;
  this.el = block.getElement();
  this.selectStrategy = null;
  this.selectStrategies = require('./select-strategies');
}

ApplyStrategy.prototype.initSelectStrategy = function(rule) {
  var SelectStrategy = this._getSelectStrategyConstructor(rule);
  this.selectStrategy = new SelectStrategy(this.block, {config:rule});
};

ApplyStrategy.prototype.apply = function(rule) {

  var content = rule[this.block.name];

  if (this._isContentMultivar(content)) {
    this.applyMulti(content, rule);
  } else {
    this.applySinge(content);
  }
};

ApplyStrategy.prototype.setContent = function(content) {
  if (this.selectStrategy != null && typeof this.selectStrategy.setContent === 'function') {
    this.selectStrategy.setContent(content);
  } else {
    this.setHTML(content);
  }
};

ApplyStrategy.prototype.setHTML = function(innerHTML) {
  this.el.innerHTML = innerHTML;
};

ApplyStrategy.prototype.applyMulti = function(variants, rule) {
  this.initSelectStrategy(rule);
  if (this._isSelectStrategyAsync()) {
    this.applyMultiAsync(variants);
  } else {
    this.applyMultiSync(variants);
  }
};

ApplyStrategy.prototype.applyMultiAsync = function(variants) {
  this.getVariantAsync(variants, _.bindMethodContext(this, 'onvariant'));
};

ApplyStrategy.prototype.applyMultiSync = function(variants) {
  var content = this.getVariant(variants);
  this.setContent(content);
};

ApplyStrategy.prototype.getVariant = function(variants) {
  return this.selectStrategy.getVariant(variants);
};

ApplyStrategy.prototype.getVariantAsync = function(variants, callback) {
  this.selectStrategy.getVariantAsync(variants, callback);
};

ApplyStrategy.prototype.applySinge = function(content) {
  this.setContent(content);
};

ApplyStrategy.prototype.onvariant = function(err, variant) {
  if (err != null) {
    window.console && console.error(err);
  } else {
    this.setContent(variant);
  }
};

ApplyStrategy.prototype._isContentMultivar = function(content) {
  return _.isArray(content);
};

ApplyStrategy.prototype._isSelectStrategyAsync = function() {
  return !!this.selectStrategy.async;
};

ApplyStrategy.prototype._getSelectStrategyName = function(rule) {
  return rule.select||this.block.config.select||'defaultStrategy';
};

ApplyStrategy.prototype._getSelectStrategyConstructor = function(rule) {
  var strategyName = this._getSelectStrategyName(rule);
  return this.selectStrategies[strategyName];
};

module.exports = ApplyStrategy;
},{"./select-strategies":11,"./utils":12}],6:[function(require,module,exports){
var _ = {
  forEach: require('./utils').forEach
};

var GoogleExperimentsStrategy = function (block, options) {
  options = options||{};
  this.block = block;
  this.initConfig(options.config||{});
  this.isReady = false;
  this.initCxApi();
}

GoogleExperimentsStrategy.prototype = {

  defaultEndpoint: '//www.google-analytics.com/cx/api.js',

  configMap: {
    experimentId: 'ga.experiment',
    endpoint:     'ga.endpoint',
    domainName:   'ga.domain_name',
    cookiePath:   'ga.cookie_path',
    allowHash:    'ga.allow_hash'
  },

  initConfig: function(ruleConfig){
    var blockConfig = this.block.config;
    var config = {};

    config.endpoint = this.defaultEndpoint;

    _.forEach(this.configMap, function(confKey, key){
      var val = ruleConfig[confKey]||blockConfig[confKey];
      if (val != null) config[key] = val;
    });

    this.config = config;
  },

  chooseVariation: function () {
    var cxApi = this.cxApi||{};
    var chooseVariation = cxApi.chooseVariation;
    if (typeof chooseVariation === 'function') {
      return chooseVariation.call(cxApi);
    } else {
      return -1;
    }
  },

  getChosenVariation: function (experimentId) {
    var cxApi = this.cxApi||{};
    var getChosenVariation = cxApi.getChosenVariation;
    if (typeof getChosenVariation === 'function') {
      return getChosenVariation.call(cxApi, experimentId);
    } else {
      return -1;
    }
  },

  setChosenVariation: function(variantId) {
    var cxApi = this.cxApi||{};
    var experimantId = this.config.experimentId||void(0);
    var setChosenVariation = cxApi.setChosenVariation;
    if (typeof setChosenVariation === 'function') {
      setChosenVariation.call(cxApi, variantId, experimentId);
    }
  },

  getVariant: function(variants) {
    var experimentId = this.config.experimentId;
    var variantId;
    if (experimentId == null) {
      variantId = this.getChosenVariation(experimentId);
    } else {
      variantId = this.chooseVariation();
    }

    switch (variantId) {
      case (cxApi.NOT_PARTICIPATING):   return this.defaultVariation(variantId, variants);
      case (cxApi.NO_CHOSEN_VARIATION): return this.defaultVariation(variantId, variants, true);
      default:                          return variants[variantId];
    }
  },

  defaultVariation: function(variantId, variants, saveVariant) {
    if (saveVariant === true) this.setChosenVariation(variantId);
    return variants[cxApi.ORIGINAL_VARIATION];
  },

  getVariantAsync: function(variants, callback) {
    var _this = this;
    this.readyCallback = function(err){
      if (err != null) return callback(err);
      callback(null, _this.getVariant(variants));
    };
    if (this.async && this.isReady) {
      this.readyCallback();
    }
  },

  getScriptSrc: function(){
    var experimentId = this.config.experimentId;
    var endpoint = this.config.endpoint;
    var src = endpoint;
    if (experimentId != null) {
      src = src+'?experiment='+experimentId;
    }
    return src;
  },

  loadScript: function(){
    var script = document.createElement('script');
    script.src = this.getScriptSrc();

    if (typeof script.setAttribute === 'function') {
      script.setAttribute('async', true);
    }

    script.onload = this.onscriptfinish(script, this.onscriptload);
    script.onerror = this.onscriptfinish(script, this.onscripterror);

    document.head.appendChild(script);
  },

  initCxApi: function(){
    if ((this.cxApi = window.cxApi) != null) {
      this.async = false;
      this.applyExtras();
      this.readyCallback && readyCallback();
    } else {
      this.async = true;
      this.loadScript();
    };
  },

  applyExtras: function() {
    var cxApi = this.cxApi;
    var config = this.config;
    var domainName = config.domainName;
    var cookiePath = config.cookiePath;
    var allowHash  = config.allowHash === 'true' ? true : false;
    if (domainName) cxApi.setDomainName(domainName);
    if (cookiePath) cxApi.setCookiePath(cookiePath);
    if (config.allowHash != null) cxApi.setAllowHash(allowHash);
  },

  onscriptfinish: function(script, callback) {
    var _this = this;
    return function(e){
      _this.isReady = true;
      _this.cxApi = window.cxApi;
      _this.applyExtras();
      script.onload = null;
      script.onerror = null;
      callback.apply(_this, arguments);
    };
  },

  onscriptload: function(){
    this.readyCallback && this.readyCallback.call(this);
  },

  onscripterror: function(e){
    var err = new Error();
    this.readyCallback && this.readyCallback.call(this, err);
  }

};

module.exports = GoogleExperimentsStrategy;
},{"./utils":12}],7:[function(require,module,exports){
var getTextContent = module.exports = function (el) {
  var textContent;
  if (el != null) {
    textContent = el.textContent;
    if (textContent != null) {
      return textContent;
    } else {
      return el.innerText;
    }
  }
}
},{}],8:[function(require,module,exports){
var _ = {
  forEach: require('./utils').forEach
};

var ApplyStrategy = require('./apply-strategy');

var compileBlock = function (blockName, blockConfig) {
  var block = {
    getElement:function(){},
    name:blockName,
    apply:function(){},
    config: blockConfig
  };

  var id = blockConfig.id;
  var selector = blockConfig.selector;
  var className = blockConfig.class;
  var index = blockConfig.index;

  if (id != null) {
    // Skip
  } else
  if (className != null && index == null) {
    block.getElement = function(){
      return document.getElementsByClassName(className)[0];
    }
  } else
  if (className != null && index != null) {
    block.getElement = function(){
      var elements = document.getElementsByClassName(className)[0];
      return elements[index];
    }
  } else
  if (selector != null && index == null) {
    block.getElement = function(){
      return document.querySelector(selector);
    }
  } else
  if (selector != null && index != null) {
    block.getElement = function(){
      var elements = document.querySelectorAll(selector);
      return elements[index];
    }
  } else {
    id = blockName;
  }

  if (id != null) {
    block.getElement = function(){
      return document.getElementById(id);
    }
  }

  block.apply = function(rule){
    new ApplyStrategy(this).apply(rule);
  };

  return block;
}

module.exports = function (config) {
  var configBlocks = config.blocks||{};
  var blocks = [];
  var configBlock;
  var blockConfig;
  var block;

  var blocksDefaults = {};

  _.forEach(configBlocks, function(val, key){
    if (typeof val === 'object') return;
    if (key==='selector'||key==='id'||key==='class') return;
    blocksDefaults[key] = val;
  });

  for (var blockName in configBlocks) {
    configBlock = configBlocks[blockName];
    if (typeof configBlock === 'object') {
      blockConfig = {};

      _.forEach(configBlock, function(val, key){
        blockConfig[key] = val;
      });

      _.forEach(blocksDefaults, function(val, key){
        if (key==='selector'||key==='id'||key==='class') return;
        if (blockConfig[key] != null) return;
        blockConfig[key] = val;
      });

      block = compileBlock(blockName, blockConfig);
      if (block != null) blocks.push(block);

    } else {
      blocksDefaults[blockName] = configBlock;
    }
  }

  return blocks;
}
},{"./apply-strategy":5,"./utils":12}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{"./utils":12}],11:[function(require,module,exports){
var selectStrategies = {};

selectStrategies.random = function (block) {
  this.getVariant = function (variants) {
    var rnd = Math.floor(Math.random()*variants.length);
    return variants[rnd];
  };
};

selectStrategies.first = function (block) {
  this.async = true;
  this.getVariant = function (variants) {
    return variants[0];
  },
  this.getVariantAsync = function (variants, callback) {
    var _this = this;
    setTimeout(function(){
      var variant = _this.getVariant(variants);
      callback(null, variant);
    }, 1000)
  };
};

selectStrategies.last = function (block) {
  this.getVariant = function (variants) {
    return variants[variants.length-1];
  }
};

selectStrategies.ga = require('./ga-select-strategy');

selectStrategies.defaultStrategy = selectStrategies.random;

module.exports = selectStrategies;
},{"./ga-select-strategy":6}],12:[function(require,module,exports){
var utils = {};

// utils.isArray
if (typeof Array.isArray === 'function') {
  utils.isArray = function (array) {
    return Array.isArray(array);
  };
} else {
  utils.isArray = function (array) {
    return array instanceof Array;
  }
}

// utils.keys
if (typeof Object.keys === 'function') {
  utils.keys = function (obj) {
    return Object.keys(obj);
  }
} else {
  utils.keys = function (obj) {
    var keys = [];
    for (var key in obj) {
      keys.push(key);
    }
    return keys;
  }
}

utils.forIn = function (obj, iter, ctx) {
  var keys = utils.keys(obj);
  var key, val, ctx=ctx||obj;
  for (var i=0, l=keys.length; i<l; i++) {
    key = keys[i];
    val = obj[key];
    iter.call(ctx, val, key);
  }
};

utils.forEach = function (arr, iter, ctx) {
  if (!utils.isArray(arr)) return utils.forIn(arr, iter, ctx);
  var val, ctx=ctx||arr;
  for (var i=0, l=arr.length; i<l; i++) {
    val = arr[i];
    iter.call(ctx, val, i);
  }
};

utils.groupBy = function (arr, name) {
  var grouped = {};
  utils.forEach(arr, function(obj){
    var val = obj[name];
    var group = grouped[val];
    if (group == null) {
      group = [];
      grouped[val] = group;
    }
    group.push(obj);
  });
  return grouped;
};

utils.union = function (left, right) {
  var set = {};

  for (var i=0, l=left.length; i<l; i++) {
    set[left[i]] = 1;
  }

  for (var j=2, l2=right.length; j<l2; j++) {
    set[right[j]] = 1;
  }

  return utils.keys(set);
};

utils.bindMethodContext = function (owner, name) {
  return function(){
    return owner[name].apply(owner, arguments);
  }
}

module.exports = utils;
},{}],13:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[4])