/**
 * @file 
 * メインのクラス。全体（bundle.js）のフローを管理
 * シーンの初期化、アニメーションのループを呼び出す
 */
import * as THREE from 'three';
import BackgoundSceneConfig from './config/BackgoundSceneConfig';
import GameSceneConfig from './config/GameSceneConfig';
import SceneSetup from './SceneSetup';
import { BaseGameState, MainMenuState} from './game/BaseGameState'
import RendererManager from './RendererManager'
//dev用GUI
import * as lil from 'lil-gui'; 
/**
 * @param sceneSetup - シーンを設定するメソッドを持つクラス。setupScene()で使用
 * @param renderer - 計算された画像（3Dを2Dに投影）を画面に出力・描画する。THREE.WebGLRendererのインスタンス
 */
class Pong {
	/**
	 * constructor():
	 * シーンを設定し、アニメーションレンダリングループを非同期でスタートする。
	 * 終了までこのコンストラクタが継続。
	 * @description
	 * - 注: コンストラクタの呼び出しは即座に完了するが、ループはアプリケーションのライフサイクルに沿って継続
	// - Rendererの処理が重いのでシングルトン
	 */
	constructor() {
		this.renderer = RendererManager.getRenderer();
		this.setupScenesManager();
		this.initStates();
		this.startAnimationLoop();
	}

	/**
	 * Private method
	 * SceneManager:各sceneに必要な情報を一元的に持たせる
	 * */
	setupScenesManager() {
		this.backgroundManager = new SceneSetup(new BackgoundSceneConfig(), this.renderer);
		this.gameManager = new SceneSetup(new GameSceneConfig(), this.renderer);
	}
	/**
	 * Private method
	 * */
	initStates() {
		this.states = {
			mainMenu: new MainMenuState(this),
			// gameplay: new GameplayState(this),
		};
		this.currentState = this.states.mainMenu;
		this.currentState.enter();
	}
	/**
	 * Private method
	 * */
	changeState(newState) {
		this.currentState.exit();
		this.currentState = this.states[newState];
		this.currentState.enter();
	}

	/**
	 * Private method
	 * ブラウザのフレーム更新タイミングに合わせて自身を再帰的に呼び出し、連続したアニメーションフレームを生成
	 * 次の画面描画タイミングで呼び出される。ループは非同期, ブロッキングしない
	 * @description
	 * - requestAnimationFrame(animate): ブラウザに animate 関数を次の描画フレームで実行するように要求
	 *   - 非同期関数であり、実行がスケジュールされた後、即座に制御が戻る。ブロックされず次の行に進む。
	 *   - animate(): 状態の更新 (`this.update()`) とシーンの描画 (`this.render()`) を行った後、自身を再帰的にスケジュールする。キューに格納
	 * - this.update(): アニメーションミキサーの進行、カメラコントロールの更新（例えば、ユーザーのインタラクションに応じた視点変更）など
	 * - this.render(): シーンとカメラの現在の状態をもとに画面を描画。rendererは全scene共通(インスタンスは一つだけ)
	 */
	startAnimationLoop() {
		const animate = () => {
			requestAnimationFrame(animate);
			this.currentState.update();
			this.currentState.render();
		};
		animate();
	}

	/** Public method*/
	static main() {
		new Pong();
	}
}

export default Pong;