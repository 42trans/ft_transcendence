#!/bin/bash

# 環境変数を読み込む
source docker/srcs/.env


# Django コンテナの起動を評価
_waiting_startup() {
    local timeout=300

    local elapsed=0
    echo "Waiting for uwsgi-django container to become healthy..."
    while [ "$(docker inspect --format='{{.State.Health.Status}}' uwsgi-django)" != "healthy" ]; do
        if [ $elapsed -ge $timeout ]; then
            echo -e "\e[31m[NG] Timeout waiting for uwsgi-django to become healthy.\e[0m"
            exit 1
        fi
        echo -e "\e[33mRemaining time: $((timeout - elapsed)) seconds.\e[0m"
        sleep 10
        elapsed=$((elapsed + 10))
    done
    echo -e "\e[32mAll uwsgi-django containers are healthy.\e[0m"
}


# 取得したコンテナ名ごとにチェックコマンドを実行
_check_container_status() {
    declare -A commands

    # コンテナ名とチェックコマンドを設定
    ## compose-blockchain
    commands[hardhat]="nc -zv localhost ${HARDHAT_PORT}"
    commands[ganache]="nc -zv localhost ${GANACHE_PORT}"

    ## compose-exporter
    commands[node-exporter]="nc -zv localhost ${NODE_EXPORTER_PORT}"

    ## compose-monitor
    commands[prometheus]="nc -zv localhost ${PROMETHEUS_PORT}"
    commands[grafana]="nc -zv localhost ${GRAFANA_PORT}"

    ## compose-web
    commands[nginx]="nc -zv localhost ${NGINX_PORT}"
    commands[uwsgi-django]="nc -zv localhost ${DJANGO_PORT}"
    commands[postgres]="nc -zv localhost ${POSTGRES_PORT}"
    commands[vite]="nc -zv localhost ${VITE_PORT}"

    # docker-compose ps コマンドを使用してコンテナ名を取得
    container_names=$(docker-compose -f ./docker/srcs/compose.yaml \
      -f ./docker/srcs/compose-yaml/compose-networks.yaml \
      -f ./docker/srcs/compose-yaml/compose-web.yaml \
      -f ./docker/srcs/compose-yaml/compose-blockchain.yaml \
      -f ./docker/srcs/compose-yaml/compose-monitor.yaml \
      -f ./docker/srcs/compose-yaml/compose-exporter.yaml ps | awk 'NR>1 {print $1}')

    local success=true
    for name in $container_names; do
        if [ "${commands[$name]}" ]; then
            echo "Checking container $name..."
            if eval "${commands[$name]}"; then
                echo -e " \e[32m[OK] $name is running properly.\e[0m"
            else
                echo -e " \e[31m[NG] There is a problem with $name.\e[0m"
                success=false
            fi
        else
            echo -e "\e[31mNo check command is set for container $name.\e[0m"
        fi
        echo ""
    done

    # 成功フラグが false の場合、スクリプトをエラー終了
    if [ "$success" = false ]; then
        echo -e "\e[31m[ERROR] One or more containers failed to start properly.\e[0m"
        exit 1
    fi
}


_main() {
    _waiting_startup
    _check_container_status
}


_main
