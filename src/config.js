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