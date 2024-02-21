# -----------------------------------------------
# まずは最初に ターミナルで`make init`で .make_env を作成ください 
# ※詳細はREADME.md
# -----------------------------------------------
-include .make_env
# -----------------------------------------------
# OSに応じて環境変数の設定と、ディレクトリの設定をする
# -----------------------------------------------
define set_env
	export SERVER_NAME=${SERVER_NAME} && \
	OSTYPE=`uname -s` && \
	if [ "$$OSTYPE" = "Linux" ]; then \
		export VOLUME_PATH=$(LINUX_VOLUME_PATH) && \
		export DJANGO_PORT=$(LINUX_DJANGO_PORT) && \
		export POSTGRES_PORT=$(LINUX_POSTGRES_PORT) && \
		export NGINX_PORT=$(LINUX_NGINX_PORT) && \
		export NGINX_SSL_PORT=$(LINUX_NGINX_SSL_PORT) && \
		if [ ! -d "$$VOLUME_PATH" ]; then \
			sudo mkdir -p $$VOLUME_PATH && \
			sudo chown $(shell whoami) $$VOLUME_PATH; \
		fi && \
		if [ ! -d "$$VOLUME_PATH/django" ]; then \
			sudo mkdir -p "$$VOLUME_PATH/django" && \
			sudo chown $(shell whoami) $$VOLUME_PATH/django; \
		fi && \
		if [ ! -d "$$VOLUME_PATH/postgres" ]; then \
			sudo mkdir -p "$$VOLUME_PATH/postgres" && \
			sudo chown $(shell whoami) $$VOLUME_PATH/postgres; \
		fi;\
	elif [ "$$OSTYPE" = "Darwin" ]; then \
		export VOLUME_PATH=$(MAC_VOLUME_PATH) && \
		export DJANGO_PORT=$(MAC_DJANGO_PORT) && \
		export POSTGRES_PORT=$(MAC_POSTGRES_PORT) && \
		export NGINX_PORT=$(MAC_NGINX_PORT) && \
		export NGINX_SSL_PORT=$(MAC_NGINX_SSL_PORT); \
	fi
endef
# -----------------------------------------------
#  docker-compose
# -----------------------------------------------
all: build up

build:
	grep -q $(SERVER_NAME) /etc/hosts || echo "127.0.0.1 $(SERVER_NAME)" | sudo tee -a /etc/hosts
	$(call set_env) && \
	docker-compose -f ./docker/srcs/docker-compose.yml build
# DEBUG: 環境変数チェック
# echo $$SERVER_NAME 
# DEBUG: キャッシュ不使用
# docker-compose -f ./docker/srcs/docker-compose.yml build --no-cache
b:
	make build

up:
	$(call set_env) && \
	docker-compose -f ./docker/srcs/docker-compose.yml up -d
u:
	make up

stop:
	$(call set_env) && \
	docker-compose -f ./docker/srcs/docker-compose.yml stop
s:
	make stop

start:
	$(call set_env) && \
	docker-compose -f ./docker/srcs/docker-compose.yml start

down:
	$(call set_env) && \
	docker-compose -f ./docker/srcs/docker-compose.yml down; \
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
	$(call set_env) && docker-compose -f ./docker/srcs/docker-compose.yml down nginx 
	$(call set_env) && docker-compose -f ./docker/srcs/docker-compose.yml build nginx
	$(call set_env) && docker-compose -f ./docker/srcs/docker-compose.yml up nginx -d
# -----------------------------------------------
#  other docker command
# -----------------------------------------------
docker_rm:
	docker stop $(docker ps -qa); docker rm $(docker ps -qa); docker rmi -f $(docker image -qa); docker volume rm $( docker volume ls -q); docker network rm $(docker network ls -q) 2>/dev/null

remove_mount_volume_mariadb:
		sudo rm -rf mount_voulme/mariadb/

remove_mount_volume_wp:
	sudo rm -rf mount_voulme/wordpress/

remove_mount_volume_data:
	sudo rm -rf mount_voulme/


log_wordpress:
	docker logs wordpress
lw:
	make log_wordpress

log_mariadb:
	docker logs mariadb
lm:
	make log_mariadb
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
	



