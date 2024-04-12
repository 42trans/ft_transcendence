// THREE.jsライブラリをインポート。C++での#includeと似ている。
import * as THREE from 'three';
// GLTFフォーマットの3Dモデルをロードするための特定のローダーをインポート。
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SceneConfig from '../SceneConfig';
import AnimationManager from './AnimationManager'

/**
 * ModelsLoader クラス:
 * 役割・機能: 3Dモデルをロードし、設定されたアニメーションとともにシーンに追加する
 */
class ModelsLoader {
	private loader: GLTFLoader;
	private textureLoader: THREE.TextureLoader;
	
	/**
     * コンストラクター:
	 * クラスのインスタンス化時に初期設定を行う。
     * @param scene THREE.Scene オブジェクト - 3Dオブジェクトが表示される空間
     * @param sceneConfig 設定情報を含むオブジェクト
     * @param animMgr アニメーションを管理するオブジェクト
     */
	constructor (
		private scene: THREE.Scene,
		private sceneConfig: SceneConfig,
		private animMgr: AnimationManager
	) {
		this.scene = scene;
		this.sceneConfig = sceneConfig;
		this.animMgr = animMgr;	
		this.loader = new GLTFLoader();
		this.textureLoader = new THREE.TextureLoader();
	}

	/**
	 * 各モデルのロードを行い、対応するアニメーションを設定する。
	 * forEach(): range-based for loop. コレクションの各要素に対して操作を行います。
	 */
	loadModels(): void{
		this.sceneConfig.modelsConfig.forEach(modelConfig => {
			const animConfig = this.sceneConfig.animationsConfig.find(a => a.model === modelConfig.name);
			const defaultAnimation = animConfig ? modelConfig.defaultAnimation : undefined;
			const autoplay = animConfig ? animConfig.autoplay : false;

			this.loadModel(
				modelConfig.path, 
				defaultAnimation, 
				autoplay,
				modelConfig.initialPosition,
				modelConfig.initialScale,
			)
		})
	}

	/**
	 * モデルのロードを行い、対応するアニメーションをミキサーに設定する。
	 * GLTFフォーマットのモデルを非同期でロードし、コールバック関数を通じて後続の処理を行う。
	 * C++のブロッキングI/Oと異なり、JavaScriptではI/O操作が完了するまでプログラムの実行がブロックされない。
	 * 
	 * @param modelPath configファイルに記載されたパス
	 * @param defaultAnimation configファイルに記載されたモデルのAnimation 
	 * @param autoplay 自動実行の有無
	 * @param initialPosition 初期位置
	 * @param initialScale 初期サイズ
	 */
	loadModel(
		modelPath: string, 
		defaultAnimation: string | undefined,
		autoplay: boolean,
		initialPosition: THREE.Vector3,
		initialScale: THREE.Vector3
	): void {		
		/**
		 * モデルを非同期でロード。
		 * @description コールバック関数(gltf): GLTFモデルが正常にロードされた後に実行。
		 */
		this.loader.load(modelPath, (gltf) => {
			// ロードされたGLTFファイルからGLTF.sceneを取得
			const model = gltf.scene;
			this.setupModel(model, initialPosition, initialScale);
			this.setupTextures(model);
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
	 */
	private setupModel(
		model: THREE.Group, 
		initialPosition: THREE.Vector3, 
		initialScale: THREE.Vector3
	){
		this.scene.add(model);
		model.position.copy(initialPosition);
		model.scale.copy(initialScale);
	}

	/**
	 * マテリアルとテクスチャ(色情報)の設定:
	 * モデルの全ての子オブジェクトを走査。適切なテクスチャをマテリアルに適用
	 * @param model ロードされたGLTFファイルから取得したシーン
	 */
	private setupTextures(
		model: THREE.Group,
	):void {
		model.traverse((child) => {
			// オブジェクトがMesh（3Dオブジェクト）であるかをチェック。
			if ((child as THREE.Mesh).isMesh) {
				const mesh = child as THREE.Mesh;
				const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
				// テクスチャをマテリアルに適用。
				materials.forEach((material: THREE.Material) => {
					if (material instanceof THREE.MeshStandardMaterial) {
						material.map = this.textureLoader.load('assets/vespa_mandarinia/textures/material_baseColor.png');
						material.normalMap = this.textureLoader.load('assets/vespa_mandarinia/textures/material_clearcoat_normal.png');
						material.roughnessMap = this.textureLoader.load('assets/vespa_mandarinia/textures/material_metallicRoughness.png');
						material.metalnessMap = this.textureLoader.load('assets/vespa_mandarinia/textures/material_metallicRoughness.png');
					}
				});
			}
		});
	}

	/**
	 * configで指定されたデフォルトアニメーションを探し、指定がない場合は、最初（配列の0番目）のアニメーションを指定
	 * 
	 * @description
	 * - THREE.AnimationMixer: 
	 *   - 個別の3Dオブジェクトのアニメーションを制御。
	 *   - アニメーションクリップ（THREE.AnimationClip）を実行、停止するための方法を提供
	 * 
	 * TODO_ft: 読み込み失敗、設定の有無などのエラーハンドリング
	 */
	private setupAnimation(
		model: THREE.Group, 
		gltf: any, 
		defaultAnimation: string | undefined
	): void {
		const mixer = new THREE.AnimationMixer(model);
		if (gltf.animations.length > 0) {			
			const animationToPlay = gltf.animations.find((anim: THREE.AnimationClip) => anim.name === defaultAnimation) || gltf.animations[0];
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
