const createExpressApp = require('./app/express')
const createConfig = require('./config');
const env = require('./env');

const config = createConfig({ env });

const app = createExpressApp( { config, env });

function signalAppStart() {
    console.log(`${env.appName} started`);
    console.table([['Port', env.port], ['Environment', env.env]]);
}

function start() {
    config.aggregators.forEach(a => a.start())
    config.components.forEach(c => c.start())
    app.listen(env.port, signalAppStart);
}

module.exports = {
    app, config, start
}