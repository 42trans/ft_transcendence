# get_game_result.py
from web3 import Web3
import json
import os

# 接続設定
HARDHAT_NETWORK_URL = 'http://hardhat:8545'
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"


# スクリプトの現在のディレクトリからパスを作成
current_dir = os.path.dirname(os.path.abspath(__file__))
abi_path = os.path.join(current_dir, 'contract_abi.json')
# ABIファイルを読み込む
with open(abi_path, 'r') as abi_definition:
    CONTRACT_ABI = json.load(abi_definition)

# Web3インスタンスの作成
w3 = Web3(Web3.HTTPProvider(HARDHAT_NETWORK_URL))

# コントラクトのインスタンスを作成
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

# ゲーム結果を取得
def get_game_result_by_match_id(match_id):
    result = contract.functions.getGameResultByMatchId(match_id).call()
    print(f"Match ID: {result[0]}")
    print(f"Player 1 Score: {result[1]}")
    print(f"Player 2 Score: {result[2]}")
    print(f"Winner Name: {result[3]}")
    print(f"Loser Name: {result[4]}")
    print(f"Date: {result[5]}")

# コマンドラインからの入力を取得
if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python get_game_result.py [match_id]")
        sys.exit(1)
    match_id = int(sys.argv[1])
    get_game_result_by_match_id(match_id)
