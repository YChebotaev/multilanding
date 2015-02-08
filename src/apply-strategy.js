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