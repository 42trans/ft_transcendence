/**
 * @file シーンの初期値を指定するconfigファイル
 * - 参考:【WebGLRenderer – three.js docs】 <https://threejs.org/docs/#api/en/renderers/WebGLRenderer>
 */

import * as THREE from 'three';


class GameParametersConfig {
	constructor() {
		this.fields = {
			WIDTH: 400,
			HEIGHT: 200,
		};

		// this.sceneSize = {
		// 	WIDTH: 640,
		// 	HEIGHT: 360,
		// };

		this.camrer = {
			VIEW_ANGLE: 50,
			// ASPECT = WIDTH / HEIGHT,
			// NEAR = 0.1,
			// FAR = 10000;
		};

		// 参考:【PlaneGeometry – three.js docs】 <https://threejs.org/docs/?q=BoxGeometry#api/en/geometries/PlaneGeometry>
		this.plane = {
			SEGMENTS: 10,
			MATERIAL: { color: 0x4BD121 },
			TRANSPARENT: true,
			OPACITY: 0.5,
		};

		// 参考:【BoxGeometry – three.js docs】 <https://threejs.org/docs/?q=BoxGeometry#api/en/geometries/BoxGeometry>
		this.table = {
			DEPTH: 100,
			SEGMENTS: 10,
			MATERIAL: { color: 0x111111 },
			TRANSPARENT: true,
			OPACITY: 0.5
		};

		this.paddles = {
			WIDTH: 10,
			HEIGHT: 30,
			DEPTH: 10,
			SEGMENTS: 1,
			MATERIALS: {
				paddle1: { color: 0x1B32C0 },
				paddle2: { color: 0xFF4045 }
			},
			SPEED: 3,
			paddle1DirY: 0,
			paddle2DirY: 0, 
		};
		
		// 参考:【SphereGeometry – three.js docs】 <https://threejs.org/docs/?q=SphereGeometry#api/en/geometries/SphereGeometry>
		this.ball = {
			RADIUS: 5,
			SEGMENTS: 16,
			// RINGS: 6,
			MATERIAL: { color: 0xD43001 },
			SPEED: 2,
			DIRECTION: { x: 1, y: 1 }
		};

		this.gameSettings = {
			score1: 0, 
			score2: 0,
			maxScore: 7,
			difficulty: 0.2
		};
	}
}

export default GameParametersConfig;