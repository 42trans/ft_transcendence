# docker/srcs/uwsgi-django/pong/blockchain/local_testnet/get_network_settings.py
from django.http import JsonResponse
import os

def get_network_settings(testnet_name):
	"""
	テストネットワークURLとコントラクト情報のパスを返します。

	:Parameters:
		- testnet_name (str): ローカルテストネットワークの名前 ('ganache' または 'hardhat')。

	:Returns:
		- tuple: ローカルネットワークURLとコントラクト情報のパス、またはエラーを示すJsonResponse。
	"""
	if testnet_name == 'ganache':
		return ('http://ganache:8545', '../../../share_hardhat/contractInfo-ganache.json', None)
	elif testnet_name == 'hardhat':
		return ('http://hardhat:8545', '../../../share_hardhat/contractInfo-hardhat.json', None)
	elif testnet_name == 'sepolia':
		infura_api_key = os.getenv('INFURA_API_KEY')
		sepolia_private_key = os.getenv('SEPOLIA_PRIVATE_KEY')
		# MEMO:APIの末尾にスラッシュが入っているとバグります 例: https://sepolia.infura.io/v3/{infura_api_key}/
		return (f'https://sepolia.infura.io/v3/{infura_api_key}', '../../../share_hardhat/contractInfo-sepolia.json', sepolia_private_key)
	else:
		return None, JsonResponse({'status': 'error', 'message': 'Unknown network'}, status=400), None
