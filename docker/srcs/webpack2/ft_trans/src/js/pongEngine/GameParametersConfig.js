/**
 * @file シーンの初期値を指定するconfigファイル
 * - 参考:【WebGLRenderer – three.js docs】 <https://threejs.org/docs/#api/en/renderers/WebGLRenderer>
 */

import * as THREE from 'three';

/**
 * ゲームに必要な初期値を設定
 * - オブジェクトリテラルで格納
 *   - オブジェクト毎にセクション `{}`にプロパティを `key: value`で設定する
 * 
 */
class GameParametersConfig {
	constructor() {
		this.fields = {
			WIDTH: 400,
			// HEIGHT: 100,
			HEIGHT: 300,
		};

		// this.sceneSize = {
		// 	WIDTH: 640,
		// 	HEIGHT: 360,
		// };

		// this.camra = {
			// VIEW_ANGLE: 50,
			// ASPECT = WIDTH / HEIGHT,
			// NEAR = 0.1,
			// FAR = 10000;
		// };

		// 参考:【PlaneGeometry – three.js docs】 <https://threejs.org/docs/?q=BoxGeometry#api/en/geometries/PlaneGeometry>
		this.plane = {
			SEGMENTS: 10,
			MATERIAL: { 
				color: 0xffffff,
				// roughness: 0.7,
				// metalness: 0.3,
				transparent: true,
				opacity: 0.5,
				receiveShadow: true,
			},
			RECEIVE_SHADOW: true,
		};

		// 参考:【BoxGeometry – three.js docs】 <https://threejs.org/docs/?q=BoxGeometry#api/en/geometries/BoxGeometry>
		this.table = {
			DEPTH: 100,
			SEGMENTS: 10,
			MATERIAL: { 
				// color: 0x111111,
				color: this.rgbToHex(10, 10, 0),
				transparent: true,
				opacity: 0.7,
			},
			RECEIVE_SHADOW: true,
			POSITION_Z: -51,
		};

		// 参考:【SphereGeometry – three.js docs】 <https://threejs.org/docs/?q=SphereGeometry#api/en/geometries/SphereGeometry>
		this.ball = {
			RADIUS: 5,
			SEGMENTS: 16,
			// RINGS: 6,
			MATERIAL: { 
				// color: 0xFFFFFF,
				color: this.rgbToHex(10, 10, 10),
				roughness: 0.1, // 鏡面反射=0.0
				metalness: 1.0, // 非金属材料=0.0
				// transparent: true,
				// opacity: 0.5,
			},
			SPEED: 2,
			DIRECTION: { x: 1, y: 1 },
			RECEIVE_SHADOW: true,
			CAST_SHADOW: true,
		};

		this.paddle1 = {
			WIDTH: 10,
			// HEIGHT: 90,
			HEIGHT: 30,
			DEPTH: 10,
			SEGMENTS: 1,
			MATERIAL: {
				// color: 0x1B32C0,
				color: this.rgbToHex(10, 10, 10),
				roughness: 0.1,
				metalness: 1.0,
				// transparent: true,
				// opacity: 0.7,
			},
			RECEIVE_SHADOW: true, 
			CAST_SHADOW: true,
			SPEED: 3,
			DirY: 0,
			// paddle2DirY: 0, 
		};
		
		this.paddle2 = {
			WIDTH: 10,
			// HEIGHT: 90,
			HEIGHT: 30,
			DEPTH: 10,
			SEGMENTS: 1,
			MATERIAL: {
				// color: 0xFF4045,
				color: this.rgbToHex(10, 10, 10),
				roughness: 0.1,
				metalness: 1.0,
			},
			RECEIVE_SHADOW: true, 
			CAST_SHADOW: true,
			SPEED: 3,
			// paddle1DirY: 0,
			DirY: 0, 
		};
		
		this.gameSettings = {
			SCORE1: 0, 
			SCORE2: 0,
			MAX_SCORE: 7,
			DIFFICULTY: 0.2,
		};
	}

	rgbToHex(r, g, b) {
		return (r << 16) + (g << 8) + b;
	}
}

export default GameParametersConfig;