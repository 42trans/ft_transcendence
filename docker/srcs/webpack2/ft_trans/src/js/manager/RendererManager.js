import * as THREE from 'three';
import RendererConfig from '../config/RendererConfig'

/**
 * RendererManager:
 * - パフォーマンスを考慮し、rendererはシングルトンとする。
 */
class RendererManager {
	static instance = null;
	constructor() {
		if (!RendererManager.instance) {
			const rendererOptions = new RendererConfig().rendererOptions;
			this.renderer = new THREE.WebGLRenderer(rendererOptions);
			this.initializeRenderer();
			RendererManager.instance = this;
		}
		return RendererManager.instance;
	}

	static getRenderer() {
		if (!RendererManager.instance) {
			new RendererManager();
		}
		return RendererManager.instance.renderer;
	}

	// 参考:【WebGLRenderer#shadowMap – three.js ドキュメント】 <https://threejs.org/docs/?q=renderer#api/en/renderers/WebGLRenderer.shadowMap>
	initializeRenderer() {
		this.renderer.autoClear = false;
		this.renderer.setClearColor(0x000000, 0);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.PCFShadowMap = true;
		this.attachRendererToDOM();
	}

	// 特定のdivにレンダラーを追加 （index.htmlで設定したthreejs-canvas-container）
	attachRendererToDOM() {
		const container = document.getElementById('threejs-canvas-container');
		if (container) {
			if (!container.querySelector('canvas')) { 
				container.appendChild(this.renderer.domElement);
			}
		} else {
			throw new Error('Container for three.js canvas is not found.');
		}
	}

}

export default RendererManager;
