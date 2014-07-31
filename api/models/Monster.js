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
      max: 1280,
      required: true
    },
    yPosition: {
      type: 'INTEGER',
      max: 720,
      required: true
    }
  }
};

