FROM node:20-alpine
RUN apk update && apk add git
WORKDIR /app
# プロジェクトからpackage.jsonとpackage-lock.jsonファイルをコピー
COPY hardhat_pj/package*.json ./
# npmの依存関係をインストール
RUN npm install
# Hardhatプロジェクトの残りの部分を/appにコピーします
COPY hardhat_pj/ .
# 開発依存関係としてHardhatをインストール
RUN npm install --save-dev hardhat
CMD ["npx", "hardhat", "node"]
