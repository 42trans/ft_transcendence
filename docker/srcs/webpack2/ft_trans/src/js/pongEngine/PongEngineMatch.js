import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

/**
 * 試合のスコア管理と試合結果のチェックを担当。スコアの更新と試合の終了条件を評価する。
 * - 参考:【FontLoader – three.js docs】 <https://threejs.org/docs/#examples/en/loaders/FontLoader>
 * - 参考:【TextGeometry – three.js docs】 <https://threejs.org/docs/#examples/en/geometries/TextGeometry>
 */
class PongEngineMatch {
	constructor(pongEngine,scene, data) {
		this.pongEngine = pongEngine;
		this.scene	= scene;
		this.score1 = data.state.score1;
		this.score2 = data.state.score2;
		this.maxScore = data.settings.maxScore;

		this.fontSize = 40;
		this.textMaterial = new THREE.MeshBasicMaterial({ 
			color: 0xffffff,
			transparent: true,
			opacity: 0.3,
		});
		
		const loader = new FontLoader();
		loader.load( 
			// 'fonts/gentilis_bold.typeface.json', 
			// 'fonts/droid/droid_serif_bold.typeface.json', 
			'fonts/droid/droid_sans_bold.typeface.json', 
			( font ) => {
				this.font = font;
				this.createScoreText();
			},
			(xhr) => {
				console.log((xhr.loaded / xhr.total * 100) + '% loaded');
			},
			(err) => {
				console.log('An error happened');
			}
		);
	}

	// 参考:【TextGeometry – three.js ドキュメント】 <https://threejs.org/docs/#examples/en/geometries/TextGeometry>
	createScoreText() {
		this.updateScoreText();
	}

	updateScoreText() {
		const scoreText = `${this.score2}       ${this.score1}`;
		const textGeometry = new TextGeometry(scoreText, {
			font: this.font,
			size: this.fontSize,
			depth: 2
		});

		textGeometry.computeBoundingBox();
		const width = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
		textGeometry.translate(-width / 2, 0, 0); // センタリング

		if (this.scoreMesh) {
			this.scene.remove(this.scoreMesh);
			this.scoreMesh.geometry.dispose();
		}

		this.scoreMesh = new THREE.Mesh(textGeometry, this.textMaterial);
		this.scoreMesh.rotation.z = Math.PI; // 180度回転
		this.scoreMesh.position.set(0, -90, 0); 

		this.scene.add(this.scoreMesh);
	}

	updateScore(scorer) {
		if (scorer === 1) {
			this.score1++;
		} else {
			this.score2++;
		}
		this.updateScoreText();
		this.checkMatchEnd();

		console.log(`
			score: ${this.score2} - ${this.score1}
		`);	
	}

	checkMatchEnd() {
		if (this.score1 >= this.maxScore || this.score2 >= this.maxScore) {
			const winner = this.score1 >= this.maxScore ? 'Player 1' : 'Player 2';
			console.log(`${this.winner} wins the match!`);
			// ここでゲーム終了の処理をするか、イベントを発火させる
			this.pongEngine.isRunning = false;
			this.endGame();
		}
	}

	endGame() {
		this.pongEngine.isRunning = false;
		console.log('end game');
		// this.sendMatchResult(this.winner);
		this.displayEndGameButton();
	}


	displayEndGameButton() {
		const button = document.createElement('button');
		button.textContent = 'End Game';
		button.id = 'startButton';
		button.style.position = 'absolute'; // 位置の基準を絶対位置に設定
		button.style.top = '50%';  // ボタンの位置調整
		button.style.left = '50%';
		button.onclick = function() {
			window.location.href = '/';
		};
		// ボタンをページに追加
		document.body.appendChild(button);
	}

}

export default PongEngineMatch;



// 	sendMatchResult(winner) {
// 		const result = {
// 			winner: winner,
// 			score1: this.score1,
// 			score2: this.score2,
// 			// matchId: this.matchId,
// 			// player1: this.player1,
// 			// player2: this.player2
// 		};

// 		// ウェブリソースへのアクセス
// 		fetch('https://localhost/pong/api/save_game_result/', {
// 			method: 'POST',
// // TODO_ft: テスト用
// mode: 'no-cors', 
// //
// 			headers: {
// 				'Content-Type': 'application/json',
// 			},
// 			// result オブジェクトをJSON文字列に変換してボディにセット
// 			body: JSON.stringify(result)
// 		})

// 		// fetch からのレスポンスが返された後に実行
// 		// ボディをJSONとして解析
// 		// .then(response => {
// 		// 	if (!response.ok) {
// 		// 		throw new Error('response faled');
// 		// 	}

// 		// 	// ↑上記のmode: 'no-cors', では機能しない
// 		// 	return response.json();
// 		// 	// 
// 		// })
// 		// .then(data => console.log('Success:', data))
// 		// .catch((error) => console.error('Error:', error));
// 	}

// 	displayEndGameButton() {
// 		const button = document.createElement('button');
// 		button.textContent = 'End Game';
// 		button.style.position = 'absolute'; // 位置の基準を絶対位置に設定
// 		button.style.top = '50%';  // ボタンの位置調整
// 		button.style.left = '50%';
// 		// button.style.zIndex = '1000'; // 他の要素より前面に表示
// 		button.onclick = function() {
// 			window.location.href = '/';
// 		};
// 		// ボタンをページに追加
// 		document.body.appendChild(button);
// 	}
