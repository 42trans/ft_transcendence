import PongApp from '../PongApp'
import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import GameSceneConfig from '../config/GameSceneConfig';
import BaseGameState from './BaseGameState'
import PongEngine from '../pongEngine/PongEngine';
import AllScenesManager from '../manager/AllScenesManager';
import * as THREE from "three";
import ZoomTable from '../effect/ZoomTable';

class GameplayState extends BaseGameState 
{
	static zoomParams = 
	{
		zoomInDistance: 1000,
		zoomOutDistance: 420,
		duration: 1500,
		pauseDuration: 100,
		initialPolarAngle: Math.PI / 4,
		finalPolarAngle: 0
	};

	constructor (PongApp)
	{
		super(PongApp);
		this.scenesMgr = AllScenesManager.getInstance();
		this.camera = this.scenesMgr.gameScene.camera;
		this.controls = this.scenesMgr.gameScene.controls;
	}
	
	enter() 
	{
		console.log("Entering GamePlay state");
		this.scenesMgr.gameScene.refreshScene(new GameSceneConfig());
		this.pongEngine = new PongEngine(this.PongApp);

		const zoomParams = 
		{
			...GameplayState.zoomParams,
			targetPosition: new THREE.Vector3(),
			startDistance: this.camera.position.distanceTo(new THREE.Vector3()), // Assuming some target position
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

		this.scenesMgr.disableAllControls();

		setTimeout(() => 
		{
			this.scenesMgr.effectsScene.clearScene();
			this.scenesMgr.backgroundScene.refreshScene(new BackgroundSceneConfig());
		}, 4500);
	}

	update() {/** empty */}
	
	render() {/** empty */}

	exit() 
	{
		console.log("Exiting GamePlay state");
		// this.PongApp.allScenesManager.backgroundScene.clearScene();
		this.PongApp.allScenesManager.gameScene.clearScene();
	}

}

export default GameplayState;
