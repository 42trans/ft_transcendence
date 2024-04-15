
/**
 * ブラウザのフレーム更新タイミングに合わせて自身を再帰的に呼び出し、連続したアニメーションフレームを生成
 * 次の画面描画タイミングで呼び出される。ループは非同期, ブロッキングしない
 * @description
 * - requestAnimationFrame(animate): ブラウザに animate 関数を次の描画フレームで実行するように要求
 *   - 非同期関数であり、実行がスケジュールされた後、即座に制御が戻る。ブロックされず次の行に進む。
 *   - animate(): 状態の更新 (`this.update()`) とシーンの描画 (`this.render()`) を行った後、自身を再帰的にスケジュールする。キューに格納
 * - update(): アニメーションミキサーの進行、カメラコントロールの更新（例えば、ユーザーのインタラクションに応じた視点変更）など
 * - render(): シーンとカメラの現在の状態をもとに画面を描画。rendererは全scene共通(インスタンスは一つだけ)
 */
class RenderLoop {
	constructor(pong) {
		this.pong = pong;
		
	}

	start() {
		const animate = () => {
			requestAnimationFrame(animate);
			this.pong.update();
			this.pong.render();
		};
		animate();
	}
}

export default RenderLoop;
