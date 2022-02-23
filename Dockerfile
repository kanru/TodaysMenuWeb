# syntax=docker/dockerfile:1
FROM node:16-alpine

WORKDIR /build

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

WORKDIR /

COPY dist /usr/share/nginx/html
