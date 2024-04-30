FROM node:20-buster

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY ft_trans/package*.json /app/

# 依存関係をインストール
RUN npm install

# プロジェクトのファイルをコピー
# TODO_ft:マウントしてるので起動時にローカルで上書きされる
COPY ft_trans/ /app/

COPY webpack-entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
