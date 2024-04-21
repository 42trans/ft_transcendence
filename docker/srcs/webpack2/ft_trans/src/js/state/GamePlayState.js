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
	}
	enter() 
	{
		console.log("Entering GamePlay state");
		this.scenesMgr.gameScene.refreshScene(new GameSceneConfig());
		this.pongEngine = new PongEngine(this.PongApp);

		this.camera = this.PongApp.allScenesManager.gameScene.camera;
		this.controls = this.PongApp.allScenesManager.gameScene.controls;

		const zoomController = new ZoomTable(this.pongEngine, this.camera, this.controls);
		zoomController.zoomToTable();

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
