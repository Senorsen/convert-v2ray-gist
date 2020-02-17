FROM node:12-alpine

WORKDIR /app
COPY . ./
RUN [ -d node_modules ] || npm install
CMD ["node", "/app/index.js"]
EXPOSE 3000
