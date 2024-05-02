// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/RoundManager.js
import StateFirstRound from './StateFirstRound.js'

/**
 *  # RoundManager
 * - 目的: 現在のラウンドの状態を管理し、状態の変更を適切に処理します。
 * - 役割: 現在の状態（ラウンド）のオブジェクトを保持し、状態変更時に適切なenterとexit処理を行います。
 */
class RoundManager 
{
	constructor(tournamentManager) 
	{
		this.tournamentManager = tournamentManager;
		this.settings		= tournamentManager.settings;
		this.stateFirstRound = new StateFirstRound(this);
		this.currentState	= null;
	}

	changeState(newState) 
	{
		if (this.currentState) {
			this.currentState.exit();
		}
		this.currentState = newState;
		this.currentState.enter();
	}
}

export default RoundManager;