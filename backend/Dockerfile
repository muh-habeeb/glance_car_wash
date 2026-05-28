FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache openssl
RUN npm install

COPY . .



RUN npm run build

EXPOSE 3500

CMD ["npm", "start"]
