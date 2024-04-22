import * as THREE from "three";
import auraTexture from '../../assets/ballTexture/bg.png';
import textureCache from './TextureCache'; 

class Aura extends THREE.Object3D 
{
	constructor() 
	{
		super();
		this.textureLoaded = false;
		const geometry = new THREE.SphereGeometry(2.02, 40, 40);
		textureCache.getTexture(auraTexture).then(texture => {
			const material = new THREE.MeshBasicMaterial(
				{
					map: texture,
					blending: THREE.AdditiveBlending,
					transparent: true
				}
			);
			this.mesh = new THREE.Mesh(geometry, material);
			this.add(this.mesh);
			this.textureLoaded = true;
		}).catch(error => {
			console.error('Texture load failed:', error);
			this.textureLoaded = false;
		});
	}

	update() 
	{
		// console.log("Aura updated");
		if (!this.textureLoaded) return;
		this.mesh.material.map.offset.x = -performance.now() / 1000 / 4;
		this.mesh.material.map.offset.y = -performance.now() / 1000 / 4;
	}
}

export default Aura;