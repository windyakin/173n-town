FROM node:24 AS builder

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

ENV PUPPETEER_SKIP_DOWNLOAD true

RUN npm install

COPY . .

RUN npm run build

FROM node:24

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/* \
  && apt-get autoremove -y

ENV PUPPETEER_SKIP_DOWNLOAD true

RUN mkdir -p /usr/src/app \
  && chown node:node /usr/src/app

ENV CHROME_EXECUTABLE_PATH=/usr/bin/chromium \
    TMPDIR=/tmp \
    XDG_CONFIG_HOME=/tmp/chromium-config \
    XDG_CACHE_HOME=/tmp/chromium-cache \
    npm_config_cache=/tmp/npm-cache

USER node

WORKDIR /usr/src/app

COPY --chown=node:node --from=builder /usr/src/app/package.json /usr/src/app/package-lock.json /usr/src/app/
COPY --chown=node:node --from=builder /usr/src/app/dist /usr/src/app/dist

CMD ["npm", "run", "start"]
