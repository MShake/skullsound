/**
 * Mp3.js
 *
 * @description :: TODO: You might write a short summary of how this model works
 * and what it represents here.
 * @docs        ::
 * http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes : {

    title : {type : 'string', defaultsTo : 'unknow'},

    album : {type : 'string', defaultsTo : 'unknow'},

    artist : {type : 'string', defaultsTo : 'unknow'},

    year : {type : 'string', defaultsTo : 'unknow'},

    genre : {type : 'string', defaultsTo : 'unknow'},

    path : {type : 'string', required : true}
  }
};
