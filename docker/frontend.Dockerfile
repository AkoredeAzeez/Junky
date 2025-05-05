FROM node:16.20.0-alpine3.18

# 1) update OS packages, 2) upgrade, 3) clean cache
RUN apk update \
 && apk upgrade \
 && rm -rf /var/cache/apk/*

ENV NODE_ENV=development
WORKDIR /app

# 2-layer copy for better cache
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# the rest of your code gets mounted at runtime
