# docker/srcs/uwsgi-django/pong/blockchain/local_testnet/get_network_settings.py
from django.http import JsonResponse

def get_network_settings(local_testnet_name):
	"""
	テストネットワークURLとコントラクト情報のパスを返します。

	:Parameters:
		- local_testnet_name (str): ローカルテストネットワークの名前 ('ganache' または 'hardhat')。

	:Returns:
		- tuple: ローカルネットワークURLとコントラクト情報のパス、またはエラーを示すJsonResponse。
	"""
	if local_testnet_name == 'ganache':
		return ('http://ganache:8545', '../../../share_hardhat/contractInfo-ganache.json')
	elif local_testnet_name == 'hardhat':
		return ('http://hardhat:8545', '../../../share_hardhat/contractInfo-hardhat.json')
	else:
		return None, JsonResponse({'status': 'error', 'message': 'Unknown network'}, status=400)
