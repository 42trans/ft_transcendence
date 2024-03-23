# docker/srcs/uwsgi-django/pong/blockchain/local_testnet/setup_web3_and_contract.py
from web3 import Web3

# ======================================================= 
# ファイル内でのみ使用する関数 
# ======================================================= 
def _initialize_web3_instance(network_url):
	"""
	Web3インスタンスを初期化（このファイル内でのみ使用）
	"""
	w3 = Web3(Web3.HTTPProvider(network_url))
	# リアルタイム性が必要ならwebsocketを使用する
	# w3 = Web3(Web3.WebsocketProvider(EVM_TEST_NETWORK_URL))
	return w3
# ------------------------------------------------------
def _configure_default_account(w3):
	"""
	Web3インスタンスに基づいてデフォルトアカウントを設定（このファイル内でのみ使用）
	"""
	if len(w3.eth.accounts) > 0:
		w3.eth.defaultAccount = w3.eth.accounts[0]
# ------------------------------------------------------
def _create_contract_instance(w3, contract_address, contract_abi):
	"""
	スマートコントラクトのインスタンスを生成（このファイル内でのみ使用）
	"""
	return w3.eth.contract(address=contract_address, abi=contract_abi)
# ------------------------------------------------------


# ======================================================= 
# ファイルの外部に公開する関数 
# ======================================================= 
def setup_web3_and_contract(network_url, contract_address, contract_abi):
	"""
	Web3インスタンスを初期化し、デフォルトアカウントを設定した上で、スマートコントラクトのインスタンスを生成
	
	:目的・役割:
		- スマートコントラクトのインスタンスを生成
	:機能・処理内容:
		- Web3インスタンスを初期化し、デフォルトアカウントを設定した上で、スマートコントラクトのインスタンスを生成。
		- ファイル内のサブ関数を呼び出す
	"""
	# Web3インスタンスの初期化
	w3 = _initialize_web3_instance(network_url)
	# デフォルトアカウントの設定
	_configure_default_account(w3)
	# スマートコントラクトのインスタンス作成
	contract = _create_contract_instance(w3, contract_address, contract_abi)
	return w3, contract