# docker/srcs/uwsgi-django/pong/online/duel/pong_online_duel_config.py
import asyncio
import redis
import os

game_managers = {}

# 参考:【同期プリミティブ — Python 3.12.3 ドキュメント】 <https://docs.python.org/ja/3/library/asyncio-sync.html>
g_GAME_MANAGERS_LOCK = asyncio.Lock() 
# Redis操作用のロック
g_REDIS_LOCK = asyncio.Lock()
g_REDIS_START_SIGNAL_LOCK = asyncio.Lock()
g_REDIS_STATE_LOCK = asyncio.Lock()

# Redisクライアント
# 参考:【Python guide | Docs】 <https://redis.io/docs/latest/develop/connect/clients/python/>
# Redis クライアントの初期化
redis_host = os.getenv('REDIS_HOST', 'redis')
redis_port = os.getenv('REDIS_PORT', 6379)
# 接続プール
redis_pool = redis.ConnectionPool(host=redis_host, port=redis_port, db=0) 
g_redis_client = redis.Redis(connection_pool=redis_pool)  
# g_redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)
