import { routeTable } from "./routeTable.js";
import { getUrl } from "../utility/url.js";
import { isLogined } from "../utility/user.js";

const ROOT_INDEX = 0;
const LOGIN_PATH = '/login/';


export const switchPage = (url) => {
  console.log("history pushState:" + url);
  history.pushState(null, null, url);

  let currentPath = window.location.pathname;
  console.log('switchPage url:' + url)
  console.log('switchPage currentPath:' + currentPath)
  renderView(currentPath);
};


const getSelectedRoute = (currentPath, routes, isLogined) => {
  let params = {};  // URLパラメータを格納するオブジェクト

  // パスパラメータを含む可能性があるルートを評価
  const matchedRoute = routes.find(route => {
    const routeParts = route.path.split('/').filter(part => part);
    const currentPathParts = currentPath.split('/').filter(part => part);

    if (routeParts.length !== currentPathParts.length) {
      return false;
    }

    // パスの各部分を比較
    return routeParts.every((part, index) => {
      if (part.startsWith(':')) {
        // パラメータのキーを抽出（例: :nickname -> nickname）
        const paramName = part.slice(1);
        params[paramName] = currentPathParts[index];  // パラメータを格納
        return true;
      }
      return part === currentPathParts[index];
    });
  });

  if (matchedRoute) {
    // マッチするルートが見つかった場合は、そのルートを選択
    matchedRoute.params = params;
    return matchedRoute;
  } else if (isLogined) {
    // マッチするルートが見つからず、ログインしている場合は、デフォルトのルートを選択
    return routes[ROOT_INDEX];
  } else {
    // マッチするルートが見つからず、ログインしていない場合は、ログインページのルートを選択
    return routes.find(route => route.path === LOGIN_PATH);
  }
};


function get_view(path) {
  // 選択されたルートを取得
  const selectedRoute = getSelectedRoute(path, routeTable, isLogined());
  console.log("renderView: selectedRoute.path: " + selectedRoute.path)

  // 選択されたルートに対応するビューをインスタンス化して、paramsを渡す
  const url_params = selectedRoute.params;
  console.log("renderView: params: " + JSON.stringify(url_params));
  const view = new selectedRoute.view(url_params);
  return view
}

export const renderView = async (path) => {
  console.log("    renderView 1: path: " + path)
  const view = get_view(path)

  // HTMLの描画 <div id="app">
  const html_src = await view.getHtml();
  document.querySelector("#spa").innerHTML = html_src;
  console.log("    renderView 2")

  // スクリプトの読み込みと実行
  await view.executeScript();
  console.log("    renderView 3")
};
