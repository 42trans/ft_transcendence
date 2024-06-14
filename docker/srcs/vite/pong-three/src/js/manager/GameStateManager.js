import GamePlayState from '../state/GamePlayState'
import EntryGameState from '../state/EntryGameState'
import RendererManager from './RendererManager';

const DEBUG_FLOW = 0;
const DEBUG_DETAIL = 0;

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
		if (this.currentState) 
		{
						if(DEBUG_FLOW) {	console.log('currentState.exit(): ', this.currentState);	}
			this.currentState.exit();
		}
					if (DEBUG_FLOW) {	console.log('changeState():', newState);	}
		this.currentState = this.states[newState];
		this.currentState.enter();
	}

	update() 
	{
					if (DEBUG_DETAIL) {	console.log('update():', this.currentState);	}
		if (this.currentState) 
		{
					if (DEBUG_DETAIL) {	console.log('update():', this.currentState);	}
			this.currentState.update();
		}
	}

	render() 
	{
		if (this.currentState) 
		{
			this.currentState.render();
		}
	}

	dispose() 
	{
		if (this.currentState) 
		{
			this.currentState.exit();
		}
		this.pongApps = null;
		this.allScenesManager = null;
		this.states = null;
		this.currentState = null;
		GameStateManager.instance = null;
	}
}

export default GameStateManager;
