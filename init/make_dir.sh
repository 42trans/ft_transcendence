#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail


make_dir() {
  dirs=("pgadmin" "nginx" "django" "postgres")
#  if [ -z "$VOLUME_PATH" ]; then
#    VOLUME_PATH="/path/to/default/volume"
#  fi

  if [ ! -d "$VOLUME_PATH" ]; then
      sudo mkdir -p "$VOLUME_PATH"
      sudo chown "$(whoami)" "$VOLUME_PATH"
  fi

  for dir in "${dirs[@]}"; do
    target="$VOLUME_PATH/$dir"
    if [ ! -d "$target" ]; then
        sudo mkdir -p "$target"
        sudo chown "$(whoami)" "$target"
    fi
  done
}


export_volume_path() {
    if [ ! -f "$os_env_file" ]; then
      echo -e "${RED}[Error] .os_env not found${RESET}"
      exit EXIT_FAILURE
    fi
    source "$os_env_file"

    OSTYPE=`uname -s`
    if [ "$OSTYPE" = "Linux" ]; then
      PREFIX="LINUX"
    elif [ "$OSTYPE" = "Darwin" ]; then
      PREFIX="MAC"
    else
      echo -e "${RED}[Error] Unsupported OS type${RESET}"
      exit EXIT_FAILURE
    fi

    eval value=\$${PREFIX}_MOUNT_PATH_FROM_PR_ROOT
    export "VOLUME_PATH=${value}"
#    echo "volume_path: $VOLUME_PATH"
}


main() {
  local os_env_file=$1
  export_volume_path $1

  make_dir dirs
}


main $1
