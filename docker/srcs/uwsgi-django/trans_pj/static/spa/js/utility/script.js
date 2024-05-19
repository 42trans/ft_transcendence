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

// export function executeScriptTab(path) {
//   console.log("executeScriptTab: 1 path: " + path);
//
//   const app = document.querySelector("#app");
//   if (!app) {
//     console.error("Error: cannot find #app");
//     return;
//   }
//
//   var newDiv = document.createElement("script");
//   var scripts = app.getElementsByTagName("script");
//
//   if (scripts.length > 0) {
//     // console.log("executeScriptTab: 2 find script: ", scripts[0]);
//
//     if (scripts[0].src !== "") {
//       newDiv.src = path;
//       console.log("executeScriptTab: 2 scripts[0].src: ", scripts[0].src);
//     } else if (scripts[0].innerHTML !== "") {
//       newDiv.textContent = scripts[0].innerHTML;
//       console.log("executeScriptTab: 2 newDiv.textContent: ", newDiv.textContent);
//     }
//     document.body.appendChild(newDiv);
//   } else {
//     console.error("Error: cannot find script in #app");
//   }
// }

export function executeScriptTab(path) {
  console.log("executeScriptTab: path: " + path);

  const script = document.createElement('script');
  script.src = path;

  script.onerror = function() {
    console.error(`Failed to load script: ${path}`);
  };

  script.onload = function() {
    console.log(`Script loaded successfully: ${path}`);
  };

  document.body.appendChild(script);
}
