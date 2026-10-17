'use strict';

const columns = [
  ['accommodations', 'status', 'unit_status'],
  ['rates', 'status', 'rate_status'],
  ['availability_blocks', 'status', 'block_status'],
  ['bookings', 'status', 'booking_status'],
  ['reviews', 'status', 'review_status'],
];

async function renameOrCopy(knex, tableName, source, destination) {
  if (!(await knex.schema.hasTable(tableName))) return;

  const hasSource = await knex.schema.hasColumn(tableName, source);
  const hasDestination = await knex.schema.hasColumn(tableName, destination);
  if (!hasSource) return;

  if (hasDestination) {
    await knex(tableName).update({ [destination]: knex.ref(source) });
    return;
  }

  await knex.schema.alterTable(tableName, (table) => table.renameColumn(source, destination));
}

module.exports = {
  async up(knex) {
    for (const [tableName, source, destination] of columns) {
      await renameOrCopy(knex, tableName, source, destination);
    }
  },

  async down(knex) {
    for (const [tableName, source, destination] of [...columns].reverse()) {
      await renameOrCopy(knex, tableName, destination, source);
    }
  },
};