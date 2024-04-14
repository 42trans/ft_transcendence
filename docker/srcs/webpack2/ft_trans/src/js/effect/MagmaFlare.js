import * as THREE from "three";
import { Aura } from "./Aura";
import { FlareEmitter } from "./FlareEmitter";

export class MagmaFlare extends THREE.Object3D {
	constructor() {
		super();
		this._aura = new Aura();
		this._flareEmitter = new FlareEmitter();
		this.add(this._aura);
		this.add(this._flareEmitter);
		// this.layers = {
		// 	Aura: true,
		// 	Flare: true,
		// };
	}
	update() {
		this._aura.update();
		// this._flareEmitter.update();
	}
}
