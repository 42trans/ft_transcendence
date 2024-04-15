/**
 * @file 
 * メインのクラス。システム全体の初期設定と、ゲームのメインループを担当
 */
import BackgroundSceneConfig from './config/BackgroundSceneConfig';
import GameSceneConfig from './config/GameSceneConfig';
import EffectsSceneConfig from './config/EffectsSceneConfig';
import RendererManager from './RendererManager'
import SceneManager from './SceneManager';
import SceneAggregate from './SceneAggregate';
import GameStateManager from './GameStateManager'
import GlobalAnimationMixer from './GlobalAnimationMixer'
import AnimationLoop from './AnimationLoop'
//dev用GUI
import * as lil from 'lil-gui'; 
import ControlsGUI from './ControlsGUI';
// import { MagmaFlare } from './effect/MagmaFlare'

/**
 * constructor: C++でいうとmain()のような役割。AnimationLoopは非同期で再帰し、アプリ終了まで残ります。
 * setupScenes: オーバーレイするシーンの数だけインスタンスを作成してください。
 */
class Pong {
	//  コンストラクタの呼び出しは即座に完了(次の行に進む)するが、ループはアプリケーションのライフサイクルに沿って終了まで継続
	constructor() {		
		// ピクセルへの描画を担当。処理が重いので一つに制限。シングルトン
		this.renderer = RendererManager.getRenderer();
		// 全てのシーンのmixerを一元的に管理
		this.globalAnimationMixer = new GlobalAnimationMixer();
		// 複数のSceneを一元的に管理
		this.sceneAggregate = new SceneAggregate(this.globalAnimationMixer);
		// 3D空間（カメラ、照明、オブジェクト）を担当
		this.setupScenes();
		// ゲームの状態（待機、Play、終了）を担当
		this.gameStateManager = new GameStateManager(this); 
		// アニメーションの更新を担当
		this.animationLoop = new AnimationLoop(this);
		this.animationLoop.start();
		
				//dev用
				this.setupDevEnv();
	}

	setupScenes() {
		this.backgroundSceneManager = new SceneManager(new BackgroundSceneConfig(), this.renderer, 'background', this.globalAnimationMixer);
		this.gameSceneManager = new SceneManager(new GameSceneConfig(), this.renderer, 'game', this.globalAnimationMixer);
		this.effectsSceneManager = new SceneManager(new EffectsSceneConfig(), this.renderer, 'effects', this.globalAnimationMixer);
		this.sceneAggregate.addSceneManager(this.backgroundSceneManager);
		this.sceneAggregate.addSceneManager(this.gameSceneManager);
		this.sceneAggregate.addSceneManager(this.effectsSceneManager);
	}

	update() {
		this.sceneAggregate.updateAllScenes();
	}

	render() {
		this.sceneAggregate.renderAllScenes(this.renderer);
	}

	// TODO_ft: dev用GUI: カメラと照明をコントロールするパネルを表示　レビュー時削除
	setupDevEnv() {
		this.gui = new lil.GUI();
		const contorolsGUI = new ControlsGUI(this.gameSceneManager.scene, this.gui, this.gameSceneManager.camera);
		contorolsGUI.setupControlsGUI();
	}

	static main() {
		new Pong();
	}
}

export default Pong;
