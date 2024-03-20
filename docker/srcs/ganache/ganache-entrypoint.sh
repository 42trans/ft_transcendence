#!/bin/sh
# docker/srcs/ganache/ganache-entrypoint.sh

# Ganacheのデータを保存するディレクトリ
GANACHE_DATA_DIR="/ganache_data"
# Ganacheを起動するdefaultのコマンド
GANACHE_CMD="ganache-cli --host 0.0.0.0 --db $GANACHE_DATA_DIR"
# 秘密鍵が環境変数に設定されていればCMD変更
if [ -n "$GANACHE_PRIVATE_KEY" ]; then
    GANACHE_CMD="$GANACHE_CMD --account=\"$GANACHE_PRIVATE_KEY,100000000000000000000\""
fi
echo "起動時のコマンド: $GANACHE_CMD"
exec $GANACHE_CMD
