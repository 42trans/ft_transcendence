# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_Resources.py
import asyncio
import redis
import os

class PongOnlineDuelResources:
	""" 
	シングルトン 
	- 2名のUserのConsumerからそれぞれ呼び出されるため。
	"""
	# -----------------------------------
	# クラス変数
	# -----------------------------------
	# GameManagerのインスタンスを入れるdict
	# -----------------------------------
	_game_managers = {}
	# -----------------------------------
	# 排他制御: Mutex lock
	# 参考:【同期プリミティブ — Python 3.12.3 ドキュメント】 <https://docs.python.org/ja/3/library/asyncio-sync.html>
	# -----------------------------------
	_GAME_MANAGERS_LOCK = asyncio.Lock() 
	_REDIS_ROOM_LOCK = asyncio.Lock()
	_REDIS_START_SIGNAL_LOCK = asyncio.Lock()
	# TODO_ft:削除予定
	_REDIS_STATE_LOCK = asyncio.Lock()
	# -----------------------------------
	# Redisクライアント
	# 参考:【Python guide | Docs】 <https://redis.io/docs/latest/develop/connect/clients/python/>
	# -----------------------------------

	_instance		= None
	# _initialized	= False
	# -----------------------------------


	# シングルトン
	def __new__(cls):
		if cls._instance is None:
			# object.__new__(cls): 暗黙的親クラスobject の new を呼び出し
			cls._instance = super().__new__(cls)
		return cls._instance
		
	def __init__(self):
		if not hasattr(self, '_redis_client'):
		# Redisクライアントが未初期化なら初期化する
		# if not self._initialized:
			redis_host = os.getenv('REDIS_HOST', 'redis')
			redis_port = os.getenv('REDIS_PORT', 6379)
			self.redis_pool = redis.ConnectionPool(host=redis_host, port=redis_port, db=0)
			self._redis_client = redis.Redis(connection_pool=self.redis_pool)
			# self._initialized = True

	@classmethod
	def get_instance(cls):
		return cls.__new__(cls)

	def get_redis_client(self):
		return self._redis_client
	# @classmethod
	# def get_redis_client(cls):
	# 	return cls._redis_client
	
	@classmethod
	def get_game_managers_lock(cls):
		return cls._GAME_MANAGERS_LOCK

	@classmethod
	def get_game_redis_room_lock(cls):
		return cls._REDIS_ROOM_LOCK

	@classmethod
	def get_game_redis_start_signal_lock(cls):
		return cls._REDIS_START_SIGNAL_LOCK

	@classmethod
	def get_game_redis_state_lock(cls):
		return cls._REDIS_STATE_LOCK

	@classmethod
	def get_game_managers(cls):
		return cls._game_managers