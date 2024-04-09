# FROM node:20-alpine
FROM node:20-buster

# アプリケーションディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY ft_trans/package*.json /app/

# 依存関係をインストール
RUN npm install

# プロジェクトのファイルをコピー
COPY ft_trans/ /app/

CMD ["npm", "run", "dev"]
# CMD ["npm", "run", "watch"]