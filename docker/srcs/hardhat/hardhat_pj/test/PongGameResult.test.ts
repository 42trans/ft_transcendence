// docker/srcs/hardhat/hardhat_pj/test/PongGameResult.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
// import { Contract } from "ethers";
// import { BigNumber } from "ethers";

describe("HardhatUnitTestForPongGameResult", function () {
	it("test1: 新しいゲーム結果を追加し、getGameResultByMatchId()で同一であることを確認", async function () {
		const Game = await ethers.getContractFactory("PongGameResult");
		const game = await Game.deploy();

		const matchId = 1;
		const player1Score = 10;
		const player2Score = 5;

		const addGame = await game.addGameResult(matchId, player1Score, player2Score);
		
		// wait until the transaction is mined
		await addGame.wait();

		const gameResult = await game.getGameResultByMatchId(matchId);
		expect(gameResult.matchId).to.equal(matchId);
		expect(gameResult.player1Score).to.equal(player1Score);
		expect(gameResult.player2Score).to.equal(player2Score);
	});

	it("test2: 登録したすべての結果をgetAllGameResults()で取得して表示し、期待値と同一であることを確認", async function () {
		const Game = await ethers.getContractFactory("PongGameResult");
		const game = await Game.deploy();

		const testData = [
			{ matchId: 2, player1Score: 7, player2Score: 3 },
			{ matchId: 3, player1Score: 2, player2Score: 1 },
			{ matchId: 4, player1Score: 2, player2Score: 1 },
			{ matchId: 2147483647, player1Score: 100, player2Score: 1 },
			{ matchId: Number.MAX_SAFE_INTEGER, player1Score: 0, player2Score: 100 },
		];

		for (const data of testData) {
			await (await game.addGameResult(data.matchId, data.player1Score, data.player2Score)).wait();
		}

		const resultList = await game.getGameResultList();

		for (let i = 0; i < resultList.length; i++) {
			console.log(
				"[Debug] (test2) Match ID: " + resultList[i].matchId +
				", Player 1 Score: " + resultList[i].player1Score +
				", Player 2 Score: " + resultList[i].player2Score +
				", timestamp: " + resultList[i].timestamp
			);
		}

		expect(resultList.length).to.equal(testData.length);
		testData.forEach((data, index) => {
			expect(resultList[index].matchId).to.equal(data.matchId);
			expect(resultList[index].player1Score).to.equal(data.player1Score);
			expect(resultList[index].player2Score).to.equal(data.player2Score);
		});

	});

});
