const __DEMO__ = false;

try {
  new Function("import('/hacsfiles/frontend/main.js')")();
} catch (err) {
  var el = document.createElement("script");
  el.src = "/hacsfiles/frontend/main.js";
  document.body.appendChild(el);
}
