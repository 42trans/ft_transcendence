import PongEngine from "./PongEngine";
import PongEngineInit from "./PongEngineInit";

class PongEngineData {
	constructor(engine) {
		this.engine = engine;
		this.config = engine.config;
		this.scene = engine.scene;
		this.objects = {};
		this.settings = {
			maxScore: this.config.gameSettings.MAX_SCORE,
			initBallSpeed: this.config.gameSettings.INIT_BALL_SPEED,
			maxBallSpeed: this.config.gameSettings.MAX_BALL_SPEED,
			difficulty: this.config.gameSettings.DIFFICULTY,
			field: {
				width: this.config.fields.WIDTH,
				height: this.config.fields.HEIGHT
			}
		}
		this.state = {
			score1: 0,
			score2: 0,
		};
	}

	initObjects() {
		const initializer = new PongEngineInit(this.scene, this.config);
		this.objects = initializer.createGameObjects();
		Object.keys(this.objects).forEach(key => {
			this.scene.add(this.objects[key]);
		});
	}

	updateScore(player, score) {
		if (player === 1) {
			this.state.score1 += score;
		} else if (player === 2) {
			this.state.score2 += score;
		}
	}
}

export default PongEngineData;