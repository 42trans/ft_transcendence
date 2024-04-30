import * as THREE from 'three';

/**
 * BaseConfig :
 * - 共通の設定は個々に追加する。*SceneConfigはextendsで継承する設定にしている。
 *   - 参考:【スプレッド構文 - JavaScript | MDN】 <https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Spread_syntax>
 * - 継承先のsuper()によってconstructorが呼び出されるので、undefinedやnullは入らない
 * - 必須のプロパティを指定する
 * - rendererは別のConfigで設定する
 */
class BaseConfig 
{
	constructor() 
	{
		/** @type {{ fov: number, aspect: number, near: number, far: number, position: THREE.Vector3, lookAt: THREE.Vector3, up: THREE.Vector3 }} */
		this.cameraConfig = 
		{
			fov: 70,
			aspect: window.innerWidth / window.innerHeight,
			near: 0.1, // 撮影可能な近さ
			far: 100,  // 撮影可能な遠さ
			position: new THREE.Vector3(0, 0, 10),
			lookAt: new THREE.Vector3(0, 0, 0),
			up: new THREE.Vector3(0, 1, 0),
		};

		/** @type {{ enableDamping: boolean, dampingFactor: number, screenSpacePanning: boolean, maxPolarAngle: number, minDistance: number, maxDistance: number, rotateSpeed: number, zoomSpeed: number, autoRotate: boolean, autoRotateSpeed: number }} */
		this.controlsConfig = 
		{
			enableZoom: false,
			enablePan: false,
			enableRotate: false,
			autoRotate: false,
		};
	}

	rgbToHex(r, g, b) 
	{
		return (r << 16) + (g << 8) + b;
	}
}
export default BaseConfig;
