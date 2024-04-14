/**
 * @file シーンの初期値を指定するconfigファイル
 */
class RendererConfig {
	constructor() {
		/** @type {{ antialias: boolean, pixelRatio: number, alpha: boolean }} */
		this.rendererConfig = {
			antialias: true,
			pixelRatio: window.devicePixelRatio,
			alpha: true,
		};
	}
}

export default RendererConfig;