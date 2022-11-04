const knex = require('knex')
const { parseConnectionString } = require('@tediousjs/connection-string');

async function createKnexClient ({ connectionString, migrationsTableName }) {
    const client = knex({
        client: 'mssql',
        connection: {
            user: 'sa',
            password: 'Sav01ard1Rach',
            server: 'localhost',
            port: 1433,
            database: 'practical_microservices',
          },
    });

    const migrationOptions = {
        tableName: migrationsTableName || 'knex_migrations'
    }

    await client.migrate.latest(migrationOptions);
    return client;
}

module.exports = createKnexClient;