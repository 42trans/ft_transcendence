
/**
 * BaseConfig :
 * - 共通の設定は個々に追加する。*SceneConfigはextendsで継承する設定にしている。
 * - 継承先のsuper()によってconstructorが呼び出されるので、undefinedやnullは入らない
 * - 必須のプロパティを指定する
 */
class BaseConfig {
	constructor() {
		this.cameraConfig = {};
		this.rendererConfig = {};
		this.controlsConfig = {};
		// this.lightsConfig = [];
		// this.modelsConfig = [];
		// this.animationsConfig = [];
	}
}
export default BaseConfig;
