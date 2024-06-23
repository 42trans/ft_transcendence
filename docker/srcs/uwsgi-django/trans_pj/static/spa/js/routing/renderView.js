import { routeTable } from "./routeTable.js";
import { getMatchedRoute } from "./getMatchedRoute.js"
import { setOnlineStatus } from "/static/accounts/js/setOnlineStatus.js";
import { updateHeader } from "/static/spa/js/views/updateHeader.js"
import { setNoCache, clearNoCache } from "/static/spa/js/utility/cache.js"



import { isValidParam } from "../utility/isValidParam.js"

const DEBUG_DETAIL = 0;
const DEBUG_LOG = 0;

// login, signin, 42loginはcacheを保存しない
function controlCache(targetPathName) {
  if (targetPathName === routeTable['oAuthLogin'].path
      || targetPathName === routeTable['login'].path
      || targetPathName === routeTable['signup'].path) {
    setNoCache();
  } else {
    clearNoCache();
  }
}


// touteTable.jsの記述について
// game3d: { path: "/app/game/game-3d/", view: Game3D }は、/app/game/game-3d/というパスに対してGame3Dという「クラス」を対応

// ページ遷移が発生した場合のメソッド
export const switchPage = (targetPath) => {
        if (DEBUG_DETAIL) { console.log('switchPage(): start');  }

  const targetUrl = new URL(targetPath, window.location.origin);
  const targetPathName = targetUrl.pathname;

  history.pushState(null, null, targetPathName );
  controlCache()

  if (DEBUG_LOG) { console.log(` history.push: ${targetPathName}`); }
  // 戻る、進むでも対応するために、event発行はrenderView内部に移動
  renderView(targetPathName);
};



async function getView(path) {
  // 選択されたルートを取得
  const selectedRoute = await getMatchedRoute(path);
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

  if (path === routeTable['oAuthLogin'].path) {
    if (DEBUG_DETAIL) { console.log('oauth');  }
    window.location = routeTable['oAuthLogin'].path;  // oauth loginの場合はwindow切り替え
    // alert("oauth");
    return;
  }

  // ここまで前回のviewに対する処理
  // --------------------------
  // ここから今回のviewに対する処理
  // viewクラスの指定とメソッド呼び出し
  const selectedRoute = await getMatchedRoute(path);
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
  updateHeader();
};
