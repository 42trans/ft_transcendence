# docker/srcs/uwsgi-django/pong/urls.py
from django.urls import path
from . import views
from .blockchain import save_testnet
from .blockchain import fetch_testnet
from .blockchain import fetch_testnet
from .blockchain import record_game_result

urlpatterns = [
	# path() 引数:
	# <str:testnet_name>/: URLから 'testnet_name' 文字列をビュー関数に渡す。異なるテストネット名に対して動的に対応。
	# save_testnet.save_testnet: URLリクエスト時に呼ばれるビュー関数（API関数・エンドポイント）。
	# name=: URLパターンの名前付け。テンプレート等で使用。reverse関数でURL名から実パスを逆引き可能。

	# testnetを指定する（DB保存なし）
	path('api/save_testnet/<str:testnet_name>/', save_testnet.save_testnet, name='save_testnet'),
	path('api/fetch_testnet/<str:testnet_name>/', fetch_testnet.fetch_testnet, name='fetch_testnet'),

	# DBとtestnetの同時記録
	# path('api/record_game_result/<str:testnet_name>/', record_game_result.record_game_result, name='record_game_result'),
	
	# 過去に作成した使っていないもの play用
	path('api/save_game_result/', views.save_game_result, name='save_game_result'),
	path('save_game_result/', views.save_game_result, name='save_game_result'),
	path('results/', views.results, name='results'),

	# root（一番下に記述する。上から順にマッチ評価されるため） ex. https://example.com/
	path("", views.index, name="index"),
]
