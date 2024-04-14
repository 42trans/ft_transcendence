/**
 * @file 
 * メインのクラス。全体（bundle.js）のフローを管理
 * シーンの初期化、アニメーションのループを呼び出す
 */
import * as THREE from 'three';
import BackgoundSceneConfig from './config/BackgoundSceneConfig';
import GameSceneConfig from './config/GameSceneConfig';
import SceneManager from './SceneManager';
import RendererManager from './RendererManager'
import GameStateManager from './GameStateManager'
//dev用GUI
import * as lil from 'lil-gui'; 
import ControlsGUI from './ControlsGUI';

/**
 * @param sceneSetup - シーンを設定するメソッドを持つクラス。setupScene()で使用
 * @param renderer - 計算された画像（3Dを2Dに投影）を画面に出力・描画する。THREE.WebGLRendererのインスタンス
 */
class Pong {
	/**
	 * constructor():
	 * シーンを設定し、アニメーションレンダリングループを非同期でスタートする。終了までこのコンストラクタが継続。
	 * @description
	 * - 注: コンストラクタの呼び出しは即座に完了するが、ループはアプリケーションのライフサイクルに沿って継続
	// - Rendererの処理が重いので一つに制限。シングルトン
	 */
	constructor() {
		this.renderer = RendererManager.getRenderer();
		this.setupScenesManager();
		this.gameStateManager = new GameStateManager(this); 
		
				// TODO_ft: dev用GUI　レビュー時削除
				this.gui = new lil.GUI();
				const contorolsGUI = new ControlsGUI(this.gameSceneManager.scene, this.gui, this.gameSceneManager.camera);
				contorolsGUI.setupControlsGUI();
				// 
				
		this.startAnimationLoop();
	}

	
	/**
	 * Private method
	 * SceneManager:各sceneに必要な情報を一元的に持たせる
	 * */
	setupScenesManager() {
		// this.backgroundSceneManager = new SceneManager(new BackgoundSceneConfig(), this.renderer);
		this.gameSceneManager = new SceneManager(new GameSceneConfig(), this.renderer);
		// 必要ならシーンを追加する。UI用,演出用など
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
			this.gameStateManager.update();
			this.gameStateManager.render();
		};
		animate();
	}

	/** Public method*/
	static main() {
		new Pong();
	}
}

export default Pong;
