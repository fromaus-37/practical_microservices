const mssql = require('mssql');

function createDatabase({ connectionString }) {

    //return an object that contains:
    //1. a function: query (sql, values = [])
    //that can execute a parameterised query string
    //and returns a Promise
    //2. another function called `stop`
    //that takes no parameters but calls end on the client that is in closure of both functions
    //and also returns a Promise (from node-postgres documentation)

    return {
        query: async (sql, parameterNames, parameterValues) => {
            const pool = await mssql.connect(connectionString);
            const req = pool.request();
            if (parameterNames) {

                for(let i = 0; i < parameterValues.length; i++ ) {
                    req.input(parameterNames[i], parameterValues[i]);
                }
            }

            return await req.query(sql);
        },
        stop: undefined //to implement it
    }

}

module.exports = createDatabase;