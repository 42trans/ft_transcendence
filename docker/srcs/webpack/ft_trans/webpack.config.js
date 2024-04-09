
module.exports = {
	// モード値を production に設定すると最適化された状態で、
	// development に設定するとソースマップ有効でJSファイルが出力される
	mode: 'development',

	// メインとなるJavaScriptファイル（エントリーポイント）
	entry: './src/index.ts',

	output: {
		//  出力ファイルのディレクトリ名
		path: `${__dirname}/public`,
	},
	module: {
	  rules: [
		{
		  // 拡張子 .ts の場合
		  test: /\.ts$/,
		  // TypeScript をコンパイルする
		  use: 'ts-loader',
		},
	  ],
	},
	// import 文で .ts ファイルを解決するため
	// これを定義しないと import 文で拡張子を書く必要が生まれる。
	// フロントエンドの開発では拡張子を省略することが多いので、
	// 記載したほうがトラブルに巻き込まれにくい。
	resolve: {
	// 拡張子を配列で指定
	extensions: [
			'.ts', '.js',
		],
	},
	// ローカル開発用環境を立ち上げる
	devServer: {
		static: {
			directory: `${__dirname}/public`,
			watch: {
				// ポーリング設定
				poll: 1000, // 1秒ごとにポーリング
			},
		},
		hot: true,
		host: '0.0.0.0',
		port: 8080,
		historyApiFallback: true,
	},
};