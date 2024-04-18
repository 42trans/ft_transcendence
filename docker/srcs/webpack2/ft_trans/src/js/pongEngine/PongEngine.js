
import GameParametersConfig from './GameParametersConfig';
import PongEngineInitializer from './PongEngineInitializer';
import PongEngineUpdate from './PongEngineUpdate';
// import PongEngineUpdate from './PongEngineUpdate';
import * as THREE from 'three';
import RendererManager from '../manager/RendererManager';
import AnimationMixersManager from '../manager/AnimationMixersManager';

/**
 * 参考:【nklsrh/BuildNewGames_ThreeJSGame: A game built to show off some of the basic features of the Three.JS WebGL library.】 <https://github.com/nklsrh/BuildNewGames_ThreeJSGame/tree/gh-pages>
 */
class PongEngine {
	constructor(PongApp) {

		this.renderer = RendererManager.getRnderer();
		this.animationMixersManager = AnimationMixersManager.getInstance();
		this.scene = PongApp.allScenesManager.gameScene.scene;
		this.camera = PongApp.allScenesManager.gameScene.camera;
		this.config = new GameParametersConfig();

		this.initializer = new PongEngineInitializer(this.renderer, this.scene, this.config);
		this.objects = this.initializer.createGameObjects();
		this.initializer.setupGameScene(this.objects);
		this.pongEngineUpdate = new PongEngineUpdate(this);

		this.animate = this.animate.bind(this);  // バインドして、正しいコンテキストで呼び出されるようにする
		// アニメーションを開始する前に一定時間待機
		setTimeout(() => {
			this.animate();  // ゲームループ開始
		}, 4500); // 1500ミリ秒後に開始、この値は必要に応じて調整
		// this.animate();  // ゲームループ開始
	}
	
	updateGame() {
		this.pongEngineUpdate.updateGame();
	}

	animate() {
		requestAnimationFrame(this.animate);  // 次のフレームをスケジュール
		this.updateGame();  // ゲーム状態を更新
		// this.renderer.render(this.scene, this.camera);  // シーンをレンダリング（カメラを適切に設定）
	}
}

export default PongEngine;
