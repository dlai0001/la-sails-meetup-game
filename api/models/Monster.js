/**
* Monster.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    xPosition: {
      type: 'INTEGER',
      defaultsTo:640
    },
    yPosition: {
      type: 'INTEGER',
      defaultsTo:310
    },
    //direction monster is facing in radians
    direction: {
      type: 'FLOAT',
      defaultsTo:0
    }
  }
};

