import asyncio
import websockets
import json
import ssl

async def pong_test_client():
    """
    ws通信チェック用
        - クライアントから接続を確認する目的がメイン
        - 処理自体はまだバグってます。
    """
    uri = "wss://localhost/ws/pong/online/"
    
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    try:
        async with websockets.connect(uri, ssl=ssl_context) as websocket:
            print(f"Connected to {uri}")

            # 初回メッセージを受信
            # state = await websocket.recv()
            # state = json.loads(state)
            # print("Initial state received:", state)

            while True:
                try:
                    action = input("Move paddle [u: up, d: down]: ")
                    if action == 'u':
                        dir_y = -1
                    elif action == 'd':
                        dir_y = 1
                    else:
                        dir_y = 0

                    send_data = json.dumps({'paddle1': {'dir_y': dir_y}})
                    print("Sending data to server...")
                    await websocket.send(send_data)
                    print(f"Sent: {send_data}")

                    print("Waiting for server message...")
                    state = await websocket.recv()
                    print("Message received.")
                    state = json.loads(state)

                    # 受信データをデバッグ用に出力
                    print(f"Received state: {state}")

                    if 'ball' in state and 'paddle1' in state and 'paddle2' in state:
                        print("\033[H\033[J")  # 画面をクリア
                        print("Pong CLI")
                        print(f"Ball position: {state['ball']['position']}")
                        print(f"Paddle 1 position: {state['paddle1']['position']}")
                        print(f"Paddle 2 position: {state['paddle2']['position']}")
                        print(f"Score: {state['score1']} - {state['score2']}")
                    else:
                        print("Received state does not contain expected keys")

                except json.JSONDecodeError as e:
                    print("JSON error:", e)
                except websockets.exceptions.ConnectionClosed as e:
                    print("Connection closed:", e)
                    break
    except Exception as e:
        print("Failed to connect or error during event loop:", e)

asyncio.run(pong_test_client())
