import * as THREE from 'three';

const DEBUG_FLOW = 0;
const DEBUG_DETAIL = 0;

/**
 * AnimationMixersManager:
 * - シングルトン
 *   - コンストラクタが呼び出されたときに既にインスタンスが存在するかどうかをチェック
 *   - インスタンスが存在する場合は新しいインスタンスを作成せずに既存のインスタンスを返す
 *   - getInstance 静的メソッド: インスタンスを取得するための唯一の手段として提供
 * - THREE.Clockはグローバルで一つだけ持つ
 */
class AnimationMixersManager 
{
	static instance = null;
	constructor() 
	{
		if (!AnimationMixersManager.instance) 
		{
			this.clock = new THREE.Clock();
			AnimationMixersManager.instance = this;
			this.mixersMap = new Map();
		}
		return AnimationMixersManager.instance;
	}

	static getInstance() 
	{
		if (!AnimationMixersManager.instance) {
			AnimationMixersManager.instance = new AnimationMixersManager();
		}
		return AnimationMixersManager.instance;
	}

	addMixer(object, mixer) 
	{
		try {
			this.mixersMap.set(object.uuid, mixer);
		} catch (error) {
			console.error('hth: addMixer() failed', error);
			// 他の部分の処理には影響を与えないので伝播させない errorログの出力のみ errorログの出力のみ
		}
	}

	dispose() 
	{
		try {
			// 各ミキサーを停止し、キャッシュをクリア
			this.mixersMap.forEach((mixer) => {
				mixer.stopAllAction();
				// ループ参照を解除
				// アニメーションが適用されるオブジェクトツリーの最上位にあるオブジェクトに関連するすべてのアニメーションデータをキャッシュから削除
				mixer.uncacheRoot(mixer.getRoot()); 
			});
			this.mixersMap.clear(); 
			this.clock = null; 
		} catch (error) {
			console.error('hth: dispose() failed', error);
			// 他の部分の処理には影響を与えないので伝播させない errorログの出力のみ
		}
	}
	
	removeMixer(object) 
	{
		try 
		{
			if (!object || !object.uuid) 
			{
				console.error("Invalid object or missing UUID.");
				return;
			}
		
			if (this.mixersMap.has(object.uuid)) {
				this.mixersMap.delete(object.uuid);
			} else {
							if (DEBUG_DETAIL){	console.log(`Mixer not found for UUID: ${object.uuid}`);	}
			}
		} catch (error) {
			console.error('hth: removeMixer() failed', error);
			// 他の部分の処理には影響を与えないので伝播させない errorログの出力のみ
		}
	}

	update() 
	{
		try 
		{
			if (!this.clock){
				this.clock = new THREE.Clock();
			}
			const delta = this.clock.getDelta();
			this.mixersMap.forEach((mixer, uuid) => 
			{
				if (mixer && typeof mixer.update === 'function') 
				{
					try {
						mixer.update(delta);
					} catch (error) {
						// ミキサーの更新に失敗した場合
						console.error(`Error updating mixer for UUID: ${uuid}:`, error);
						// 不正なミキサーをマップから削除
						this.mixersMap.delete(uuid);
						// 他のミキサーの更新処理を継続
					}
				} else {
					console.error(`Invalid mixer for UUID: ${uuid}`);
					this.mixersMap.delete(uuid);
				}
			});
		} catch (error) {
			console.error('hth: update() failed', error);
			// 他の部分の処理には影響を与えないので伝播させない errorログの出力のみ
		}
		
	}

}

export default AnimationMixersManager;