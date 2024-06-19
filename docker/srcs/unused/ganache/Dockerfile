# docker/srcs/ganache/Dockerfile
FROM node:20-alpine
RUN npm install -g ganache-cli
COPY ganache-entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
