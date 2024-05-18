from .pong_online_config import PongOnlineConfig
from .pong_online_init import PongOnlineInit
from .pong_online_update import PongOnlineUpdate
from .pong_online_physics import PongOnlinePhysics
from .pong_online_match import PongOnlineMatch
import logging
from typing import Dict, Any
from ..utils.async_logger import async_log, sync_log

logger = logging.getLogger(__name__)

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
    """
    def __init__(self, user_id):
        self.user_id = user_id
        self.config = PongOnlineConfig()
        self.pong_engine_data: Dict[str, Any] = {
            "objects": {},
            "game_settings": {},
            "state": {"score1": 0, "score2": 0},
            "is_running": True
        }
        self.initialize_game()


    def initialize_game(self):
        """ 
        ゲームの各コンポーネントを初期化し、依存関係を注入する。
         - pong_engine_data: 環境・状態・オブジェクトなどgameに関するほとんどの変数を持つ
         - match:            スコア、終了判定
         - physics:          衝突・速度計算
        """
        sync_log("物理判定init")

        init                    = PongOnlineInit(self.config)
        self.pong_engine_data   = init.init_pong_engine()
        self.match              = PongOnlineMatch(self.pong_engine_data)
        self.physics            = PongOnlinePhysics(self.pong_engine_data)
        #  ゲームの更新メカニズムのセットアップ・依存性注入
        self.pong_engine_update = PongOnlineUpdate(
            self.pong_engine_data,
            self.physics,
            self.match
        )
        logger.info("ready to start.")
        sync_log(self.pong_engine_data)


    def update_game(self, json_data):
        """ gameの状態を高速で更新する """
        self.pong_engine_update.update_game(json_data)
        return self.pong_engine_update.serialize_state()
    