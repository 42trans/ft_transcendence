const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("PongGameResult", function () {
	it("Should return the new game result once it's added", async function () {
	  const Game = await ethers.getContractFactory("PongGameResult");
	  const game = await Game.deploy();
	//   await game.deployed();
  
	  const addGameTx = await game.addGameResult(1, 10, 5, "Alice", "Bob");
	  
	  // wait until the transaction is mined
	  await addGameTx.wait();
  
	  const gameResult = await game.getGameResultByMatchId(1);
  
	  expect(gameResult.matchId).to.equal(1);
	  expect(gameResult.player1Score).to.equal(10);
	  expect(gameResult.player2Score).to.equal(5);
	  expect(gameResult.winnerName).to.equal("Alice");
	  expect(gameResult.loserName).to.equal("Bob");
	});
  });
  