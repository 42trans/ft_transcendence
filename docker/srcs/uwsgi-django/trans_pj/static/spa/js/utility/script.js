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
  console.log("executeScriptTab 関数が呼び出されました。パス: " + path);

  const app = document.querySelector("#app");
  if (!app) {
    console.error("エラー: #app 要素が見つかりません。");
    return;
  }

  var newDiv = document.createElement("script");
  var scripts = app.getElementsByTagName("script");

  if (scripts.length > 0) {
    console.log("既存のスクリプトが見つかりました。詳細: ", scripts[0]);

    if (scripts[0].src !== "") {
      newDiv.src = path;
      console.log("新しいスクリプトのsrcを設定しました: " + path);
    } else if (scripts[0].innerHTML !== "") {
      newDiv.textContent = scripts[0].innerHTML;
      console.log("新しいスクリプトにインラインコンテンツを設定しました。");
    }

    document.body.appendChild(newDiv);
    console.log("新しいスクリプト要素が body に追加されました。", newDiv);
  } else {
    console.error("エラー: #app 内にスクリプト要素が見つかりませんでした。");
  }
}
