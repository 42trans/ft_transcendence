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
		uint64 matchId;
		uint8 player1Score;
		uint8 player2Score;
		uint256 timestamp;
	}

	/// @notice 全ゲーム結果の配列
	GameResult[] public gameResultList;

	/// @notice 全ゲーム結果を格納するmap(key: matchId, value: GameResult)
	/// @dev 時間計算量O(1)でGameResultを返す -> ガス消費量は最小限
	mapping(uint64 => GameResult) public gameResultMap;



	/// @notice 新しいゲーム結果が追加されたときにトリガーされるイベント
	/// @dev 今のところ使っていません。
	event AddGameResult(uint64 indexed matchId, uint8 player1Score, uint8 player2Score);



	/// @notice 全ゲーム結果を取得する
	/// @dev Django APIへの GET メソッドリクエストで使用する関数
	/// @return 全ゲーム結果の配列
	function getGameResultList() public view returns (GameResult[] memory) {
		return gameResultList;
	}

	/**
	 * @notice 新しいゲーム結果を追加
	 * @dev Django APIへの POST メソッドリクエストで使用する関数
     * @param matchId 試合の一意識別子
     * @param player1Score プレイヤー1のスコア
     * @param player2Score プレイヤー2のスコア
     */
	function addGameResult(uint64 matchId, uint8 player1Score, uint8 player2Score) public {
		require(gameResultMap[matchId].matchId == 0, "[Error] matchId is duplicated");

		console.log("[Debug] addGameResult: matchId %s, player1Score %s, player2Score %s", matchId, player1Score, player2Score);
		GameResult memory newGameResult = GameResult(matchId, player1Score, player2Score, block.timestamp);
		gameResultList.push(newGameResult);
		gameResultMap[matchId] = newGameResult;
		emit AddGameResult(matchId, player1Score, player2Score);
	}

	/// @notice indexを指定して試合結果を取得する。Djangoのコンソールlog出力に使用する関数
	function getGameResult(uint64 index) public view returns (GameResult memory) {
		return gameResultMap[index];
	}

	/// @notice matchIdを指定して試合結果を取得する。Hardhatローカルネットテストで使用する関数。
	function getGameResultByMatchId(uint64 matchId) public view returns (GameResult memory) {
		require(gameResultMap[matchId].matchId != 0, "[Error] Game result not found");
		return gameResultMap[matchId];
	}

}
