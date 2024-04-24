import * as THREE from 'three';
import RendererConfig from '../config/RendererConfig'

/**
 * RendererManager:
 * - パフォーマンスを考慮し、rendererはシングルトンとする。
 */
class RendererManager 
{
	static instance = null;

	constructor() 
	{
		if (!RendererManager.instance) 
		{
			const rendererOptions = new RendererConfig().rendererOptions;
			this.renderer = new THREE.WebGLRenderer(rendererOptions);
			this.initializeRenderer();
			RendererManager.instance = this;
		}
		return RendererManager.instance;
	}

	static getRenderer() 
	{
		if (!RendererManager.instance) 
		{
			RendererManager.instance = new RendererManager();
		}
		return RendererManager.instance.renderer;
	}

	// 参考:【WebGLRenderer#shadowMap – three.js ドキュメント】 <https://threejs.org/docs/?q=renderer#api/en/renderers/WebGLRenderer.shadowMap>
	initializeRenderer() 
	{
		this.renderer.autoClear = false;
		this.renderer.setClearColor(0x000000, 0);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		// this.renderer.PCFShadowMap = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.attachRendererToDOM();
	}

	attachRendererToDOM() 
	{
		// configで<canvas>が指定されているため、appendChildは不要
		// 確認のために親要素が正しいかをチェックするだけで良い
		const canvas = document.getElementById('threejs-canvas-container');
		if (!canvas) {
			throw new Error('Canvas element not found in the document.');
		}
	}
}

export default RendererManager;
