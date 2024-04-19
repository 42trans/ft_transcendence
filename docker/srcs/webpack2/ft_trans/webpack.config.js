const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
	// モード値を production に設定すると最適化された状態で、
	// development に設定するとソースマップ有効でJSファイルが出力される
	mode: 'development',

	// メインとなるJavaScriptファイル（エントリーポイント）
	// entry: './src/main.js',
	entry: './src/index.js',

	output: {
		//  出力ファイルのディレクトリ名
		path: `${__dirname}/public`,
		filename: 'bundle.js',
	},
	module: {
	  rules: [
		// {
		//   // 拡張子 .ts の場合
		//   test: /\.ts$/,
		//   // TypeScript をコンパイルする
		//   use: 'ts-loader',
		// },
		{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
			  loader: 'babel-loader',
			  options: {
				presets: ['@babel/preset-env'],
			  },
			},
		  },
		
		{
			test: /\.(png|svg|jpg|jpeg|gif)$/i,
			type: 'asset/resource',
		},
		{
			test: /\.css$/,
			use: [
				'style-loader', // CSSをDOMに注入する
				'css-loader'   // CSSをCommonJSに変換する
			]
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
	plugins: [
		new HtmlWebpackPlugin({
		  template: './src/index.html', // 入力となるHTMLファイルのパス
		  filename: 'index.html', // 出力されるHTMLファイルの名前
		}),
		new CopyWebpackPlugin({
			patterns: [
			  { from: 'src/assets', to: 'assets' }, // src/assetsディレクトリ内のファイルを出力ディレクトリのassetsにコピー
			  { from: 'node_modules/three/examples/fonts', to: 'fonts' }
			],
		}),
	],
	// ローカル開発用環境を立ち上げる
	devServer: {
		static: {
			directory: path.join(__dirname, 'public'), // この行を修正
			watch: true,
			// directory: `${__dirname}/src`,
			// watch: {
			// 	// ポーリング設定
			// 	poll: 1000, // 1秒ごとにポーリング
			// },
		},
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		// client: {
		// 	webSocketURL: {
		// 		// DockerホストのIPアドレスまたはドメインを使用
		// 		hostname: 'host.docker.internal',
		// 		port: 8180,
		// 		// HTTPSを使用している場合は`wss`を指定
		// 		protocol: 'ws',
		// 	},
		// },
		hot: true,
		host: '0.0.0.0',
		port: 8081,
		historyApiFallback: true,
	},
};