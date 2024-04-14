import * as THREE from 'three';
import RendererConfig from './config/RendererConfig'

/**
 * RendererManager:
 * - パフォーマンスを考慮し、rendererはシングルトンとする。
 */
class RendererManager {
	constructor() {
		if (!RendererManager.instance) {
			const config = new RendererConfig();
			const rendererOptions = {
				antialias: config.antialias,
				pixelRatio: config.pixelRatio,
				alpha: config.alpha,
			};
			this.renderer = new THREE.WebGLRenderer(rendererOptions);
			this.renderer.autoClear = false; // 必須
			this.renderer.setClearColor(0x000000, 0); // 背景を透明に
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			// 特定のdivにレンダラーを追加 （index.htmlで設定したthreejs-canvas-container）
			const container = document.getElementById('threejs-canvas-container');
			if (container) {
				container.appendChild(this.renderer.domElement);
			} else {
				console.error('three.jsのキャンバスを配置するためのコンテナが見つかりません。');
			}
			// もしもdivでなくbodyに埋め込む場合
			// document.body.appendChild(rend.domElement);
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

	setRendererOptions(options) {
		this.renderer.setPixelRatio(options.pixelRatio);
		this.renderer.setSize(options.width, options.height);
		this.renderer.setClearColor(options.clearColor, options.clearAlpha);
	}
}

export default RendererManager;
