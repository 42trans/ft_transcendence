import PongApp from '../PongApp'
import BaseGameState from './BaseGameState'
import MagmaFlare from '../effect/MagmaFlare'
import * as THREE from 'three';
import EffectsSceneConfig from '../config/EffectsSceneConfig';
import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import GameSceneConfig from '../config/GameSceneConfig';
import ZoomBall from '../effect/ZoomBall';
import AllScenesManager from '../manager/AllScenesManager';

class EntryGameState extends BaseGameState {
	constructor (PongApp)
	{
		super(PongApp);
		this.scenesMgr = AllScenesManager.getInstance();
		this.magmaFlare = new MagmaFlare();
		this.zoomInDistance = 3; // ズームイン後の目的の距離
		this.zoomOutDistance = 100; // ズームアウト後の目的の距離
		this.duration = 2000; // アニメーションの持続時間 (ミリ秒)
		this.pauseDuration = 500; // ズームインとズームアウトの間の遅延 (ミリ秒)
	}

	enter() 
	{
		// this.scenesMgr.backgroundScene.refreshScene(new BackgroundSceneConfig());
		console.log("enter(): EntryGameState");
		this.scenesMgr.effectsScene.refreshScene(new EffectsSceneConfig());
		this.magmaFlare.name = "MagmaFlare";
		this.scenesMgr.effectsScene.scene.add(this.magmaFlare);
		
		this.displayEnterGameButton(); 
		this.camera = this.scenesMgr.effectsScene.camera;
		this.controls = this.scenesMgr.effectsScene.controls;
		this.zoomBall = new ZoomBall(this.camera, this.controls);
	}

	update() 
	{
		this.magmaFlare.update();
	}
	
	render() {/** empty */}
	
	exit() 
	{
		console.log("exit(): EntryGameState");
		const targetPosition = new THREE.Vector3();
		this.magmaFlare.getWorldPosition(targetPosition);
		this.startDistance = this.camera.position.distanceTo(targetPosition);
		this.zoomBall.zoomToBall(
			targetPosition, 
			this.startDistance, 
			this.zoomInDistance, 
			this.zoomOutDistance, 
			this.duration, 
			this.pauseDuration,
		);
		this.scenesMgr.backgroundScene.clearScene();
	}

	displayEnterGameButton() {
		let button = document.getElementById('sButton');
		if (!button) {
			button = document.createElement('button');
			button.textContent = 'Enter Game';
			button.className = 'game-button';
			button.id = 'sButton';
			document.body.appendChild(button);
		}
	
		// イベントリスナーを一度だけ追加する
		button.removeEventListener('click', this.handleButtonClick);
		this.handleButtonClick = () => {
			this.PongApp.gameStateManager.changeState('gamePlay');
			button.style.display = 'none';
			console.log('State changed to gamePlay');
		};
		button.addEventListener('click', this.handleButtonClick);
	}
	
}

export default EntryGameState;
