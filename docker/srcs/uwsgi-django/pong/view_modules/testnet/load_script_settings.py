# docker/srcs/uwsgi-django/pong/view_modules/testnet/load_script_settings.py
import json
import os
# --------------------------------------
# Hardhat localの場合
# HARDHAT_NETWORK_URL = 'http://hardhat:8545'
# ------------------------------------------------------
# スクリプトの設定をロードする
# ------------------------------------------------------
def load_script_settings():
	current_dir = os.path.dirname(os.path.abspath(__file__))
	contract_info_path = os.path.join(current_dir, '../../../share_hardhat/contractInfo.json')
	abi_path = os.path.join(current_dir, 'contract_abi.json')

	# もしもファイルパスの問題で混乱することがあったら、make Re-setup でなおるかもしれない
	# {"status": "error", "message": "Could not transact with/call contract function, is contract deployed correctly and chain synced?"}

	# debug
	# print("debug")
	# print(os.getcwd())
	# print(current_dir)
	# print(abi_path)

	with open(contract_info_path, 'r') as file:
		contract_info = json.load(file)
	with open(abi_path, 'r') as file:
		contract_abi = json.load(file)

	 # デフォルト値として空文字列を設定
	contract_address = contract_info.get('address', '') 
	ganache_network_url = os.getenv('GANACHE_NETWORK_URL', 'http://ganache:8545')

	return ganache_network_url, contract_address, contract_abi
