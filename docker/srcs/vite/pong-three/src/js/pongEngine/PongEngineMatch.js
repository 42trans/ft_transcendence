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
	constructor(pongApp, pongEngine, scene, data) 
	{
		this.pongApp	= pongApp;
		this.pongEngine	= pongEngine;
		this.scene		= scene;
		this.score1		= data.state.score1;
		this.score2		= data.state.score2;
		this.maxScore	= data.settings.maxScore;
		this.matchData	= pongEngine.matchData;
		this.env		= pongEngine.env; 
		this.ball		= data.objects.ball;

		// console.log('match constructor', this.matchData.id);

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
					// console.log('Font loaded successfully', font);
					this.font = font;
					this.createScoreText();
				},
			// ロードされたデータの量と全体のデータ量を取得し、ロードの進行状況をパーセンテージでコンソールに出力
			(xhr) => 
				{
					console.log((xhr.loaded / xhr.total * 100) + '% font loaded');
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

	async updateScore(scorer) 
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
		await this.checkMatchEnd();
	}

	async checkMatchEnd() 
	{
		if (this.score1 >= this.maxScore || this.score2 >= this.maxScore) 
		{
			this.ball.position.set(0, 0, 0); 
			await this.endGame();
		}
	}

	async endGame() 
	{
		console.log('Game end');
		this.pongEngine.isRunning = false;
		
		if (this.matchData){
			this.sendMatchResult();
		}
		await this.displayEndGameButton();
	}

	async loadSwitchPage() {
		if (import.meta.env.MODE === 'development') {
			// 開発環境用のパス
			const devUrl = new URL('../../static/spa/js/routing/renderView.js', import.meta.url);
			const module = await import(devUrl.href);
			return module.switchPage;
		} else {
			// 本番環境用のパス
			const prodUrl = new URL('../../../spa/js/routing/renderView.js', import.meta.url);
			const module = await import(prodUrl.href);
			return module.switchPage;
		}
	}

	// ゲーム終了時に Back to Home ボタンリンクを表示する	
	async displayEndGameButton() 
	{
		try {
			const endGameButton = document.getElementById('hth-threejs-back-to-home-btn');
			if (endGameButton) 
			{
				endGameButton.style.display = 'block';
				const switchPage = await this.loadSwitchPage();
				endGameButton.addEventListener('click', () => 
				{
					const redirectTo = this.pongApp.routeTable['top'].path;
					switchPage(redirectTo);
				});
			} else {
				console.error('End Game button not found');
			}
		} catch (error){
			console.error('hth: updateEndGameBtn() failed: ', error);
		}
	}

	// displayEndGameButton() 
	// {
	// 	// buttonタグを追加
	// 	const button = document.createElement('button');
	// 	button.textContent = 'End Game';
	// 	button.className = 'game-button';
	// 	button.setAttribute('data-link', '');
	// 	button.onclick = function() {
	// 		window.location.href = '/app/';
	// 	};
	// 	// ボタンをページに追加
	// 	document.body.appendChild(button);
	// }

	sendMatchResult() 
	{
		const result = 
		{
			match_id: this.matchData.id, 
			player1_score: this.score1,
			player2_score: this.score2,
		};

		// console.log('three window.isDevServer', window.isDevServer);
		
		// viteが開発環境ならば、this.env == 'dev'
		// Djangoがdev server(:8002)ならば、window.isDevServer == true
		if (this.env === 'dev'|| window.isDevServer) {
			this.saveURL = 'http://localhost:8002/pong/api/tournament/save_game_result/';
		} else {
			this.saveURL = 'https://localhost/pong/api/tournament/save_game_result/';
		}
		fetch(this.saveURL, 
			{
				method: 'POST',
				headers: {'Content-Type': 'application/json',},
				// result オブジェクトをJSON文字列に変換してボディにセット
				body: JSON.stringify(result)
			})
			.then(response => 
				{
					if (!response.ok) {
						throw new Error('response faled');
					}
					return response.json();
				})
		.then(data => console.log('The Results have been saved to the DB: match.id:', this.matchData.id, data))
		.catch((error) => console.error('Error:', error));
	}

}

export default PongEngineMatch;
