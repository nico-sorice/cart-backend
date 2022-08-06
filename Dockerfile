FROM node:14.16-alpine
WORKDIR /var/www/preciosrotos

RUN apk add chromium

RUN npm install