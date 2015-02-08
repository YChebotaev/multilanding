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