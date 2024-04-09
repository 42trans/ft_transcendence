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
				./docker/srcs/compose-yaml/compose-web.yaml \
				./docker/srcs/compose-yaml/compose-blockchain.yaml \
				./docker/srcs/compose-yaml/compose-monitor.yaml \
				./docker/srcs/compose-yaml/compose-exporter.yaml
COMPOSE_FILES_ARGS = $(addprefix -f , $(COMPOSE_FILES))

# -----------------------------------------------
#  docker-compose
# -----------------------------------------------
all: init build up

# DEBUG: 環境変数チェック
# echo $$SERVER_NAME 
# DEBUG: キャッシュ不使用
# docker-compose -f docker-compose.yml build --no-cache
# -----------------------------------------------
# Docker
# -----------------------------------------------
.PHONY: build
build: init
	COMPOSE_PROFILES=elk,blockchain,monitor docker-compose $(COMPOSE_FILES_ARGS) build


.PHONY: b
b:
	make build

.PHONY: up
up: init
	COMPOSE_PROFILES=elk,blockchain,monitor docker-compose $(COMPOSE_FILES_ARGS) up -d

.PHONY: u
u:
	make up

.PHONY: build_elk
build_elk: init
	docker-compose -f ./docker/srcs/elk/docker-compose-elk.yml build

.PHONY: up_elk
up_elk: init
	docker-compose -f ./docker/srcs/elk/docker-compose-elk.yml up

.PHONY: setup_elk
setup_elk: init
	docker-compose -f ./docker/srcs/elk/docker-compose-elk.yml up setup

.PHONY: build_up_blockchain
build_up_blockchain: init
	COMPOSE_PROFILES=blockchain docker-compose $(COMPOSE_FILES_ARGS) build
	COMPOSE_PROFILES=blockchain docker-compose $(COMPOSE_FILES_ARGS) up -d
	make hardhat_deploy_hardhat
	make hardhat_deploy_ganache
	make setup_ganache_data

.PHONY: build_up_monitor
build_up_monitor: init
	COMPOSE_PROFILES=monitor docker-compose $(COMPOSE_FILES_ARGS) build
	COMPOSE_PROFILES=monitor docker-compose $(COMPOSE_FILES_ARGS) up -d

.PHONY: build_up_default
build_up_default: init
	docker-compose $(COMPOSE_FILES_ARGS) build
	docker-compose $(COMPOSE_FILES_ARGS) up -d

.PHONY: stop
stop:
	docker-compose $(COMPOSE_FILES_ARGS) stop

.PHONY: s
s:
	make stop


.PHONY: start
start:
	docker-compose $(COMPOSE_FILES_ARGS) start

.PHONY: down
down:
	COMPOSE_PROFILES=elk,blockchain,monitor docker-compose $(COMPOSE_FILES_ARGS) down; \
	PATTERN='127.0.0.1 $(SERVER_NAME)'; \
	OSTYPE=`uname -s`; \
	if [ "$$OSTYPE" = "Darwin" ]; then \
		sudo sed -i '' "/$$PATTERN/d" /etc/hosts; \
	elif [ "$$OSTYPE" = "Linux" ]; then \
		sudo sed -i "/$$PATTERN/d" /etc/hosts; \
	fi 

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

.PHONY: reset_kibana
reset_kibana:
	docker-compose $(COMPOSE_FILES_ARGS) down kibana
# rm -rf mount_volume/kibana
	docker-compose $(COMPOSE_FILES_ARGS) build kibana
	docker-compose $(COMPOSE_FILES_ARGS) up kibana -d

.PHONY: reset_es
reset_es:
	docker-compose $(COMPOSE_FILES_ARGS) down elasticsearch
# rm -rf mount_volume/elasticsearch
	docker-compose $(COMPOSE_FILES_ARGS) build elasticsearch
	docker-compose $(COMPOSE_FILES_ARGS) up elasticsearch -d

.PHONY: reset_logstash
reset_logstash:
	docker-compose $(COMPOSE_FILES_ARGS) down logstash
# rm -rf mount_volume/logstash
	docker-compose $(COMPOSE_FILES_ARGS) build logstash
	docker-compose $(COMPOSE_FILES_ARGS) up logstash -d


# -----------------------------------------------
#  other docker command
# -----------------------------------------------
.PHONY: docker_rm
docker_rm:
	@if [ -n "$$(docker ps -qa)" ]; then docker stop $$(docker ps -qa); fi
	@if [ -n "$$(docker ps -qa)" ]; then docker rm -f $$(docker ps -qa); fi
	@if [ -n "$$(docker images -qa)" ]; then docker rmi -f $$(docker images -qa); fi
	@if [ -n "$$(docker images -f "dangling=true" -q)" ]; then docker rmi -f $$(docker images -f "dangling=true" -q); fi
	@docker network rm $$(docker network ls -q) 2>/dev/null || true
	@docker volume prune -f

.PHONY: remove_mount_volume_mac
remove_mount_volume_mac:
	rm -rf mount_volume

.PHONY: rm
rm:
	make remove_mount_volume_mac

.PYHONY: ps
ps:
	docker-compose $(COMPOSE_FILES_ARGS) ps

.PYHONY: ps_a
ps_a:
	docker-compose $(COMPOSE_FILES_ARGS) ps -a


.PYHONY: logs
logs:
	docker-compose $(COMPOSE_FILES_ARGS) logs


# -----------------------------------------------
#  init
# -----------------------------------------------
## build初期設定: .envの作成 & /etc/hostsにserver_nameを登録
.PHONY: init
init: env cert_key
	@chmod +x init/add_host.sh && ./init/add_host.sh init/.os_env

.PHONY: env
env:
	cat docker/srcs/.env_src_credentials > docker/srcs/.env
	cat docker/srcs/.env_src_general >> docker/srcs/.env
	@chmod +x init/os_env.sh && ./init/os_env.sh init/.os_env docker/srcs/.env

## Certificate生成（初回のみ実行）
.PHONY: cert_key
cert_key:
	@chmod +x init/cert_key.sh && ./init/cert_key.sh
# gfarana追加
	@chmod +x init/cert_key_grafana.sh && init/cert_key_grafana.sh

.PHONY: check_key
check_key:
	openssl s_client -connect localhost:443

.PHONY: ntp_linux
ntp_linux:
	sudo apt update
	sudo apt install ntp
	sudo systemctl restart ntp
	sudo systemctl enable ntp

.PHONY: ELK_certs
ELK_certs:
	chmod +x srcs/make/generate_certs.sh
	bash srcs/make/generate_certs.sh
	openssl x509 -in docker/srcs/elasticsearch/cert/elasticsearch.crt -text -noout

# -----------------------------------------------
#  test
# -----------------------------------------------
.PHONY: test_django_test_py
test_django_test_py:
	docker exec uwsgi-django /bin/sh -c "python manage.py test --keepdb" > test/result/test_py_results.txt 

.PHONY: test_main
test_main:
	bash ./test/main_test.sh
	make test_django_test_py

.PHONY: t
t:
	make test_main

# そのうち削除予定
.PHONY: test_game_result_json
test_game_result_json:
	sh test/django/game_result_json.sh

.PHONY: test_game_result_json_hardhat
test_game_result_json_hardhat:
	sh test/hardhat/save_game_result_json_hardhat.sh

.PHONY: test_ganache
test_ganache:
	bash ./test/ganache/test_main_ganache.sh
# -----------------------------------------------
# Blockcharin コマンド
# -----------------------------------------------
# build blockchainでも実行
.PHONY: hardhat_deploy_hardhat
hardhat_deploy_hardhat:
	docker exec hardhat /bin/sh -c 'NETWORK_NAME=hardhat npx hardhat run scripts/deploy.ts --network localhost'
# build blockchainでも実行
.PHONY: hardhat_deploy_ganache
hardhat_deploy_ganache:
	docker exec hardhat /bin/sh -c 'NETWORK_NAME=ganache npx hardhat run scripts/deploy.ts --network ganache'
# 公開ネットなので、コントラクトは一度だけデプロイ
.PHONY: hardhat_deploy_sepolia
hardhat_deploy_sepolia:
	docker exec hardhat /bin/sh -c 'NETWORK_NAME=sepolia npx hardhat run scripts/deploy.ts --network sepolia'
# ganacheにサンプルデータを20件登録する
# build blockchainでも実行
.PHONY: setup_ganache_data
setup_ganache_data:
	sh docker/srcs/ganache/setup_data.sh
# -----------------------------------------------
# docment 自動作成
# -----------------------------------------------
.PHONY: sphinx_make_html
sphinx_make_html:
	docker exec uwsgi-django /bin/sh -c "cd sphinx && make html"

.PHONY: hardhat_docgen
hardhat_docgen:
	docker exec hardhat npx hardhat docgen
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
