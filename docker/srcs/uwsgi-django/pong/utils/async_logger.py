import aiofiles
import asyncio
import datetime

async def async_log(message: str, file_path: str = "/code/pong/utils/async_log.log"):
    """非同期にメッセージをログファイルに書き込む"""
    async with aiofiles.open(file_path, mode='a') as log_file:
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        await log_file.write(f"{timestamp} - {message}\n")

def sync_log(message: str, file_path: str = "/code/pong/utils/async_log.log"):
    """同期的にメッセージをログファイルに書き込む"""
    loop = asyncio.get_event_loop()
    if loop.is_running():
        # 既存のイベントループが走っている場合は新しいイベントループを作成する
        new_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(new_loop)
        new_loop.run_until_complete(async_log(message, file_path))
        new_loop.close()
        asyncio.set_event_loop(loop)
    else:
        loop.run_until_complete(async_log(message, file_path))
