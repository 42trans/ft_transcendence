// THREE.jsライブラリをインポート。C++での#includeと似ている。
import * as THREE from 'three';
// GLTFフォーマットの3Dモデルをロードするための特定のローダーをインポート。
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SceneConfig from '../SceneConfig';
import AnimationManager from './AnimationManager'

/**loader.loadメソッドの構造
export class GLTFLoader extends Loader {
	constructor(manager?: LoadingManager);
	dracoLoader: DRACOLoader | null;

	load(
		url: string,
		onLoad: (gltf: GLTF) => void,
		onProgress?: (event: ProgressEvent) => void,
		onError?: (event: ErrorEvent) => void,
	): void;
 */

// モデルをロードし、「いつか完了する」操作の完了時にコールバックを実行する関数を定義。
// 第2引数: GLTFLoader.loadメソッドの成功時コールバックからonComplete(model, mixer);の形で呼び出されるときに、modelとmixerの引数を受け取り、内部の処理が実行され
export function loadModels(
	scene: THREE.Scene,
	sceneConfig: SceneConfig,
	animMgr: AnimationManager
) {
	sceneConfig.modelsConfig.forEach(modelConfig => {
		const animConfig = sceneConfig.animationsConfig.find(a => a.model === modelConfig.name);
		const defaultAnimation = animConfig ? modelConfig.defaultAnimation : undefined;
		const autoplay = animConfig ? animConfig.autoplay : false;

		loadModel(
			scene, 
			modelConfig.path, 
			defaultAnimation, 
			autoplay,
			modelConfig.initialPosition,
			modelConfig.initialScale,
			(model, mixer) => {
				animMgr.setMixer(mixer);
				animMgr.startAnimationLoop();
			}
		)
	})
}

// モデルをロードし、「いつか完了する」操作の完了時にコールバックを実行する関数を定義。
// 第2引数: GLTFLoader.loadメソッドの成功時コールバックからonComplete(model, mixer);の形で呼び出されるときに、modelとmixerの引数を受け取り、内部の処理が実行され
export function loadModel(
	scene: THREE.Scene, 
	modelPath: string, 
	defaultAnimation: string | undefined,
	autoplay: boolean,
	initialPosition: THREE.Vector3,
	initialScale: THREE.Vector3,
	onComplete: (model: THREE.Group, mixer: THREE.AnimationMixer) => void) 
{
	// GLTFモデルローダーのインスタンスを作成。
	const loader = new GLTFLoader();
	
	// モデルを非同期でロード。C++ではファイルロードにブロッキングI/Oを使うことが多いが、JavaScriptでは非同期I/Oが一般的。
	// 匿名関数function (gltf): GLTFモデルが正常にロードされた後に実行。コールバック関数。GLTFモデルが正常にロードされた後に実行
	loader.load(modelPath, function (gltf) {
		// ロードされたGLTFファイルからシーンを取得
		const model = gltf.scene;
		// モデルを現在のシーンに追加。
		scene.add(model);
		// // モデルの位置を設定。
		model.position.copy(initialPosition);
		// // モデルのスケールを設定。
		model.scale.copy(initialScale);

		// マテリアルとテクスチャ(色情報)の設定
		// テクスチャローダーのインスタンスを作成。
		const textureLoader = new THREE.TextureLoader();
		// モデルの全ての子オブジェクトを再帰的に走査。
		model.traverse((child) => {
			// オブジェクトがMesh（3Dオブジェクト）であるかをチェック。
			if ((child as THREE.Mesh).isMesh) {
				const mesh = child as THREE.Mesh;
				const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
				// テクスチャをマテリアルに適用。
				materials.forEach((material: THREE.Material) => {
					if (material instanceof THREE.MeshStandardMaterial) {
						material.map = textureLoader.load('assets/vespa_mandarinia/textures/material_baseColor.png');
						material.normalMap = textureLoader.load('assets/vespa_mandarinia/textures/material_clearcoat_normal.png');
						material.roughnessMap = textureLoader.load('assets/vespa_mandarinia/textures/material_metallicRoughness.png');
						material.metalnessMap = textureLoader.load('assets/vespa_mandarinia/textures/material_metallicRoughness.png');
					}
				});
			}
		});

		const mixer = new THREE.AnimationMixer(model);
		let action;
		if (gltf.animations.length > 0) {
			const animation = defaultAnimation ? gltf.animations.find(anim => anim.name === defaultAnimation) : gltf.animations[0];
			
			if (gltf.animations.length > 0) {
				console.log("利用可能なアニメーション: modelsConfig: ModelConfig[]で設定可能:", gltf.animations.map(anim => anim.name));
	
				// デフォルトアニメーションを探すか、利用可能な最初のアニメーションを選ぶ
				const animationToPlay = gltf.animations.find(anim => anim.name === defaultAnimation) || gltf.animations[0];

				// Optionally, play the first animation found
				if (animationToPlay) {
					const action = mixer.clipAction(animationToPlay);
					action.play();
		
					console.log(`Playing animation: ${animationToPlay.name}`);
				} else {
					console.warn(`Default animation '${defaultAnimation}' not found. Playing first animation: ${gltf.animations[0].name}`);
				}
			
			} else {
				console.warn(`Animation '${defaultAnimation}' not found for model '${modelPath}'. No animation will be played.`);
			}
		} else {
			console.warn('No animations found in the model' + modelPath);
		}

		// モデルの読み込みが完了したら、コールバック関数を呼び出し
		// コールバック関数とは: 他の関数に引数として渡される関数。ある操作が完了した後（非同期処理が完了した後）に何かしらの操作を行いたい場合
		onComplete(model, mixer);
	}, undefined, function (error) {
		console.error(error);
	});
}
