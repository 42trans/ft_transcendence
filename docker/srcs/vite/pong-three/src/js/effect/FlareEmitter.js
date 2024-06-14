// docker/srcs/vite/pong-three/src/js/effect/FlareEmitter.js
import * as THREE from "three";
import Flare from "./Flare";


class FlareEmitter extends THREE.Object3D 
{
	constructor() 
	{
		super();
		this._flareNum = 10;  // フレアの数
		this._flareList = []; // フレアリスト

		const perAngle = 360 / this._flareNum;
		for (let i = 0; i < this._flareNum; i++) {
			const rad = (perAngle * i * Math.PI) / 180;
			const flare = new Flare();
			flare.rotation.x = rad;
			flare.rotation.y = rad;
			flare.rotation.z = rad / 2;
			this.add(flare);
			this._flareList.push(flare);
		}
	}

	update() 
	{
		this._flareList.forEach((flare) => 
		{
			flare.update();
		});
	}
}

export default FlareEmitter;