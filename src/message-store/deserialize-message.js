/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
/**
 * @description The Message Store is a PostgreSQL database, and idiomatic RDBMSs
 * tend to use snake_casing.  Also, `position` and `global_position` come back
 * as strings, and we need them as numbers.  This function deals with that.
 */
 function deserializeMessage (rawMessage) {
    if (!rawMessage) {
      return null
    }

    return {
      id: rawMessage.id,
      streamName: rawMessage.stream_name,
      type: Object.values(rawMessage)[1],
      position: parseInt(rawMessage.position, 10),
      globalPosition: parseInt(rawMessage.global_position, 10),
      //probably due to a bug in mssql, `data` can be seen as 5th
      //key in Object.keys(rawMessage) and its value is the
      //5th value in Object.values(rawMessage) yet
      //rawMessage.data is undefined is the query was stored
      //proc get_last_stream_message.
      //even Object.values(rawMessage)[5] ? JSON.parse(Object.values(rawMessage)[5]) : {}.indexOf('data') is -1
      //but the key 'data' shows in Object.values(rawMessage) in Watch window
      data: Object.values(rawMessage)[5] ? JSON.parse(Object.values(rawMessage)[5]) : {},
      metadata: rawMessage.metadata ? JSON.parse(rawMessage.metadata) : {},
      time: rawMessage.time
    }
  }

  module.exports = deserializeMessage
