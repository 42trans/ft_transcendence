// docker/srcs/vite/pong-three/src/js/state/EntryGameState.js
import BaseGameState from './BaseGameState'
import MagmaFlare from '../effect/MagmaFlare'
import * as THREE from 'three';
import EffectsSceneConfig from '../config/EffectsSceneConfig';
import ZoomBall from '../effect/ZoomBall';
import AllScenesManager from '../manager/AllScenesManager';
import { handleCatchError } from '../../index.js';

let DEBUG_FLOW		= 0;
let DEBUG_DETAIL1	= 0;
let TEST_TRY1		= 0;
let TEST_TRY2		= 0;
let TEST_TRY3		= 0;
let TEST_TRY4		= 0;

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

		this.handleButtonClick	= this._changeStateGamePlay.bind(this);
		this.boundHandleButtonClick = this.handleButtonClick.bind(this);
		this._registerStartButtonEventListener();
		this.isStartButtonListenerRegistered = false;
	}

	enter() 
	{
		try {
						if (DEBUG_FLOW) {	console.log("enter(): EntryGameState");	}
			this.scenesMgr.effectsScene.refreshScene(new EffectsSceneConfig());
			this.magmaFlare.name = "MagmaFlare";
			this.scenesMgr.effectsScene.scene.add(this.magmaFlare);
			
			this._displayEnterGameButton(); 
			this._initEndButton();
			this._registerStartButtonEventListener();
			this.camera		= this.scenesMgr.effectsScene.camera;
			this.controls	= this.scenesMgr.effectsScene.controls;
			this.zoomBall	= new ZoomBall(this.camera, this.controls);
						if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}
		} catch (error) {
			console.error('hth: EntryGameState.enter() failed', error);
			handleCatchError(error);
		}
	}

	update() 
	{
		try {
						if (DEBUG_DETAIL1) {	console.log("entryState.update(): start");	}
			this.magmaFlare.update();
						if (TEST_TRY2) {	throw new Error('TEST_TRY2');	}
		} catch (error) {
			console.error('hth: EntryGameState.update() failed', error);
			handleCatchError(error);
		}
	}
	
	render() {/** empty */}
	
	exit() 
	{
		try {
						if (DEBUG_FLOW) {	console.log("exit(): EntryGameState");	}
			// イベントリスナーの削除
			this._unregisterStartButtonEventListener();
			
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
						if (TEST_TRY3) {	throw new Error('TEST_TRY3');	}
		} catch (error) {
			console.error('hth: EntryGameState.exit() failed', error);
			handleCatchError(error);
		}
	}

	_displayEnterGameButton()
	{
		try {
			this.startGameButton = document.getElementById('hth-threejs-start-game-btn');
			if (!this.startGameButton) {
				return;
			}
			this.startGameButton.style.display = 'block' 
			this._registerStartButtonEventListener();
						if (TEST_TRY4){	throw new Error('TEST_TRY4');	}
		} catch (error) {
			console.error('hth: initStartButton() failed: ', error);
			handleCatchError(error);
		}
	}

	_registerStartButtonEventListener() 
	{
		// リスナーが既に登録されているかどうかをフラグで確認 onclickはパフォの問題あり
		if (this.startGameButton && !this.isStartButtonListenerRegistered) {
			this.startGameButton.addEventListener('click', this.boundHandleButtonClick);
			// コンストラクタでフラグ変数を設定しておく
			this.isStartButtonListenerRegistered = true;
		}
	}
	
	_unregisterStartButtonEventListener() 
	{
		// フラグがtrueなら削除
		if (this.startGameButton && this.isStartButtonListenerRegistered) {
			this.startGameButton.removeEventListener('click', this.boundHandleButtonClick);
			this.isStartButtonListenerRegistered = false;
		}
	}

	_changeStateGamePlay() 
	{
		this.PongApp.gameStateManager.changeState('gamePlay');
		if (this.startGameButton) {
			this.startGameButton.style.display = 'none';
		}
	}

	_initEndButton() 
	{
		const endGameButton = document.getElementById('hth-threejs-back-to-home-btn');
		if (!endGameButton) {
			return;
		}
		endGameButton.style.display = 'none';
	}

	
}

export default EntryGameState;
