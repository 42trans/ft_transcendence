// docker/srcs/vite/pong-three/src/js/PongApp.js

/**
 * @file 
 * メインのクラス。システム全体の初期設定と、ゲームのメインループを担当
 */
import * as THREE from 'three';
import AllScenesManager from './manager/AllScenesManager';
import AnimationMixersManager from './manager/AnimationMixersManager'
import GameStateManager from './manager/GameStateManager'
import LoopManager from './manager/LoopManager'
import RendererManager from './manager/RendererManager'

//dev用GUI
import * as lil from 'lil-gui'; 
import ControlsGUI from './ControlsGUI';
// import { thickness } from 'three/examples/jsm/nodes/core/PropertyNode.js';

const DEBUG_FLOW = 0;
const DEBUG_DETAIL = 0;

/**
 * -コンストラクタの呼び出しは即座に完了(次の行に進む)するが、ループはアプリケーションのライフサイクルに沿って終了まで継続
 * setupScenes: オーバーレイするシーンの数だけインスタンスを作成してください。
 */
class PongApp 
{
	static instance = null;
	constructor(env) 
	{
		this.env = env;
		this.init();
	}

	static getInstance(env)
	{
				if (DEBUG_FLOW) {	console.log('getInstance(): start');	}
		if (!PongApp.instance)
		{
					if (DEBUG_FLOW) {	console.log('new PongApp');	}
			PongApp.instance = new PongApp(env);
		}
				if (DEBUG_FLOW) {	console.log('getInstance(): done');	}
		return PongApp.instance;
	}

	static async loadRouteTable() 
	{
		if (import.meta.env.MODE === 'development') {
			// 開発環境用のパス
			const devUrl = new URL('../static/spa/js/routing/routeTable.js', import.meta.url);
			const module = await import(devUrl.href);
			return module.routeTable;
		} else {
			// 本番環境用のパス
			const prodUrl = new URL('../../../spa/js/routing/routeTable.js', import.meta.url);
			const module = await import(prodUrl.href);
			return module.routeTable;
		}
	}
	
	/**
	 * - SPAによるreloard時に対応するためコンストラクタでキャッチし、initで最初から全て処理し直す
	 * - キャッシュ機能をON
	 * - manager/内のクラスのシングルトンのインスタンスを生成
	 * - Sceneの基礎(camera,lightなど)をあらかじめ設定
	 */
	async init() 
	{
					if (DEBUG_FLOW) {	console.log('init(): start');	}

		// urlがtournametの試合かどうかを判定
		const currentPath = window.location.pathname;
		const routeTable = await PongApp.loadRouteTable();
					if (DEBUG_DETAIL) {	console.log('routeTable:', routeTable);	}
		const gameMatchPath = routeTable['gameMatch'].path;
		const gameMatchRegex = new RegExp(`^${gameMatchPath.replace(':matchId', '\\d+')}$`);
		if (!gameMatchRegex.test(currentPath)) {
						if (DEBUG_FLOW) {	console.log('init()', currentPath, gameMatchRegex);	}
			return;
		}
		
		// 試合が終了しているかを判定する処理
		const matchDataElement = document.getElementById('match-data');
					if (DEBUG_FLOW) {	console.log('init() matchDataElement: ', matchDataElement);	}
		if (matchDataElement) 
		{
			this.matchData = JSON.parse(matchDataElement.textContent);
						if (DEBUG_DETAIL) {	console.log('Match Data:', this.matchData);	}
		} else {
						if (DEBUG_FLOW) {	console.log('matchDataElement not found');	}
			return;
		}
		this.routeTable = await PongApp.loadRouteTable();
		if (this.matchData && this.matchData.is_finished) 
		{
				if (DEBUG_FLOW) {	console.log('matchData.is_finished is true');	}
			// ゲームが終了状態の場合リダイレクト
			window.location.href = this.routeTable['top'].path;
			return;
		}

		// 後に移動
		// ピクセルへの描画を担当。処理が重いので一つに制限。シングルトン
		// RendererManager.getInstance().reinitializeRenderer();
		// this.renderer = RendererManager.getRenderer();
		// 		if (DEBUG_DETAIL) {	console.log('this.renderer', this.renderer);	}


		// 全てのシーンのmixerを一元的に管理。シングルトン
		this.animationMixersManager = AnimationMixersManager.getInstance();
		// 複数のSceneを一元的に管理。シングルトン
		this.allScenesManager = AllScenesManager.getInstance(this.animationMixersManager);
		// 3D空間（カメラ、照明、オブジェクト）を担当
		await this.allScenesManager.setupScenes();
					if (DEBUG_DETAIL) {	console.log('this.allScenesManager', this.allScenesManager);	}
		// ゲームの状態（待機、Play、終了）を担当。シングルトン
		this.gameStateManager = GameStateManager.getInstance(this, this.allScenesManager); 
					if (DEBUG_DETAIL) {	console.log('this.gameStateManager', this.gameStateManager);	}
		// 無限ループでアニメーションの更新を担当。シングルトン
		const renderLoop = LoopManager.getInstance(this);
					if (DEBUG_DETAIL) {	console.log('renderLoop', renderLoop);	}
					if (DEBUG_DETAIL) {	console.log('renderLoop.pong', renderLoop.pong);	}
		this.renderLoop = renderLoop;

		// -----------------------------------------------------------------------------
		// 再描画のバグの根本原因の対策はこの行。再度コンストラクタから作り直すような処理。理由は不明
		// -----------------------------------------------------------------------------
		RendererManager.getInstance().reinitializeRenderer();
		// -----------------------------------------------------------------------------
		// 他のMgrが依存してるので、この位置でリセット。マネージャーが生成された後のタイミングで再初期化を行う
		this.renderer = RendererManager.getRenderer();
				if (DEBUG_DETAIL) {	console.log('this.renderer', this.renderer);	}
		this.renderLoop.start();

					//dev用　index.jsで`PongApp.main('dev');`で呼び出す
					if (this.env === 'dev'){
						this.setupDevEnv();
					} 
		
		this.boundHandleResize = this.allScenesManager.handleResize.bind(this.allScenesManager);
		window.addEventListener('resize', this.boundHandleResize, false);
					if (DEBUG_FLOW) {	console.log('init(): done');	}
	}
	
	stopRenderLoop() 
	{
		if (this.renderLoop) {
			this.renderLoop.stop();
			this.renderLoop = null;
		}
	}

	// spa/js/views/AbstractView.jsの dispose から呼び出される
	async destroy() 
	{
					if (DEBUG_FLOW) {	console.log('destroy(): start');	}

		if (!window.pongApp){
						if (DEBUG_FLOW) {	console.log('destroy(): window.pongApp is false');	window.pongApp}
			return;
		}
		this.stopRenderLoop();
		if (this.allScenesManager){
			this.allScenesManager.dispose();
		}
		if (this.renderer){
			// THREE.WebGLRendererのメソッド
			// これだけでは不足のようで、init()でインスタンスの廃棄が必要
			this.renderer.dispose();
		}
		if (this.animationMixersManager){
			this.animationMixersManager.dispose();
		}
		if (this.renderLoop) {
			this.renderLoop.dispose();
		}
		if (this.gameStateManager) {
			this.gameStateManager.dispose();
		}
		// イベントリスナーを削除
		window.removeEventListener('resize', this.boundHandleResize);
		PongEngineKey.removeListeners();

		// DOM書き換えと同時に削除されるので冗長だが、一応Buttonの設定も削除
		// removeメソッドを使用するにはインスタンスが必要なのでボタンに対して行う
		const endGameButton = document.getElementById('hth-threejs-back-to-home-btn');
		if (endGameButton) {
			endGameButton.removeEventListener('click', this.handleEndGameButtonClick);
		}
		const startGameButton = document.getElementById('hth-threejs-start-game-btn');
		if (startGameButton) {
			this.startGameButton.removeEventListener('click', this.boundHandleButtonClick);
		}

		// lil-gui を破棄
		if (this.gui) {
			this.gui.destroy();
			this.gui = null;
		}

		this.env = null;
		this.matchData = null;
		this.routeTable = null;
		this.renderer = null;
		this.animationMixersManager = null;
		this.allScenesManager = null;
		this.gameStateManager = null;
		this.renderLoop = null;
		PongApp.instance = null;
					if (DEBUG_FLOW) {	console.log('destroy(): done');	window.pongApp}
	}


				setupDevEnv()
				{
					this.gui = new lil.GUI();
					const contorolsGUI = new ControlsGUI(
						this.allScenesManager.effectsScene.scene,
						this.gui,
						this.allScenesManager.effectsScene.camera
					);
					contorolsGUI.setupControlsGUI();
				}


}


export default PongApp;
