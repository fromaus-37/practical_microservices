const VersionConflictError = require('./version-conflict-error')
const versionConflictErrorRegex = /^Wrong.*Stream Version: (\d+)\)/

const writeFunctionSql =
    [`EXEC write_message @id, @stream_name,
        @type, @data, @metadata, @expected_version`,
        ['id', 'stream_name', 'type',
         'data', 'metadata', 'expected_version']
    ];

//mssql client in `db` returned by `require('mssql-client')`
//---
//it creates and returns a writer function
//that writes a `message` object with a specified
//`expectedVersion` into the specified `stream` (just a
//column in the messages_store table that identifies
//the name of the stream to which the message
//conceptually belongs)
function createWrite({ db }) {
    return (streamName, message, expectedVersion) => {
        if (!message.type) {
            throw new Error('Messages must have a type');
        }

        const values = [
            message.id,
            streamName,
            message.type,
            JSON.stringify(message.data),
            JSON.stringify(message.metadata),
            expectedVersion
        ]

        return db.query(...writeFunctionSql, values)
            .catch(err => {
                const errorMatch = err.message.match(versionConflictErrorRegex);
                const notVersionConflict = errorMatch == null

                if (notVersionConflict) {
                    throw err;
                }

                const actualVersion = parseInt(errorMatch[1], 10);

                const versionConflictError = new VersionConflictError(
                    streamName,
                    actualVersion,
                    expectedVersion
                )

                throw versionConflictError;
            });
    }
}

module.exports = createWrite;