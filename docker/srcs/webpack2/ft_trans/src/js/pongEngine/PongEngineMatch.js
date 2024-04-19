import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

/**
 * 試合のスコア管理と試合結果のチェックを担当。スコアの更新と試合の終了条件を評価する。
 * - 参考:【FontLoader – three.js docs】 <https://threejs.org/docs/#examples/en/loaders/FontLoader>
 * - 参考:【TextGeometry – three.js docs】 <https://threejs.org/docs/#examples/en/geometries/TextGeometry>
 */
class PongEngineMatch {
	constructor(scene, data) {
		this.scene	= scene;
		this.score1 = data.state.score1;
		this.score2 = data.state.score2;
		this.maxScore = data.state.maxScore;

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
	}

	checkMatchEnd() {
		if (this.score1 >= this.maxScore || this.score2 >= this.maxScore) {
			const winner = this.score1 >= this.maxScore ? 'Player 1' : 'Player 2';
			console.log(`${winner} wins the match!`);
			// ここでゲーム終了の処理をするか、イベントを発火させる
		}
	}
}

export default PongEngineMatch;