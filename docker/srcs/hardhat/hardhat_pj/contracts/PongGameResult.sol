// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract PongGameResult {
	struct GameResult {
		uint matchId;
		uint player1Score;
		uint player2Score;
		string winnerName;
		string loserName;
		uint date;
	}

	GameResult[] public gameResults;

	event AddGameResult(uint256 indexed matchId, uint256 player1Score, uint256 player2Score, string winner, string loser);

	function addGameResult(uint _matchId, uint _player1Score, uint _player2Score, string memory _winnerName, string memory _loserName) public {
		// console.log(
		// 	" id %s , win %s ",
		// 	_matchId,
		// 	_winnerName
		// );
		gameResults.push(GameResult(_matchId, _player1Score, _player2Score, _winnerName, _loserName, block.timestamp));
		emit AddGameResult(_matchId, _player1Score, _player2Score, _winnerName, _loserName);
	}

	function getGameResult(uint index) public view returns (GameResult memory) {
		return gameResults[index];
	}

	function getGameResultByMatchId(uint _matchId) public view returns (GameResult memory) {
		for (uint i = 0; i < gameResults.length; i++) {
			if (gameResults[i].matchId == _matchId) {
				return gameResults[i];
			}
		}
		revert("Game result not found.");
	}

	function getAllGameResults() public view returns (GameResult[] memory) {
		return gameResults;
	}
}
