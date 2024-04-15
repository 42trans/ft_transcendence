import * as THREE from 'three';

class AnimationMixersManager {
	constructor() {
		this.mixers = [];
		 // クロックはグローバルで一つだけ持つ
		this.clock = new THREE.Clock();
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