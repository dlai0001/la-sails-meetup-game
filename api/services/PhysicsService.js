/**
 * Created by dlai on 8/1/14.
 */

var b2d = require("box2d");
var SCALE = 30;

var DEFAULT_MONSTER_FORCE = 100.0;

module.exports = {

  _world: null, // our world
  _lastUpdate:null,

  // we'll use this as a dictionary to
  _registeredObjects: {},


  init: function() {
    console.log("Initializing physics service");

    this.initWorld();

    //Schedule periodic updates to step the world
    var update = function() {
      this.doUpdateTask();
      setImmediate(update);
    }.bind(this);

    update();
  },


  initWorld: function() {
    console.log("creating virtual world");
    this._lastUpdate = Date.now();

    //Configure the world's size
    var worldAABB = new b2d.b2AABB();
    worldAABB.lowerBound.Set(-35.0, -25.0);
    worldAABB.upperBound.Set(35.0, 25);

    var gravity = new b2d.b2Vec2(0.0, 0.0);
    var doSleep = true;

    var world = new b2d.b2World(worldAABB, gravity, doSleep);

    this._world = world;
    this._createBoundingBox();
  },

  _createBoundingBox: function() {
    // create a bounding box
    var groundCeilingShapeDef = new b2d.b2PolygonDef();
    groundCeilingShapeDef.SetAsBox(30.0, 2.0);

    var groundBodyDef = new b2d.b2BodyDef();
    groundBodyDef.position.Set(0.0, -12.0);
    var groundBody = this._world.CreateBody(groundBodyDef);
    groundBody.CreateShape(groundCeilingShapeDef);

    var ceilingBodyDef = new b2d.b2BodyDef();
    ceilingBodyDef.position.Set(0.0, 12.0);
    var ceilingBody = this._world.CreateBody(ceilingBodyDef);
    ceilingBody.CreateShape(groundCeilingShapeDef);

    var wallShapeDef = new b2d.b2PolygonDef();
    wallShapeDef.SetAsBox(2.0, 20.0);

    var leftWallBodyDef = new b2d.b2BodyDef();
    leftWallBodyDef.position.Set(-21.33, 0.0);
    var leftWallBody = this._world.CreateBody(leftWallBodyDef);
    leftWallBody.CreateShape(wallShapeDef);

    var rightWallBodyDef = new b2d.b2BodyDef();
    rightWallBodyDef.position.Set(21.33, 0.0);
    var rightWallBody = this._world.CreateBody(rightWallBodyDef);
    rightWallBody.CreateShape(wallShapeDef);
  },


  doUpdateTask: function() {
    var newTime = Date.now();
    var timeDiff = (newTime - this._lastUpdate) / 1000;
    this._lastUpdate = newTime;

    // do a step in the world.
    //console.log("update task stepping world", timeDiff);
    //console.log("current mosnters", this._registeredObjects);

    this._world.Step(timeDiff, 5);

    for(var key in this._registeredObjects) {
      (function(body) {

        var position = metersToPixel(body.GetPosition());
        MonsterAiService.handleMovementUpdate(body.model, position);

        // Apply force at the monster's given angle for all monsters registered in the world.
        //console.log("update task applying force to ", body.model);
        var angle = body.model.direction;
        var force = new b2d.b2Vec2(
            Math.cos(angle) * DEFAULT_MONSTER_FORCE,
            Math.sin(angle) * DEFAULT_MONSTER_FORCE
        );
        body.ApplyForce(force, body.GetWorldCenter());

      })(this._registeredObjects[key]);
    }

  },

  registerMonster: function(monsterModel) {
    //console.log("registering monster", monsterModel);
    if(!this._registeredObjects[monsterModel.id]) {

      // create a Dynamic Body for this monster
      var bodyDef = new b2d.b2BodyDef();
      bodyDef.type = b2d.b2_dynamicBody;
      var position = pixelToMeters({
        'x':monsterModel.xPosition,
        'y':monsterModel.yPosition
      });
      bodyDef.position.Set(position.x, position.y);

      var body = this._world.CreateBody(bodyDef);

      var shapeDef = new b2d.b2PolygonDef();
      shapeDef.SetAsBox(2.0, 2.0);
      shapeDef.density = 1.0;
      shapeDef.friction = 0.3;

      body.CreateShape(shapeDef);
      body.SetMassFromShapes();

      body.model = monsterModel; //embed in the body our model

      this._registeredObjects[monsterModel.id] = body;
    }
  },

  unregisterMonster: function(monsterModelId) {
    this._world.DestroyBody(this._registeredObjects[monsterModelId]);
    delete this._registeredObjects[monsterModelId];
  }

}



function pixelToMeters(pixelCoordinates) {
  var metersX = ( pixelCoordinates.x / SCALE ) - 21.33;
  var metersY = ( pixelCoordinates.y / SCALE ) - 12;

  return {
    'x':metersX,
    'y':metersY
  }
}

function metersToPixel(meterCoordinates) {
  var pixelX = Math.floor((meterCoordinates.x + 21.33) * 30);
  var pixelY = Math.floor((meterCoordinates.y + 12) * 30);

  return {
    'x':pixelX,
    'y':pixelY
  }
}