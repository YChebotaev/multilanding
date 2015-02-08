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