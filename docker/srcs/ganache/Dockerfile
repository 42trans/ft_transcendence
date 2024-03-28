# docker/srcs/ganache/Dockerfile
FROM node:20-buster
RUN npm install -g ganache-cli
COPY ganache-entrypoint.sh /entrypoint.sh
RUN chmod +x entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
