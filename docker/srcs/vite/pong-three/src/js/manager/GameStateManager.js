import GamePlayState from '../state/GamePlayState'
import EntryGameState from '../state/EntryGameState'
import RendererManager from './RendererManager';
import { handleCatchError } from '../../index.js';

const DEBUG_FLOW	= 0;
const DEBUG_DETAIL	= 0;
const TEST_TRY1		= 0;
const TEST_TRY2		= 0;
const TEST_TRY3		= 0;

/** シングルトン*/
class GameStateManager 
{
	static instance = null;
	constructor(pongApps, allScenesManager) 
	{
		if (!GameStateManager.instance) 
		{
			this.pongApps = pongApps;
			this.allScenesManager = allScenesManager;
			this.states = 
			{
				entry: new EntryGameState(pongApps),
				gamePlay: new GamePlayState(pongApps)
			};
			this.currentState = this.states.entry;
			this.currentState.enter();
			GameStateManager.instance = this;
		}
		return GameStateManager.instance;
	}

	static getInstance(pongApps) 
	{
		if (!GameStateManager.instance) 
		{
			GameStateManager.instance = new GameStateManager(pongApps);
		}
		return GameStateManager.instance;
	}

	changeState(newState) 
	{
		try {
			if (this.currentState) 
			{
							if(DEBUG_FLOW) {	console.log('currentState.exit(): ', this.currentState);	}
				this.currentState.exit();
			}
						if (DEBUG_FLOW) {	console.log('changeState():', newState);	}
			this.currentState = this.states[newState];
			this.currentState.enter();
						if (TEST_TRY1){	throw new Error('TEST_TRY1');	}
		} catch (error) {
			console.error('hth: changeState() failed', error);
			// この場合、ゲームに入れないのでリセットする
			handleCatchError(error);
		}
	}

	update() 
	{
		try {
						if (DEBUG_DETAIL) {	console.log('update():', this.currentState);	}
			if (this.currentState) {
						if (DEBUG_DETAIL) {	console.log('update():', this.currentState);	}
				this.currentState.update();
			}
						if (TEST_TRY2){	throw new Error('TEST_TRY2');	}
		} catch (error) {
			console.error('hth: update() failed', error);
		}
	}

	// 未使用の可能性あり。一旦コメントアウト
	// render() 
	// {
	// 	try {
	// 		if (this.currentState) {
	// 			this.currentState.render();
	// 		}
	// 				if (TEST_TRY3){	throw new Error('TEST_TRY3');	}
	// 	} catch (error) {
	// 		console.error('hth: render() failed', error);
	// 		// 他の部分の処理には影響を与えないので伝播させない errorログの出力のみ
	// 	}
	// }

	dispose() 
	{
		try {
			if (this.currentState) 
			{
				this.currentState.exit();
			}
			this.pongApps = null;
			this.allScenesManager = null;
			this.states = null;
			this.currentState = null;
			GameStateManager.instance = null;
						if (TEST_TRY3){	throw new Error('TEST_TRY3');	}
		} catch (error) {
			console.error('hth: dispose() failed', error);
		}
	}
}

export default GameStateManager;
