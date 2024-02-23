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

build:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	docker-compose -f $(COMPOSE_FILES_ARGS) build
# DEBUG: 環境変数チェック
# echo $$SERVER_NAME 
# DEBUG: キャッシュ不使用
# docker-compose -f docker-compose.yml build --no-cache
b:
	make build

up:
	$(call set_env) && \
	docker-compose -f $(COMPOSE_FILES_ARGS) up -d
u:
	make up

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
	docker-compose -f $(COMPOSE_FILES_ARGS) down; \
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
# -----------------------------------------------
#  test
# -----------------------------------------------
test_main:
	bash ./test/main_test.sh
t:
	make test_main
	



