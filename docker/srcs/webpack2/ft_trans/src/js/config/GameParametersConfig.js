/**
 * @file シーンの初期値を指定するconfigファイル
 * - 参考:【WebGLRenderer – three.js docs】 <https://threejs.org/docs/#api/en/renderers/WebGLRenderer>
 */

import * as THREE from 'three';
import BaseSceneConfig from './BaseSceneConfig.js'


class GameParametersConfig {
	constructor() {
		/** @type {{ antialias: boolean, pixelRatio: number, alpha: boolean }} */
		this.fields = {
			fieldWidth: 400,
			fieldHeight: 200,
		};

		this.paddles = {
			WIDTH: 10,
			HEIGHT: 30,
			DEPTH: 10,
			QUALITY: 1,
			MATERIALS: {
				paddle1: { color: 0x1B32C0 },
				paddle2: { color: 0xFF4045 }
			},
			SPEED: 3
		};
		this.ball = {
			RADIUS: 5,
			SEGMENTS: 6,
			RINGS: 6,
			MATERIAL: { color: 0xD43001 },
			SPEED: 2,
			DIRECTION: { x: 1, y: 1 }
		};
		this.materials = {
			plane: { color: 0x4BD121 },
			table: { color: 0x111111 },
			pillar: { color: 0x534d0d },
			ground: { color: 0x888888 }
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