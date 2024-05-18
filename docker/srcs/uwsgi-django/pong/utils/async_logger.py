import aiofiles
# import asyncio
import datetime

async def async_log(message: str, file_path: str = "/code/pong/utils/async_log.log"):
    """非同期にメッセージをログファイルに書き込む"""
    async with aiofiles.open(file_path, mode='a') as log_file:
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        await log_file.write(f"{timestamp} - {message}\n")
