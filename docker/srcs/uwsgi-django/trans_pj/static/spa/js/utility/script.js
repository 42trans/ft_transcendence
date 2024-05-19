// export function executeScriptTab(path) {
//   const app = document.querySelector("#app");
//   var newDiv = document.createElement("script");
//
//   var script = app.getElementsByTagName("script");
//   if (script !== undefined && script[0] !== undefined) {
//     if (script[0].src !== "") {
//       newDiv.src = path;
//     } else if (script[0].innerHTML !== "") {
//       newDiv.textContent = script[0].innerHTML;
//     }
//
//     document.body.appendChild(newDiv);
//   }
// }

export function executeScriptTab(path) {
  console.log("executeScriptTab: path: " + path);

  const app = document.querySelector("#app");
  if (!app) {
    console.error("Error: cannot find #app");
    return;
  }

  var newDiv = document.createElement("script");
  var scripts = app.getElementsByTagName("script");

  if (scripts.length > 0) {
    console.log("executeScriptTab: find script: ", scripts[0]);

    if (scripts[0].src !== "") {
      newDiv.src = path;
    } else if (scripts[0].innerHTML !== "") {
      newDiv.textContent = scripts[0].innerHTML;
    }

    document.body.appendChild(newDiv);
    console.log("executeScriptTab appendChild", newDiv);
  } else {
    console.error("Error: cannot find script in #app");
  }
}
