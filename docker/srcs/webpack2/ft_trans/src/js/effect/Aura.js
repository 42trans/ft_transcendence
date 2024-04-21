import * as THREE from "three";
import auraTexture from '../../assets/ballTexture/bg.png';
import textureCache from './TextureCache'; 

class Aura extends THREE.Object3D 
{
	constructor() 
	{
		super();
		const geometry = new THREE.SphereGeometry(2.02, 40, 40);
		textureCache.getTexture(auraTexture).then(texture => {
			const material = new THREE.MeshBasicMaterial(
				{
					map: texture,
					blending: THREE.AdditiveBlending,
					transparent: true
				}
			);
			const mesh = new THREE.Mesh(geometry, material);
			this.add(mesh);
		}).catch(error => console.error('Texture load failed:', error));
	}

	update() 
	{
		if (!this.textureLoaded) return;
		this._map.offset.x = -performance.now() / 1000 / 4;
		this._map.offset.y = -performance.now() / 1000 / 4;
	}
}

export default Aura;