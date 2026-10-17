FROM node:22-alpine

WORKDIR /srv/app
COPY package.json package-lock.json ./
RUN npm ci --include=optional --os=linux --libc=musl --no-audit --no-fund --loglevel=verbose
RUN node -e "require('sharp')"
COPY . ./
RUN DATABASE_CLIENT=mysql \
  DATABASE_HOST=127.0.0.1 \
  DATABASE_NAME=royal_signature_build \
  DATABASE_USERNAME=royal_signature_build \
  DATABASE_PASSWORD=build-only-placeholder \
  APP_KEYS=build_key_one,build_key_two,build_key_three,build_key_four \
  API_TOKEN_SALT=build_api_salt \
  ADMIN_JWT_SECRET=build_admin_secret \
  TRANSFER_TOKEN_SALT=build_transfer_salt \
  JWT_SECRET=build_jwt_secret \
  ENCRYPTION_KEY=build_encryption_key \
  INTERNAL_WEBHOOK_SECRET=build_webhook_secret \
  npm run build

RUN mkdir -p /srv/app/public/uploads \
  && chown -R node:node /srv/app/public/uploads

ENV NODE_ENV=production
EXPOSE 1337
CMD ["npm", "run", "start"]