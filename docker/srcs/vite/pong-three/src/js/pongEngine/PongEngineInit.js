import * as THREE from 'three';

class PongEngineInit 
{
	constructor(scene, config) 
	{
		this.scene = scene;
		this.config = config;
	}

	/**  トンネル現象に対応するため、パドルの幅に基づいた速度に補正する */
	capMaxSpeedToAvoidTunneling() 
	{
		return Math.min(
			this.config.paddle1.WIDTH * 0.99,
			this.config.paddle2.WIDTH * 0.99,
			this.config.gameSettings.ABSOLUTE_MAX_SPEED
		);
	}
	
	initPongEngine(data) 
	{
		this.initSettings(data);
		data.objects =
		{
			plane: this.createPlane(),
			table: this.createTable(),
			ball: this.createBall(),
			paddle1: this.createPaddle(this.config.paddle1),
			paddle2: this.createPaddle(this.config.paddle2)
		};
		this.setupObjectAttributes(data.objects);
		this.addSceneObjects(data);
	}

	initSettings(data) {
		data.settings = {
			maxScore: this.config.gameSettings.MAX_SCORE,
			initBallSpeed: this.config.gameSettings.INIT_BALL_SPEED,
			maxBallSpeed: this.capMaxSpeedToAvoidTunneling(),
			difficulty: this.config.gameSettings.DIFFICULTY,
			field: {
				width: this.config.fields.WIDTH,
				height: this.config.fields.HEIGHT
			}
		};
	}

	setupObjectAttributes(objects) 
	{
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
			(this.config.fields.WIDTH * -0.95) / 2 + 50, 
			0, 
			this.config.paddle1.DEPTH,
		);
		objects.paddle2.position.set(
			(this.config.fields.WIDTH * 0.95)/ 2 - 50, 
			0, 
			this.config.paddle2.DEPTH,
		);
		objects.table.position.z = this.config.table.POSITION_Z;
		objects.ball.position.z = this.config.ball.RADIUS;
		
		// ball
		objects.ball.speed = this.config.ball.SPEED,
		objects.ball.dirX = this.config.ball.DIRECTION.x,
		objects.ball.dirY = this.config.ball.DIRECTION.y,
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
	}

	addSceneObjects(data) 
	{
		this.objects = data.objects;
		Object.keys(this.objects).forEach(key => {
			this.scene.add(this.objects[key]);
		});
		// this.scene.traverse(obj => {
		// 	if (obj instanceof THREE.Mesh) {
		// 		console.log('Object in scene:', obj.name); // デバッグのためにオブジェクト名を出力
		// 	}
		// });
	}

	// 参考:【MeshStandardMaterial – three.js docs】 <https://threejs.org/docs/#api/en/materials/MeshStandardMaterial>
	createPlane() {
		const geometry = new THREE.PlaneGeometry(
				this.config.fields.WIDTH,
				this.config.fields.HEIGHT,
				this.config.plane.SEGMENTS,
				this.config.plane.SEGMENTS
			);
		const material = new THREE.MeshStandardMaterial(
		{
			color: this.config.plane.MATERIAL.color,
			transparent: this.config.plane.MATERIAL.transparent,
			opacity: this.config.plane.MATERIAL.opacity,
		});
		return new THREE.Mesh(geometry, material);
	}

	createTable() {
		const geometry = new THREE.BoxGeometry(
			this.config.fields.WIDTH * 1.1, 
			this.config.fields.HEIGHT * 1.05,
			this.config.table.DEPTH,
			this.config.table.SEGMENTS,
			this.config.table.SEGMENTS,
			this.config.table.SEGMENTS,
		);
		const material = new THREE.MeshBasicMaterial(
		{
			color: this.config.table.MATERIAL.color,
			transparent: this.config.table.MATERIAL.transparent,
			opacity: this.config.table.MATERIAL.opacity,
		});
		// return new THREE.Mesh(geometry, material);
		const table = new THREE.Mesh(geometry, material);
		table.name = 'table';
		return table;
	}

	createBall() {
		const geometry = new THREE.SphereGeometry(
			this.config.ball.RADIUS, 
			this.config.ball.SEGMENTS, 
		);
		const material = new THREE.MeshStandardMaterial(
		{
			color: this.config.ball.MATERIAL.color,
			roughness: this.config.ball.MATERIAL.roughness,
			metalness: this.config.ball.MATERIAL.metalness,
			transparent: this.config.ball.MATERIAL.transparent,
			opacity: this.config.ball.MATERIAL.opacity,
		});
		return new THREE.Mesh(geometry, material);
	}

	createPaddle(config) {
		const geometry = new THREE.BoxGeometry(
			config.WIDTH, 
			config.HEIGHT, 
			config.DEPTH,
			config.SEGMENTS,
			config.SEGMENTS,
			config.SEGMENTS,
		);
		const material = new THREE.MeshStandardMaterial(
		{ 
			color: config.MATERIAL.color,
			roughness: config.MATERIAL.roughness,
			metalness: config.MATERIAL.metalness,
			transparent: config.MATERIAL.transparent,
			opacity: config.MATERIAL.opacity,
		});
		return new THREE.Mesh(geometry, material);
	}
}

export default PongEngineInit;