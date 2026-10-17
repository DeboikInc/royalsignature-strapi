const cronTasks = require('./cron-tasks');

module.exports = ({ env }) => ({
  ...validateRoyalConfiguration(env),
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  cron: { enabled: env.bool('CRON_ENABLED', true), tasks: cronTasks },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

function validateRoyalConfiguration(env) {
  const keys = env.array('APP_KEYS');
  const required = ['API_TOKEN_SALT', 'ADMIN_JWT_SECRET', 'TRANSFER_TOKEN_SALT', 'JWT_SECRET', 'ENCRYPTION_KEY', 'INTERNAL_WEBHOOK_SECRET'];
  if (keys.length !== 4 || new Set(keys).size !== 4 || keys.some((key) => !key || key.includes('replace_with'))) {
    throw new Error('Royal Signature requires four unique APP_KEYS values.');
  }
  for (const name of required) {
    const value = env(name);
    if (!value || value.includes('replace_with')) {
      throw new Error(`Royal Signature requires ${name} to be configured.`);
    }
  }
  return {};
}
