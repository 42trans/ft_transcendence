FROM node:20-alpine
RUN apk update && apk add git bash
WORKDIR /app
# プロジェクトからpackage.jsonとpackage-lock.jsonファイルをコピー
COPY hardhat_pj/package*.json /app/
# npmの依存関係をインストール
RUN npm install
# Hardhatプロジェクトの残りの部分を/appにコピー
COPY hardhat_pj/ /app/
# 開発依存関係でHardhatをインストール
RUN npm install --save-dev hardhat
CMD ["npx", "hardhat", "node"]
