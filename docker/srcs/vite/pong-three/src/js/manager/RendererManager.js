import * as THREE from 'three';
import RendererConfig from '../config/RendererConfig'
import { handleCatchError } from '../../index.js';

const DEBUG_FLOW 		= 0;
const TEST_TRY1 		= 0;
const TEST_TRY2 		= 0;
const TEST_TRY3 		= 0;
const TEST_TRY4			= 0;
const TEST_TRY5			= 0;

/**
 * RendererManager:
 * - パフォーマンスを考慮し、rendererはシングルトンとする。
 */
class RendererManager 
{
	static instance = null;

	constructor() 
	{
		try {
			if (!RendererManager.instance) 
			{
				const rendererOptions = new RendererConfig().rendererOptions;
				this.renderer = new THREE.WebGLRenderer(rendererOptions);
							if (TEST_TRY1) {	this.renderer = null;	}
				this.initializeRenderer();
				RendererManager.instance = this;
			}
			return RendererManager.instance;
		} catch (error) {
			console.error('hth: RendererManager constructor() failed', error);
		}
	}

	reinitializeRenderer() 
	{
					if (DEBUG_FLOW) {	console.log('reinitializeRenderer(): start');	}
		try {
			const rendererOptions = new RendererConfig().rendererOptions;
			this.renderer = new THREE.WebGLRenderer(rendererOptions);
			this.initializeRenderer();
						if (TEST_TRY2){	throw new Error('TEST_TRY2');	}
		} catch (error) {
			console.error('hth: reinitializeRenderer() failed', error);
			handleCatchError(error);
		}
	}
	
	static getInstance()
	{
		try {
			if (!RendererManager.instance) 
			{
				RendererManager.instance = new RendererManager();
			}
						if (TEST_TRY3){	throw new Error('TEST_TRY3');	}
			return RendererManager.instance;
		} catch (error) {
			console.error('hth: getInstance() failed', error);
		}
	}

	static getRenderer() 
	{
		try {
			if (!RendererManager.instance) 
			{
				RendererManager.instance = new RendererManager();
			}
						if (TEST_TRY4){	RendererManager.instance = null;	}
			return RendererManager.instance.renderer;
		} catch (error) {
			console.error('hth: getRenderer() failed', error);
		}
	}

	// 参考:【WebGLRenderer#shadowMap – three.js ドキュメント】 <https://threejs.org/docs/?q=renderer#api/en/renderers/WebGLRenderer.shadowMap>
	initializeRenderer() 
	{
		try {
			this.renderer.autoClear = false;
			this.renderer.setClearColor(0x000000, 0);
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			this.attachRendererToDOM();
						if (TEST_TRY5){	this.renderer = null;	}
		} catch (error) {
			console.error('hth: initializeRenderer() failed', error);
		}
	}

	attachRendererToDOM() 
	{
		// configで<canvas>が指定されているため、appendChildは不要
		// 確認のために親要素が正しいかをチェックするだけで良い
		const canvas = document.getElementById('threejs-canvas-container');
		if (!canvas) {
			throw new Error('hth: Canvas element not found in the document.');
		}
	}
}

export default RendererManager;
