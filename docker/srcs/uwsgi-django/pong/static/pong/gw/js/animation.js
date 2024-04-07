document.addEventListener('DOMContentLoaded', () => {
	const spans = document.querySelectorAll('.title span');
	spans.forEach((span, index) => {
	// アニメーションを遅延させる
	setTimeout(() => {
		span.classList.add('-visible');
	// ここで設定する時間によって各文字の表示タイミングが変わります
	}, 20 * (index + 1)); 
	});
});
