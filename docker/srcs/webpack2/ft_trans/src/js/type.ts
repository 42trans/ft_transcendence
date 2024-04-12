// docker/srcs/webpack2/ft_trans/src/js/type.ts
import * as THREE from 'three';

export interface AmbientLightConfig {
	type: 'AmbientLight';
	color: number;
	intensity: number;
	name: string;
}

export interface DirectionalLightConfig {
	type: 'DirectionalLight';
	color: number;
	intensity: number;
	position: THREE.Vector3;
	name: string;
}

export interface HemisphereLightConfig {
	type: 'HemisphereLight';
	skyColor: number;
	groundColor: number;
	intensity: number;
	position: THREE.Vector3;
	name: string;
}

export interface PointLightConfig {
	type: 'PointLight';
	color: number;
	intensity: number;
	distance: number;
	decay: number;
	position: THREE.Vector3;
	name: string;
}

export interface SpotLightConfig {
	type: 'SpotLight';
	color: number;
	intensity: number;
	distance: number;
	angle: number;
	penumbra: number;
	decay: number;
	position: THREE.Vector3;
	name: string;
}

export type LightConfig = AmbientLightConfig | DirectionalLightConfig | HemisphereLightConfig | PointLightConfig | SpotLightConfig;

export interface TexturePaths {
	baseColor?: string;
	normalMap?: string;
	roughnessMap?: string;
	metalnessMap?: string;
	specularMap?: string;
}

export interface ModelConfig {
	path: string;
	initialPosition: THREE.Vector3;
	initialScale: THREE.Vector3;
	initialRotation?: THREE.Euler; //向き
	name: string;
	defaultAnimation?: string;
	textures?: TexturePaths;
}

export interface AnimationClipConfig {
	name: string;
	loop: THREE.AnimationActionLoopStyles;
}

export interface AnimationConfig {
	model: string;
	autoplay: boolean;
}