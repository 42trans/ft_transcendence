# -----------------------------------------------
# まずは最初に ターミナルで`make init`で .make_env を作成ください ※詳細はREADME.md
# -----------------------------------------------
# Makefile用の環境変数の読み込み
-include init/.make_env
# OSに応じて環境変数の設定と、ディレクトリの設定をする
-include init/set_env
# 複数の.ymlを環境変数から読み込む
COMPOSE_FILES_ARGS=$(subst :, -f ,$(COMPOSE_FILES))
# -----------------------------------------------
#  docker-compose
# -----------------------------------------------
all: build up

# DEBUG: 環境変数チェック
# echo $$SERVER_NAME 
# DEBUG: キャッシュ不使用
# docker-compose -f compose.yaml build --no-cache
# -----------------------------------------------
# kind(k8s)
# -----------------------------------------------
<<<<<<< HEAD
# kindup:
# 	chmod +x kind/up.sh
# 	kind/up.sh

# kinddown:
# 	chmod +x kind/down.sh
# 	kind/down.sh
=======
.PHONY: kindup
kindup:
	chmod +x kind/up.sh
	kind/up.sh

.PHONY: kinddown
kinddown:
	chmod +x kind/down.sh
	kind/down.sh
>>>>>>> main
# -----------------------------------------------
# Docker
# -----------------------------------------------
.PHONY: build
build:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	COMPOSE_PROFILES=elk,blockchain,monitor docker-compose -f $(COMPOSE_FILES_ARGS) build

.PHONY: b
b:
	make build

.PHONY: up
up:
# make kindup
	$(call set_env) && \
	COMPOSE_PROFILES=elk,blockchain,monitor docker-compose -f $(COMPOSE_FILES_ARGS) up -d

.PHONY: u
u:
	make up

.PHONY: build_elk
build_elk:
	$(call set_env) && \
	docker-compose -f ./docker/srcs/elk/compose-elk.yaml build

.PHONY: up_elk
up_elk:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	docker-compose -f ./docker/srcs/elk/compose-elk.yaml up

.PHONY: setup_elk
setup_elk:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	docker-compose -f ./docker/srcs/elk/compose-elk.yaml up setup

.PHONY: build_up_blockchain
build_up_blockchain:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	COMPOSE_PROFILES=blockchain docker-compose -f $(COMPOSE_FILES_ARGS) build
	$(call set_env) && \
	COMPOSE_PROFILES=blockchain docker-compose -f $(COMPOSE_FILES_ARGS) up -d
	make hardhat_deploy_hardhat
	make hardhat_deploy_ganache
	make setup_ganache_data

.PHONY: build_up_monitor
build_up_monitor:
	make kindup
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	COMPOSE_PROFILES=monitor docker-compose -f $(COMPOSE_FILES_ARGS) build
	$(call set_env) && \
	COMPOSE_PROFILES=monitor docker-compose -f $(COMPOSE_FILES_ARGS) up -d

.PHONY: build_up_default
build_up_default:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	docker-compose -f $(COMPOSE_FILES_ARGS) build
	$(call set_env) && \
	docker-compose -f $(COMPOSE_FILES_ARGS) up -d

.PHONY: stop
stop:
	$(call set_env) && \
	docker-compose -f $(COMPOSE_FILES_ARGS) stop

.PHONY: s
s:
	make stop


.PHONY: start
start:
	$(call set_env) && \
	docker-compose -f $(COMPOSE_FILES_ARGS) start

.PHONY: down
down:
	make kinddown
	$(call set_env) && \
	COMPOSE_PROFILES=elk,blockchain,monitor docker-compose -f $(COMPOSE_FILES_ARGS) down; \
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
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) down nginx 
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) build nginx
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) up nginx -d

.PHONY: reset_ft_django
reset_ft_django:
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) down ft_django 
	rm -rf mount_volume/ft_django
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) build ft_django
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) up ft_django -d

.PHONY: reset_kibana
reset_kibana:
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) down kibana
# rm -rf mount_volume/kibana
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) build kibana
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) up kibana -d

.PHONY: reset_es
reset_es:
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) down elasticsearch
# rm -rf mount_volume/elasticsearch
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) build elasticsearch
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) up elasticsearch -d

.PHONY: reset_logstash
reset_logstash:
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) down logstash
# rm -rf mount_volume/logstash
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) build logstash
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) up logstash -d


# -----------------------------------------------
#  other docker command
# -----------------------------------------------
.PHONY: docker_rm
docker_rm:
	docker stop $(docker ps -qa); docker rm $(docker ps -qa); docker rmi -f $(docker image -qa); docker volume rm $( docker volume ls -q); docker network rm $(docker network ls -q) 2>/dev/null

.PHONY: remove_mount_volume_mac
remove_mount_volume_mac:
	rm -rf mount_volume

.PHONY: rm
rm:
	make remove_mount_volume_mac
# -----------------------------------------------
#  init
# -----------------------------------------------
.PHONY: env
env:
	cp docker/srcs/.env_example docker/srcs/.env

.PHONY: make_env
make_env:
	cp init/.make_env_example init/.make_env

.PHONY: key
key:
	openssl req -new -x509 -nodes -sha256 -days 365 \
	-keyout ./docker/srcs/nginx/ssl/nginx.key \
	-out ./docker/srcs/nginx/ssl/nginx.crt \
	-config ./docker/srcs/nginx/ssl/openssl.cnf \
	-extensions req_ext

.PHONY: check_key
check_key:
	openssl s_client -connect localhost:443

.PHONY: ntp_linux
ntp_linux:
	sudo apt update
	sudo apt install ntp
	sudo systemctl restart ntp
	sudo systemctl enable ntp

.PHONY: init
init:
	make make_env
	mkdir -p ./docker/srcs/nginx/ssl
	make key
	make env

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
	$(call set_env) && bash ./test/main_test.sh
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
