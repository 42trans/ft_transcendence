// docker/srcs/vite/pong-three/src/js/effect/Flare.js

import * as THREE from "three";
import flareTexture from '../../assets/img/bg.png';
import textureCache from './TextureCache';



class Flare extends THREE.Object3D 
{
	constructor() 
	{
		super();
		const geometry = new THREE.CylinderGeometry(6, 2, 0, 30, 3, true);
		this._randomRatio = Math.random();

		textureCache.getTexture(flareTexture).then(texture => 
		{
			texture.needsUpdate = true;
			this._map = texture;
			const uniforms = {
				map: { type: "t", value: texture },
				offset: { type: "v2", value: new THREE.Vector2(0, 0) },
				opacity: { type: "f", value: 0.15 },
				innerRadius: { type: "f", value: 2 },
				diameter: { type: "f", value: 4 }
			};
			this._offset = uniforms.offset.value;  // オフセットの参照を保存

			const material = new THREE.ShaderMaterial(
			{
				uniforms: uniforms,			
				vertexShader: `
					varying vec2 vUv;
					varying float radius;
					uniform vec2 offset;
			
					void main() {
						vUv = uv + offset;
						radius = length(position);
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}
				`,
				fragmentShader: `
					uniform sampler2D map;
					uniform float opacity;
					uniform float diameter;
					uniform float innerRadius;
					varying vec2 vUv;
					varying float radius;
					const float PI = 3.1415926;

					void main() {
					vec4 tColor = texture2D(map, vUv);
					float ratio = (radius - innerRadius) / diameter;
					float opacity = opacity * sin(PI * ratio);
					vec4 baseColor = (tColor + vec4(0.0, 0.0, 0.3, 1.0));
					gl_FragColor = baseColor * vec4(1.0, 1.0, 1.0, opacity);
					}
				`,
				side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent: true,
			});
			const mesh = new THREE.Mesh(geometry, material);
			this.add(mesh);
		}).catch(error => {
			console.error('hth: Texture load failed:', error);
			// オーラのない描画でゲームに進む
		});
	}

	update() 
	{
		if (!this._map || !this._offset) return;  
		this._offset.x = (performance.now() / 1000) * 0.2 * this._randomRatio;
		this._offset.y = (-performance.now() / 1000) * 0.8 * this._randomRatio;
	}
}

export default Flare;