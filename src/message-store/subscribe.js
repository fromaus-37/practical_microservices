const uuid = require('uuid').v4;
const category = require('./category');

function configureCreateSubscription( {read, readLastMessage, write}) {

    return ({
        streamName,
        handlers,
        messagesPerTick = 100,
        subscriberId,
        positionUpdateInterval = 10,
        originStreamName = null,
        tickIntervalMs = 100
    }) => {
        const subscriberStreamName = `subscriberPosition-${subscriberId}`;
        let currentPosition = -1;
        let messagesSinceLastPositionWrite = 0;
        let keepGoing = true;

        async function loadPosition() {
            const message = await readLastMessage(subscriberStreamName);
            currentPosition = message ? message.data.position : -1;
        }

        async function updateReadPosition(position) {
            currentPosition = position;
            messagesSinceLastPositionWrite += 1;

            if(messagesSinceLastPositionWrite === positionUpdateInterval) {
                messagesSinceLastPositionWrite = 0;
                return await writePosition(position);
            }
        }

        async function writePosition(position) {
            const positionEvent = {
                id: uuid(),
                type: 'Read',
                data: { position }
            }

            return await write(subscriberStreamName, positionEvent)
        }

        function filterOnOriginMatch(messages) {
            if (!originStreamName) {
                return messages;
            }

            return messages.filter(message => {
                const originCategory =
                    message.metadata && category(message.metadata.originStreamName);

                return originStreamName === originCategory;
            });
        }

        async function getNextBatchOfMessages() {
            const messages = await read(streamName, currentPosition + 1, messagesPerTick);
            return filterOnOriginMatch(messages);

        }

        function logError (lastMessage, error) {
            // eslint-disable-next-line no-console
            console.error(
                'error processing:\n',
                `\t${subscriberId}\n`,
                `\t${lastMessage.id}\n`,
                `\t${error}\n`
            )
        }

        async function handleMessage(message) {
            const handler = handlers[message.type] || handlers.$any
            return handler? await handler(message) : true;
        }

        async function processBatch(messages) {
            for(const message of messages) {
                try {
                await handleMessage(message);
                updateReadPosition(message.globalPosition);
                }
                catch(err) {
                    logError(message, err);
                    throw err;
                }
            }
            return messages.length;
        }

        async function tick() {
            try
            {
                const messages = await getNextBatchOfMessages();
                processBatch(messages);
            }
            catch(err) {
                console.error('Error processing message batch', err);
                stop();
            }

        }

        async function poll() {
            await loadPosition();

            while(keepGoing) {
                const messagesProcessed = await tick();
                if (messagesProcessed === 0) {
                    await new Promise(resolve => setTimeout(
                        resolve,
                        tickIntervalMs
                    ));
                }
            }
        }

        async function start() {
            console.log(`Started subscriber ${subscriberId}`);

            return poll();
        }

        function stop() {
            console.log(`Stopping ${subscriberId}`);

            keepGoing = false;
        }
        return {
            loadPosition,
            start,
            stop,
            tick,
            writePosition
        }

    }
}

module.exports = configureCreateSubscription;
