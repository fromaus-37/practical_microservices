const deserializeMessage = require('./deserialize-message');

const getLastMessageSql =
['EXEC get_last_stream_message @stream_name',
['stream_name']
];

const getAllMessagesSql = [`
SELECT TOP(@max_messages)
  id,
  stream_name,
  [type],
  position,
  global_position,
  [data],
  metadata,
  [time]
FROM
  messages
WHERE
  global_position > @global_position
ORDER BY global_position
`,
['global_position', 'max_messages']
]

const getStreamMessagesSql =
    ['EXEC get_stream_messages @stream_name, @global_position, @max_messages',
    ['stream_name', 'global_position', 'max_messages']];

const getCategoryMessagesSql =
    ['get_category_messages @stream_name, @global_position, @max_messages',
    ['stream_name', 'global_position', 'max_messages']];

function createRead({ db }) {
    async function read(streamName, fromPosition = 0, maxMessages = 1000) {
        let query = null;
        let values = null;

        if (streamName === "$all") {
            query = getAllMessagesSql;
            values = [fromPosition, maxMessages]
        } else
        if (streamName.includes('-')) {
            // Entity streams have a dash
            query = getStreamMessagesSql;
            values = [streamName, fromPosition, maxMessages];
        } else {
            // Category streams do not have a dash
            query = getCategoryMessagesSql;
            values = [streamName, fromPosition, maxMessages];
        }

        const res = await db.query(...query, values);

        return res.recordsets.length && res.recordsets[0].length ?
            res.recordsets[0].map(deserializeMessage) : [];
    }

    async function readLastMessage(streamName) {
        const res = await db.query(...getLastMessageSql, [streamName]);

        const returnVal = res.recordsets.length && res.recordsets[0].length ? deserializeMessage(res.recordsets[0][0]) : undefined;

        return returnVal;
    }

    return {
        read,
        readLastMessage
    }
}

module.exports = createRead;