#!/bin/bash

# ホストのIPアドレスを取得します
HOST_IP=$(ifconfig en1 | grep inet | awk '$1=="inet" {print $2}')


# kind-config.yaml ファイルを生成します
cat <<EOF > docker/srcs/kind/kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
networking:
  apiServerAddress: "$HOST_IP"
  apiServerPort: 6443
EOF
