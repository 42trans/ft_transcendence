# -----------------------------------------------
# まずは最初に ターミナルで`make init`で .make_env を作成ください ※詳細はREADME.md
# -----------------------------------------------
# Makefile用の環境変数の読み込み
-include init/.make_env
# OSに応じて環境変数の設定と、ディレクトリの設定をする
# -include init/set_env
# 各compose.ymlを定義
COMPOSE_FILES = ./docker/srcs/compose.yaml \
				./docker/srcs/compose-yaml/compose-networks.yaml \
				./docker/srcs/compose-yaml/compose-web.yaml 

# COMPOSE_FILES = ./docker/srcs/compose.yaml \
# 				./docker/srcs/compose-yaml/compose-networks.yaml \
# 				./docker/srcs/compose-yaml/compose-web.yaml \
# 				./docker/srcs/compose-yaml/compose-blockchain.yaml \
# 				./docker/srcs/compose-yaml/compose-monitor.yaml \
# 				./docker/srcs/compose-yaml/compose-exporter.yaml
COMPOSE_FILES_ARGS = $(addprefix -f , $(COMPOSE_FILES))

# -----------------------------------------------
#  docker-compose
# -----------------------------------------------
# all: init build up
all: build_up_default

# DEBUG: 環境変数チェック
# echo $$SERVER_NAME 
# DEBUG: キャッシュ不使用
# docker-compose -f docker-compose.yml build --no-cache
# -----------------------------------------------
# Docker
# -----------------------------------------------
.PHONY: build
build: init
	docker-compose $(COMPOSE_FILES_ARGS) build
# COMPOSE_PROFILES=elk,blockchain,monitor docker-compose $(COMPOSE_FILES_ARGS) build

.PHONY: b
b:
	make build

.PHONY: up
up: init
	docker-compose $(COMPOSE_FILES_ARGS) up -d
# COMPOSE_PROFILES=elk,blockchain,monitor docker-compose $(COMPOSE_FILES_ARGS) up -d

.PHONY: u
u:
	make up


# .PHONY: build_up_blockchain
# build_up_blockchain: init
# 	COMPOSE_PROFILES=blockchain docker-compose $(COMPOSE_FILES_ARGS) build
# 	COMPOSE_PROFILES=blockchain docker-compose $(COMPOSE_FILES_ARGS) up -d
# 	make hardhat_deploy_hardhat
# 	make hardhat_deploy_ganache
# 	make setup_ganache_data

# .PHONY: build_up_monitor
# build_up_monitor: init
# 	COMPOSE_PROFILES=monitor docker-compose $(COMPOSE_FILES_ARGS) build
# 	COMPOSE_PROFILES=monitor docker-compose $(COMPOSE_FILES_ARGS) up -d

# Django + vite環境の起動
.PHONY: build_up_three
build_up_three: init
	COMPOSE_PROFILES=three docker-compose $(COMPOSE_FILES_ARGS) build
	COMPOSE_PROFILES=three docker-compose $(COMPOSE_FILES_ARGS) up -d

# 通常の起動: viteはbuildのみ行い、即downしrmする
.PHONY: build_up_default
build_up_default: build_up_three vite_npm_run_build down_vite django_collectstatic
# docker-compose $(COMPOSE_FILES_ARGS) build
# docker-compose $(COMPOSE_FILES_ARGS) up -d

.PHONY: stop
stop:
	docker-compose $(COMPOSE_FILES_ARGS) stop

.PHONY: s
s:
	make stop


.PHONY: start
start:
	docker-compose $(COMPOSE_FILES_ARGS) start

# ------------------------------
# down
# ------------------------------
# viteコンテナだけをdownする：make の際、viteでbuildだけしてdownするために使用する
.PHONY: down_vite
down_vite:
	docker-compose $(COMPOSE_FILES_ARGS) rm -s -f vite

# Django+vite起動環境のdown
.PHONY: down_three	
down_three:
	COMPOSE_PROFILES=three docker-compose $(COMPOSE_FILES_ARGS) down

# 通常時のdown: viteは起動していない想定
.PHONY: down
down:
	docker-compose $(COMPOSE_FILES_ARGS) down
# COMPOSE_PROFILES=elk,blockchain,monitor,three docker-compose $(COMPOSE_FILES_ARGS) down

#	COMPOSE_PROFILES=elk,blockchain,monitor,three docker-compose $(COMPOSE_FILES_ARGS) down; \
#	PATTERN='127.0.0.1 $(SERVER_NAME)'; \
#	OSTYPE=`uname -s`; \
#	if [ "$$OSTYPE" = "Darwin" ]; then \
#		sudo sed -i '' "/$$PATTERN/d" /etc/hosts; \
#	elif [ "$$OSTYPE" = "Linux" ]; then \
#		sudo sed -i "/$$PATTERN/d" /etc/hosts; \
#	fi

.PHONY: d
d:
	make down

.PHONY: reset_nginx
reset_nginx:
	docker-compose $(COMPOSE_FILES_ARGS) down nginx
	docker-compose $(COMPOSE_FILES_ARGS) build nginx
	docker-compose $(COMPOSE_FILES_ARGS) up nginx -d

.PHONY: reset_ft_django
reset_ft_django:
	docker-compose $(COMPOSE_FILES_ARGS) down ft_django
	rm -rf mount_volume/ft_django
	docker-compose $(COMPOSE_FILES_ARGS) build ft_django
	docker-compose $(COMPOSE_FILES_ARGS) up ft_django -d

# -----------------------------------------------
#  other docker command
# -----------------------------------------------
.PHONY: docker_rm
docker_rm:
	-@docker stop $$(docker ps -qa) 2>/dev/null
	-@docker rm -f $$(docker ps -qa) 2>/dev/null
	-@docker rmi -f $$(docker images -qa) 2>/dev/null
	-@docker network rm $$(docker network ls -q) 2>/dev/null
	-@docker volume rm $$(docker volume ls -q) 2>/dev/null
	-@docker system prune -af --volumes

.PHONY: remove_mount_volume
remove_mount_volume:
	sudo rm -rf mount_volume

.PHONY: rm
rm:
	make remove_mount_volume

.PYHONY: ps
ps:
	docker-compose $(COMPOSE_FILES_ARGS) ps

.PYHONY: ps_a
ps_a:
	docker-compose $(COMPOSE_FILES_ARGS) ps -a


.PYHONY: logs
logs:
	docker-compose $(COMPOSE_FILES_ARGS) logs

.PHONY: fclean
fclean: down docker_rm remove_mount_volume

.PHONY: re
re: fclean all


# -----------------------------------------------
#  init
# -----------------------------------------------
## build初期設定: .envの作成 & /etc/hostsにserver_nameを登録
.PHONY: init
init: env cert_key
	@#chmod +x init/add_host.sh && ./init/add_host.sh init/.os_env
	@chmod +x init/make_dir.sh && ./init/make_dir.sh init/.os_env

.PHONY: env
env:
	cat docker/srcs/.env_src_credentials > docker/srcs/.env
	cat docker/srcs/.env_src_general >> docker/srcs/.env
	@chmod +x init/os_env.sh && ./init/os_env.sh init/.os_env docker/srcs/.env

## Certificate生成（初回のみ実行）
.PHONY: cert_key
cert_key:
	@chmod +x init/cert_key.sh && ./init/cert_key.sh
	@chmod +x init/cert_key_django.sh && ./init/cert_key_django.sh
	@chmod +x init/cert_key_postgresql.sh && ./init/cert_key_postgresql.sh
# gfarana追加
#	@chmod +x init/cert_key_grafana.sh && init/cert_key_grafana.sh

.PHONY: check_key
check_key:
	openssl s_client -connect localhost:443

.PHONY: ntp_linux
ntp_linux:
	sudo apt update
	sudo apt install ntp
	sudo systemctl restart ntp
	sudo systemctl enable ntp


# -----------------------------------------------
#  test
# -----------------------------------------------
.PHONY: test_django_test_py
test_django_test_py:
	docker exec uwsgi-django /bin/sh -c "python manage.py test --keepdb" > test/result/test_py_results.txt 

# pong/tournament 
test_tournament_django_all:
	docker exec -it uwsgi-django bash -c "python manage.py test pong.tournament.tests"
# pong/online
test_online_pong_django:
	docker exec -it uwsgi-django bash -c "python manage.py test pong.online.tests"
log_async_online:
	tail -f docker/srcs/uwsgi-django/pong/utils/async_log.log


# .PHONY: test_main
# test_main:
# 	bash ./test/main_test.sh
# 	make test_django_test_py

.PHONY: t
t:
	make test_main

# そのうち削除予定
.PHONY: test_game_result_json
test_game_result_json:
	sh test/django/game_result_json.sh

# .PHONY: test_game_result_json_hardhat
# test_game_result_json_hardhat:
# 	sh test/hardhat/save_game_result_json_hardhat.sh

# .PHONY: test_ganache
# test_ganache:
# 	bash ./test/ganache/test_main_ganache.sh
# -----------------------------------------------
# Blockcharin コマンド
# -----------------------------------------------
# build blockchainでも実行
# .PHONY: hardhat_deploy_hardhat
# hardhat_deploy_hardhat:
# 	docker exec hardhat /bin/sh -c 'NETWORK_NAME=hardhat npx hardhat run scripts/deploy.ts --network localhost'
# # build blockchainでも実行
# .PHONY: hardhat_deploy_ganache
# hardhat_deploy_ganache:
# 	docker exec hardhat /bin/sh -c 'NETWORK_NAME=ganache npx hardhat run scripts/deploy.ts --network ganache'
# # 公開ネットなので、コントラクトは一度だけデプロイ
# .PHONY: hardhat_deploy_sepolia
# hardhat_deploy_sepolia:
# 	docker exec hardhat /bin/sh -c 'NETWORK_NAME=sepolia npx hardhat run scripts/deploy.ts --network sepolia'
# # ganacheにサンプルデータを20件登録する
# # build blockchainでも実行
# .PHONY: setup_ganache_data
# setup_ganache_data:
# 	sh docker/srcs/ganache/setup_data.sh
# -----------------------------------------------
# docment 自動作成
# -----------------------------------------------
.PHONY: sphinx_make_html
sphinx_make_html:
	docker exec uwsgi-django /bin/sh -c "cd sphinx && make html"

# .PHONY: hardhat_docgen
# hardhat_docgen:
# 	docker exec hardhat npx hardhat docgen
# -----------------------------------------------
# Re-setup 再起動時に毎回実行するコマンドを登録してください。
.PHONY: Re-setup
Re-setup:


# -----------------------------------------------
# 
# -----------------------------------------------
# Django開発サーバー　localhost:8002
run_django_server:
	docker exec -it uwsgi-django bash -c "python manage.py runserver 0.0.0.0:8002"
# DBのフィールド変更時に毎回必要
migrate_Django_db:
	docker exec -it uwsgi-django bash -c "python manage.py migrate --noinput"
# Django staticファイル収集
django_collectstatic:
	docker exec -it uwsgi-django bash -c "python manage.py collectstatic --noinput"

# vite build for public
vite_npm_run_build:
	docker exec -it vite bash -c "npm run build"
# vite 開発サーバー
vite_npm_run_dev:
	docker exec -it vite bash -c "npm run dev"
# -----------------------------------------------
# インクルードしたいファイルのリスト
# -----------------------------------------------
# 個人用のmake targetを作成する際に活用してください。
# Makefileのある階層にadditional.mkを作成すると、.gitignoreで個人用にカスタマイズすることが可能です
INCLUDES := additional.mk
# 実際にインクルードする前に、存在しないファイルに対してのダミールールを定義
$(INCLUDES):
	touch $@
# ファイルをインクルード（存在しなければ空のファイルが作られ、エラーは発生しない）
include $(INCLUDES)
