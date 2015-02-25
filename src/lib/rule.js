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