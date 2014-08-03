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




