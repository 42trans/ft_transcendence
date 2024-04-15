/**
 * @file 
 * メインのクラス。システム全体の初期設定と、ゲームのメインループを担当
 */
import BackgroundSceneConfig from './config/BackgroundSceneConfig';
import GameSceneConfig from './config/GameSceneConfig';
import EffectsSceneConfig from './config/EffectsSceneConfig';
import RendererManager from './RendererManager'
import SceneUnit from './SceneUnit';
import AllScenesManager from './AllScenesManager';
import GameStateManager from './GameStateManager'
import AnimationMixersManager from './AnimationMixersManager'
import RenderLoop from './RenderLoop'
//dev用GUI
import * as lil from 'lil-gui'; 
import ControlsGUI from './ControlsGUI';
// import { MagmaFlare } from './effect/MagmaFlare'

/**
 * constructor: C++でいうとmain()のような役割。RenderLoopは非同期で再帰し、アプリ終了まで残ります。
 * setupScenes: オーバーレイするシーンの数だけインスタンスを作成してください。
 */
class Pong {
	//  コンストラクタの呼び出しは即座に完了(次の行に進む)するが、ループはアプリケーションのライフサイクルに沿って終了まで継続
	constructor() {		
		// ピクセルへの描画を担当。処理が重いので一つに制限。シングルトン
		this.renderer = RendererManager.getRnderer();
		// 全てのシーンのmixerを一元的に管理
		this.animationMixersManager = AnimationMixersManager.getInstance();
		// 複数のSceneを一元的に管理
		this.allScenesManager = AllScenesManager.getInstance(this.animationMixersManager);
		// 3D空間（カメラ、照明、オブジェクト）を担当
		this.setupScenes();
		// ゲームの状態（待機、Play、終了）を担当
		this.gameStateManager = GameStateManager.getInstance(this); 
		// アニメーションの更新を担当
		this.renderLoop = RenderLoop.getInstance(this);
		// this.RenderLoop = new RenderLoop(this);
		this.renderLoop.start();
		
				//dev用
				this.setupDevEnv();
	}

	setupScenes() {
		this.backgroundSceneUnit = new SceneUnit(new BackgroundSceneConfig(), this.renderer, 'background', this.animationMixersManager);
		this.gameSceneUnit = new SceneUnit(new GameSceneConfig(), this.renderer, 'game', this.animationMixersManager);
		this.effectsSceneUnit = new SceneUnit(new EffectsSceneConfig(), this.renderer, 'effects', this.animationMixersManager);
		this.allScenesManager.addSceneUnit(this.backgroundSceneUnit);
		this.allScenesManager.addSceneUnit(this.gameSceneUnit);
		this.allScenesManager.addSceneUnit(this.effectsSceneUnit);
	}

	update() {
		this.allScenesManager.updateAllScenes();
	}

	render() {
		this.allScenesManager.renderAllScenes(this.renderer);
	}

	// TODO_ft: dev用GUI: カメラと照明をコントロールするパネルを表示　レビュー時削除
	setupDevEnv() {
		this.gui = new lil.GUI();
		const contorolsGUI = new ControlsGUI(
			this.backgroundSceneUnit.scene, 
			this.gui, 
			this.backgroundSceneUnit.camera
		);
		contorolsGUI.setupControlsGUI();
	}

	static main() {
		new Pong();
	}
}

export default Pong;
