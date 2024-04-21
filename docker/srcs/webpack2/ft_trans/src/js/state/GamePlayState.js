import PongApp from '../PongApp'
import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import GameSceneConfig from '../config/GameSceneConfig';
// import GameStateManager from './states/GameStateManager';
import BaseGameState from './BaseGameState'
import SceneUnit from '../SceneUnit';
import PongEngine from '../pongEngine/PongEngine';
import MagmaFlare from '../effect/MagmaFlare'
import AllScenesManager from '../manager/AllScenesManager';
import * as THREE from "three";
import ZoomTable from '../effect/zoomTable';

class GameplayState extends BaseGameState 
{
	constructor (PongApp)
	{
		super(PongApp);
		this.scenesMgr = AllScenesManager.getInstance();
		this.camera = this.scenesMgr.gameScene.camera;
		this.controls = this.scenesMgr.gameScene.controls;
	}
	
	enter() 
	{
		// console.log("Entering GamePlay state");
		// this.scenesMgr.backgroundScene.refreshScene(new GameSceneConfig());
		this.scenesMgr.gameScene.refreshScene(new GameSceneConfig());
		this.pongEngine = new PongEngine(this.PongApp);

		
		const zoomParams = {
			targetPosition: new THREE.Vector3(),
			startDistance: this.camera.position.distanceTo(new THREE.Vector3()), // Assuming some target position
			zoomInDistance: 1000,
			zoomOutDistance: 420,
			duration: 1500,
			pauseDuration: 100,
			initialPolarAngle: Math.PI / 4,
			finalPolarAngle: 0
		};
		this.pongEngine.data.objects.plane.getWorldPosition(zoomParams.targetPosition);


		const zoomController = new ZoomTable(
			this.pongEngine,
			this.camera,
			this.controls
		);
		
		zoomController.zoomToTable(
			zoomParams
		);

		setTimeout(() => {
			this.scenesMgr.effectsScene.clearScene();
		}, 4500);
	}

	update() {}
	
	render() {}

	exit() {
		console.log("Exiting GamePlay state");
		// this.PongApp.allScenesManager.backgroundScene.clearScene();
		this.PongApp.allScenesManager.gameScene.clearScene();
	}

}

export default GameplayState;
