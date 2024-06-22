// docker/srcs/vite/pong-three/src/index.js

/**
 * @file エントリーポイント
 * 
 * @description 
 * - public/へのビルド方法: docker exec -it webpack2 bash -c "npm run build"
 * - buildにより、一つのjsファイル（public/bundle.js）にまとめて生成されます。　
 * - そのファイルと合わせて、public/内のファイルをすべて、django/static/share_webpack2などのディレクトリに保存してください。共有ボリュームを設定しているので、再起動時二回以内にマウントされる予定ですが、不安定な時は手動で行ってください。
 * 
 * ## 使い方
 * ### ホスト開発用サーバーの起動 ※hotReload機能
 * vite_npm_run_dev:
 * 	docker exec -it vite bash -c "npm run dev"
 * ### build
 * vite_npm_run_build:
 * 	docker exec -it vite bash -c "npm run build"
 * - Django　static用のpublic
 *   - vite/public/に一式できます。マウント共有してるので自動的にDjangoに認識されます。.gitignoreしてます
 *   - pong/static/pong/three/に自動で入ります。そこはホストマシンに保存されません。が、下記で対応
 *   - django/staticにcode/一式マウントされてるので逆流してホストに保存されます。.gitignore済み
 * 
 * ## ディレクトリ/ファイル
 * - シーン（空間）毎にSceneConfig.jsに値を設定してください。scene設定はそこで全てです。
 * - Contorls.jsのパラメーターはスライダーの感度調整なので変更しなくても問題ないはずです。が、必要なら。
 * - 3Dmodel.gltfやtextureは assejs/にまとめてます。自動でコピーされない拡張子があるので、その場合は手動でコピーしてください
*/

import PongApp from './js/PongApp'
import './css/3d.css';

// DEBUG TEST FLAG
const DEBUG_FLOW	= 0;
const DEBUG_DETAIL1	= 0;
const TEST_TRY1		= 0;
const TEST_TRY2		= 0;
const TEST_TRY3		= 0;

window.pongApp = null;
let isEventListenerRegistered = false; 
// ---------------------------------------
// init
// ---------------------------------------
async function initPongApp(env)
{
	try {
					if (DEBUG_FLOW) {	console.log('initPongApp(): start');	}
					if (TEST_TRY1){	throw new Error('TEST_TRY1');	}
		// URLをチェックしてはじく
		if (!await _isGameMatchUrl()) {
						if (DEBUG_FLOW) {	console.log('initPongApp(): not game match url');	}
			return;
		}

		if (window.pongApp){
			await window.pongApp.destroy();
			window.pongApp = null;
		}
					if (DEBUG_FLOW) {	console.log('initPongApp(): PongApp.getInstance');	}
		window.pongApp = PongApp.getInstance(env)
					if (DEBUG_FLOW) {	console.log('initPongApp(): done');	}
	} catch (error) {
		console.error('hth: initPongApp() failed', error);
		handleCatchError(error);
	}	
}
async function _isGameMatchUrl() {
	const routeTable = await loadRouteTable();
	const currentPath = window.location.pathname;
				if (DEBUG_FLOW) {	console.log('routeTable:', routeTable);	}
	const gameMatchPath = routeTable['gameMatch'].path;
	const gameMatchRegex = new RegExp(`^${gameMatchPath.replace(':matchId', '\\d+')}$`);
				if (DEBUG_DETAIL1) {	console.log('init()', currentPath, gameMatchRegex);	}
	return gameMatchRegex.test(currentPath);
}
// 3Dgameインスタンスの作成
initPongApp();
// ---------------------------------------
// switchPageResetState
// ---------------------------------------
// switchPageResetStateイベントハンドラ
async function handleSwitchPageResetState() 
{
	try {
					if (DEBUG_FLOW) { console.log('switchPageResetState: event'); }
		// 常にinitを呼び出す。内部でURLをチェックして処理中断する。
		await initPongApp();
	} catch (error) {
		console.error('hth: handleSwitchPageResetState() failed', error);
		handleCatchError(error);
	}	
}

function registerEventListenerSwitchPageResetState() 
{
	try {
					if (TEST_TRY2){	throw new Error('TEST_TRY2');	}
		if (!isEventListenerRegistered) {
			window.addEventListener('switchPageResetState', handleSwitchPageResetState);
			isEventListenerRegistered = true;
		}
	} catch (error) {
		console.error('hth: registerEventListenerSwitchPageResetState() failed', error);
		handleCatchError(error);
	}
}
// SPA中は削除できないので、重複しないようにフラグを見て書き換える
registerEventListenerSwitchPageResetState();
// ---------------------------------------
// dispose
// ---------------------------------------
async function disposePongApp() 
{
	try {
					if (TEST_TRY3){	throw new Error('TEST_TRY3');	}
		if (window.pongApp) 
		{
			window.pongApp.destroy();
			window.pongApp = null;
		}
	} catch (error) {
		console.error('hth: disposePongApp() failed', error);
		handleCatchError(error);
	}	
}

if (!window.disposePongApp) {
	window.disposePongApp = disposePongApp;
}
// ---------------------------------------
// handle error
// ---------------------------------------
// vite コンテナから Django static/ のファイルをimportするための処理
export async function loadRouteTable() {
	if (import.meta.env.MODE === 'development') {
		// 開発環境用のパス
		const devUrl = new URL('../../static/spa/js/routing/routeTable.js', import.meta.url);
		const module = await import(devUrl.href);
		return module.routeTable;
	} else {
		// 本番環境用のパス
		const prodUrl = new URL('../../../spa/js/routing/routeTable.js', import.meta.url);
		const module = await import(prodUrl.href);
		return module.routeTable;
	}
}

export async function handleCatchError(error = null) 
{
	// ゲームでのエラーは深刻なので、location.hrefでSPAの状態を完全にリセットする
	const routeTable = await loadRouteTable();
	if (error) {
		alert("エラーが発生しました。トップページに遷移します。 error: " + error);
	} else {
		alert("エラーが発生しました。トップページに遷移します。");
	}
	window.location.href = routeTable['top'].path;
}
