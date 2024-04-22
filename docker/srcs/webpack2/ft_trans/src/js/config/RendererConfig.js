/**
 * @file シーンの初期値を指定するconfigファイル
 * - 参考:【WebGLRenderer – three.js docs】 <https://threejs.org/docs/#api/en/renderers/WebGLRenderer>
 */
class RendererConfig 
{
	constructor() 
	{
		const canvas = document.getElementById('threejs-canvas-container');
		this.rendererOptions = {
			canvas: canvas,
			antialias: true,
			pixelRatio: window.devicePixelRatio,
			alpha: true,
		};
	}
}

export default RendererConfig;