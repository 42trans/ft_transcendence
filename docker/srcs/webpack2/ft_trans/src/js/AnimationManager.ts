import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/** アニメーションを管理するクラス */
class AnimationManager {
	// 外部からアクセス可能なアニメーションの状態を管理するための変数と関数
	private mixer: THREE.AnimationMixer | null = null;
	// アニメーションを管理するクロックインスタンス
	private clock: THREE.Clock = new THREE.Clock();
	private scene: THREE.Scene
	private camera!: THREE.PerspectiveCamera;
	private renderer!: THREE.WebGLRenderer;
	private controls!: OrbitControls;

	/**
	 * AnimationManagerのコンストラクタ
	 * @param renderer - 計算された画像（3Dを2Dに投影）を画面に出力・描画する。THREE.WebGLRendererのインスタンス
	 * @param scene - 描画操作が行われる空間・ワールド。THREE.Sceneのインスタンス
	 * @param camera - カメラ。THREE.PerspectiveCameraのインスタンス
	 * @param controls - カメラの操作。OrbitControlsのインスタンス。
	 */
	constructor (
		renderer: THREE.WebGLRenderer,
		scene: THREE.Scene,
		camera: THREE.PerspectiveCamera,
		controls: OrbitControls
	){
		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;
		this.controls = controls;
	}

	/**
	 * 外部からアニメーションミキサーを設定または更新するためのインターフェースを提供
	 * 
	 * @description
	 * ## THREE.AnimationMixer
	 * - 多様なアニメーションの同時制御: ex.歩きながら手を振る
	 * - 時間制御: アニメーションの再生速度や遅延、ループ回数などを正確に管理
	 * - イベント駆動が可能: アニメーションフック(特定のタイミングでサウンド再生、シーン遷移など)
	 * @param newMixer nullも受け付ける
	 */
	setMixer(newMixer: THREE.AnimationMixer | null): void {
		this.mixer = newMixer;
	}

	/**
	 * ブラウザのフレーム更新タイミングに合わせて自身を再帰的に呼び出し、連続したアニメーションフレームを生成
	 * 
	 * @description
	 * ## 動作
	 * - ブラウザのフレーム更新タイミングに合わせて自身を再帰的に呼び出す
	 *   - 次の画面描画タイミングで呼び出される
	 *   - ループは非同期, ブロッキングしない
	 * - 連続したアニメーションフレームを生成
	 * 
	 * ## 関数
	 * - requestAnimationFrame(animate): ブラウザに animate 関数を次の描画フレームで実行するように要求
	 *   - 非同期関数であり、実行がスケジュールされた後、即座に制御が戻る。ブロックされず次の行に進む。
	 *   - animate(): 状態の更新 (`this.update()`) とシーンの描画 (`this.render()`) を行った後、自身を再帰的にスケジュールする。
	 *   - キューに格納
	 * - this.update(): アニメーションミキサーの進行、カメラコントロールの更新（例えば、ユーザーのインタラクションに応じた視点変更）など
	 * - this.render(): シーンとカメラの現在の状態をもとに画面を描画
	 * 
	 * @example
	 * // App.tsのメイン関数から呼び出し
	 * const animationManager = new AnimationManager(renderer, scene, camera, controls);
	 * animationManager.startAnimationLoop(); 
	 */
	startAnimationLoop(): void {
		const animate = () => {
			// 次のフレームでanimateを再び呼び出す
			// 非同期。ブロックされない。requestAnimationFrame()の終了を待たずに進む
			requestAnimationFrame(animate);
			// 状態を更新
			this.update();
			// シーンを描画
			this.render();
		}
		// 初回の呼び出し
		animate();
	}

	private update(): void {
		const delta = this.clock.getDelta();
		if (this.mixer){
			this.mixer.update(delta);
		}
		this.controls.update();
	}

	private render(): void {
		this.renderer.render(this.scene, this.camera);
	}
}

export default AnimationManager;