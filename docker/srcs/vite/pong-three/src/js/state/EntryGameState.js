import BaseGameState from './BaseGameState'
import MagmaFlare from '../effect/MagmaFlare'
import * as THREE from 'three';
import EffectsSceneConfig from '../config/EffectsSceneConfig';
import ZoomBall from '../effect/ZoomBall';
import AllScenesManager from '../manager/AllScenesManager';

let DEBUG_FLOW		= 0;
let DEBUG_DETAIL1	= 0;
let TEST_TRY1		= 0;

class EntryGameState extends BaseGameState 
{
	static zoomInDistance	= 3; // ズームイン後の目的の距離
	static zoomOutDistance	= 100; // ズームアウト後の目的の距離
	static duration			= 2000; // アニメーションの持続時間 (ミリ秒)
	static pauseDuration	= 500; // ズームインとズームアウトの間の遅延 (ミリ秒)

	constructor (PongApp)
	{
		super(PongApp);
		this.scenesMgr			= AllScenesManager.getInstance();
		this.magmaFlare			= new MagmaFlare();

		this.startGameButton	= null;

		this.handleButtonClick	= this.changeStateGamePlay.bind(this);
		this.boundHandleButtonClick = this.handleButtonClick.bind(this);
		this.registerStartButtonEventListener();
	}

	enter() 
	{
					if (DEBUG_FLOW) {	console.log("enter(): EntryGameState");	}
		this.scenesMgr.effectsScene.refreshScene(new EffectsSceneConfig());
		this.magmaFlare.name = "MagmaFlare";
		this.scenesMgr.effectsScene.scene.add(this.magmaFlare);
		
		this.displayEnterGameButton(); 
		this.initEndButton();
		this.registerStartButtonEventListener();
		this.camera		= this.scenesMgr.effectsScene.camera;
		this.controls	= this.scenesMgr.effectsScene.controls;
		this.zoomBall	= new ZoomBall(this.camera, this.controls);
	}

	update() 
	{
					if (DEBUG_DETAIL1) {	console.log("entryState.update(): start");	}
		this.magmaFlare.update();
	}
	
	render() {/** empty */}
	
	exit() 
	{
					if (DEBUG_FLOW) {	console.log("exit(): EntryGameState");	}
		this.unregisterStartButtonEventListener();
		const targetPosition = new THREE.Vector3();
		this.magmaFlare.getWorldPosition(targetPosition);
		this.startDistance = this.camera.position.distanceTo(targetPosition);
		this.zoomBall.zoomToBall(
			targetPosition, 
			this.startDistance, 
			EntryGameState.zoomInDistance, 
			EntryGameState.zoomOutDistance, 
			EntryGameState.duration, 
			EntryGameState.pauseDuration,
		);
		this.scenesMgr.backgroundScene.clearScene();
	}

	displayEnterGameButton()
	{
		try {
						if (TEST_TRY1){	throw new Error('TEST_TRY1');	}
			this.startGameButton = document.getElementById('hth-threejs-start-game-btn');
			if (!this.startGameButton) {
				return;
			}
			this.startGameButton.style.display = 'block' 
			this.startGameButton.addEventListener('click', this.handleButtonClick);
		} catch (error) {
			console.error('hth: initStartButton() failed: ', error);
		}
	}

	registerStartButtonEventListener() 
	{
		// !onclick: 登録されていない場合
		if (this.startGameButton && !this.startGameButton.onclick) {
			this.startGameButton.addEventListener('click', this.boundHandleButtonClick);
		}
	}
	
	unregisterStartButtonEventListener() 
	{
		if (this.startGameButton) {
			this.startGameButton.removeEventListener('click', this.boundHandleButtonClick);
		}
	}

	changeStateGamePlay() 
	{
		this.PongApp.gameStateManager.changeState('gamePlay');
		if (this.startGameButton) {
			this.startGameButton.style.display = 'none';
		}
	}

	initEndButton() 
	{
		const endGameButton = document.getElementById('hth-threejs-back-to-home-btn');
		if (!endGameButton) {
			return;
		}
		endGameButton.style.display = 'none';
	}

	
}

export default EntryGameState;
