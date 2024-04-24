import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

/**
 * 試合のスコア管理と試合結果のチェックを担当。スコアの更新と試合の終了条件を評価する。
 * - 参考:【FontLoader – three.js docs】 <https://threejs.org/docs/#examples/en/loaders/FontLoader>
 * - 参考:【TextGeometry – three.js docs】 <https://threejs.org/docs/#examples/en/geometries/TextGeometry>
 */
class PongEngineMatch 
{
	constructor(pongEngine,scene, data) 
	{
		this.pongEngine = pongEngine;
		this.scene	= scene;
		this.score1 = data.state.score1;
		this.score2 = data.state.score2;
		this.maxScore = data.settings.maxScore;

		this.fontSize	= 40;
		this.depth		= 10;
		this.textMaterial = new THREE.MeshBasicMaterial(
		{ 
			color: 0xffffff,
			transparent: true,
			opacity: 0.7,
		});
		this.rotationZ = Math.PI; // 180度回転
		this.pos = new THREE.Vector3(0, -90, -7);
		
		if (import.meta.env.MODE === 'development') {
			this.fontURL = '../assets/fonts/droid_sans_bold.typeface.json';
		} else {
			const baseURL = new URL('.', import.meta.url).href;
			this.fontURL = new URL('../../fonts/droid_sans_bold.typeface.json', baseURL).href;
		}

		// フォントファイルのパスと3つのコールバック関数（成功、進行中、エラー）を引数として受け取り
		const loader = new FontLoader();
		loader.load( 
			// ロードするフォントファイルのパス
			this.fontURL,
			// フォントが正常にロードされた後に実行の処理
			( font ) => 
			{
				console.log('Font loaded successfully', font);
				this.font = font;
				this.createScoreText();
			},
			// ロードされたデータの量と全体のデータ量を取得し、ロードの進行状況をパーセンテージでコンソールに出力
			(xhr) => 
			{
				console.log((xhr.loaded / xhr.total * 100) + '% loaded');
			},
			(err) => 
			{
				console.error('An error happened');
			}
		);
	}

	// 参考:【TextGeometry – three.js ドキュメント】 <https://threejs.org/docs/#examples/en/geometries/TextGeometry>
	createScoreText() 
	{
		if (!this.font) 
		{
			return;
		}
		this.updateScoreText();
	}

	updateScoreText() 
	{
		// スコア表示領域の中心のxの値を取りたいので一つの文字列として扱う
		// TODO_ft:等幅フォントを用いも表示は崩れるので、別の方法も検討すべき
		const scoreText = `${this.score2}       ${this.score1}`;
		const textGeometry = new TextGeometry(scoreText, 
		{
			font:	this.font,
			size:	this.fontSize,
			depth:	this.depth
		});

		textGeometry.computeBoundingBox();
		const width = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
		// センタリング
		textGeometry.translate(-width / 2, 0, 0); 

		if (this.scoreMesh) 
		{
			this.scene.remove(this.scoreMesh);
			this.scoreMesh.geometry.dispose();
		}

		this.scoreMesh = new THREE.Mesh(textGeometry, this.textMaterial);
		// テキストが反転表示されてしまうので180度回転
		this.scoreMesh.rotation.z = this.rotationZ;
		this.scoreMesh.position.set(this.pos.x, this.pos.y, this.pos.z); 

		this.scene.add(this.scoreMesh);
	}

	updateScore(scorer) 
	{
		if (scorer === 1) 
		{
			this.score1++;
		} 
		else 
		{
			this.score2++;
		}
		// console.log(`score: ${this.score2} - ${this.score1}`);
		this.updateScoreText();
		this.checkMatchEnd();
	}

	checkMatchEnd() 
	{
		if (this.score1 >= this.maxScore || this.score2 >= this.maxScore) 
		{
			const winner = this.score1 >= this.maxScore ? 'Player 1' : 'Player 2';
			// console.log(`${this.winner} wins the match!`);
			this.endGame();
		}
	}

	endGame() 
	{
		console.log('end game');
		this.pongEngine.isRunning = false;
		this.sendMatchResult(this.winner);
		this.displayEndGameButton();
	}

	displayEndGameButton() 
	{
		// buttonタグを追加
		const button = document.createElement('button');
		button.textContent = 'End Game';
		button.className = 'game-button';
		button.onclick = function() {
			window.location.href = '/';
		};
		// ボタンをページに追加
		document.body.appendChild(button);
	}

	sendMatchResult(winner) 
	{
		// TODO_ft: matchID
		const result = 
		{
			winner: winner,
			score1: this.score1,
			score2: this.score2,
			// matchId: this.matchId,
			// player1: this.player1,
			// player2: this.player2
		};

		// ウェブリソースへのアクセス
		fetch('https://localhost/pong/api/save_game_result/', {
			method: 'POST',
// TODO_ft: テスト用
mode: 'no-cors', 
//
			headers: 
			{
				'Content-Type': 'application/json',
			},
			// result オブジェクトをJSON文字列に変換してボディにセット
			body: JSON.stringify(result)
		})

		// fetch からのレスポンスが返された後に実行
		// ボディをJSONとして解析
		// .then(response => 
		// {
		// 	if (!response.ok) 
		// 	{
		// 		throw new Error('response faled');
		// 	}

		// 	// ↑上記のmode: 'no-cors', では機能しない
		// 	return response.json();
		// 	// 
		// })
		// .then(data => console.log('Success:', data))
		// .catch((error) => console.error('Error:', error));
	}

}

export default PongEngineMatch;

