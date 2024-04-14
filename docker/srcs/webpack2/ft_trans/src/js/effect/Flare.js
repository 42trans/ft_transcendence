import * as THREE from "three";
import flareTexture from '../../assets/ballTexture/bg.png';

export class Flare extends THREE.Object3D {
constructor() {
	super();
	const topRadius = 6;
	const bottomRadius = 2;
	const diameter = topRadius - bottomRadius;
	const geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, 0, 30, 3, true);
	this._offset = new THREE.Vector2(0,0);
	this._randomRatio = Math.random() + 1;
	this._map = new THREE.TextureLoader().load(flareTexture);
	this._map.wrapS = this._map.wrapT = THREE.RepeatWrapping;
	this._map.repeat.set(10, 10);
	const material = this._createMaterial(bottomRadius, diameter);
	const mesh = new THREE.Mesh(geometry, material);
	this.add(mesh);


	 // テクスチャロードが完了してからマテリアルとメッシュを作成
	 const textureLoader = new THREE.TextureLoader();
	 textureLoader.load(flareTexture, (loadedTexture) => {
		 this._map = loadedTexture;
		 this._map.wrapS = this._map.wrapT = THREE.RepeatWrapping;
		 this._map.repeat.set(10, 10);

		 const material = this._createMaterial(bottomRadius, diameter);
		 const mesh = new THREE.Mesh(geometry, material);
		 this.add(mesh);
	 });
}

/**
 * マテリアルを生成します。
 */
_createMaterial(bottomRadius, diameter) {
	const material = new THREE.ShaderMaterial({
	uniforms: {
		map: {
			type: "t",
			value: this._map,
		},
		offset: {
			type: "v2",
			value: this._offset,
		},
		opacity: {
			type: "f",
			value: 0.15,
		},
		innerRadius: {
			type: "f",
			value: bottomRadius,
		},
		diameter: {
			type: "f",
			value: diameter,
		},
	},
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
	return material;
}

// _createMaterial(bottomRadius, diameter) {
// 	const material = new THREE.ShaderMaterial({
// 		uniforms: {
// 			map: { type: "t", value: this._map },
// 			offset: { type: "v2", value: this._offset },
// 			opacity: { type: "f", value: 0.15 },
// 			innerRadius: { type: "f", value: bottomRadius },
// 			diameter: { type: "f", value: diameter },
// 		},
// 		vertexShader: `
//         varying vec2 vUv;       // フラグメントシェーダーに渡すUV座標
//         varying float radius;   // フラグメントシェーダーに渡す半径
//         uniform vec2 offset;    // カラーマップのズレ位置

//         void main()
//         {
//           // 本来の一からuvをずらす
//           vUv = uv + offset;
//           // 中心から頂点座標までの距離
//           radius = length(position);
//           // 3次元上頂点座標を画面上の二次元座標に変換(お決まり)
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
// 		fragmentShader: `
//         uniform sampler2D map;      // テクスチャ
//         uniform float opacity;      // 透明度
//         uniform float diameter;     // ドーナツの太さ
//         uniform float innerRadius;  // 内円の半径
//         varying vec2 vUv;           // UV座標
//         varying float radius;       // 中心ドットまでの距離
//         const float PI = 3.1415926; // 円周率

//         void main() {
//           // UVの位置からテクスチャの色を取得
//           vec4 tColor = texture2D(map, vUv);
//           // 描画位置がドーナツの幅の何割の位置になるか
//           float ratio = (radius - innerRadius) / diameter;
//           float opacity = opacity * sin(PI * ratio);
//           // ベースカラー
//           vec4 baseColor = (tColor + vec4(0.0, 0.0, 0.3, 1.0));
//           // 透明度を反映させる
//           gl_FragColor = baseColor * vec4(1.0, 1.0, 1.0, opacity);
//         }
// 		`,
// 		side: THREE.DoubleSide,
// 		blending: THREE.AdditiveBlending,
// 		depthTest: false,
// 		transparent: true,
// 	});
// 	return material;
// }

/**
 * フレーム毎の更新
 */
update() {
	if (!this._map || !this._offset) return;  
	this._offset.x = (performance.now() / 1000) * 0.2 * this._randomRatio;
	this._offset.y = (-performance.now() / 1000) * 0.8 * this._randomRatio;
}
}
