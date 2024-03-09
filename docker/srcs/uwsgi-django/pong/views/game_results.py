from web3 import Web3
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

# Hardhatのローカルネットワークの設定
HARDHAT_NETWORK_URL = 'http://hardhat:3000'
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
CONTRACT_ABI = json.loads("""
[
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_matchId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_player1Score",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_player2Score",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_winnerName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_loserName",
          "type": "string"
        }
      ],
      "name": "addGameResult",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "gameResults",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "matchId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "player1Score",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "player2Score",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "winnerName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "loserName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "date",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getGameResult",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "matchId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "player1Score",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "player2Score",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "winnerName",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "loserName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "date",
              "type": "uint256"
            }
          ],
          "internalType": "struct PongGameResult.GameResult",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
						  """)

@csrf_exempt
def save_game_result_hardhat(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            player_1_score = data.get('player_1_score')
            player_2_score = data.get('player_2_score')
            player_1_name = data.get('player_1_name')
            player_2_name = data.get('player_2_name')

            winner = player_1_name if player_1_score > player_2_score else player_2_name
            loser = player_2_name if player_1_score > player_2_score else player_1_name

            # Hardhatのテストネットワークに接続
            w3 = Web3(Web3.HTTPProvider(HARDHAT_NETWORK_URL))
            w3.eth.defaultAccount = w3.eth.accounts[0]  # Hardhatのデフォルトアカウントを使用
            contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

            # スマートコントラクトの関数を呼び出し
            txn_hash = contract.functions.addGameResult(
                player_1_score,
                player_2_score,
                winner,
                loser
            ).transact()
            txn_receipt = w3.eth.waitForTransactionReceipt(txn_hash)

            return JsonResponse({'status': 'success', 'txn_receipt': txn_receipt.transactionHash.hex()})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
