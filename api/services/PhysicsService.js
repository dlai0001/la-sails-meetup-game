/**
 * Created by dlai on 8/1/14.
 */

var b2d = require("box2d");
var SCALE = 30;

var DEFAULT_MONSTER_FORCE = 20.0;

module.exports = {

  _world: null, // our world
  _lastUpdate:null,

  // we'll use this as a dictionary to
  _registeredObjects: {

  },


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

    //Size up the world
    var worldAABB = new b2d.b2AABB();
    worldAABB.lowerBound.Set(-35.0, -25.0);
    worldAABB.upperBound.Set(35.0, 25);

    var gravity = new b2d.b2Vec2(0.0, 0.0);
    var doSleep = true;

    var world = new b2d.b2World(worldAABB, gravity, doSleep);

    this._world = world;

    // create a bounding box
    var groundBodyDef = new b2d.b2BodyDef();
    groundBodyDef.position.Set(0.0, -12.0);
    var groundBody = world.CreateBody(groundBodyDef);
    var groundShapeDef = new b2d.b2PolygonDef();
    groundShapeDef.SetAsBox(30.0, 2.0);
    groundBody.CreateShape(groundShapeDef);

    var ceilingBodyDef = new b2d.b2BodyDef();
    ceilingBodyDef.position.Set(0.0, 12.0);
    var ceilingBody = world.CreateBody(ceilingBodyDef);
    var ceilingShapeDef = new b2d.b2PolygonDef();
    ceilingShapeDef.SetAsBox(30.0, 2.0);
    ceilingBody.CreateShape(ceilingShapeDef);

    var leftWallBodyDef = new b2d.b2BodyDef();
    leftWallBodyDef.position.Set(-21.33, 0.0);
    var leftWallBody = world.CreateBody(leftWallBodyDef);
    var leftWallShapeDef = new b2d.b2PolygonDef();
    leftWallShapeDef.SetAsBox(2.0, 20.0);
    leftWallBody.CreateShape(leftWallShapeDef);

    var rightWallBodyDef = new b2d.b2BodyDef();
    rightWallBodyDef.position.Set(21.33, 0.0);
    var rightWallBody = world.CreateBody(rightWallBodyDef);
    var rightWallShapeDef = new b2d.b2PolygonDef();
    rightWallShapeDef.SetAsBox(2.0, 20.0);
    rightWallBody.CreateShape(rightWallShapeDef);

    //set a contact listener to handle the collisons in the world.
    var contactListener = new b2d.b2ContactListener();
    contactListener.EndContact = function(contact) {
      console.log("contact", contact);

    };
  },



  doUpdateTask: function() {
    var newTime = Date.now();
    var timeDiff = (newTime - this._lastUpdate) / 1000;
    this._lastUpdate = newTime;

    // do a step in the world.
    console.log("update task stepping world", timeDiff);
    //console.log("current mosnters", this._registeredObjects);

    this._world.Step(timeDiff, 1);

    for(var key in this._registeredObjects) {
      (function(body) {

        var position = metersToPixel(body.GetPosition());

        // if the monster is standing still, handle the stall
        if(position.x == body.model.xPosition && position.y == body.model.yPosition)
          MonsterAiService.handleCollision(body.model);

        // Apply force at the monster's given angle for all monsters registered in the world.
        //console.log("update task applying force to ", body.model);
        var angle = body.model.direction;
        var force = new b2d.b2Vec2(
                Math.cos(angle) * DEFAULT_MONSTER_FORCE,
                Math.sin(angle) * DEFAULT_MONSTER_FORCE
        );
        body.ApplyForce(force, body.GetWorldCenter());

        // update all our models with new coordinates.
        body.model.xPosition = position.x;
        body.model.yPosition = position.y;

        //console.log("update task updating position of ", body.model);
        body.model.save(function(err, savedMonsterModel) {
          if(!err)
            Monster.publishUpdate(savedMonsterModel.id, savedMonsterModel);
          else
            console.log(err);
        });

      })(this._registeredObjects[key]);
    }

    // Update all the monsters' coordinates.
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

  unregisterMonster: function(monsterModel) {
    this._world.DestroyBody(this._registeredObjects[monsterModel.id]);
    delete this._registeredObjects[monsterModel.id];
  },


  handleCollision: function() {

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