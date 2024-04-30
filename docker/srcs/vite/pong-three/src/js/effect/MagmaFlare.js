import * as THREE from "three";
import Aura from "./Aura";
import FlareEmitter from "./FlareEmitter";

// 参考:【エフェクト作成入門講座 Three.js編 ゲーム演出に役立つマグマ表現の作り方 - ICS MEDIA】 <https://ics.media/entry/13973/>
class MagmaFlare extends THREE.Object3D 
{
	constructor() 
	{
		super();
		this.name = "MagmaFlare";
		this._aura = new Aura();
		this._flareEmitter = new FlareEmitter();
		this.add(this._aura);
		this.add(this._flareEmitter);
	}

	update() 
	{
		this._aura.update();
		this._flareEmitter.update();
	}

	// 透明度を徐々に下げる
	fadeOut(duration = 1000) 
	{
		const fadeOutStep = () => 
		{
			let isComplete = true;
			// Object3D.traverse: 反復処理
			this.traverse((child) => 
			{
				// ofjの種類を判定して透明度を下げる
				if (child.material && child.material.transparent) 
				{
					// 1/16秒ごとに透明にしていく
					child.material.opacity -= 1 / (duration / 16);
					if (child.material.opacity > 0) 
					{
						isComplete = false;
					}
				}
			});
			if (!isComplete) 
			{
				requestAnimationFrame(fadeOutStep);
			} 
			else 
			{
				// シーンからこのオブジェクトを削除
				this.parent.remove(this);  
			}
		};
		requestAnimationFrame(fadeOutStep);
	}
}

export default MagmaFlare;