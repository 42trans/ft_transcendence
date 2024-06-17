// docker/srcs/vite/pong-three/src/js/pongEngine/PongEngineMatch.js
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { loadRouteTable } from '../../index.js';
import { handleCatchError } from '../../index.js';

const DEBUG_FLOW = 0;
const DEBUG_DETAIL = 0;

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

		this.fontSize	= 40;
		this.depth		= 10;
		this.textMaterial = new THREE.MeshBasicMaterial(
		{ 
			color: 0xffffff,
			transparent: true,
			opacity: 0.7,
		});
		// 180度回転
		this.rotationZ	= Math.PI; 
		this.pos		= new THREE.Vector3(0, -90, -7);
		
		if (import.meta.env.MODE === 'development') {
			this.fontURL	= '../assets/fonts/droid_sans_bold.typeface.json';
		} else {
			const baseURL	= new URL('.', import.meta.url).href;
			this.fontURL	= new URL('../../fonts/droid_sans_bold.typeface.json', baseURL).href;
		}

		// フォントファイルのパスと3つのコールバック関数（成功、進行中、エラー）を引数として受け取り
		const loader = new FontLoader();
		loader.load( 
			// ロードするフォントファイルのパス
			this.fontURL,
			// フォントが正常にロードされた後に実行の処理
			( font ) => 
				{
					this.font = font;
					this.createScoreText();
				},
			// ロードされたデータの量と全体のデータ量を取得し、ロードの進行状況をパーセンテージでコンソールに出力
			(xhr) => 
				{
								if (DEBUG_DETAIL) {	console.log((xhr.loaded / xhr.total * 100) + '% font loaded');	}
				},
			(error) => 
				{
					console.error('hth: An error happened');
					handleCatchError(error);
				}
		);

		this.isEndGameButtonListenerRegistered = false;
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
					if (DEBUG_FLOW) {	console.log(`score: ${this.score2} - ${this.score1}`);	};
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
					if (DEBUG_FLOW) {	console.log('Game end');	};
		this.pongEngine.isRunning = false;
		
		if (this.matchData){
			this.sendMatchResult();
		}
		await this.displayEndGameButton();
	}

	// TODO_ft:共通化
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
				this.registerEndGameButtonClickListener(endGameButton);
			} else {
				console.error('hth: End Game button not found');
				handleCatchError(error);
			}
		} catch (error){
			console.error('hth: updateEndGameBtn() failed: ', error);
			handleCatchError(error);
		}
	}


	async handleEndGameButtonClick() 
	{
		const routeTable = await loadRouteTable();
		const switchPage = await this.loadSwitchPage();
		const redirectTo = routeTable['top'].path;
		switchPage(redirectTo);
	}

	registerEndGameButtonClickListener(endGameButton) 
	{
		if (!this.isEndGameButtonListenerRegistered) {
			endGameButton.addEventListener('click', this.handleEndGameButtonClick.bind(this));
			this.isEndGameButtonListenerRegistered = true;
		}
	}

	removeEndGameButtonClickListener(endGameButton) 
	{
		if (this.isEndGameButtonListenerRegistered) {
			endGameButton.removeEventListener('click', this.handleEndGameButtonClick);
			this.isEndGameButtonListenerRegistered = false;
		}
	}

	sendMatchResult() 
	{
		try
		{
			const result = 
			{
				match_id: this.matchData.id, 
				player1_score: this.score1,
				player2_score: this.score2,
			};
			
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
							throw new Error('hth: response failed');
						}
						return response.json();
					})
			.then(data => 
				{
								if (DEBUG_DETAIL){
									console.log('The Results have been saved to the DB: match.id:', this.matchData.id, data);
								}
				})
			.catch((error) => console.error('Error:', error));
		} catch (error) {
			console.error('hth: sendMatchResult() failed:', error);
			handleCatchError(error);
		}
	}


	dispose() 
	{
		// イベントハンドラの削除
		const endGameButton = document.getElementById('hth-threejs-back-to-home-btn');
		if (endGameButton) {
			this.removeEndGameButtonClickListener(endGameButton);
		}

		// シーンからオブジェクトを廃棄　リーク防止
		if (this.scoreMesh) {
			this.scene.remove(this.scoreMesh);
			this.scoreMesh.geometry.dispose();
			this.scoreMesh = null;
		}
		if (this.font) {
			this.font = null;
		}
			if (this.textMaterial) {
			this.textMaterial.dispose();
			this.textMaterial = null;
		}
	
		// 他のプロパティをnullに設定
		this.pongApp	= null;
		this.pongEngine	= null;
		this.scene		= null;
		this.score1		= null;
		this.score2		= null;
		this.maxScore	= null;
		this.matchData	= null;
		this.env		= null;
		this.ball		= null;

	}

}

export default PongEngineMatch;
