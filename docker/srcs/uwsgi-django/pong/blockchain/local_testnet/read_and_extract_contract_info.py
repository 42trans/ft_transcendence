# docker/srcs/uwsgi-django/pong/view_modules/testnet/read_and_extract_contract_info.py
import json
import os

def read_and_extract_contract_info(contract_info_path:str):
	"""
	コントラクトに関するEVMベースのテストネットワーク設定を読み込む関数

	環境変数とローカルファイルシステム上のJSONファイルからEthereumテストネットワークの設定を読み込み、
	テストネットのURL、スマートコントラクトのアドレス、およびABIを抽出して返します。

	ABI(Application Binary Interface)は、スマートコントラクトとのインタラクションに必要なメソッド定義やデータ構造を定義したものです。C++の「クラス」の定義に類似

	:JSONファイルについて:
		- `contractInfo-NETWORK_NAME.json`: デプロイ時に取得するアドレスを自動で保存するファイル
			- docker/srcs/hardhat/hardhat_pj/share/contractInfo-NETWORK_NAME.json (Hardhat, Django共有volume)
				- 'NETWORK_NAME=hardhat npx hardhat run scripts/deploy.ts'の実行（デプロイ）により、環境変数を付加して自動生成
			- スマートコントラクトのアドレスが含まれる
		- `contract_abi.json`: deploy時に自動生成される、docker/srcs/hardhat/hardhat_pj/artifacts/内の.jsonから手動で抽出・保存したファイル
			- docker/srcs/uwsgi-django/pong/view_modules/testnet/contract_abi.json
			- スマートコントラクトのインターフェースを定義
		
	:Environment Variables:
		- EVM_TEST_NETWORK_URL (str): テストネットワークのURL。
	
	:Returns:
		tuple: (test_network_url, contract_address, contract_abi)の形式のタプル。
			- contract_address (str): スマートコントラクトのアドレス。
			- contract_abi (list): スマートコントラクトのABI。

	.. Note::
		- Hardhat ローカルネットワークのデフォルトURLは 'http://hardhat:8545' です。
		- デプロイメントやネットワーク接続の問題をデバッグする際は、`make Re-setup` コマンドを使用して環境を再設定することが役立ちます。
			これにより、スマートコントラクトが正しくデプロイされ、ネットワークが同期されていることを確認できます。

	:Example Environment Setup:
		- docker/srcs/.envファイルに記述してください
			- EVM_TEST_NETWORK_URL="http://localhost:8545"
			- GANACHE_PRIVATE_KEY="0xce***pre-cure"
	"""
	# 設定情報ファイルのパスを作成
	current_dir = os.path.dirname(os.path.abspath(__file__))
	contract_info_abs_path = os.path.join(current_dir, contract_info_path)
	abi_path = os.path.join(current_dir, '../contract_abi.json')

	# ファイルを開いて読み取る
	with open(contract_info_abs_path, 'r') as file:
		contract_info = json.load(file)
	with open(abi_path, 'r') as file:
		contract_abi = json.load(file)

	# 第二引数はデフォルト値
	contract_address = contract_info.get('address', '') 

	# debug
	# print(f"debug contract_address: {contract_address}")
	# print(f"debug test_net_url: {test_net_url}")

	# network_url = os.getenv(test_net_url, 'EVM_TEST_NETWORK_URL')

	return contract_address, contract_abi
