

function createHandlers({ queries }) {
    return {
        VideoViewed: event => queries.incrementVideosWatched(event.globalPosition)

    }
}

function createQueries ({ db }) {

    function ensureHomePage() {

        const queryString = `if NOT EXISTS
        (
            SELECT *
            FROM dbo.pages
            WHERE page_name = 'home'
        )

            INSERT INTO dbo.pages(page_name, page_data)
            VALUES('home', '{ "lastViewProcessed": 0, "videosWatched": 0}')

        `;

        return db.then(client => client.raw(queryString));

    }

    function incrementVideosWatched(globalPosition) {
        const queryString = `
        UPDATE
            pages
        SET
            page_data = JSON_MODIFY(
                JSON_MODIFY(page_data, '\$.videosWatched',
                COALESCE(CONVERT(bigint, JSON_VALUE(page_data, '\$.videosWatched')), 0) + 1),
                '\$.lastViewProcessed',
                ${globalPosition})
        WHERE
            page_name = 'home' AND
            COALESCE(CONVERT(bigint, JSON_VALUE(page_data, '\$.lastViewProcessed')), 0) < ${globalPosition}
            `;

        return db.then(client => client.raw(queryString, { globalPosition }));

    }

    return {
        ensureHomePage,
        incrementVideosWatched
    }
}

function build ({ db, messageStore }) {
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });
    const subscription = messageStore.createSubscription({
        streamName: 'viewing',
        handlers,
        subscriberId: 'aggregators:home-page'
    })

    function init() {
        return queries.ensureHomePage();
    }

    function start() {
        init().then(subscription.start);
    }

    return {
        queries,
        handlers,
        init,
        start
    }
}

module.exports = build;