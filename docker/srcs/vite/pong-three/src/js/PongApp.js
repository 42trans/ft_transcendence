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
 * constructor: C++でいうとmain()のような役割。RenderLoopは非同期で再帰し、アプリ終了まで残ります。
 *   -コンストラクタの呼び出しは即座に完了(次の行に進む)するが、ループはアプリケーションのライフサイクルに沿って終了まで継続
 * setupScenes: オーバーレイするシーンの数だけインスタンスを作成してください。
 */
class PongApp 
{
	constructor(env) 
	{
		this.env = env;
		
		document.addEventListener('DOMContentLoaded', () => 
		{
			const matchDataElement = document.getElementById('match-data');
			if (matchDataElement) {
				this.matchData = JSON.parse(matchDataElement.textContent);
				// console.log('Match Data:', this.matchData);
			}
			this.init();
			// 無限ループでアニメーションの更新を担当。シングルトン
			this.renderLoop = LoopManager.getInstance(this);
			this.renderLoop.start();
						
						//dev用　index.jsで`PongApp.main('dev');`で呼び出す
						if (env === 'dev'){
							this.setupDevEnv();
						}
		});
	}

	/**
	 * - キャッシュ機能をON
	 * - manager/内のクラスのシングルトンのインスタンスを生成
	 * - Sceneの基礎(camera,lightなど)をあらかじめ設定
	 */
	init() 
	{
		// ピクセルへの描画を担当。処理が重いので一つに制限。シングルトン
		this.renderer = RendererManager.getRenderer();
		// 全てのシーンのmixerを一元的に管理。シングルトン
		this.animationMixersManager = AnimationMixersManager.getInstance();
		// 複数のSceneを一元的に管理。シングルトン
		this.allScenesManager = AllScenesManager.getInstance(this.animationMixersManager);
		// 3D空間（カメラ、照明、オブジェクト）を担当
		// TODO_ft:開幕はモデルを読み込まないようにしたい。もう少し遅延できないものか。要設計
		this.allScenesManager.setupScenes();
		// ゲームの状態（待機、Play、終了）を担当。シングルトン
		this.gameStateManager = GameStateManager.getInstance(this, this.allScenesManager); 
	}
	
	static main(env) 
	{
		new PongApp(env);
	}
				// TODO_ft: dev用GUI: カメラと照明をコントロールするパネルを表示　レビュー時削除
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
