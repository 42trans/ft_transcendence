/**
 * 試合のスコア管理と試合結果のチェックを担当。スコアの更新と試合の終了条件を評価する。
 */
class PongEngineMatch {
	constructor(data) {
		this.score1 = data.state.score1;
		this.score2 = data.state.score2;
		this.maxScore = data.state.maxScore;
	}

	updateScore(scorer) {
		if (scorer === 1) {
			this.score1++;
			console.log(`${this.score1} - ${this.score2}`);
		} else {
			this.score2++;
			console.log(`${this.score1} - ${this.score2}`);
		}
		this.checkMatchEnd();
	}

	checkMatchEnd() {
		if (this.score1 >= this.maxScore || this.score2 >= this.maxScore) {
			const winner = this.score1 >= this.maxScore ? 'Player 1' : 'Player 2';
			console.log(`${winner} wins the match!`);
			// ここでゲーム終了の処理をするか、イベントを発火させる
		}
	}
}

export default PongEngineMatch;