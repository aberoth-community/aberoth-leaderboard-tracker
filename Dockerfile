FROM node:17.7.1-alpine AS base

# Setup workspace
RUN mkdir -p /app \
  && chown -R node:node /app
WORKDIR /app

# Swap users
USER node

# Install node librariess
COPY --chown=node:node package*.json yarn.lock ./
RUN yarn install --production

# Copy files
COPY --chown=node:node . ./

# Testing target ---
FROM base AS test

RUN yarn install --development

ENTRYPOINT [ "yarn", "test" ]

# Default target ---
FROM base AS prod

ENTRYPOINT [ "node", "src/index.js" ]
