FROM node:20-slim as builder

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# プロジェクトからpackage.jsonとpackage-lock.jsonファイルをコピー
COPY hardhat_pj/package*.json /app/

# npmの依存関係をインストール
RUN npm install

# Hardhatプロジェクトの残りの部分を/appにコピー
COPY hardhat_pj/ /app/

# Solidityコンパイラを事前にインストール（後でも可）
# RUN npm install -g solc

# 不要なパッケージを削除してイメージを軽量化
RUN apt-get autoremove -y && npm cache clean --force && rm -rf /tmp/*


# 実行ステージ
FROM node:20-slim

RUN apt-get update && apt-get install -y \
    git \
    bash \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ビルドステージから必要なファイルをコピー
COPY --from=builder /app /app

CMD ["npx", "hardhat", "node"]
