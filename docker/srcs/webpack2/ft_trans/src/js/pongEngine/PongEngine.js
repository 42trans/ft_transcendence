
import * as THREE from 'three';
import PongEngineConfig from '../config/PongEngineConfig';
import PongEngineUpdate from './PongEngineUpdate';
import PongEngineData from './PongEngineData';
import PongEnginePhysics from './PongEnginePhysics';
import PongEngineMatch from './PongEngineMatch';
import RendererManager from '../manager/RendererManager';

/**
 * 参考:【nklsrh/BuildNewGames_ThreeJSGame: A game built to show off some of the basic features of the Three.JS WebGL library.】 <https://github.com/nklsrh/BuildNewGames_ThreeJSGame/tree/gh-pages>
 */
class PongEngine {
	constructor(PongApp) {
		this.initializeRendering(PongApp);
		this.initializeGameData();
		this.initializeGameSystems();
		
		this.animate = this.animate.bind(this);
		setTimeout(() => this.animate(), 4500);
	}

	initializeRendering(PongApp) {
		this.scene		= PongApp.allScenesManager.gameScene.scene;
		this.camera		= PongApp.allScenesManager.gameScene.camera;
		this.renderer	= RendererManager.getRnderer();
	}

	initializeGameData() {
		this.config	= new PongEngineConfig();
		this.data	= new PongEngineData(this);
		this.data.initObjects();
	}

	initializeGameSystems() {
		this.physics	= new PongEnginePhysics(this.data);
		this.match		= new PongEngineMatch(this.data);
		this.update		= new PongEngineUpdate(this.data, this.physics, this.match);
	}
	
	updatePongEngine() {
		this.update.updateGame();
	}

	animate() {
		requestAnimationFrame(this.animate);
		this.updatePongEngine();
	}
}

export default PongEngine;
