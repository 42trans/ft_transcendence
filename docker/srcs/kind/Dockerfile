# docker/srcs/kind/Dockerfile
FROM docker:20.10-dind

# Set Environment Variables
ENV KIND_VERSION=v0.22.0
ENV KUBECTL_VERSION=v1.29.2
ENV HELM_VERSION=v3.10.0

RUN apk update && apk add curl bash firefox

# Install kind
# Docker コンテナ "ノード" を使ってローカル Kubernetes クラスターを実行するためのツールです。Kubernetes 自体のテストに特に有用ですが、ローカル開発や CI (継続的インテグレーション) システムにも利用可能
RUN curl -Lo ./kind "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-amd64" && \
    chmod +x ./kind && \
    mv ./kind /usr/local/bin/kind

# Install kubectl
# Kubernetes クラスターに対してコマンドを実行
RUN curl -Lo ./kubectl "https://storage.googleapis.com/kubernetes-release/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" && \
    chmod +x ./kubectl && \
    mv ./kubectl /usr/local/bin/kubectl

# Install Helm
# Kubernetes のパッケージマネージャー
RUN curl -fsSL -o get_helm.sh "https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3" && \
    chmod 700 get_helm.sh && \
    ./get_helm.sh --version ${HELM_VERSION}

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]