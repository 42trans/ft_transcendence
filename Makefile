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
# docker-compose -f docker-compose.yml build --no-cache
# -----------------------------------------------
# kind(k8s)
# -----------------------------------------------
kindup:
	chmod +x kind/up.sh
	kind/up.sh

kinddown:
	chmod +x kind/down.sh
	kind/down.sh
# -----------------------------------------------
# Docker
# -----------------------------------------------
build:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	COMPOSE_PROFILES=elk,blockchain,monitor docker-compose -f $(COMPOSE_FILES_ARGS) build

b:
	make build

up:
	make kindup
	$(call set_env) && \
	COMPOSE_PROFILES=elk,blockchain,monitor docker-compose -f $(COMPOSE_FILES_ARGS) up -d
u:
	make up

build_elk:
	$(call set_env) && \
	docker-compose -f ./docker/srcs/elk/docker-compose-elk.yml build

up_elk:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	docker-compose -f ./docker/srcs/elk/docker-compose-elk.yml up

setup_elk:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	docker-compose -f ./docker/srcs/elk/docker-compose-elk.yml up setup

build_up_blockchain:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	COMPOSE_PROFILES=blockchain docker-compose -f $(COMPOSE_FILES_ARGS) build
	$(call set_env) && \
	COMPOSE_PROFILES=blockchain docker-compose -f $(COMPOSE_FILES_ARGS) up -d
	make hardhat_deploy_ganache
	make setup_ganache_data

build_up_monitor:
	make kindup
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	COMPOSE_PROFILES=monitor docker-compose -f $(COMPOSE_FILES_ARGS) build
	$(call set_env) && \
	COMPOSE_PROFILES=monitor docker-compose -f $(COMPOSE_FILES_ARGS) up -d

build_up_default:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	docker-compose -f $(COMPOSE_FILES_ARGS) build
	$(call set_env) && \
	docker-compose -f $(COMPOSE_FILES_ARGS) up -d

stop:
	$(call set_env) && \
	docker-compose -f $(COMPOSE_FILES_ARGS) stop
s:
	make stop


start:
	$(call set_env) && \
	docker-compose -f $(COMPOSE_FILES_ARGS) start

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
d:
	make down

reset_nginx:
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) down nginx 
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) build nginx
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) up nginx -d
reset_ft_django:
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) down ft_django 
	rm -rf mount_volume/ft_django
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) build ft_django
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) up ft_django -d

reset_kibana:
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) down kibana
# rm -rf mount_volume/kibana
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) build kibana
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) up kibana -d

reset_es:
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) down elasticsearch
# rm -rf mount_volume/elasticsearch
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) build elasticsearch
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) up elasticsearch -d

reset_logstash:
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) down logstash
# rm -rf mount_volume/logstash
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) build logstash
	$(call set_env) && docker-compose -f $(COMPOSE_FILES_ARGS) up logstash -d


# -----------------------------------------------
#  other docker command
# -----------------------------------------------
docker_rm:
	docker stop $(docker ps -qa); docker rm $(docker ps -qa); docker rmi -f $(docker image -qa); docker volume rm $( docker volume ls -q); docker network rm $(docker network ls -q) 2>/dev/null

remove_mount_volume_mac:
	rm -rf mount_volume
rm:
	make remove_mount_volume_mac

# log_django:
# 	docker logs ft_django
# ld:
# 	make log_django

# -----------------------------------------------
#  init
# -----------------------------------------------
env:
	cp docker/srcs/.env_example docker/srcs/.env

make_env:
	cp init/.make_env_example init/.make_env

key:
	openssl req -new -x509 -nodes -sha256 -days 365 \
	-keyout ./docker/srcs/nginx/ssl/nginx.key \
	-out ./docker/srcs/nginx/ssl/nginx.crt \
	-config ./docker/srcs/nginx/ssl/openssl.cnf \
	-extensions req_ext

check_key:
	openssl s_client -connect localhost:443

ntp_linux:
	sudo apt update
	sudo apt install ntp
	sudo systemctl restart ntp
	sudo systemctl enable ntp

init:
	make make_env
	mkdir -p ./docker/srcs/nginx/ssl
	make key
	make env

ELK_certs:
	chmod +x srcs/make/generate_certs.sh
	bash srcs/make/generate_certs.sh
	openssl x509 -in docker/srcs/elasticsearch/cert/elasticsearch.crt -text -noout

# -----------------------------------------------
#  test
# -----------------------------------------------
test_main:
	$(call set_env) && bash ./test/main_test.sh
t:
	make test_main
	
test_game_result_json:
	sh test/django/game_result_json.sh
test_game_result_json_hardhat:
	sh test/hardhat/save_game_result_json_hardhat.sh
test_ganache:
	bash ./test/ganache/test_main_ganache.sh

# -----------------------------------------------
# Blockcharin コマンド
# -----------------------------------------------
# build blockchainでも実行
hardhat_deploy_hardhat:
# docker exec hardhat npx hardhat run scripts/deploy.ts
	docker exec hardhat /bin/sh -c 'NETWORK_NAME=hardhat npx hardhat run scripts/deploy.ts --network localhost'

hardhat_deploy_ganache:
	docker exec hardhat npx hardhat run scripts/deploy.ts --network ganache
setup_ganache_data:
	sh docker/srcs/ganache/setup_data.sh
# -----------------------------------------------
# docment 自動作成
# -----------------------------------------------
sphinx_make_html:
	docker exec uwsgi-django /bin/sh -c "cd sphinx && make html"
hardhat_docgen:
	docker exec hardhat npx hardhat docgen
# -----------------------------------------------
# Re-setup 再起動時に毎回実行するコマンドを登録してください。
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
