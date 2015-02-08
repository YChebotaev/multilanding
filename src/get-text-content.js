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