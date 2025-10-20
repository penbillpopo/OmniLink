# 使用官方的 Node.js 映像作為基礎
FROM node:16

# 設置工作目錄
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY dist ./dist

# 開放容器內部的 3000 端口
EXPOSE 3000

# 啟動 Nest.js 應用程序
CMD ["node", "dist/server/server/src/main.js"]