// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

/**
 * @title 
 * @author 
 * @notice pongゲームの結果を記録するcontract
 * @dev テスト用を除き、functionはDjangoの view_modules から呼び出されます。
 */
contract PongGameResult {
	struct GameResult {
		uint matchId;
		uint player1Score;
		uint player2Score;
		string winnerName;
		string loserName;
		uint date;
	}

	/// @notice 全ゲーム結果の配列
	GameResult[] public gameResults;

	/// @notice 新しいゲーム結果が追加されたときにトリガーされるイベント
	/// @dev 今のところ使っていません。
	event AddGameResult(uint256 indexed matchId, uint256 player1Score, uint256 player2Score, string winner, string loser);

	/// @notice 全ゲーム結果を取得する
	/// @dev Django APIへの GET メソッドリクエストで使用する関数
	/// @return 全ゲーム結果の配列
	function getAllGameResults() public view returns (GameResult[] memory) {
		return gameResults;
	}

	/// @notice 新しいゲーム結果を追加する
	/// @dev Django APIへの POST メソッドリクエストで使用する関数
	/// @param _matchId The unique identifier for the match
	function addGameResult(uint _matchId, uint _player1Score, uint _player2Score, string memory _winnerName, string memory _loserName) public {
		// debug
		// console.log(
		// 	" id %s , win %s ",
		// 	_matchId,
		// 	_winnerName
		// );
		gameResults.push(GameResult(_matchId, _player1Score, _player2Score, _winnerName, _loserName, block.timestamp));
		emit AddGameResult(_matchId, _player1Score, _player2Score, _winnerName, _loserName);
	}

	/// @notice indexを指定して試合結果を取得する。Djangoのコンソールlog出力に使用する関数
	function getGameResult(uint index) public view returns (GameResult memory) {
		return gameResults[index];
	}

	/// @notice matchIdを指定して試合結果を取得する。Hardhatローカルネットテストで使用する関数。
	function getGameResultByMatchId(uint _matchId) public view returns (GameResult memory) {
		for (uint i = 0; i < gameResults.length; i++) {
			if (gameResults[i].matchId == _matchId) {
				return gameResults[i];
			}
		}
		revert("Game result not found.");
	}

}

