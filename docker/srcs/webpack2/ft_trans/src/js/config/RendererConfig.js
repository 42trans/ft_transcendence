/**
 * @file シーンの初期値を指定するconfigファイル
 * - 参考:【WebGLRenderer – three.js docs】 <https://threejs.org/docs/#api/en/renderers/WebGLRenderer>
 */
class RendererConfig 
{
	constructor() 
	{
		// TODO_ft:　<div>から<canvas>への挿入
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