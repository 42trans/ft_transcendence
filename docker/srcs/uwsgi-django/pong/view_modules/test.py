
from web3 import Web3
HARDHAT_NETWORK_URL = 'http://hardhat:8545'

# トランザクションハッシュ
txn_hash = "0x5012b5991355fc6ffd0b4a4310a9cb51580f28ff4c52104979deb92d5892ac93"

# Hardhatのローカルネットワークに接続
w3 = Web3(Web3.HTTPProvider(HARDHAT_NETWORK_URL))

# トランザクションハッシュからトランザクション情報取得
txn_receipt = w3.eth.get_transaction_receipt(txn_hash)

# レスポンスに情報を追加
print({
    'status': 'success',
    'txn_receipt': txn_receipt.transactionHash.hex(),
    'block_hash': txn_receipt.blockHash.hex(),
    'block_number': txn_receipt.blockNumber,
    # ... (必要な情報)
})


# トランザクション情報
print(f"トランザクションハッシュ: {txn_receipt.transactionHash.hex()}")
print(f"ブロックハッシュ: {txn_receipt.blockHash.hex()}")
print(f"ブロック番号: {txn_receipt.blockNumber}")
# ゲーム結果データを取得
try:
    # ログが存在するかどうかを確認
    if txn_receipt.logs:
        match_id = txn_receipt.logs[0].args["matchId"]
        player1_score = txn_receipt.logs[0].args["player1Score"]
        player2_score = txn_receipt.logs[0].args["player2Score"]
        winner = txn_receipt.logs[0].args["winner"]
        loser = txn_receipt.logs[0].args["loser"]
        # ゲーム結果データを出力
        print(f"マッチID: {match_id}")
        print(f"プレイヤー1のスコア: {player1_score}")
        print(f"プレイヤー2のスコア: {player2_score}")
        print(f"勝者: {winner}")
        print(f"敗者: {loser}")
    else:
        # ログが存在しない場合の処理
        print("トランザクションにゲーム結果データが含まれていません。")
except IndexError as e:
    # IndexErrorが発生した場合の処理
    print(f"エラー: {e}")