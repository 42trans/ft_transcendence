# docker/srcs/frontend/Dockerfile
FROM node:20-alpine
RUN apk update && apk add git curl
WORKDIR /usr/src/app
# プロジェクトからpackage.jsonとpackage-lock.jsonファイルをコピー
COPY package*.json ./
# npmの依存関係をインストール
RUN npm install
# Hardhatプロジェクトの残りの部分を/appにコピーします
COPY srcs/ ./

CMD ["npm", "start"]
