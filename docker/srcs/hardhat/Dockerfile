FROM node:20-buster
RUN apt-get update && apt-get install -y \
	git \
	bash \
	curl \
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
CMD ["npx", "hardhat", "node"]
