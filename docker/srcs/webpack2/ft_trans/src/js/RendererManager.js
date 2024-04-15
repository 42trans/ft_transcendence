import * as THREE from 'three';
import RendererConfig from './config/RendererConfig'

/**
 * RendererManager:
 * - パフォーマンスを考慮し、rendererはシングルトンとする。
 */
class RendererManager {
	static instance;

	constructor() {
		if (!RendererManager.instance) {
			const config = new RendererConfig();
			const rendererOptions = {
				antialias: config.antialias,
				pixelRatio: config.pixelRatio,
				alpha: config.alpha,
			};
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

	initializeRenderer() {
		this.renderer.autoClear = false;
		this.renderer.setClearColor(0x000000, 0);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		// this.renderer.setPixelRatio(options.pixelRatio);
		// this.renderer.setPixelRatio(window.devicePixelRatio);
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
