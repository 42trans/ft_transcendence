import { Routes } from "./routes.js";
import { getUrl } from "../utility/url.js";
import { isLogined } from "../utility/user.js";

const ROOT_INDEX = 0;
const LOGIN_PATH = '/login/';


export const navigateTo = (url) => {
  console.log("history pushState:" + url);
  history.pushState(null, null, url);
  router();
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


export const router = async () => {
  const currentPath = location.pathname;
  console.log("router path: " + currentPath)

  // 選択されたルートを取得
  const selectedRoute = getSelectedRoute(currentPath, Routes, isLogined());
  console.log("router selectedRoute.path: " + selectedRoute.path)

  // 選択されたルートに対応するビューを描画
  // const view = new selectedRoute.view();
  // 選択されたルートに対応するビューをインスタンス化して、paramsを渡す
  const view = new selectedRoute.view(selectedRoute.params);
  const html = await view.getHtml();
  document.querySelector("#app").innerHTML = html;

  // ビューに関連するスクリプトを実行
  try {
    view.executeScript();
  } catch (error) {
    console.error(`Error executing view script: ${error}`);
  }
};
