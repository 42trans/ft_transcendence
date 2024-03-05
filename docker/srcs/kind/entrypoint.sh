#!/bin/bash
# docker/srcs/kind/entrypoint.sh

# Docker コンテナの停止と削除
container_ids=$(docker ps -q --filter "name=kind-*")  # コンテナIDの取得
for container_id in $container_ids; do
  container_name=$(docker inspect --format='{{.Name}}' $container_id | sed 's/^\/\(\(kind-worker\)\|\(kind-control-plane\)\)$/\1/')  # コンテナ名の取得
  if [[ "$container_name" =~ ^(kind-worker|kind-control-plane)$ ]]; then
    echo "🧹🧻 Stopping and removing $container_name"
    docker kill "$container_id" && docker rm "$container_id"
  fi
done

# Kubernetesクラスタの存在を確認し、存在しない場合は作成
cluster_exists=$(kind get clusters | grep -c '^kind$')
if [ "$cluster_exists" -eq 0 ]; then
    echo "👍 Creating kind cluster..."
    kind create cluster --name kind --wait 30s --config /kind-config.yaml || { echo "Failed to create kind cluster"; exit 1; }
else
    echo "🙅 Kind cluster already exists."
fi

# --------------------
# config path 変更
# --------------------
kind get kubeconfig --name="kind" > /kind-kubeconfig.yaml
export KUBECONFIG=/kind-kubeconfig.yaml
echo "$KUBECONFIG"
chmod 600 /kind-kubeconfig.yaml
# --------------------
# debug
# --------------------
echo "🔍 debug "
kind get kubeconfig --name="kind"

kind get clusters
kubectl get nodes
kubectl config get-contexts
kubectl get pods --all-namespaces
echo "debug 🔍 fin"
# --------------------
# kind-kindに変更する場合
# kubectl config use-context kind-kind
# kubectl cluster-info --context kind-kind
# --------------------
# prometheus install
# --------------------
# Add the Helm repo for Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/prometheus
# --------------------
# debug
# --------------------
kubectl get pods -n default
# kubectl port-forward svc/prometheus-server 9090:80を別の独立したターミナルから実行
# export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=prometheus,app.kubernetes.io/instance=prometheus" -o jsonpath="{.items[0].metadata.name}")
# kubectl --namespace default port-forward $POD_NAME 9090

# --------------------

exec "$@"

# 参考:【kindind ~Kubernetes in Docker in Dockerでお手軽クラスタ構築~ | DevelopersIO】 https://dev.classmethod.jp/articles/kubernetes-in-docker-in-docker/