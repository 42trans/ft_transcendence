import * as THREE from 'three';
import { lightsConfig } from '../config';
import { HemisphereLightConfig, SpotLightConfig } from './type';

export function setupLights(scene: THREE.Scene) {
	lightsConfig.forEach((config) => {
		let light: THREE.Light | null = null;

		switch (config.type) {
			case 'AmbientLight':
				light = new THREE.AmbientLight(config.color, config.intensity);
				break;
			case 'DirectionalLight':
				light = new THREE.DirectionalLight(config.color, config.intensity);
				if (config.position) light.position.set(config.position.x, config.position.y, config.position.z);
				break;
			case 'HemisphereLight':
				const hemiConfig = config as HemisphereLightConfig;
				light = new THREE.HemisphereLight(hemiConfig.skyColor, hemiConfig.groundColor, hemiConfig.intensity);
				if (hemiConfig.position) light.position.set(hemiConfig.position.x, hemiConfig.position.y, hemiConfig.position.z);
				break;
			case 'PointLight':
				light = new THREE.PointLight(config.color, config.intensity, config.distance, config.decay);
				if (config.position) light.position.set(config.position.x, config.position.y, config.position.z);
				break;
			case 'SpotLight':
				const spotConfig = config as SpotLightConfig;
				light = new THREE.SpotLight(spotConfig.color, spotConfig.intensity, spotConfig.distance, spotConfig.angle, spotConfig.penumbra, spotConfig.decay);
				if (spotConfig.position) light.position.set(spotConfig.position.x, spotConfig.position.y, spotConfig.position.z);
				break;
		}

		if (light) {
			light.name = config.name;
			scene.add(light);
		}
	});
}
