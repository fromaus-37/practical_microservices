const createWrite = require('./write');
const createRead = require('./read');
const configureCreateSubscription = require('./subscribe');


//very illiterate code
//here `db` is the mssql client directly
//elsewhere, knexclient is called db when the
//interfaces for the two objects are different
//and they come from different NPM packages.
//---
//we haven't even document in JSDoc what type
//of this `db` is
//---
//In pincipal, especially if the dependency will be
//injected by a DI container at some point later
//in the book, we don't need to know concrete type
//of this `db`. However, the contract should be
//visible or immediately navigable (which is where TypeScript
//would probabably be great; this probabaly cannot be achieved
//with just JSDOC). This would also allow us to see quickly all
//implementors of the interface that adds another layer
//of understanding to what would potentially be received.
//---
//ALTERNATIVELY (or perhaps IN ADDITION TO code literacy measures
//described above), we should navigate to where services
//are being added to the DI container (e.g. in ConfigureServices
//and Configure in ASP.NET Core) and see what db would be.
function createMessageStore({ db }) {
    const write = createWrite({ db });
    const read = createRead({ db });
    const createSubscription = configureCreateSubscription({
        read: read.read,
        readLastMessage: read.readLastMessage,
        write: write
    });

    return {
        write: write,
        read: read.read,
        readLastMessage: read.readLastMessage,
        createSubscription
    };

}

module.exports = createMessageStore;