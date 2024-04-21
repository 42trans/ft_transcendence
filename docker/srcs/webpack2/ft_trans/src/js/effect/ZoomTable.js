import * as THREE from "three";
import AnimationUtils from "./AnimationUtils";

class ZoomTable 
{
	constructor(pongEngine, camera, controls) 
	{
		this.pongEngine = pongEngine;
		this.camera = camera;
		this.controls = controls;
	}

	/**
	 * テーブルのズームアニメーションを実行する
	 * 
	 * @param {*} zoomInDistance ズームイン後の距離
	 * @param {*} zoomOutDistance ズームアウト後の距離
	 * @param {*} duration アニメーション時間
	 * @param {*} pauseDuration 一時停止時間
	 * 
	 * 参考:【OrbitControls – three.js docs】 <https://threejs.org/docs/#examples/en/controls/OrbitControls>
	 */
	async zoomToTable(zoomInDistance, zoomOutDistance, duration, pauseDuration) 
	{
		const targetPosition = new THREE.Vector3();
		const startDistance = this.camera.position.distanceTo(targetPosition);
		// テーブルTOPへの距離
		this.pongEngine.data.objects.plane.getWorldPosition(targetPosition);
		this.controls.target.copy(targetPosition);
	
	
		await this.animateZoom(targetPosition, startDistance, zoomInDistance, duration);
		await new Promise(resolve => setTimeout(resolve, pauseDuration));
		await this.animateZoom(targetPosition, zoomInDistance, zoomOutDistance, duration);
	}
	
	async animateZoom(targetPosition, startDistance, endDistance, duration) 
	{
		const startTime = performance.now();
	
		while (true) {
			const now = performance.now();
			const elapsedTime = now - startTime;
			const fraction = elapsedTime / duration;

			if (fraction > 1) break;

			const easedFraction = AnimationUtils.easeInOutQuad(fraction);
			const currentDistance = THREE.MathUtils.lerp(startDistance, endDistance, easedFraction);
			const direction = new THREE.Vector3().subVectors(this.camera.position, targetPosition).normalize();
			this.camera.position.copy(targetPosition).add(direction.multiplyScalar(currentDistance));

			this.controls.update();
			await new Promise(resolve => requestAnimationFrame(resolve));
		}
	
		this.controls.target.copy(targetPosition);
		this.controls.update();
	}
	
}

export default ZoomTable;
