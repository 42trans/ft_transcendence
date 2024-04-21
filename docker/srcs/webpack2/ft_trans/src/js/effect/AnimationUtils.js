class AnimationUtils {
	/**
	 * イージング関数 (easeInOutQuad)
	 * アニメーションを滑らか（非線形）にする。
	 * @param {number} t - 時間
	 * @returns {number} - 変化後の値
	 */
	static easeInOutQuad(t) {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}
}

export default AnimationUtils;
