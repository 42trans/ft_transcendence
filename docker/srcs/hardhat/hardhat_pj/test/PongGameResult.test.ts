import { expect } from "chai";
import { ethers } from "hardhat";
// import { Contract } from "ethers";
// import { BigNumber } from "ethers";

describe("PongGameResult", function () {
	it("新しいゲーム結果を追加し、getGameResultByMatchId()で同一であることを確認", async function () {
		const Game = await ethers.getContractFactory("PongGameResult");
		const game = await Game.deploy();
		const addGameTx = await game.addGameResult(1, 10, 5, "キュア緑", "キュア黄");
		
		// wait until the transaction is mined
		await addGameTx.wait();

		const gameResult = await game.getGameResultByMatchId(1);
		expect(gameResult.matchId).to.equal(1);
		expect(gameResult.player1Score).to.equal(10);
		expect(gameResult.player2Score).to.equal(5);
		expect(gameResult.winnerName).to.equal("キュア緑");
		expect(gameResult.loserName).to.equal("キュア黄");
	});

	it("登録したすべての結果をgetAllGameResults()で取得して表示し、期待値と同一であることを確認", async function () {
		const Game = await ethers.getContractFactory("PongGameResult");
		const game = await Game.deploy();

		await (await game.addGameResult(3, 2, 1, "キュア緑", "キュア黄")).wait();
		await (await game.addGameResult(2, 7, 3, "キュア紫", "キュア桃")).wait();

		const results = await game.getAllGameResults(); 

		for (let i = 0; i < results.length; i++) {
			console.log(`Match ID: ${results[i].matchId}`);
			console.log(`Player 1 Score: ${results[i].player1Score}`);
			console.log(`Player 2 Score: ${results[i].player2Score}`);
			console.log(`Winner Name: ${results[i].winnerName}`);
			console.log(`Loser Name: ${results[i].loserName}`);
			console.log(`Date: ${results[i].date}`);
		}

		expect(results.length).to.equal(2);
		expect(results[0].matchId).to.equal(3);
		expect(results[0].player1Score).to.equal(2);
		expect(results[0].player2Score).to.equal(1);
		expect(results[0].winnerName).to.equal("キュア緑");
		expect(results[0].loserName).to.equal("キュア黄");

		expect(results[1].matchId).to.equal(2);
		expect(results[1].player1Score).to.equal(7);
		expect(results[1].player2Score).to.equal(3);
		expect(results[1].winnerName).to.equal("キュア紫");
		expect(results[1].loserName).to.equal("キュア桃");
	});
});
