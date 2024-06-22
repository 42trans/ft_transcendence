import asyncio
import websockets
import json
import ssl

async def pong_test_client():
    """
    WebSocket通信チェック用
        - クライアントから接続を確認する目的がメイン
        - 処理自体はまだバグってます。
    """
    uri = "wss://localhost/ws/pong/online/"
    
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    try:
        print("start")
        async with websockets.connect(uri, ssl=ssl_context) as websocket:
            print("start2")
            print(f"Connected to {uri}")

            # 初期化または再接続時のリクエスト
            await websocket.send(json.dumps({
                "action": "initialize"
            }))
            print("Initialization request sent.")

            # サーバーからの初期状態を受信
            state = await websocket.recv()
            print("Initial state received.")
            state = json.loads(state)
            print(state)

            # ユーザーインタラクション
            while True:
                action = input("Move paddle [u: up, d: down]: ")
                if action == 'u':
                    dir_y = -1
                elif action == 'd':
                    dir_y = 1
                else:
                    dir_y = 0

                # ユーザー入力をもとに更新データを送信
                send_data = json.dumps({
                    "action": "update",
                    "objects": {
                        "paddle1": {
                            "dir_y": dir_y
                        }
                    }
                })
                print("Sending data to server...")
                await websocket.send(send_data)
                print(f"Sent: {send_data}")

                # サーバーからの更新状態を受信
                state = await websocket.recv()
                print("Updated state received.")
                state = json.loads(state)

                print("\033[H\033[J")  # 画面をクリア
                print("Pong CLI")
                
                print(state)

    except Exception as e:
        print(f"Failed to connect or error during event loop: {e}")

asyncio.run(pong_test_client())
