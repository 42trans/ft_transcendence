import * as THREE from "three";
import { Aura } from "./Aura";
import { FlareEmitter } from "./FlareEmitter";

class MagmaFlare extends THREE.Object3D {
	constructor() {
		super();
		this.name = "MagmaFlare";
		this._aura = new Aura();
		this._flareEmitter = new FlareEmitter();
		this.add(this._aura);
		this.add(this._flareEmitter);
	}
	update() {
		this._aura.update();
		this._flareEmitter.update();
	}

	fadeOut(duration = 1000) {
		const fadeOutStep = () => {
			let isComplete = true;
			this.traverse((child) => {
				if (child.material && child.material.transparent) {
					child.material.opacity -= 1 / (duration / 16);  // 16 ms per frame
					if (child.material.opacity > 0) {
						isComplete = false;
					}
				}
			});
			if (!isComplete) {
				requestAnimationFrame(fadeOutStep);
			} else {
				this.parent.remove(this);  // シーンからこのオブジェクトを削除
			}
		};
		requestAnimationFrame(fadeOutStep);
	}
}

export default MagmaFlare;