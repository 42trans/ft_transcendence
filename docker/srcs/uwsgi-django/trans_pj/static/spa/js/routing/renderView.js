import { routeTable } from "./routeTable.js";
import { getUrl } from "../utility/url.js";
import { setOnlineStatus } from "/static/accounts/js/setOnlineStatus.js";

const DEBUG_DETAIL = 0;
const DEBUG_LOG = 0;

// touteTable.jsの記述について
// game3d: { path: "/app/game/game-3d/", view: Game3D }は、/app/game/game-3d/というパスに対してGame3Dという「クラス」を対応

// ページ遷移が発生した場合のメソッド
export const switchPage = (targetPath) => {
        if (DEBUG_DETAIL) { console.log('switchPage(): start');  }

  const targetUrl = new URL(targetPath, window.location.origin);
  const targetPathName = targetUrl.pathname;

  history.pushState(null, null, targetPathName );
  if (DEBUG_LOG) { console.log(` history.push: ${targetPathName}`); }
  // 戻る、進むでも対応するために、event発行はrenderView内部に移動
  renderView(targetPathName);
};


const getSelectedRoute = (currentPath, routeTable) => {
  let params = {};  // URLパラメータを格納するオブジェクト

  // パスパラメータを含む可能性があるルートを評価
  const matchedRoute = Object.values(routeTable).find(route => {
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
    matchedRoute.params = params;
    matchedRoute.queryParams = new URLSearchParams(window.location.search);
    return matchedRoute;
  } else {
    // routeTableに存在しないpathの場合、Guest, Userともにtopを表示
    // todo: URLとinnerHTMLが乖離 -> URLも/app/に切り替えるべきか？
    return routeTable['top'];
  }
};


async function getView(path) {
  // 選択されたルートを取得
  const selectedRoute = getSelectedRoute(path, routeTable);
  // console.log("renderView: selectedRoute.path: " + selectedRoute.path)

  // 選択されたルートに対応するビューをインスタンス化して、paramsを渡す
  const url_params = selectedRoute.params;
  // console.log("renderView: params: " + JSON.stringify(url_params));
  const view = new selectedRoute.view(url_params);
  return view
}

// 現在表示しているviewを格納しておく変数: 次回の冒頭でdispose()が呼ばれる
let currentView = null;

// 全ての遷移で呼ばれるメソッド。とりあえずここに共通のものを設定
export const renderView = async (path) => {
  if (DEBUG_LOG) { console.log(` renderView: ${path}`); }
  // viewクラスのdespose()を呼び出す
  if (currentView && typeof currentView.dispose === "function") {
        if (DEBUG_DETAIL) { console.log('renderView(): currentView.dispose(): currentView', currentView);  }
    currentView.dispose();
  }
  // ここまで前回のviewに対する処理
  // --------------------------
  // ここから今回のviewに対する処理
  // viewクラスの指定とメソッド呼び出し
  const selectedRoute = getSelectedRoute(path, routeTable);
  const view = new selectedRoute.view(selectedRoute.params);
  currentView = view;
  const htmlSrc = await view.getHtml();

  let spaElement = document.querySelector("#spa");
  spaElement.innerHTML = htmlSrc;

  // document.querySelector("#spa").innerHTML = htmlSrc;
  await view.executeScript(spaElement);
        // DEBUG
        if (DEBUG_DETAIL) { console.log('renderView():htmlSrc', htmlSrc); }
        if (DEBUG_DETAIL) { console.log('renderView(): currentView', currentView); }
        if (DEBUG_DETAIL) { console.log('renderView(): selectedRoute.params', selectedRoute.params); }
        if (DEBUG_DETAIL) { console.log('event: switchPageResetState');  }
  // イベントを発行: 3Dのインスタンス更新に使用
  window.dispatchEvent(new CustomEvent('switchPageResetState'));
  // 
  setOnlineStatus();
};
