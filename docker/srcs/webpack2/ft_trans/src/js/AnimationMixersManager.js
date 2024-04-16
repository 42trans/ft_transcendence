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
			// this.mixers = [];
			this.clock = new THREE.Clock();
			AnimationMixersManager.instance = this;
			this.mixersMap = new Map();
		}
		return AnimationMixersManager.instance;
	}

	static getInstance() {
		if (!AnimationMixersManager.instance) {
			AnimationMixersManager.instance = new AnimationMixersManager();
		}
		return AnimationMixersManager.instance;
	}

	addMixer(object, mixer) {
        this.mixersMap.set(object.uuid, mixer);
		console.log(` UUID: ${object.uuid}`);
		console.log(` mixer: ${mixer}`);
    }

	removeMixer(object) {
		if (!object || !object.uuid) {
			console.error("Invalid object or missing UUID.");
			return;
		}
	
		if (this.mixersMap.has(object.uuid)) {
			this.mixersMap.delete(object.uuid);
			console.log(`Mixer removed for object UUID: ${object.uuid}`);
		} else {
			console.log(`Mixer not found for UUID: ${object.uuid}`);
		}
	}

	update() {
		const delta = this.clock.getDelta();
		// console.log(`Delta time for updates: ${delta}`);
		this.mixersMap.forEach((mixer, uuid) => {
			// console.log(`Updating mixer for UUID: ${uuid}`);
			if (mixer && typeof mixer.update === 'function') {
				try {
					mixer.update(delta);
					// console.log(`Mixer updated for UUID: ${uuid}`);
				} catch (error) {
					console.error(`Error updating mixer for UUID: ${uuid}:`, error);
					// 不正なミキサーをマップから削除する
					this.mixersMap.delete(uuid);
				}
			} else {
				console.error(`Invalid mixer for UUID: ${uuid}`);
				this.mixersMap.delete(uuid);  // 不正なエントリを削除
			}
		});
	}
	
		
}

export default AnimationMixersManager;