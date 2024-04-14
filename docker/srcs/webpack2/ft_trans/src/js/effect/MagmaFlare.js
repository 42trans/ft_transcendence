import * as THREE from "three";
import { Aura } from "./Aura";
import { FlareEmitter } from "./FlareEmitter";

export class MagmaFlare extends THREE.Object3D {
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
}
