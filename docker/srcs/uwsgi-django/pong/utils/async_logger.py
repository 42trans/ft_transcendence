import aiofiles
import asyncio
import datetime
import json

async def async_log(message, file_path: str = "/code/pong/utils/async_log.log"):
    """非同期にメッセージをログファイルに書き込む"""
    # メッセージを文字列に変換
    if not isinstance(message, str):
        try:
            message = json.dumps(message)
        except TypeError:
            message = str(message)

    async with aiofiles.open(file_path, mode='a') as log_file:
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        await log_file.write(f"{timestamp} - {message}\n")

import datetime
import json

def sync_log(message, file_path: str = "/code/pong/utils/sync_log.log"):
    """同期的にメッセージをログファイルに書き込む"""
    # メッセージを文字列に変換
    if not isinstance(message, str):
        try:
            message = json.dumps(message)
        except TypeError:
            message = str(message)

    with open(file_path, mode='a') as log_file:
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_file.write(f"{timestamp} - {message}\n")