FROM node:20-buster

WORKDIR /app

# プロジェクトからpackage.jsonとpackage-lock.jsonファイルをコピー
COPY hardhat_pj/package*.json /app/

# npmの依存関係をインストール
RUN npm install

# Hardhatプロジェクトの残りの部分を/appにコピー
COPY hardhat_pj/ /app/

# Solidityコンパイラを事前にインストール（後でも可）
RUN npm install --global solc@0.7.3

CMD ["npx", "hardhat", "node"]
