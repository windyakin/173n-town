FROM node:18 AS builder

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:18

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/* \
  && apt-get autoremove -y

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
  && mkdir -p /home/pptruser/Downloads \
  && chown -R pptruser:pptruser /home/pptruser \
  && mkdir -p /usr/src/app \
  && chown -R pptruser:pptruser /usr/src/app

ENV CHROME_EXECUTABLE_PATH=/usr/bin/chromium

USER pptruser

WORKDIR /usr/src/app

COPY --chown=pptruser:pptruser --from=builder /usr/src/app/dist /usr/src/app

CMD ["node", "/usr/src/app/index.js"]
