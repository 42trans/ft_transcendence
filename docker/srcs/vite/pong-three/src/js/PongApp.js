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

/**
 * -コンストラクタの呼び出しは即座に完了(次の行に進む)するが、ループはアプリケーションのライフサイクルに沿って終了まで継続
 * setupScenes: オーバーレイするシーンの数だけインスタンスを作成してください。
 */
class PongApp 
{
	constructor(env) 
	{
		this.env = env;
		this.init();
		this.boundInit = this.init.bind(this);
		window.addEventListener('switchPageResetState', this.boundInit);
	}

	async loadRouteTable() {
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
		const matchDataElement = document.getElementById('match-data');
		if (matchDataElement) {
			this.matchData = JSON.parse(matchDataElement.textContent);
			console.log('Match Data:', this.matchData);
		}

		this.routeTable = await this.loadRouteTable();

		// ゲームが終了状態の場合リダイレクト
		if (this.matchData && this.matchData.is_finished) {
			window.location.href = this.routeTable['top'].path;
			// window.location.href = 'https://localhost/app/game/tournament/';
			// リダイレクト後の処理を停止
			return;
		}

		// ピクセルへの描画を担当。処理が重いので一つに制限。シングルトン
		this.renderer = RendererManager.getRenderer();
		// 全てのシーンのmixerを一元的に管理。シングルトン
		this.animationMixersManager = AnimationMixersManager.getInstance();
		// 複数のSceneを一元的に管理。シングルトン
		this.allScenesManager = AllScenesManager.getInstance(this.animationMixersManager);
		// 3D空間（カメラ、照明、オブジェクト）を担当
		await this.allScenesManager.setupScenes();
		// ゲームの状態（待機、Play、終了）を担当。シングルトン
		this.gameStateManager = GameStateManager.getInstance(this, this.allScenesManager); 

		// 無限ループでアニメーションの更新を担当。シングルトン
		this.renderLoop = LoopManager.getInstance(this);
		this.renderLoop.start();

					//dev用　index.jsで`PongApp.main('dev');`で呼び出す
					if (this.env === 'dev'){
						this.setupDevEnv();
					} 
		
		window.addEventListener('resize', this.allScenesManager.handleResize.bind(this.allScenesManager), false);
	}
	
	stopRenderLoop() {
		if (this.renderLoop) {
			this.renderLoop.stop();
			this.renderLoop = null;
		}
	}

	static main(env)
	{
		new PongApp(env);
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

// errorが出るし、ページ遷移の問題は違う箇所で解消したのでコメントアウト
// Three.jsのアニメーションループを制御するためのグローバルな関数を定義
window.controlThreeAnimation = {
	stopAnimation: function() {
		PongApp.getInstance().stopRenderLoop();
	},
};


export default PongApp;
