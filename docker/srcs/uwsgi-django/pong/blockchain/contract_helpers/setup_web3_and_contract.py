# docker/srcs/uwsgi-django/pong/blockchain/local_testnet/setup_web3_and_contract.py
from web3 import Web3
import logging

# ロギング設定
logger = logging.getLogger(__name__)


# ======================================================= 
# ファイル内でのみ使用する関数 
# ======================================================= 
def _initialize_web3_instance(network_url):
	"""
	Web3インスタンスを初期化（このファイル内でのみ使用する関数）
	"""
	logger.debug(f"Initializing Web3 with HTTPProvider at URL: {network_url}")

	w3 = Web3(Web3.HTTPProvider(network_url))
	# リアルタイム性が必要ならwebsocketを使用する
	# w3 = Web3(Web3.WebsocketProvider(EVM_TEST_NETWORK_URL))

	# Web3インスタンスの状態をログ出力
	logger.debug(f"Web3 instance created: {w3}")

	try:
		block_number = w3.eth.block_number
		logger.debug(f"Successfully connected to the network. Latest block number: {block_number}")
	except Exception as e:
		logger.error(f"Failed to connect to the network: {str(e)}")
		raise
	
	if w3.is_connected():
		logger.debug("Web3 instance is connected to the Ethereum network")
	else:
		logger.error("Web3 instance is not connected to the Ethereum network")


	logger.debug(f"Web3 HTTPProvider endpoint: {w3.providers[0].endpoint_uri if w3.providers else 'No provider'}")

	return w3
# ------------------------------------------------------
def _configure_default_account(w3):
	"""
	Web3インスタンスに基づいてデフォルトアカウントを設定（このファイル内でのみ使用する関数）
	"""
	if len(w3.eth.accounts) > 0:
		w3.eth.defaultAccount = w3.eth.accounts[0]
		logger.debug(f"Default account configured: {w3.eth.defaultAccount}")
	else:
		logger.debug("No accounts found in Web3 instance")
# ------------------------------------------------------
def _create_contract_instance(w3, contract_address, contract_abi):
	"""
	スマートコントラクトのインスタンスを生成（このファイル内でのみ使用する関数）
	"""
	logger.debug(f"Creating contract instance with address: {contract_address}")
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
	try:
		logger.debug("Setting up Web3 and contract instance")
		# Web3インスタンスの初期化
		logger.debug(f"Initializing Web3 with HTTPProvider at URL: {network_url}")
		w3 = _initialize_web3_instance(network_url)

		logger.debug("Checking if Web3 instance is connected to the network")
		# try:
		# 	latest_block = w3.eth.getBlock('latest')
		# 	logger.debug(f"Latest block number is: {latest_block['number']}")
		# except Exception as e:
		# 	logger.error(f"Error while getting the latest block: {str(e)}")

		# デフォルトアカウントの設定
		_configure_default_account(w3)

		# try:
		# 	latest_block = w3.eth.getBlock('latest')
		# 	logger.debug(f"Latest block number is: {latest_block['number']}")
		# except Exception as e:
		# 	logger.error(f"Error while getting the latest block: {str(e)}")
		
		# スマートコントラクトのインスタンス作成
		logger.debug(f"Creating contract instance with address: {contract_address}")
		contract = _create_contract_instance(w3, contract_address, contract_abi)
		logger.debug("Web3 and contract instance setup complete")
		return w3, contract
	except Exception as e:
		logger.error(f"An error occurred in setup_web3_and_contract: {str(e)}")
		return None, None