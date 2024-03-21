# docker/srcs/uwsgi-django/pong/view_modules/testnet/process_game_result.py
# ------------------------------------------------------
# 勝者の判定を行う
# ------------------------------------------------------
def determine_winner(player1_score, player2_score, player1_name, player2_name):
	if player1_score > player2_score:
		# 勝者:player1
		return player1_name, player2_name
	else:
		# 勝者:player2
		return player2_name, player1_name
# ------------------------------------------------------
# JSONデータからゲーム結果を処理する
# ------------------------------------------------------
def process_game_result(data):
	player1_score = data['player_1_score']
	player2_score = data['player_2_score']
	player1_name = data['player_1_name']
	player2_name = data['player_2_name']

	# 勝者と敗者を判定する
	winner, loser = determine_winner(player1_score, player2_score, player1_name, player2_name)

	return winner, loser 
