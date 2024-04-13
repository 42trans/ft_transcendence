import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/** アニメーションを管理するクラス */
class AnimationManager {
	/**
	 * AnimationManagerのコンストラクタ
	 * @param {THREE.WebGLRenderer} renderer - 計算された画像（3Dを2Dに投影）を画面に出力・描画するインスタンス。
	 * @param {THREE.Scene} scene - 描画操作が行われる空間・ワールド。
	 * @param {THREE.PerspectiveCamera} camera - カメラ。
	 * @param {OrbitControls} controls - カメラの操作。
	 * @param {THREE.AnimationMixer[]} mixers  
	 * @param {THREE.Clock[]} clock - アニメーションを管理するクロックインスタンス
	 */
	constructor (
		renderer,
		scene,
		camera,
		controls
	){
		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;
		this.controls = controls;
		this.mixers = [];
		this.clock =  new THREE.Clock();
	}

	/**
	 * Public method
	 * 外部からアニメーションミキサーを設定または更新するためのインターフェースを提供
	 * 
	 * @description
	 * ## THREE.AnimationMixer
	 * - 多様なアニメーションの同時制御: ex.歩きながら手を振る
	 * - 時間制御: アニメーションの再生速度や遅延、ループ回数などを正確に管理
	 * - イベント駆動が可能: アニメーションフック(特定のタイミングでサウンド再生、シーン遷移など)
	 * @param {THREE.AnimationMixer} newMixer nullも受け付ける
	 */
	setMixer(newMixer) {
		this.mixers.push(newMixer);
	}

	/** Public method
	 * アニメーションミキサーの進行、カメラコントロールの更新などを行う。
	 */
	update() {
		const delta = this.clock.getDelta();
		this.mixers.forEach(mixer => mixer.update(delta));
		if (this.controls) {
			this.controls.update();
		}
	}
}

export default AnimationManager;