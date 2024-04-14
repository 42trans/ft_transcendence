import * as THREE from "three";
import auraTexture from '../../assets/ballTexture/bg.png';
// import auraTexture from '../../assets/ballTexture/aura.png';

/**
 * オーラ球クラスです。
 */
export class Aura extends THREE.Object3D {
/**
 * コンストラクター
 */
constructor() {
	super();
	this.textureLoaded = false;

	// ジオメトリ
	const geometry = new THREE.SphereGeometry(2.02, 40, 40);

	// // カラーマップ
	// this._map = new THREE.TextureLoader().load(auraTexture);
	// this._map.wrapS = this._map.wrapT = THREE.RepeatWrapping;

	// // マテリアル
	// const material = new THREE.MeshBasicMaterial({
	// 	map: this._map,
	// 	blending: THREE.AdditiveBlending,
	// 	transparent: true,
	// });

	// // メッシュ
	// const mesh = new THREE.Mesh(geometry, material);
	// this.add(mesh);
	const textureLoader = new THREE.TextureLoader();
	textureLoader.load(auraTexture, (loadedTexture) => {
		console.log("Texture loaded successfully");
	this._map = loadedTexture;
	this._map.wrapS = this._map.wrapT = THREE.RepeatWrapping;
	this.textureLoaded = true;

	const material = new THREE.MeshBasicMaterial({
		map: this._map,
		blending: THREE.AdditiveBlending,
		transparent: true,
		// opacity: 0.5
	});

	const mesh = new THREE.Mesh(geometry, material);
	console.log("Mesh visibility: ", mesh.visible);
	this.add(mesh);
	});


}

/**
 * フレーム毎の更新
 */
update() {
	if (!this.textureLoaded) return;
	this._map.offset.x = -performance.now() / 1000 / 4;
	this._map.offset.y = -performance.now() / 1000 / 4;
}
}
