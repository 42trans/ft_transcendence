# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_config.py
import asyncio
import redis
import os

game_managers = {}

# 参考:【同期プリミティブ — Python 3.12.3 ドキュメント】 <https://docs.python.org/ja/3/library/asyncio-sync.html>
g_GAME_MANAGERS_LOCK = asyncio.Lock() 

# Redisクライアント
# 参考:【Python guide | Docs】 <https://redis.io/docs/latest/develop/connect/clients/python/>
# Redis クライアントの初期化
redis_host = os.getenv('REDIS_HOST', 'redis')
redis_port = os.getenv('REDIS_PORT', 6379)
# グローバル
g_redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)
