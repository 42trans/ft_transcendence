// docker/srcs/webpack2/ft_trans/src/ts/GLTFModelsLoader.ts

import * as THREE from 'three';
// GLTFフォーマットの3Dモデルをロードするための特定のローダーをインポート。
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * GLTFModelsLoader クラス:
 * 役割・機能: 3Dモデルをロードし、設定されたアニメーションとともにシーンに追加する
 */
class GLTFModelsLoader {
	/**
	 * コンストラクタの引数にアクセス修飾子（private, public, protected）を直接付けることにより、プロパティの宣言と代入を一行で行う
	 * @param scene THREE.Scene オブジェクト - 3Dオブジェクトが表示される空間
	 * @param sceneConfig 設定情報を含むオブジェクト
	*/
	constructor (
		scene,
		sceneConfig,
		AnimationMixersManager
	) { 
		this.scene = scene;
		this.sceneConfig = sceneConfig,
		this.AnimationMixersManager = AnimationMixersManager;
		this.loader = new GLTFLoader();
		this.textureLoader = new THREE.TextureLoader();
		this.modelCache = new Map(); 
	}

	/**
	 * 各モデルのロードを行い、対応するアニメーションを設定する。
	 * forEach(): range-based for loop. コレクションの各要素に対して操作
	 */
	loadModels(){
		if (!this.sceneConfig || !this.sceneConfig.modelsConfig) {
			return;
		}
		this.sceneConfig.modelsConfig.forEach(modelsConfig => {
			let defaultAnimation;
			let autoplay = false;

			// animationsConfigで設定した中からnameに一致するmodelのアニメーションをfindで探す
			const animConfig = this.sceneConfig.animationsConfig.find(tempAnimConf => 
				tempAnimConf.model === modelsConfig.name
			);

			// findで見つからない場合、未定義を設定して後続の処理に伝えて、0番目のアニメーションを設定
			if (animConfig) {
				defaultAnimation = modelsConfig.defaultAnimation;
				autoplay = animConfig.autoplay;
			} else {
				defaultAnimation = undefined;
			}

			this.loadModel(
				modelsConfig,
				defaultAnimation, 
			)
		})
	}

	/**
	 * Private method
	 * モデルのロードを行い、対応するアニメーションをミキサーに設定する。
	 * GLTFフォーマットのモデルを非同期でロードし、コールバック関数を通じて後続の処理を行う。
	 * C++のブロッキングI/Oと異なり、JavaScriptではI/O操作が完了するまでプログラムの実行がブロックされない。
	 * 
	 * @param {Object} modelsConfig - モデル設定
	 * @param modelsConfig.path configファイルに記載されたパス
	 * @param modelsConfig.initialPosition 初期位置
	 * @param modelsConfig.initialScale 初期サイズ
	 * @param modelsConfig.initialRotation 向き
	 * @param {string | undefined} defaultAnimation - モデルのデフォルトアニメーション
	 */
	loadModel(
		modelsConfig,
		defaultAnimation,
	) {
		// キャッシュからモデルを取得する試み
		const cachedModel = this.modelCache.get(modelsConfig.path);
		if (cachedModel) {
			const modelClone = cachedModel.clone(); // モデルのクローンを作成
			this.setupModel(modelClone, modelsConfig.initialPosition, modelsConfig.initialScale, modelsConfig.initialRotation);
			this.scene.add(modelClone); // クローンをシーンに追加
			return;
		}

		// モデルがキャッシュになければロード
		/**
		 * GLTFモデルを非同期でロード。
		 * @description コールバック関数(gltf): GLTFモデルが正常にロードされた後に実行。
		 */
		this.loader.load(modelsConfig.path, (gltf) => {

			// ロードされたGLTFファイルからGLTF.sceneを取得
			const model = gltf.scene;
			this.modelCache.set(modelsConfig.path, model);
			// 3Dモデルを配置
			this.setupModel(
				model, 
				modelsConfig.initialPosition, 
				modelsConfig.initialScale, 
				modelsConfig.initialRotation
			);
			// モデルにテクスチャを設定
			if (modelsConfig.textures) {
				this.setupTextures(model, modelsConfig.textures);
			}
			// モデルにアニメーションを設定
			this.setupAnimation(model, gltf, defaultAnimation);
		}, undefined, function (error) {
			console.error(error);
		});
	}

	/**
	 * Private method
	 * オブジェクトの配置: 
	 * モデルを現在のシーンの指定の位置に指定のサイズで追加する
	 * @param {THREE.Group} model ロードされたGLTFファイルから取得したシーン
	 * @param {THREE.Vector3} initialPosition Configで設定された位置
	 * @param {THREE.Vector3} initialScale Configで設定されたスケール
	 * @param {THREE.Euler} [initialRotation = (0, 0, 0)] モデルの向き。省略可。
	 */
	setupModel(
		model,
		initialPosition,
		initialScale,
		initialRotation = (0, 0, 0)
	){
		this.scene.add(model);
		model.position.copy(initialPosition);
		model.scale.copy(initialScale);
		if (initialRotation) {
			model.rotation.copy(initialRotation);
		}
	}

	/**
	 * Private method
	 * マテリアルとテクスチャ(色情報)の設定:
	 * モデルの全ての子オブジェクトを走査。適切なテクスチャをマテリアルに適用
	 * @param {THREE.Group} model ロードされたGLTFファイルから取得したシーン
	 * @param {TexturePaths} textureConfig モデルの色情報。modelConfigで設定
	 */
	setupTextures(
		model,
		textureConfig
	) {
		model.traverse((child) => {

			// オブジェクトがMesh（3Dオブジェクト）であるかをチェック。
			/** @type {THREE.Mesh} */
			if (!child.isMesh) {
				return;
			}
			// TypeScriptにこのオブジェクトがTHREE.Meshであることを保証
			const mesh = child;
			
			// materials を設定
			/** @type {THREE.Material[]} */
			let materials;
			if (Array.isArray(mesh.material)) {
				materials = mesh.material;
			} else {
				materials = [mesh.material];
			}

			// テクスチャをマテリアルに適用。
			materials.forEach((material) => {

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
	 * Private method
	 * configで指定されたデフォルトアニメーションを探し、指定がない場合は、最初（配列の0番目）のアニメーションを指定
	 * @param {THREE.Group} model 
	 * @param {any} gltf 
	 * @param {string | undefined} defaultAnimation
	 * @description
	 * - THREE.AnimationMixer: 
	 *   - 個別の3Dオブジェクトのアニメーションを制御。
	 *   - アニメーションクリップ（THREE.AnimationClip）を実行、停止するための方法を提供
	 */
	setupAnimation(
		model, 
		gltf, 
		defaultAnimation
	) {
		if (!gltf.animations || gltf.animations.length === 0) {
			return;
		}
		const mixer = new THREE.AnimationMixer(model);
		if (gltf.animations.length > 0) {
			let animationToPlay;
			/**
			 * GLTFのアニメーション配列から、指定されたデフォルトアニメーションを検索
			 * defaultAnimation が指定されていない場合や見つからない場合は、配列の最初のアニメーションを選択
			 * @param {THREE.AnimationClip} anim 
			 */
			const foundAnimation = gltf.animations.find((anim) => {
				return anim.name === defaultAnimation;
			});
			if (foundAnimation) {
				// 検索結果が存在する（foundAnimationがundefinedではない）場合
				animationToPlay = foundAnimation;
			} else {
				// 指定されたデフォルトアニメーションが見つからなかった場合、配列の最初のアニメーションを使用
				animationToPlay = gltf.animations[0];
			}

			if (animationToPlay) {
				const action = mixer.clipAction(animationToPlay);
				action.play();
				if (this.AnimationMixersManager) {
					this.AnimationMixersManager.addMixer(mixer);
					console.log("Mixerに追加");
				} 
			} 
		} else {
			console.warn('No animations found in the model' + model.name);
		}
	}

}

export default GLTFModelsLoader;
