import PongApp from '../PongApp'
import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import GameSceneConfig from '../config/GameSceneConfig';
import BaseGameState from './BaseGameState'
import PongEngine from '../pongEngine/PongEngine';
import AllScenesManager from '../manager/AllScenesManager';
import * as THREE from "three";
import ZoomTable from '../effect/ZoomTable';

let DEBUG_FLOW 		= 0;
let DEBUG_DETAIL 	= 0;
let TEST_TRY1 		= 0;

const ZOOM_IN_FACTOR = 1.5;
const ZOOM_OUT_FACTOR = 0.5;
const SCENE_CHANGE_DELAY = 4500; // milliseconds

class GameplayState extends BaseGameState 
{
	constructor (PongApp)
	{
		super(PongApp);
		this.scenesMgr = AllScenesManager.getInstance();
		this.camera = this.scenesMgr.gameScene.camera;
		this.controls = this.scenesMgr.gameScene.controls;
	}

	static zoomParams = 
	{
		duration: 1500,
		pauseDuration: 100,
		initialPolarAngle: Math.PI / 4,
		finalPolarAngle: 0
	};

	enter() 
	{
					if (DEBUG_FLOW){	console.log("Entering GamePlay state");	 };
		this.scenesMgr.gameScene.refreshScene(new GameSceneConfig());
		this.pongEngine	= new PongEngine(this.PongApp);
		this.camera 	= this.scenesMgr.getGameSceneCamera()
					if (DEBUG_DETAIL)
					{
						console.log('this.camera.z', this.camera.position.z);
						console.log('this.camera', this.camera);
					}
		this.scenesMgr.handleResize();
					if (DEBUG_DETAIL)
					{
						console.log('this.camera.z', this.camera.position.z);
						console.log('this.camera', this.camera);
					}
		const targetPosition = new THREE.Vector3();
		// テーブルの中心位置を取得　実際は0,0,0
		this.pongEngine.data.objects.plane.getWorldPosition(targetPosition); 
		// 初期距離を計算
		this.initialDistance = this.camera.position.distanceTo(targetPosition);

		const zoomParams = 
		{
			...GameplayState.zoomParams,
			zoomInDistance: this.initialDistance * ZOOM_IN_FACTOR,
			zoomOutDistance: this.initialDistance * ZOOM_OUT_FACTOR,
			targetPosition: targetPosition,
			initialDistance: this.initialDistance,
		};

		const zoomController = new ZoomTable
		(
			this.pongEngine,
			this.camera,
			this.controls
		);
		
		zoomController.zoomToTable(
			zoomParams
		);

		// this.scenesMgr.disableAllControls();
		// this.pongEngine.update.initMouseControl();

		setTimeout(() => 
		{
			this.scenesMgr.effectsScene.clearScene();
			this.scenesMgr.backgroundScene.refreshScene(new BackgroundSceneConfig());
		}, SCENE_CHANGE_DELAY);
	}

	update() {/** empty */}
	
	render() {/** empty */}

	exit() 
	{
					if (DEBUG_FLOW){	console.log("Exiting GamePlay state");	 };
		this.PongApp.allScenesManager.gameScene.clearScene();
	}

}

export default GameplayState;
