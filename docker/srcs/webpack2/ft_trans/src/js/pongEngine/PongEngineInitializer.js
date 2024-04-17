import * as THREE from 'three';

class PongEngineInitializer {
	constructor(renderer, scene, config) {
		this.renderer = renderer;
		this.scene = scene;
		this.config = config;

		this.fieldWidth = this.config.fields.WIDTH;
		this.fieldHeight = this.config.fields.HEIGHT;
	}

	createGameObjects() {
		const objects = {
			plane: new THREE.Mesh(
				new THREE.PlaneGeometry(
					this.config.fields.WIDTH * 0.95,
					this.config.fields.HEIGHT,
					this.config.plane.SEGMENTS,
					this.config.plane.SEGMENTS
				),
				new THREE.MeshLambertMaterial({
					color: this.config.plane.MATERIAL.color,
					transparent: this.config.plane.TRANSPARENT,
					opacity: this.config.plane.OPACITY
				})
			),

			table: new THREE.Mesh(
				new THREE.BoxGeometry(
					this.config.fields.WIDTH * 1.05,    
					this.config.fields.HEIGHT * 1.03,
					this.config.table.DEPTH,
					this.config.table.SEGMENTS,
					this.config.table.SEGMENTS,
					this.config.table.SEGMENTS,
				),
				new THREE.MeshLambertMaterial({
					color: this.config.table.MATERIAL.color,
					transparent: this.config.table.TRANSPARENT,
					opacity: this.config.table.OPACITY
				})
			),

			ball: new THREE.Mesh(
				// SphereGeometry(radius : Float, widthSegments : Integer, heightSegments : Integer, phiStart : Float, phiLength : Float, thetaStart : Float, thetaLength : Float)
				new THREE.SphereGeometry(
					this.config.ball.RADIUS, 
					this.config.ball.SEGMENTS, 
					// this.config.ball.RINGS
				),
				new THREE.MeshBasicMaterial({ color: this.config.ball.MATERIAL.color })
			),
	
			paddle1: new THREE.Mesh(
				new THREE.BoxGeometry(
					this.config.paddles.WIDTH, 
					this.config.paddles.HEIGHT, 
					this.config.paddles.DEPTH,
					this.config.paddles.SEGMENTS,
					this.config.paddles.SEGMENTS,
					this.config.paddles.SEGMENTS,
				),
				new THREE.MeshBasicMaterial(
					this.config.paddles.MATERIALS.paddle1
				)
			),

			paddle2: new THREE.Mesh(
				new THREE.BoxGeometry(
					this.config.paddles.WIDTH, 
					this.config.paddles.HEIGHT, 
					this.config.paddles.DEPTH,
					this.config.paddles.SEGMENTS,
					this.config.paddles.SEGMENTS,
					this.config.paddles.SEGMENTS,
				),
				new THREE.MeshBasicMaterial(
					this.config.paddles.MATERIALS.paddle2
				)
			)
		};

		return objects;
	}

	setupGameScene(objects) {
		this.scene.add(objects.plane);
		this.scene.add(objects.table);
		this.scene.add(objects.ball);
		this.scene.add(objects.paddle1);
		this.scene.add(objects.paddle2);
		
		objects.plane.receiveShadow = true;
		
		objects.table.position.z = -51;
		objects.table.receiveShadow = true;	

		objects.ball.position.set(0, 0, this.config.ball.RADIUS);
		objects.ball.receiveShadow = true;
		objects.ball.castShadow = true;

		objects.paddle1.position.set((this.fieldWidth * -0.95) / 2 + 50, 0, 0);
		objects.paddle1.receiveShadow = true;
		objects.paddle1.castShadow = true;

		objects.paddle2.position.set((this.fieldWidth * 0.95)/ 2 - 50, 0, 0);
		objects.paddle2.receiveShadow = true;
		objects.paddle2.castShadow = true;

		objects.paddle1.position.z = this.config.paddles.DEPTH;
		objects.paddle2.position.z = this.config.paddles.DEPTH;


		objects.maxScore = this.config.gameSettings.maxScore;
		objects.score1 = this.config.gameSettings.score1;
		objects.score2 = this.config.gameSettings.score2;
	}
	
}

export default PongEngineInitializer;