export function executeScriptTab(path) {
  const app = document.querySelector("#app");
  var newDiv = document.createElement("script");

  var script = app.getElementsByTagName("script");
  if (script !== undefined && script[0] !== undefined) {
    if (script[0].src !== "") {
      newDiv.src = path;
    } else if (script[0].innerHTML !== "") {
      newDiv.textContent = script[0].innerHTML;
    }

    document.body.appendChild(newDiv);
  }
}
