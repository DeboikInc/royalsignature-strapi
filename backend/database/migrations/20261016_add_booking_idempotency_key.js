'use strict';

const tableName = 'bookings';
const columnName = 'idempotency_key';
const indexName = 'bookings_idempotency_key_unique';

module.exports = {
  async up(knex) {
    if (!(await knex.schema.hasTable(tableName)) || (await knex.schema.hasColumn(tableName, columnName))) return;
    await knex.schema.alterTable(tableName, (table) => {
      table.string(columnName, 128).nullable();
      table.unique([columnName], indexName);
    });
  },

  async down(knex) {
    if (!(await knex.schema.hasTable(tableName)) || !(await knex.schema.hasColumn(tableName, columnName))) return;
    await knex.schema.alterTable(tableName, (table) => {
      table.dropUnique([columnName], indexName);
      table.dropColumn(columnName);
    });
  },
};