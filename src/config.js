// this module basically seems to be the _app_
// as it returns an object that combines in one place
// the express app, a client (this is the connection perhaps)
// for the backing database, and the actual config
// info which we seem to receive from env variables
// (with halp from dotenv which overrides env
// info from that declared in .env file; I think
// this should be the other way round and
// NConf is MUCH BETTER )
//
//It is also standing in for a DI container,
//by creating the objects like db connection
//that other objects require, then creating
//those objects with correct dependencies
//and returning them as part of
//complete app object at the end.
//
//Actually this class combines ConfigureServices
//and Configure from ASP.NET Core app initialisation.
//Considering that, the name Config for this class
//does sound apprioriate.
//The reason why it is standing in for DI container
//is because even though it is doing the job of
//ConfigureServices and Configure, there isn't
//a DI container being used yet there are
//services (functions, objects, classes etc.)
//that need to created/registered now for use
//later in the running of the application (when
//requests begin to get handled).
const createKnexClient = require('./knex-client')
const createHomeApp = require('./app/home')
const createRecordViewingsApp = require('./app/record-viewings')
const createMSSQLClient = require('./mssql-client');
const createMessageStore = require('./message-store');
const createHomePageAggregator = require('./aggregators/home-page');

function createConfig({ env }) {
    const knexClient = createKnexClient({
        connectionString: env.databaseUrl
      });

    const mssqlClient = createMSSQLClient({connectionString: env.messageStoreConnectionString});

    const messageStore = createMessageStore( { db: mssqlClient });

    const homeApp = createHomeApp({ db: knexClient })
    const recordViewingsApp = createRecordViewingsApp({ messageStore });

    const homePageAggregator = createHomePageAggregator({db: knexClient, messageStore});

    const aggregators = [
        homePageAggregator
    ]

    const components = []

    return {
        env,
        db: knexClient,
        homeApp,
        recordViewingsApp,
        messageStore,
        homePageAggregator,
        aggregators,
        components
    }
}

module.exports = createConfig