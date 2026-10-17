/** @import { Core } from '@strapi/strapi' */

const path = require('path');
const { isDatabaseClientKind } = require('@strapi/database');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT');

  if (client !== 'mysql' || !isDatabaseClientKind(client)) {
    throw new Error('Royal Signature requires its dedicated MariaDB database (DATABASE_CLIENT=mysql).');
  }
  const databaseName = env('DATABASE_NAME');
  const databaseUsername = env('DATABASE_USERNAME');
  const databaseHost = env('DATABASE_HOST');
  const databasePassword = env('DATABASE_PASSWORD');
  if (!databaseName?.startsWith('royal_signature_') || !databaseUsername?.startsWith('royal_signature_')) {
    throw new Error('Royal Signature requires a dedicated database and user named with the royal_signature_ prefix.');
  }
  if (!databaseHost || /viveeaura/i.test(databaseHost) || !databasePassword) {
    throw new Error('Royal Signature requires an independent database host and password.');
  }

  /** @type {Record<Core.Config.Database.ClientKind, Core.Config.Database['connection']>} */
  const connections = {
    mysql: {
      client: 'mysql',
      connection: {
        host: databaseHost,
        port: env.int('DATABASE_PORT', 3306),
        database: databaseName,
        user: databaseUsername,
        password: databasePassword,
        charset: 'utf8mb4',
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      client: 'postgres',
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
