var getCurrentScript = module.exports = function () {
  var scripts = document.getElementsByTagName('script');
  return scripts[scripts.length-1];
};