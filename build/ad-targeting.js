(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
(function (global){
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
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./config":3,"./lib/matcher":4}],3:[function(require,module,exports){
(function (global){
var queryString = require('query-string');

function tryEvalWith(code, global){
  try {
    with (global) {
      eval(code);
    }
  } catch (err) {
    console.error(err);
  }
}

function isPromise (promise) {
  return promise != null && typeof promise.then === 'function';
}

function promiseJoin (promise, then) {
  if (isPromise(promise)) {
    promise.then(then);
  } else {
    then(promise);
  }
}

function parse () {
  var config = {};
  var currentScript = document.currentScript;
  var textContent = currentScript ? currentScript.textContent : '';

  config.blocks = [];

  config.rules = [];

  config.params = [];

  config.ondone = undefined;

  config.qs = queryString.parse(global.location.search);

  if (textContent) {
    tryEvalWith(currentScript.textContent, config);
  }

  var block, selector, blocks={byName: {}, byIndex: []};
  for (var i=0, l=config.blocks.length; i<l; i++) {
    for (var name in config.blocks[i]) {
      selector = config.blocks[i][name];
      block = {
        name:     name,
        selector: selector,
        index:    i,
        el:       document.querySelector(selector)
      }
      blocks.byName[name] = block;
      blocks.byIndex[i] = block;
      break;
    }
  }
  config.blocks = blocks;

  return config;
}
var config = parse();

module.exports = config;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"query-string":1}],4:[function(require,module,exports){
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
},{"./rule":5}],5:[function(require,module,exports){
function Rule (config, args) {
  this.config = config.slice(args.length);
  this.args = args;
  this.actions = [];
  var action;
  for (var i=0, l=this.config.length; i<l; i++) {
    action = this.createAction(i);
    this.actions.push(action);
  }
}

Rule.prototype.createAction = function(i) {
  var blockText = this.config[i];
  return function(blocks){
    var byIndex = blocks.byIndex;
    var block = byIndex[i];
    var el = block.el;
    if (el == null) el = block.el = this.getElement(block.selector);
    if (el != null) {
      el.innerHTML = blockText;
    }
  };
};

Rule.prototype.getElement = function(selector) {
  return document.querySelector(selector);
};

Rule.prototype.exec = function() {
  var action;
  for (var i=0, l=this.actions.length; i<l; i++) {
    action = this.actions[i];
    action.apply(this, arguments);
  }
};

module.exports = Rule;
},{}]},{},[2])