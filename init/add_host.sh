#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

RED="\033[0;31m"
RESET="\033[0m"
EXIT_FAILURE=1


add_host() {
  local env_file=$1

  if [ ! -f "$env_file" ]; then
    echo -e "${RED}[Error] ${$env_file} not found${RESET}"
    exit EXIT_FAILURE
  fi

  source "$env_file"

  echo "server_name: ${SERVER_NAME}"

  if [ -z "${SERVER_NAME}" ]; then
    echo -e "${RED}[Error] SERVER_NAME undefined${RESET}"
    exit EXIT_FAILURE
  fi

  grep -q ${SERVER_NAME} /etc/hosts || echo "127.0.0.1 ${SERVER_NAME}" | sudo tee -a /etc/hosts
}


add_host $1
