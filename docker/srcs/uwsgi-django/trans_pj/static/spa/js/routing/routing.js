import { Routes } from "./routes.js";
//import getUrl from "../utility/url.js";
import { getUrl } from "../utility/url.js";
import { isLogined } from "../utility/user.js";

const pathToRegex = (path) =>
  new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = (match) => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
    (result) => result[1]
  );
  if (values.length > 0) {
    alert(values);
  }
  const url = match.result.toString();

  return Object.fromEntries(
    keys.map((key, i) => {
      alert(key);
      alert(i);
      return [key, values[i]];
    })
  );
};

export const navigateTo = (url) => {
  console.log("history pushState:" + url);
  history.pushState(null, null, url);
  router();
};

export const router = async () => {
  // Test each route for potential match
  const potentialMatches = Routes.map((route) => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path)),
    };
  });

  let match = potentialMatches.find(
    (potentialMatch) => potentialMatch.result !== null
  );
  //alert("match test:" + match.result);

  console.log("match!???????????");
  if (!match) {
    console.log("not match!!!!!");
    match = {
      route: Routes[0],
      result: [getUrl(Routes[0].path)],
    };
  }
  console.log("match result:" + match.result);

  if (isLogined() == false) {
    match = {
      route: Routes[0],
      result: [getUrl(Routes[0].path)],
    };
  }
  const view = new match.route.view(getParams(match));

  const html = await view.getHtml();
  document.querySelector("#app").innerHTML = html;
  const app = document.querySelector("#app");
  var newDiv = document.createElement("script");

  // 2. 必要に応じて、属性を設定します。
  //newDiv.id = "newDivId";
  //newDiv.className = "newDivClass";

  // 3. 必要に応じて、テキストコンテンツを設定します。
  //newDiv.textContent = `
  //var targetDiv = document.getElementById("target");
  //var paragraph = targetDiv.querySelector("p");
  //paragraph.textContent = "This text is changed by JavaScript????????.";
  //`;

  // 4. 必要に応じて、作成した要素を既存の要素に追加します。

  //app.insertAdjacentHTML("afterbegin", html);

  var parent = document.getElementById("parent");
  var child = document.getElementById("child");
  var script = app.getElementsByTagName("script");
  //if (script !== undefined && script[0] !== undefined) {
  if (script !== undefined && script[0] !== undefined) {
    //console.table(script);
    //console.table(script[0]);
    //console.table(script[0].src);
    //document.body.appendChild(script);
    //var script_txt = script[0].innerHTML;

    if (script[0].src !== "") {
      //console.log("append Src:" + script[0].src);
      //newDiv.src = script[0].src;
      newDiv.src = "/static/spa_test/js/test.js";
      //console.log("append Src:" + newDiv.src);
    } else if (script[0].innerHTML !== "") {
      console.log("append innerHTML:" + script[0].innerHTML);
      newDiv.textContent = script[0].innerHTML;
    }

    document.body.appendChild(newDiv);
    //console.log("Script:" + script_txt);
    //console.log("Script:" + script_txt);
  } else {
    console.log("None Script");
    console.log("None Script");
  }
  if (parent) {
    /*
    parent.insertAdjacentHTML(
      "beforebegin",
      "<div>New content before parent</div>"
    ); // parentの前に挿入
    parent.insertAdjacentHTML(
      "afterbegin",
      "<p>New content at the beginning of parent</p>"
    ); // parent内の先頭に挿入
    */
  }
  document
    .querySelector("#app")
    .insertAdjacentHTML(
      "beforeend",
      "<script>console.log('Replace Test No.1')</script>"
    );
  //alert(location.href);
  //window.location = match.result;
  //alert("ページが変更されました8：" + window.location);
  //alert("ページが変更されました9：" + match.result);
  //alert(location.host + "/" + match.route.path);
};
