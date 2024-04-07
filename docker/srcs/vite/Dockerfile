# FROM node:20-alpine
FROM node:20-buster

# アプリケーションディレクトリを設定
WORKDIR /app

RUN npm cache clean --force && npm cache verify

# package.jsonとpackage-lock.jsonをコピー
COPY ft_trans/package*.json /app/

# 依存関係をインストール
RUN npm install --force

# プロジェクトのファイルをコピー
COPY ft_trans/ /app/

# 環境変数PATHにnode_modules/.binを追加
# ENV PATH="./node_modules/.bin:$PATH"

# Vite開発サーバーを起動
CMD ["npm", "run", "dev"]
