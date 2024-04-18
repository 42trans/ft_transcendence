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
					this.fieldWidth * 0.95,
					this.fieldHeight,
					this.config.plane.SEGMENTS,
					this.config.plane.SEGMENTS
				),
				// 参考:【MeshStandardMaterial – three.js docs】 <https://threejs.org/docs/#api/en/materials/MeshStandardMaterial>
				new THREE.MeshStandardMaterial({ 
				// new THREE.MeshBasicMaterial({
					color: this.config.plane.MATERIAL.color,
					roughness: this.config.plane.MATERIAL.roughness,
					metalness: this.config.plane.MATERIAL.metalness,
					transparent: this.config.plane.MATERIAL.transparent,
					opacity: this.config.plane.MATERIAL.opacity,
				})
			),


			table: new THREE.Mesh(
				new THREE.BoxGeometry(
					this.fieldWidth * 1.05, 
					this.fieldHeight * 1.03,
					this.config.table.DEPTH,
					this.config.table.SEGMENTS,
					this.config.table.SEGMENTS,
					this.config.table.SEGMENTS,
				),
				new THREE.MeshBasicMaterial({
				// new THREE.MeshStandardMaterial({ 
					color: this.config.table.MATERIAL.color,
					transparent: this.config.table.MATERIAL.transparent,
					opacity: this.config.table.MATERIAL.opacity,
				})
			),

			ball: new THREE.Mesh(
				// SphereGeometry(radius : Float, widthSegments : Integer, heightSegments : Integer, phiStart : Float, phiLength : Float, thetaStart : Float, thetaLength : Float)
				new THREE.SphereGeometry(
					this.config.ball.RADIUS, 
					this.config.ball.SEGMENTS, 
					// this.config.ball.RINGS
				),
				new THREE.MeshStandardMaterial({ 
					color: this.config.ball.MATERIAL.color,
					roughness: this.config.ball.MATERIAL.roughness,
					metalness: this.config.ball.MATERIAL.metalness,
					transparent: this.config.ball.MATERIAL.transparent,
					opacity: this.config.ball.MATERIAL.opacity,
				 })
			),
	
			paddle1: new THREE.Mesh(
				new THREE.BoxGeometry(
					this.config.paddle1.WIDTH, 
					this.config.paddle1.HEIGHT, 
					this.config.paddle1.DEPTH,
					this.config.paddle1.SEGMENTS,
					this.config.paddle1.SEGMENTS,
					this.config.paddle1.SEGMENTS,
				),
				new THREE.MeshStandardMaterial({
					color: this.config.paddle1.MATERIAL.color,
					roughness: this.config.paddle1.MATERIAL.roughness,
					metalness: this.config.paddle1.MATERIAL.metalness,
					transparent: this.config.paddle1.MATERIAL.transparent,
					opacity: this.config.paddle1.MATERIAL.opacity,
				})
			),

			paddle2: new THREE.Mesh(
				new THREE.BoxGeometry(
					this.config.paddle2.WIDTH, 
					this.config.paddle2.HEIGHT, 
					this.config.paddle2.DEPTH,
					this.config.paddle2.SEGMENTS,
					this.config.paddle2.SEGMENTS,
					this.config.paddle2.SEGMENTS,
				),
				new THREE.MeshStandardMaterial({
					color: this.config.paddle2.MATERIAL.color,
					roughness: this.config.paddle2.MATERIAL.roughness,
					metalness: this.config.paddle2.MATERIAL.metalness,
				})
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
		
		// RECEIVE_SHADOW
		objects.plane.receiveShadow = this.config.plane.RECEIVE_SHADOW;
		objects.table.receiveShadow = this.config.table.RECEIVE_SHADOW;
		objects.ball.receiveShadow = this.config.ball.RECEIVE_SHADOW;
		objects.paddle1.receiveShadow = this.config.paddle1.RECEIVE_SHADOW;
		objects.paddle2.receiveShadow = this.config.paddle2.RECEIVE_SHADOW;
		// CAST_SHADOW
		objects.ball.castShadow = this.config.ball.CAST_SHADOW;
		objects.paddle1.castShadow = this.config.paddle1.CAST_SHADOW;
		objects.paddle2.castShadow = this.config.paddle2.CAST_SHADOW;
		// position
		objects.paddle1.position.set(
			(this.fieldWidth * -0.95) / 2 + 50, 
			0, 
			this.config.paddle1.DEPTH,
		);
		objects.paddle2.position.set(
			(this.fieldWidth * 0.95)/ 2 - 50, 
			0, 
			this.config.paddle2.DEPTH,
		);
		objects.table.position.z = this.config.table.POSITION_Z;
		objects.ball.position.z = this.config.ball.RADIUS;
		
		// othrer: paddle1 
		objects.paddle1.speed = this.config.paddle1.SPEED,
		objects.paddle1.dirY = this.config.paddle1.DirY,
		objects.paddle1.width = this.config.paddle1.WIDTH;
		objects.paddle1.height = this.config.paddle1.HEIGHT;
		// othrer: paddle2 
		objects.paddle2.speed = this.config.paddle2.SPEED,
		objects.paddle2.dirY = this.config.paddle2.DirY,
		objects.paddle2.width = this.config.paddle2.WIDTH;
		objects.paddle2.height = this.config.paddle2.HEIGHT;
		// 
		objects.maxScore = this.config.gameSettings.MAX_SCORE;
		objects.score1 = this.config.gameSettings.SCORE1;
		objects.score2 = this.config.gameSettings.SCORE2;
		objects.difficulty = this.config.gameSettings.DIFFICULTY;
		objects.fieldWidth = this.config.fields.WIDTH;
		objects.fieldHeight = this.config.fields.HEIGHT;
	}
	
}

export default PongEngineInitializer;