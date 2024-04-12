// docker/srcs/webpack2/ft_trans/src/js/ModelsLoader.ts

import * as THREE from 'three';
// GLTFフォーマットの3Dモデルをロードするための特定のローダーをインポート。
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SceneConfig from '../SceneConfig';
import AnimationManager from './AnimationManager'
import { ModelConfig, TexturePaths } from './type';
/**
 * ModelsLoader クラス:
 * 役割・機能: 3Dモデルをロードし、設定されたアニメーションとともにシーンに追加する
 *  */
class ModelsLoader {
	/** 変数 */
	private loader = new GLTFLoader();
	private textureLoader = new THREE.TextureLoader();
	/**
	 * コンストラクター:
	 * コンストラクタの引数にアクセス修飾子（private, public, protected）を直接付けることにより、プロパティの宣言と代入を一行で行う
	 * @param scene THREE.Scene オブジェクト - 3Dオブジェクトが表示される空間
	 * @param sceneConfig 設定情報を含むオブジェクト
	 * @param animMgr アニメーションを管理するオブジェクト
	 */
	constructor (
		private scene: THREE.Scene,
		private sceneConfig: SceneConfig,
		private animMgr: AnimationManager
	) { 
		// 処理無し
	}

	/**
	 * 各モデルのロードを行い、対応するアニメーションを設定する。
	 * forEach(): range-based for loop. コレクションの各要素に対して操作
	 */
	loadModels(): void{
		this.sceneConfig.modelsConfig.forEach(modelConfig => {
			let defaultAnimation;
			let autoplay = false;

			// animationsConfigで設定した中からnameに一致するmodelのアニメーションをfindで探す
			const animConfig = this.sceneConfig.animationsConfig.find(tempAnimConf => 
				tempAnimConf.model === modelConfig.name
			);

			// findで見つからない場合、未定義を設定して後続の処理に伝えて、0番目のアニメーションを設定
			if (animConfig) {
				defaultAnimation = modelConfig.defaultAnimation;
				autoplay = animConfig.autoplay;
			} else {
				defaultAnimation = undefined;
			}

			this.loadModel(
				modelConfig,
				defaultAnimation, 
			)
		})
	}

	/**
	 * モデルのロードを行い、対応するアニメーションをミキサーに設定する。
	 * GLTFフォーマットのモデルを非同期でロードし、コールバック関数を通じて後続の処理を行う。
	 * C++のブロッキングI/Oと異なり、JavaScriptではI/O操作が完了するまでプログラムの実行がブロックされない。
	 * 
	 * @param defaultAnimation configファイルに記載されたモデルのAnimation 
	 * @param modelConfig.path configファイルに記載されたパス
	 * @param modelConfig.initialPosition 初期位置
	 * @param modelConfig.initialScale 初期サイズ
	 * @param modelConfig.initialRotation 向き
	 //  * @param autoplay 自動実行の有無
	*/
	loadModel(
		modelConfig: ModelConfig,
		defaultAnimation: string | undefined,
	): void {		
		/**
		 * GLTFモデルを非同期でロード。
		 * @description コールバック関数(gltf): GLTFモデルが正常にロードされた後に実行。
		 */
		this.loader.load(modelConfig.path, (gltf) => {

			// ロードされたGLTFファイルからGLTF.sceneを取得
			const model = gltf.scene;
			// 3Dモデルを配置
			this.setupModel(
				model, 
				modelConfig.initialPosition, 
				modelConfig.initialScale, 
				modelConfig.initialRotation
			);
			// モデルにテクスチャを設定
			if (modelConfig.textures) {
				this.setupTextures(model, modelConfig.textures);
			}
			// モデルにアニメーションを設定
			this.setupAnimation(model, gltf, defaultAnimation);
		
		}, undefined, function (error) {
			console.error(error);
		});
	}

	/**
	 * オブジェクトの配置: 
	 * モデルを現在のシーンの指定の位置に指定のサイズで追加する
	 * @param model ロードされたGLTFファイルから取得したシーン
	 * @param initialPosition Configで設定された位置
	 * @param initialScale Configで設定されたスケール
	 * @param initialRotation モデルの向き。省略可。
	 */
	private setupModel(
		model: THREE.Group, 
		initialPosition: THREE.Vector3, 
		initialScale: THREE.Vector3,
		initialRotation?: THREE.Euler
	){
		this.scene.add(model);
		model.position.copy(initialPosition);
		model.scale.copy(initialScale);
		if (initialRotation) {
			model.rotation.copy(initialRotation);
		}
	}

	/**
	 * マテリアルとテクスチャ(色情報)の設定:
	 * モデルの全ての子オブジェクトを走査。適切なテクスチャをマテリアルに適用
	 * @param model ロードされたGLTFファイルから取得したシーン
	 * @param textureConfig モデルの色情報。modelConfigで設定
	 */
	private setupTextures(
		model: THREE.Group,
		textureConfig: TexturePaths
	):void {
		model.traverse((child) => {

			// オブジェクトがMesh（3Dオブジェクト）であるかをチェック。
			if (!(child as THREE.Mesh).isMesh) {
				return;
			}
			// TypeScriptにこのオブジェクトがTHREE.Meshであることを保証
			const mesh = child as THREE.Mesh;
			
			// materials を設定
			let materials: THREE.Material[];
			if (Array.isArray(mesh.material)) {
				materials = mesh.material;
			} else {
				materials = [mesh.material];
			}

			// テクスチャをマテリアルに適用。
			materials.forEach((material: THREE.Material) => {

				if (material instanceof THREE.MeshStandardMaterial) {
					if (textureConfig.baseColor) {
						material.map = this.textureLoader.load(textureConfig.baseColor);
					}
					if (textureConfig.normalMap) {
						material.normalMap = this.textureLoader.load(textureConfig.normalMap);
					}
					if (textureConfig.roughnessMap) {
						material.roughnessMap = this.textureLoader.load(textureConfig.roughnessMap);
					}
					if (textureConfig.metalnessMap) {
						material.metalnessMap = this.textureLoader.load(textureConfig.metalnessMap);
					}
					if ('reflectivity' in material && textureConfig.specularMap) {
						material.reflectivity = this.textureLoader.load(textureConfig.specularMap);
						}
				}
			});

		});
	}

	/**
	 * configで指定されたデフォルトアニメーションを探し、指定がない場合は、最初（配列の0番目）のアニメーションを指定
	 * @description
	 * - THREE.AnimationMixer: 
	 *   - 個別の3Dオブジェクトのアニメーションを制御。
	 *   - アニメーションクリップ（THREE.AnimationClip）を実行、停止するための方法を提供
	 */
	private setupAnimation(
		model: THREE.Group, 
		gltf: any, 
		defaultAnimation: string | undefined
	): void {
		const mixer = new THREE.AnimationMixer(model);
		if (gltf.animations.length > 0) {			
			
			// GLTFのアニメーション配列から、指定されたデフォルトアニメーションを検索
			// defaultAnimation が指定されていない場合や見つからない場合は、配列の最初のアニメーションを選択
			const animationToPlay = gltf.animations.find((anim: THREE.AnimationClip) => {
				return anim.name === defaultAnimation;
			})|| gltf.animations[0];

			if (animationToPlay) {
				const action = mixer.clipAction(animationToPlay);
				action.play();
				console.log(`Playing animation: ${animationToPlay.name}`);
				this.animMgr.setMixer(mixer);
			} else {
				console.warn(`Default animation '${defaultAnimation}' not found. Playing first animation: ${gltf.animations[0].name}`);
			}
		} else {
			console.warn('No animations found in the model' + model.name);
		}
	}

}

export default ModelsLoader;
