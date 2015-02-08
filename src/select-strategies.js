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