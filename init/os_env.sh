#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

# -----------------------------------------------
# OSに応じて環境変数を設定する
# -----------------------------------------------

RED="\033[0;31m"
RESET="\033[0m"
EXIT_FAILURE=1

append_to_env_file() {
  local output_env_file=$1

  OSTYPE=`uname -s`
  if [ "$OSTYPE" = "Linux" ]; then
    OS_PREFIX="LINUX"
  elif [ "$OSTYPE" = "Darwin" ]; then
    OS_PREFIX="MAC"
  else
    echo -e "${RED}[Error] Unsupported OS type${RESET}"
    exit EXIT_FAILURE
  fi

  content="
# ---------------------
# OS ENV for ${OS_PREFIX}
# ---------------------
SERVER_NAME=${SERVER_NAME}
"
  echo -n "$content" >> "$output_env_file"

  env_vars=(
#    MOUNT_PATH_FROM_PR_ROOT \
    NGINX_SSL_PORT \
    NGINX_PORT \
    FRONTEND_PORT \
    DJANGO_PORT \
    POSTGRES_PORT \
#    PGADMIN_PORT \
    HARDHAT_PORT \
    GANACHE_PORT \
    ELASTIC_SEARCH_PORT \
    KIBANA_PORT \
    LOGSTASH_PORT \
    PROMETHEUS_PORT \
    GRAFANA_PORT
  )

  echo "export env for '$OS_PREFIX OS'"
  for var in "${env_vars[@]}"; do
    eval value=\$${OS_PREFIX}_${var}
    if [ -n "${var}" ]; then
      echo "${var}=${value}" >> "$output_env_file"
    else
      echo -e "${RED}[Error] ${OS_PREFIX}_${var} is not set or is empty${RESET}"
      exit EXIT_FAILURE
    fi
  done

  eval volume_path=$PWD/\$${OS_PREFIX}_MOUNT_PATH_FROM_PR_ROOT
  echo "VOLUME_PATH=${volume_path}" >> "$output_env_file"
}


main() {
  local os_env_file=$1
  local output_env_file=$2

  if [ ! -f "$os_env_file" ]; then
    echo -e "${RED}[Error] $os_env_file not found${RESET}"
    exit EXIT_FAILURE
  fi
  if [ ! -f "$output_env_file" ]; then
    echo -e "${RED}[Error] ${output_env_file} not found${RESET}"
    exit EXIT_FAILURE
  fi

  echo "exec set_env"
  source "$os_env_file"

  append_to_env_file $output_env_file
}


main $1 $2
