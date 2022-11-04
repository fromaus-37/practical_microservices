/***
 * Excerpted from "Practical Microservices",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/egmicro for more book information.
***/
exports.up = knex =>
  knex.schema.createTable('pages', table => {
    table.string('page_name', 1000).primary()

    //.json() with MSSQL generates nvarchar(MAX) which
    //is the type of column in which I store
    //json on which operations can then
    //be performed in SQL using JSON_XXX operation.
    table.json('page_data').defaultsTo('{}')
  })

exports.down = knex => knex.schema.dropTable('pages')
