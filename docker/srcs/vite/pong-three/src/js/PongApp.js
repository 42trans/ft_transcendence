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
import PongEngineKey from './pongEngine/PongEngineKey'
import { handleCatchError } from '../index.js';
import { loadRouteTable } from '../index.js';

//dev用GUI
import * as lil from 'lil-gui'; 
import ControlsGUI from './ControlsGUI';
// import { thickness } from 'three/examples/jsm/nodes/core/PropertyNode.js';

const DEBUG_FLOW	= 0;
const DEBUG_DETAIL	= 0;
const TEST_TRY1		= 0;
const TEST_TRY2		= 0;
const TEST_TRY3		= 0;
const TEST_TRY4		= 0;

/**
 * - コンストラクタの呼び出しは即座に完了(次の行に進む)するが、ループはアプリケーションのライフサイクルに沿って終了まで継続
 * - setupScenes: オーバーレイするシーンの数だけインスタンスを作成してください。
 */
class PongApp 
{
	static instance = null;
	constructor(env) 
	{
		this.env = env;
		this.init();
		this.boundHandleResize = null;
		this.routeTable = null;
	}

	/** シングルトンパターン */
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

	
	/**
	 * - SPAによるreloard時に対応するためコンストラクタでキャッチし、initで最初から全て処理し直す
	 * - キャッシュ機能をON
	 * - manager/内のクラスのシングルトンのインスタンスを生成
	 * - Sceneの基礎(camera,lightなど)をあらかじめ設定
	 */
	async init() 
	{
		try
		{
						if (DEBUG_FLOW) {	console.log('init(): start');	}
						if (TEST_TRY1){	throw new Error('TEST_TRY1');	}
			// ----------------------------------
			// 試合が終了しているか判定
			// ----------------------------------
			const matchDataElement = document.getElementById('match-data');
			if (!matchDataElement){
							if (DEBUG_FLOW) {	console.log('matchDataElement not found');	}
				return;
			}

			this.matchData = JSON.parse(matchDataElement.textContent);
						if (DEBUG_DETAIL) {	console.log('Match Data:', this.matchData);	}
			this.routeTable = await loadRouteTable();
			if (this.matchData && this.matchData.is_finished) 
			{
							if (DEBUG_FLOW) {	console.log('matchData.is_finished is true');	}
				// ゲームが終了状態の場合リダイレクト
				const switchPage = await PongApp.loadSwitchPage();
				const redirectTo = this.routeTable['top'].path;
				switchPage(redirectTo);
							if (DEBUG_FLOW) {	console.log('switchPage: done');	}
				return;
			}
			// ----------------------------------
			// インスタンスの作成
			// ----------------------------------
			// 全てのシーンのmixerを一元的に管理。シングルトン
			this.animationMixersManager = AnimationMixersManager.getInstance();
			// 複数のSceneを一元的に管理。シングルトン
			this.allScenesManager = AllScenesManager.getInstance(this.animationMixersManager);
			// 3D空間（カメラ、照明、オブジェクト）を担当
			await this.allScenesManager.setupScenes();
			// ゲームの状態（待機、Play、終了）を担当。シングルトン
			this.gameStateManager = GameStateManager.getInstance(this, this.allScenesManager); 
			// イベントリスナーの登録
			this.boundHandleResize = this.allScenesManager.handleResize.bind(this.allScenesManager);
			this.registerListeners();
			// PongEngineKey.registerListenersKeyUpDown()
			// 無限ループでアニメーションの更新を担当。シングルトン
			const renderLoop = LoopManager.getInstance(this);
			this.renderLoop = renderLoop;
			// -----------------------------------------------------------------------------
			// 再描画のバグの根本原因の対策はこの行。再度コンストラクタから作り直すような処理。理由は不明
			// -----------------------------------------------------------------------------
			RendererManager.getInstance().reinitializeRenderer();
			// -----------------------------------------------------------------------------
			// 他のMgrが依存するので、この位置でリセット。マネージャーが生成された後のタイミングで再初期化を行う
			this.renderer = RendererManager.getRenderer();
			this.renderLoop.loopStart();

						//dev用　index.jsで`PongApp.main('dev');`で呼び出す
						if (this.env === 'dev'){
							this.setupDevEnv();
						} 

						if (DEBUG_FLOW) {	console.log('init(): done');	}	
						if (TEST_TRY2){	throw new Error('TEST_TRY2');	}
		} catch (error) {
			console.error('hth: init() failed', error);
			handleCatchError(error);
		}	
	}
	

	registerListeners() {
		PongEngineKey.registerListenersKeyUpDown();
		window.addEventListener('resize', this.boundHandleResize, false);
	}

	unregisterListeners() {
		PongEngineKey.unregisterListenersKeyUpDown();
		window.removeEventListener('resize', this.boundHandleResize);
	}

	static async loadSwitchPage() {
		if (import.meta.env.MODE === 'development') {
			// 開発環境用のパス
			const devUrl = new URL('../../static/spa/js/routing/renderView.js', import.meta.url);
			const module = await import(devUrl.href);
			return module.switchPage;
		} else {
			// 本番環境用のパス
			const prodUrl = new URL('../../../spa/js/routing/renderView.js', import.meta.url);
			const module = await import(prodUrl.href);
			return module.switchPage;
		}
	}

	/**
	 * ページから抜ける（アウト）時にspa/js/views/AbstractView.jsの dispose() から呼び出される
	 */
	async destroy() 
	{
		try
		{
						if (DEBUG_FLOW) {	console.log('destroy(): start');	}
						if (TEST_TRY3){	throw new Error('TEST_TRY3');	}
			if (!window.pongApp){
							if (DEBUG_FLOW) {	console.log('destroy(): window.pongApp is false');	window.pongApp}
				return;
			}
			// まとめてeventlistenerを削除
			this.unregisterListeners();
			
			this.stopRenderLoop();
			if (this.allScenesManager){
				this.allScenesManager.dispose();
			}
			if (this.renderer)
				{
				// THREE.WebGLRendererのメソッド
				// これだけでは不足で、init()でインスタンスの廃棄が必要
				// TODO_ft-2:　インスタンスの廃棄をdispose()を実装して行うべき
				// if (RendererManager.instance) {
				// 	RendererManager.instance.dispose();
				// }
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

			if (this.boundHandleResize) 
			{
				window.removeEventListener('resize', this.boundHandleResize);
				this.boundHandleResize = null;
			}

			// lil-gui を破棄
			if (this.gui) {
				this.gui.destroy();
				this.gui = null;
			}

			this.env = null;
			this.boundHandleResize = null;	
			this.routeTable = null;
			this.matchData = null;
			this.renderer = null;
			this.animationMixersManager = null;
			this.allScenesManager = null;
			this.gameStateManager = null;
			this.renderLoop = null;
			PongApp.instance = null;
						if (DEBUG_FLOW) {	console.log('destroy(): done');	window.pongApp}
						if (TEST_TRY4){	throw new Error('TEST_TRY4');	}
		} catch (error) {
			console.error('hth: destroy() failed', error);
			handleCatchError(error);
		}	
	}


	/** ブラウザの再描画タイミングで描画を実行する処理の停止 */
	stopRenderLoop() 
	{
		try{
			if (this.renderLoop) {
				this.renderLoop.loopStop();
				this.renderLoop = null;
			}
		} catch (error) {
			console.error('hth: stopRenderLoop() failed', error);
			handleCatchError(error);
		}	
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
