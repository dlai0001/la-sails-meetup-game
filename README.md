So Cal Node Meetup - Build a SailsJS Adventure Game series
==========================================================

In this series, we will be building a simple web game from scratch.  Each meetup we will take a new feature, and implement it in the meetup for you to follow.  Bring your laptops and be sure to check out the code branch for that day before the start of the meetup.

Suggest / Vote for which feature we implement at the next meetup.
http://www.google.com/moderator/#15/e=21174e&t=21174e.40



SailsJS Build A Game Series - Day2
----------------------------------

__Goal:__ Incorporate physics into our game to handle collisions between monsters.


1. Setup for today's lesson, we'll be continuing off our lesson from
[Day1](https://github.com/dlai0001/la-sails-meetup-game/tree/lesson/1).

  Make sure you have Bower, SailsJS, and EmberJS command line tools installed.

		$> sudo npm install -g bower
		$> sudo npm install -g sails
		$> sudo npm install -g ember-cli


  Fetch the source for today's lesson.

		    $> git clone git@github.com:dlai0001/la-sails-meetup-game.git
		    $> git fetch
		    $> git checkout "lesson/2"

  (Note: you can also find the completed exercise under "lesson/2.completed")

  Then install the library dependencies.

        $> npm install
        $> bower install


2. Before we get started handling the physics.  Let's remove some of the movement related code
inside the `/api/services/MonsterAiService.js`.  We're going to refactor this so and separate
the responsibilities so `MonsterAiService.js` will handle decisions the monster makes, and we'll
create a new service `PhysicsService.js` to handle the movement and collisions in the virtual
world.

  For now, let's go into `/api/services/MonsterAiService.js` and remove the movement related
  logic.  Let's create some method stubs for handling initialization, handling created monsters,
  handling deleted monsters, and handling movement updates we'll be getting from the `PhysicsService`.

          module.exports = {
            init: function() {
              console.log("Loading monsters to the world.");
              //TODO: find all monsters and add them to the world.
            },

            handleCreatedMonster: function(newRecord) {
            console.log("Adding created monster to the world", newRecord);
              //TODO: add newly created monster to the world
            },

            handleDeletedMonster: function(deletedRecord) {
              console.log("Removing monster from the world", deletedRecord);
              //TODO: remote deleted monster from the world.
            },

            handleMovementUpdate: function(monsterModel, position) {
              console.log("Processing monster position update.", position);
              //TODO: write code to change angle if monster is stuck
            }
          };


  We'll also create a couple model hooks to allow us to call `handleCreateMonster` and `handleDeleteMonster`
  when ever a new Monster is created or destroyed.  Add the following to your `/api/models/Monster.js` file.


          module.exports = {

            attributes: {
              ...
            },
            // Add an after create hook.
            afterCreate: function(newlyInsertedRecord, cb){
              MonsterAiService.handleCreatedMonster(newlyInsertedRecord);
              cb();
            },
            // Add a after destroy hook.
            afterDestroy: function(destroyedModels, cb) {
              destroyedModels.forEach(function(destroyedModel){
                MonsterAiService.handleDeletedMonster(destroyedModel);
              });
              cb();
            }

          };




3. To handle the physics, we'll be using Box2D library for Node. This is a 2d physics engine that will
handle collisions between moving bodies in a 2 dimensional space.

          $> npm install box2d


4. Create a service `/api/services/PhysicsService.js` file, where we'll be writing various methods
 to handle registering our objects (monsters), and calling a periodic task to compute the next
 position of all the objects in our virtual world.


          module.exports = {

            init: function() {
              console.log("Initializing physics service");

              //TODO: start update loop
            },

            doUpdateTask: function() {
              //TODO: periodic task to update positions of all objects.
            },

            registerMonster: function(monsterModel) {
              console.log("registering monster", monsterModel);
              //TODO
            },

            unregisterMonster: function(monsterModelId) {
              console.log("removing monster from the world.");
              //TODO
            }

          }


5. Let's start off by creating the world in which our Monsters live.  Since box2d uses meters
instead of pixels.  We'll need to create a world that maps roughly slightly larger than our
screen (1280x720), and create a few methods to map between the coordinates in our world and
our screen.

          var b2d = require("box2d"); //import box2d physics library.

          module.exports = {

            _world: null,         // Reference to our instance of the world.

            ...

            init: function() {
                console.log("Initializing physics service");
                this.initWorld();
            },

            initWorld: function() {
                console.log("creating virtual world");
                this._lastUpdate = Date.now();

                //Configure the world's size
                var worldAABB = new b2d.b2AABB();
                worldAABB.lowerBound.Set(-35.0, -25.0);
                worldAABB.upperBound.Set(35.0, 25);

                var gravity = new b2d.b2Vec2(0.0, 0.0); //set gravity to 0

                var world = new b2d.b2World(worldAABB, gravity, true);

                this._world = world;
                this._createBoundingBox();
              },

              _createBoundingBox: function() {
                console.log("creating bounding box for the world.")

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
            ...

  This will create a new `box2d` world, along with a bounding box (4 static boxes) that act as hard
  walls for the edge of our world.

6.  Next we want to create a few functions to map the pixel world to our realm of meters and angles.
At the bottom of the `/app/services/PhysicsService.js` file, add a couple translation methods.

          var SCALE = 30;

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

7.  Let's create a couple methods for registering and unregistering Monsters from our virtual physics
simulation world.

  Under the `/api/service/PhysicsService.js`, add a couple methods for registering and unregistering
  monsters.

  Start off adding a javascript object to index/hold our bodies.  Bodies in our `box2d` world, are
  objects that track the physical and positional properties.

         // A dictionary to track/index all the objects we have in our world.
         _registeredObjects: {},

  Then add a couple methods to add/remove Monsters

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

  Now we can call these methods we added above in our `/api/services/MonsterAiService.js` file to
  handle to add/remove hooks we have.

            init: function() {
              //Register all monsters to physics service
              console.log("Registering monsters to physics service");

              Monster.find().exec(function(err, monsters) {
                monsters.forEach(function(monster) {
                  PhysicsService.registerMonster(monster);
                });
              });
            },

            handleCreatedMonster: function(newRecord) {
              console.log("monster ai service handling created monster", newRecord);
              Monster.findOne(newRecord.id).exec(function(err, model){
                if(!err) {
                  PhysicsService.registerMonster(model);
                }  else {
                  console.log("error handling created monster", err);
                }
              });

            },

            handleDeletedMonster: function(deletedRecord) {
              console.log("monster ai service handling deleted monster", deletedRecord);
              PhysicsService.unregisterMonster(deletedRecord.id);
            },

