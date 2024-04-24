const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
	// モード値を production に設定すると最適化された状態で、
	// development に設定するとソースマップ有効でJSファイルが出力される
	mode: 'development',

	// メインとなるJavaScriptファイル（エントリーポイント）
	entry: './src/index.js',

	output: {
		//  出力ファイルのディレクトリ名
		path: `${__dirname}/public`,
		filename: 'bundle.js',
	},
	module: {
	  rules: [
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
	resolve: {
		// 拡張子を配列で指定
		extensions: [
			'.ts', '.js',
		],
		// import 文で 解決するため
		alias: {
			'three': path.resolve(__dirname, 'node_modules/three')
		}
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
			directory: path.join(__dirname, 'public'),
			watch: true,
		},
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		hot: true,
		liveReload: false,
		host: '0.0.0.0',
		port: 8081,
		historyApiFallback: true,
	},
};