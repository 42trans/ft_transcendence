# FROM node:20-alpine
FROM node:20-buster

# アプリケーションディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY pong-three/package*.json /app/

# 依存関係をインストール
RUN npm install

# プロジェクトのファイルをコピー
COPY pong-three/ /app/

# 環境変数PATHにnode_modules/.binを追加
# ENV PATH="/app/node_modules/.bin:$PATH"

# Vite開発サーバーを起動
CMD ["npm", "run", "dev"]
