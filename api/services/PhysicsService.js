/**
 * Created by dlai on 8/1/14.
 */

b2d = require("box2d");

module.exports = {

  _world: null,
  _registeredObjects: {

  },
  _lastStep: null,

  init: function() {
    console.log("Initializing physics service");

    this._lastStep = Date.now();

    this.initWorld();

    //todo: init monsters


  },


  initWorld: function() {
    console.log("initializing the world");

    var worldAABB = new b2d.b2AABB();
    worldAABB.lowerBound.Set(-100.0, -100.0);
    worldAABB.upperBound.Set(100.0, 100.0);

    var gravity = new b2d.b2Vec2(0.0, 0.0);
    var doSleep = true;

    var world = new b2d.b2World(worldAABB, gravity, doSleep);

    this._world = world;

  }



}