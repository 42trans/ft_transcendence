# -----------------------------------------------
# まずは最初に ターミナルで`make init`で .make_env を作成ください ※詳細はREADME.md
# -----------------------------------------------
# Makefile用の環境変数の読み込み
-include .make_env
# OSに応じて環境変数の設定と、ディレクトリの設定をする
-include set_env
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

# k8setup:
# 	$(call set_env) && \
# 	kompose convert -f $(COMPOSE_FILES_ARGS)
# kompose convert -f ./docker/srcs/docker-compose.yml -f ./docker/srcs/docker-compose-yml/docker-compose-networks.yml -f ./docker/srcs/docker-compose-yml/docker-compose-web.yml -f ./docker/srcs/docker-compose-yml/docker-compose-blockchain.yml -f ./docker/srcs/docker-compose-yml/docker-compose-monitor.yml -f ./docker/srcs/docker-compose-yml/docker-compose-exporter.yml


build:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	COMPOSE_PROFILES=elk,blockchain,monitor docker-compose -f $(COMPOSE_FILES_ARGS) build

b:
	make build

up:
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

build_up_monitor:
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

log_django:
	docker logs ft_django
ld:
	make log_django

# -----------------------------------------------
#  init
# -----------------------------------------------
env:
	cp docker/srcs/.env_example docker/srcs/.env

make_env:
	cp .make_env_example .make_env

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

# init_kind_hostip:
# 	sh docker/srcs/kind/host_ip.sh

kindup:
	chmod +x kind/up.sh
	kind/up.sh
kinddown:
	chmod +x kind/down.sh
	kind/down.sh
# -----------------------------------------------
#  test
# -----------------------------------------------
test_main:
	$(call set_env) && bash ./test/main_test.sh
t:
	make test_main
	



