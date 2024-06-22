FROM node:20-buster
WORKDIR /app
COPY pong-three/package*.json /app/
RUN npm install

COPY pong-three/ /app/

# index.jsをbindしてから起動するためのentrypoint.sh
# 注意:/appはマウントしているので避ける
COPY entrypoint.sh /entrypoint.sh

# bindせずに通常の起動を行う場合
# CMD ["npm", "run", "dev"]

ENTRYPOINT ["/entrypoint.sh"]
