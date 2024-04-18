
import GameParametersConfig from './GameParametersConfig';
import PongEngineInitializer from './PongEngineInitializer';
// import PongEngineUpdate from './PongEngineUpdate';
import * as THREE from 'three';
import RendererManager from '../manager/RendererManager';
import AnimationMixersManager from '../manager/AnimationMixersManager';


class PongEngine {
		constructor(scene) {
		this.renderer = RendererManager.getRnderer();
		this.animationMixersManager = AnimationMixersManager.getInstance();
		this.scene = scene;
		this.config = new GameParametersConfig();

		this.builder = new PongEngineInitializer(this.renderer, this.scene, this.config);
		this.objects = this.builder.createGameObjects();
		this.builder.setupGameScene(this.objects);
	}
	
	updeat() {
		// this.pongEngineUpdate = new PongEngineUpdate(this.scene, this.renderer);
	}
}

export default PongEngine;
