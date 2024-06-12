import BaseGameState from './BaseGameState'
import MagmaFlare from '../effect/MagmaFlare'
import * as THREE from 'three';
import EffectsSceneConfig from '../config/EffectsSceneConfig';
import ZoomBall from '../effect/ZoomBall';
import AllScenesManager from '../manager/AllScenesManager';

let DEBUG_FLOW		= 1;
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

		this.handleButtonClick	= this.changeStateGamePlay.bind(this);
		this.startGameButton	= null;

		this.boundStartBtn = this.displayEnterGameButton.bind(this);
		window.addEventListener('switchPageResetState', this.boundStartBtn);

		// this.bundRemoveEnterGameButton =  this.removeEnterGameButton.bind(this);

		// window.addEventListener('switchPageResetState', () => this.removeEnterGameButton());
		// window.addEventListener('switchPageResetState', this.bundRemoveEnterGameButton);
		// window.addEventListener('popstate', this.handlePopState.bind(this));
	}

	enter() 
	{
					if (DEBUG_FLOW) {	console.log("enter(): EntryGameState");	}
		// this.scenesMgr.backgroundScene.refreshScene(new BackgroundSceneConfig());
		this.scenesMgr.effectsScene.refreshScene(new EffectsSceneConfig());
		this.magmaFlare.name = "MagmaFlare";
		this.scenesMgr.effectsScene.scene.add(this.magmaFlare);
		
		this.displayEnterGameButton(); 
		this.initEndButton();

		this.camera		= this.scenesMgr.effectsScene.camera;
		this.controls	= this.scenesMgr.effectsScene.controls;
		this.zoomBall	= new ZoomBall(this.camera, this.controls);
	}

	update() 
	{
			if (DEBUG_FLOW) {	console.log("entryState.update(): start");	}

		this.magmaFlare.update();
	}
	
	render() {/** empty */}
	
	exit() 
	{
					if (DEBUG_FLOW) {	console.log("exit(): EntryGameState");	}
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

			// const startGameButtonClickHandler = () => {
				// console.log('this.socket', this.socket);

				// this.setupWebSocketConnection();
				// this.startGameButton.remove();  
				// this.startGameButton.style.display = 'none';  
			// };
			this.startGameButton.addEventListener('click', this.handleButtonClick);
		} catch (error) {
			console.error('hth: initStartButton() failed: ', error);
		}
	}

	// displayEnterGameButton() 
	// {
	// 	this.button = document.getElementById('sButton');
	// 	if (!this.button) {
	// 		this.button = document.createElement('button');
	// 		this.button.textContent = 'Enter Game';
	// 		this.button.className = 'game-button';
	// 		this.button.id = 'sButton';
	// 		document.body.appendChild(this.button);
	// 		this.button.addEventListener('click', this.handleButtonClick);
	// 	}
	// }

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


	// removeEnterGameButton() 
	// {
	// 	const pathName = window.location.pathname;
	// 	const matchPageRegex = /^\/app\/game\/match\/\d+\/$/;

	// 	// /app/game/match にいる場合にのみボタンを削除しない
	// 	if (!matchPageRegex.test(pathName)) 
	// 	{
	// 		if (this.button) {
	// 			this.button.removeEventListener('click', this.handleButtonClick);
	// 			document.body.removeChild(this.button);
	// 			this.button = null;
	// 		}
	// 	}
	// }

	// handlePopState() {
	// 	// URLをチェックして、現在のページが特定のページであるかを確認
	// 	const pathName = window.location.pathname;
	// 	const matchPageRegex = /^\/app\/game\/match\/\d+\/$/;

	// 	if (matchPageRegex.test(pathName)) {
	// 		// ページが特定の条件に一致する場合、ボタンを再配置
	// 		this.displayEnterGameButton();
	// 	} else {
	// 		// 一致しない場合は、ボタンを削除
	// 		this.removeEnterGameButton();
	// 	}
	// }
	
}

export default EntryGameState;
