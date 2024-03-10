import requests
import json
import warnings

API_URL = "https://hioikawa.42.fr/pong/save_game_result_hardhat/"

def test_get_game_results():
    # テストデータ
    match_id = 1

    warnings.filterwarnings("ignore", category=requests.packages.urllib3.exceptions.InsecureRequestWarning)

    # APIリクエスト
    # response = requests.get(f"{API_URL}?match_id={match_id}")
    response = requests.get(f"{API_URL}?match_id={match_id}", verify=False)

    # レスポンスの確認
    if response.status_code == 200:
        data = json.loads(response.content.decode('utf-8'))
        print(f"Match ID: {data['match_id']}")
        print(f"Player 1 Score: {data['player_1_score']}")
        print(f"Player 2 Score: {data['player_2_score']}")
        print(f"Winner Name: {data['winner_name']}")
        print(f"Loser Name: {data['loser_name']}")
    else:
        print(f"Error: {response.status_code}")

# テストの実行
test_get_game_results()
