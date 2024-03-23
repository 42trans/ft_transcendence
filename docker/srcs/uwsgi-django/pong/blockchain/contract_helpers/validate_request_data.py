import json
from django.http import JsonResponse

def validate_request_data(request_body):
	"""
	リクエストボディのJSONデータを検証する。
	正しい場合はデータを返し、間違っている場合はエラーのJsonResponseを返す。
	"""
	try:
		data = json.loads(request_body)
		if not data or 'match_id' not in data or 'player_1_score' not in data or 'player_2_score' not in data:
			return None, JsonResponse({'status': 'error', 'message': 'Invalid data'}, status=400)
		if data['match_id'] < 0 or data['player_1_score'] < 0 or data['player_2_score'] < 0:
			return None, JsonResponse({'status': 'error', 'message': 'Negative scores are not allowed'}, status=400)
		return data, None
	except json.JSONDecodeError:
		return None, JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
