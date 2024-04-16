import * as THREE from 'three';

/**
 * BaseConfig :
 * - 共通の設定は個々に追加する。*SceneConfigはextendsで継承する設定にしている。
 *   - 参考:【スプレッド構文 - JavaScript | MDN】 <https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Spread_syntax>
 * - 継承先のsuper()によってconstructorが呼び出されるので、undefinedやnullは入らない
 * - 必須のプロパティを指定する
 * - rendererは別のConfigで設定する
 */
class BaseConfig {
	constructor() {
		this.cameraConfig = {
			fov: 70,
			aspect: window.innerWidth / window.innerHeight,
			near: 0.1,
			far: 100,
			position: new THREE.Vector3(0, 0, 10),
			lookAt: new THREE.Vector3(0, 0, 0),
		};
		this.controlsConfig = {
			enableZoom: false,
			enablePan: false,
			enableRotate: false,
			autoRotate: false,

			// enableDamping: true,
			// dampingFactor: 0.05,
			// screenSpacePanning: false,
			// maxPolarAngle: Math.PI / 2,
			// minDistance: 1,
			// maxDistance: 100,
		};
		// this.lightsConfig = [];
		// this.modelsConfig = [];
		// this.animationsConfig = [];
	}
}
export default BaseConfig;
