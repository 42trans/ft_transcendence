
import * as THREE from 'three';
import PongEngineConfig from '../config/PongEngineConfig';
import PongEngineUpdate from './PongEngineUpdate';
import PongEngineData from './PongEngineData';
import PongEnginePhysics from './PongEnginePhysics';
import PongEngineMatch from './PongEngineMatch';
import RendererManager from '../manager/RendererManager';
import PongEngineInit from "./PongEngineInit";
import AllScenesManager from '../manager/AllScenesManager';
import { handleCatchError } from '../../index.js';


const DEBUG_FLOW 		= 0;
const TEST_TRY1			= 0;
const TEST_TRY2			= 0;

/**
 * 参考:【nklsrh/BuildNewGames_ThreeJSGame: A game built to show off some of the basic features of the Three.JS WebGL library.】 <https://github.com/nklsrh/BuildNewGames_ThreeJSGame/tree/gh-pages>
 */
class PongEngine 
{
	constructor(PongApp) 
	{
		try {
			this.pongApp	= PongApp
			this.env		= PongApp.env;
			this.matchData	= PongApp.matchData;
			
			this.init3DEnvironment();
			this.initParameters();
			this.initGameLogic();

			this.isRunning	= true;
			this.animate	= this.animate.bind(this);
			setTimeout(() => this.animate(), 4500);
		} catch (error) {
			console.error('hth: GameplayState.enter() failed', error);
			handleCatchError(error);
		}
	}

	init3DEnvironment() 
	{
		this.scene		= AllScenesManager.getInstance().gameScene.scene;
		this.camera		= this.scene.camera;
		this.renderer	= RendererManager.getRenderer();
	}

	initParameters() 
	{
		this.config	= new PongEngineConfig();
		this.data	= new PongEngineData(this);
		this.init	= new PongEngineInit(this.scene, this.config);
		this.init.initPongEngine(this.data);
	}

	initGameLogic() 
	{
		this.physics	= new PongEnginePhysics(this.data);
		this.match		= new PongEngineMatch(this.pongApp, this, this.scene, this.data);
		this.update		= new PongEngineUpdate(this, this.data, this.physics, this.match);
					if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}
	}

	async animate() 
	{
		try {
			if (this.isRunning)
			{
				requestAnimationFrame(this.animate);
				// ここで描画ループを止めると終了後のアスペクト比がバグる
			// } else {
			// 	// ゲームが終了した場合は、描画ループを停止
			// 	this.pongApp.stopRenderLoop();
			}
			await this.update.updateGame();
			if (TEST_TRY2) {	throw new Error('TEST_TRY2');	}
		} catch (error) {
			console.error('hth: GameplayState.enter() failed', error);
			// handleCatchError(error);
		}
	}
}

export default PongEngine;
