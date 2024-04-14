
/**
 * BaseConfig :
 * - 共通の設定は個々に追加する。*SceneConfigはextendsで継承する設定にしている。
 * - 継承先のsuper()によってconstructorが呼び出されるので、undefinedやnullは入らない
 * 
 */
class BaseConfig {
	constructor() {
		this.cameraConfig = {};
		this.rendererConfig = {};
		this.controlsConfig = {};
		this.lightsConfig = [];
	}
}
export default BaseConfig;
