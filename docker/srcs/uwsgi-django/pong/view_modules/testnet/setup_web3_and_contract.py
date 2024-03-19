# docker/srcs/uwsgi-django/pong/view_modules/testnet/setup_web3_and_contract.py
from web3 import Web3
# ------------------------------------------------------
# Web3インスタンスを初期化する
# ------------------------------------------------------
# リアルタイム性が必要ならwebsocketを使用する
# w3 = Web3(Web3.WebsocketProvider(GANACHE_NETWORK_URL))
def initialize_web3_instance(network_url):
	w3 = Web3(Web3.HTTPProvider(network_url))
	return w3
# ------------------------------------------------------
# デフォルトアカウントを設定する
# ------------------------------------------------------
def configure_default_account(w3):
	if len(w3.eth.accounts) > 0:
		w3.eth.defaultAccount = w3.eth.accounts[0]
# ------------------------------------------------------
# スマートコントラクトのインスタンスをロードする
# ------------------------------------------------------
def create_contract_instance(w3, contract_address, contract_abi):
	return w3.eth.contract(address=contract_address, abi=contract_abi)
# ------------------------------------------------------
# 上記のサブ関数を呼び出す
# ------------------------------------------------------
def setup_web3_and_contract(network_url, contract_address, contract_abi):
	# Web3インスタンスの初期化
	w3 = initialize_web3_instance(network_url)
	# デフォルトアカウントの設定
	configure_default_account(w3)
	# スマートコントラクトのインスタンス作成
	contract = create_contract_instance(w3, contract_address, contract_abi)
	return w3, contract