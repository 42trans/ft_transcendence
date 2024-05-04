// TextureCache.js
import * as THREE from 'three';

class TextureCache 
{
	constructor() 
	{
		this.cache = new Map();
		this.loader = new THREE.TextureLoader();
	}

	getTexture(texturePath) 
	{
		if (this.cache.has(texturePath)) 
		{
			return Promise.resolve(this.cache.get(texturePath));
		} 
		else 
		{
			return new Promise((resolve, reject) => {
				this.loader.load(texturePath, (texture) => {
					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
					this.cache.set(texturePath, texture);
					resolve(texture);
				}, undefined, reject);
			});
		}
	}
}

const textureCache = new TextureCache();
export default textureCache;
