import * as THREE from 'three';

/**
 * AnimationMixersManager:
 * - シングルトン
 *   - コンストラクタが呼び出されたときに既にインスタンスが存在するかどうかをチェック
 *   - インスタンスが存在する場合は新しいインスタンスを作成せずに既存のインスタンスを返す
 *   - getInstance 静的メソッド: インスタンスを取得するための唯一の手段として提供
 * - THREE.Clockはグローバルで一つだけ持つ
 */
class AnimationMixersManager {
	static instance = null;
	constructor() {
		if (!AnimationMixersManager.instance) {	
			this.mixers = [];
			this.clock = new THREE.Clock();
			AnimationMixersManager.instance = this;
		}
		return AnimationMixersManager.instance;
	}

	static getInstance() {
		if (!AnimationMixersManager.instance) {
			AnimationMixersManager.instance = new AnimationMixersManager();
		}
		return AnimationMixersManager.instance;
	}

	addMixer(mixer) {
		if (!mixer) {
			console.error('mixersに追加できませんでした', mixer);
		} else {
			this.mixers.push(mixer);
		}
	}

	update() {
		const delta = this.clock.getDelta();
		this.mixers.forEach(mixer => {
			mixer.update(delta);
		});
	}
}

export default AnimationMixersManager;