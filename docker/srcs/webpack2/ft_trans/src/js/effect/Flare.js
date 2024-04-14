import * as THREE from "three";
import flareTexture from '../../assets/ballTexture/bg.png';

/**
 * フレアクラスです。
 */
export class Flare extends THREE.Object3D {
/**
 * コンストラクター
 */
constructor() {
	super();

	// 上面の半径
	const topRadius = 6;
	// 下面の半径
	const bottomRadius = 2;
	// ドーナツの太さ
	const diameter = topRadius - bottomRadius;

	// ジオメトリ
	const geometry = new THREE.CylinderGeometry(
		topRadius,
		bottomRadius,
		0,
		30,
		3,
		true
	);

	// カラーマップ
	this._map = new THREE.TextureLoader().load(flareTexture);
	this._map.wrapS = this._map.wrapT = THREE.RepeatWrapping;
	this._map.repeat.set(10, 10);

	// マテリアル
	const material = this._createMaterial(bottomRadius, diameter);

	// メッシュ
	const mesh = new THREE.Mesh(geometry, material);
	this.add(mesh);

	this._offset = new THREE.Vector2(0,0);
	this._randomRatio = Math.random() + 1;
}

/**
 * マテリアルを生成します。
 */
// _createMaterial(bottomRadius, diameter) {
// 	const material = new THREE.ShaderMaterial({
// 	uniforms: {
// 		map: {
// 			type: "t",
// 			value: this._map,
// 		},
// 		offset: {
// 			type: "v2",
// 			value: this._offset,
// 		},
// 		opacity: {
// 			type: "f",
// 			value: 0.15,
// 		},
// 		innerRadius: {
// 			type: "f",
// 			value: bottomRadius,
// 		},
// 		diameter: {
// 			type: "f",
// 			value: diameter,
// 		},
// 	},
// 	vertexShader: `
// 		varying vec2 vUv;
// 		varying float radius;
// 		uniform vec2 offset;

// 		void main() {
// 		vUv = uv + offset;
// 		radius = length(position);
// 		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// 		}
// 	`,
// 	fragmentShader: `
// 		uniform sampler2D map;
// 		uniform float opacity;
// 		uniform float diameter;
// 		uniform float innerRadius;
// 		varying vec2 vUv;
// 		varying float radius;
// 		const float PI = 3.1415926;

// 		void main() {
// 		vec4 tColor = texture2D(map, vUv);
// 		float ratio = (radius - innerRadius) / diameter;
// 		float opacity = opacity * sin(PI * ratio);
// 		vec4 baseColor = (tColor + vec4(0.0, 0.0, 0.3, 1.0));
// 		gl_FragColor = baseColor * vec4(1.0, 1.0, 1.0, opacity);
// 		}
// 	`,
// 	side: THREE.DoubleSide,
// 	blending: THREE.AdditiveBlending,
// 	depthTest: false,
// 	transparent: true,
// 	});
// 	return material;
// }

_createMaterial(bottomRadius, diameter) {
	const material = new THREE.ShaderMaterial({
		uniforms: {
			map: { type: "t", value: this._map },
			offset: { type: "v2", value: this._offset },
			opacity: { type: "f", value: 0.15 },
			innerRadius: { type: "f", value: bottomRadius },
			diameter: { type: "f", value: diameter },
		},
		vertexShader: `...`,
		fragmentShader: `...`,
		side: THREE.DoubleSide,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true,
	});
	return material;
}

/**
 * フレーム毎の更新
 */
update() {
	if (!this._map || !this._offset) return;  
	this._offset.x = (performance.now() / 1000) * 0.2 * this._randomRatio;
	this._offset.y = (-performance.now() / 1000) * 0.8 * this._randomRatio;
}
}
