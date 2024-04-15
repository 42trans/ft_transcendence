/**
 * @file シーンの初期値を指定するconfigファイル
 */
class RendererConfig {
	constructor() {
		// const canvas = document.getElementById('threejs-canvas-container');
		/** @type {{ antialias: boolean, pixelRatio: number, alpha: boolean }} */
		this.rendererOptions = {
			// canvas: 'threejs-canvas-container',
			// canvas: document.getElementById('threejs-canvas-container'),
			antialias: true,
			pixelRatio: window.devicePixelRatio,
			alpha: true,
		};
	}
}

export default RendererConfig;