#!/bin/bash

# Set Environment Variables
KIND_VERSION=v0.22.0
KUBECTL_VERSION=v1.29.2
HELM_VERSION=v3.10.0

# Detect platform (Linux or Darwin)
PLATFORM=$(uname -s)
EXT=""
if [ "$PLATFORM" = "Darwin" ]; then
    EXT="darwin"
elif [ "$PLATFORM" = "Linux" ]; then
    EXT="linux"
else
    echo "Unsupported platform: $PLATFORM"
    exit 1
fi

# Install kind if not installed
if ! command -v kind &> /dev/null; then
    curl -Lo ./kind "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-${EXT}-amd64" && \
    chmod +x ./kind && \
    sudo mv ./kind /usr/local/bin/kind
else
    echo "Kind is already installed."
fi

# Install kubectl if not installed
if ! command -v kubectl &> /dev/null; then
    curl -Lo ./kubectl "https://storage.googleapis.com/kubernetes-release/release/${KUBECTL_VERSION}/bin/${EXT}/amd64/kubectl" && \
    chmod +x ./kubectl && \
    sudo mv ./kubectl /usr/local/bin/kubectl
else
    echo "kubectl is already installed."
fi

# Install Helm if not installed
if ! command -v helm &> /dev/null; then
    curl -fsSL -o get_helm.sh "https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3" && \
    chmod 700 get_helm.sh && \
    ./get_helm.sh --version ${HELM_VERSION}
else
    echo "Helm is already installed."
fi

# Create kind cluster
if ! kind get clusters | grep -q kind; then
    kind create cluster --name kind --wait 30s --config ./kind/kind-config.yaml
else
    echo "Kind cluster 'kind' already exists."
fi

# Install Prometheus using Helm
if ! helm list -q | grep -q prometheus; then
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    helm install prometheus prometheus-community/prometheus
else
    echo "Prometheus is already installed."
fi

helm upgrade --install prometheus prometheus-community/prometheus -f kind/prometheus-values.yaml

if ! helm list -q | grep -q grafana; then
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo update
    helm install grafana grafana/grafana -f kind/grafana-values.yaml
fi


# DEBUG

# kubectl get pods
#  kubectl get configmap -n default -l "app=prometheus,component=server" -o yaml 
# kubectl rollout restart deployment prometheus-server -n default

# 一時的にクラスター内に入ってnginxのmetricsを見る
# kubectl run curl --image=radial/busyboxplus:curl -i --tty --rm
# curl http://host.docker.internal:9113/metrics

# ログ
# kubectl get pods　でNAMEを見るそれを
# kubectl logs <NAME> -c prometheus-server
# kubectl logs prometheus-server-6598cc45d8-2d9dt -c prometheus-server
