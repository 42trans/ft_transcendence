// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PongGameResult {
    struct GameResult {
        uint matchId;
        uint player1Score;
        uint player2Score;
        string winnerName;
        string loserName;
        uint date; // UNIXタイムスタンプ形式
    }

    GameResult[] public gameResults;

    function addGameResult(uint _matchId, uint _player1Score, uint _player2Score, string memory _winnerName, string memory _loserName) public {
        gameResults.push(GameResult(_matchId, _player1Score, _player2Score, _winnerName, _loserName, block.timestamp));
    }

    function getGameResult(uint index) public view returns (GameResult memory) {
        return gameResults[index];
    }
}
