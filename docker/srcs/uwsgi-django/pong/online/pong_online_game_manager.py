from .pong_online_config import PongOnlineConfig
from .pong_online_init import PongOnlineInit
from .pong_online_updater import PongOnlineUpdater
from .pong_online_physics import PongOnlinePhysics
from .pong_online_match import PongOnlineMatch
from typing import Dict, Any
from ..utils.async_logger import async_log

# asyn_log: docker/srcs/uwsgi-django/pong/utils/async_log.log
DEBUG_FLOW = 0
DEBUG_DETAIL = 0

class PongOnlineGameManager:
    """
    # テストの実行方法: 
        - Makefileのあるディレクトリで下記のコマンドを実行
        - Django Test: Makefile
            make test_online_pong_django
            - または、
                docker exec -it uwsgi-django bash -c "python manage.py test pong.online.tests"
        - WS Test: CLI
            - 準備
                pip install websockets
            - コマンド
                python3 docker/srcs/uwsgi-django/pong/online/tests/CLI_pong_test_client.py
    # logger: async_log, sync_log
        - 役割: ピンポイントでprintデバッグする独自のメソッド
        - 保存場所: docker/srcs/uwsgi-django/pong/util/
        - 出力ファイル: 同じディレクトリの async_log.log
        
    # 例外処理: 一旦、このクラスから呼ばれるものを全てキャッチする > Consumerクラスにraise
    - ゲームの初期化や状態の復元など、外部データ（client）に依存する処理が含まれるため
    """
    def __init__(self, consumer, user_id):
        self.consumer   = consumer
        self.user_id    = user_id
        self.config     = PongOnlineConfig()
        self.match      = None
        self.physics    = None
        self.updater    = None
        self.pong_engine_data: Dict[str, Any] = {
            "objects": {},
            "game_settings": {},
            "state": {},
            "is_running": None
        }

    async def initialize_game(self):
        """ 
        ゲームの各コンポーネントを初期化し、依存関係を注入する。
         - pong_engine_data: 環境・状態・オブジェクトなどgameに関するほとんどの変数を持つ
         - match:            スコア、終了判定
         - physics:          衝突・速度計算
        """
        try:
            init                    = PongOnlineInit(self.config)
            self.pong_engine_data   = init.init_pong_engine()
            self.match              = PongOnlineMatch(self.consumer, self.pong_engine_data)
            self.physics            = PongOnlinePhysics(self.pong_engine_data)
            #  ゲームの更新メカニズムのセットアップ・依存性注入
            self.updater = PongOnlineUpdater(
                self.pong_engine_data,
                self.physics,
                self.match
            )
            if DEBUG_DETAIL:
                await async_log("initialize_game().pong_engine_data: ")
                await async_log(self.pong_engine_data)
            return self
        except Exception as e:
            await async_log(f"initialize_game() failed: {e}")
            raise  # 例外を再送出


    async def update_game(self, json_game_state_objects):
        """ 
        gameの状態を高速で更新する
        データはkey==objectsだけをやり取りする
        """
        try:
            await self.updater.update_game(json_game_state_objects)
            return self
        except Exception as e:
            await async_log(f"update_game() failed: {e}")
            raise


    async def restore_game_state(self, client_json_game_state):
        """
        クライアントから送信されたゲーム状態でサーバーの状態を更新する。
        """
        try:
            if "game_settings" in client_json_game_state:
                self.pong_engine_data["game_settings"].update(client_json_game_state["game_settings"])
            if "objects" in client_json_game_state:
                for key in ["ball", "paddle1", "paddle2"]:
                    if key in client_json_game_state["objects"]:
                        self.pong_engine_data["objects"][key].update(client_json_game_state["objects"][key])
            if "state" in client_json_game_state:
                self.pong_engine_data["state"].update(client_json_game_state["state"])
            if "is_running" in client_json_game_state:
                self.pong_engine_data["is_running"] = client_json_game_state["is_running"]
            # ログ出力
            if DEBUG_FLOW:
                await async_log("Game state restored from client.")
            return self
        except Exception as e:
                await async_log(f"restore_game_state() failed: {e}")
                raise

