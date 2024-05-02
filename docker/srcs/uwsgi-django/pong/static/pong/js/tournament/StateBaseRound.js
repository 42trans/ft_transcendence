// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/StateBaseRound.js

/**
 * # StateBaseRound
 * - 目的: 共通のインターフェースを提供し、各ラウンドクラスで必要なメソッド（enter, exit, update）を強制します。
 * - 役割: 各ラウンドの共通の動作を定義し、特有の動作は継承したクラスでオーバーライドする。
 */
class StateBaseRound 
{
	constructor(roundManager) 
	{
		// インスタンス作成の禁止
		if (new.target === StateBaseRound) {
			throw new Error("StateBaseRound cannot be instantiated directly.");
		}
		// 子クラスが使用可能
		this.roundManager		= roundManager;
		this.settings			= roundManager.settings;
		this.API_URLS			= roundManager.settings.API_URLS;
		// 情報を表示するコンテナのIDを設定から取得
		this.tournamentForm				= document.getElementById(this.settings.tournamentFormId);
		this.userInfoContainer			= document.getElementById(this.settings.userInfoId);
		this.errorMessage				= document.getElementById(this.settings.errorMessageId);
		this.submitMessage				= document.getElementById(this.settings.submitMessageId);
		this.backHomeButton				= document.getElementById(this.settings.backHomeButtonId);
		this.ongoingTournamentContainer	= document.getElementById(this.settings.ongoingTournamentId);
		this.tournamentRoundContainer	= document.getElementById(this.settings.tournamentRoundId);
		this.tournamentContainer		= document.getElementById(this.settings.tournamentContainerId);
	}
	enter() {	console.error("method should be overridden.");	}
	exit() {	console.error("method should be overridden.");	}
	update() {	console.error("method should be overridden.");	}
}

export default StateBaseRound;