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

  if (id != null) {
    // Skip
  } else
  if (className != null) {
    block.getElement = function(){
      return document.getElementsByClassName(className)[0];
    }
  } else
  if (selector != null) {
    block.getElement = function(){
      return document.querySelector(selector);
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