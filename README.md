So Cal Node Meetup - Build a SailsJS Adventure Game series
==========================================================

In this series, we will be building a simple web game from scratch.  Each meetup we will take a new feature, and implement it in the meetup for you to follow.  Bring your laptops and be sure to check out the code branch for that day before the start of the meetup.

Suggest / Vote for which feature we implement at the next meetup.
http://www.google.com/moderator/#15/e=21174e&t=21174e.40


SailsJS Build A Game Series - Day1
----------------------------------

__Goal:__ Create a virtual world with N monsters moving about.  When we open the page, 
we will see multiple monsters moving around the screen in sync with the server in near real time.

1. Setup for today's lesson.

  Make sure you have Bower, SailsJS, and EmberJS command line tools installed.

		$> sudo npm install -g bower
		$> sudo npm install -g sails
		$> sudo npm install -g ember-cli


  Fetch the source for today's lesson.  For today, we'll be starting off with a pretty bare project skeleton
  with SailsJS v0.10.4, EmberJS 1.6, and an SailsSocketAdapter.  (see [Prelude](PRELUDE.md) for full details of the setup)
  
		    $> git clone git@github.com:dlai0001/la-sails-meetup-game.git
		    $> git fetch
		    $> git checkout "lesson/1"

  (Note: you can also find the completed exercise under "lesson/1.completed")


  Run npm and bower install to download dependencies.  This will download all the dependencies specified in 
  the `package.json` and `bower.json`.

		    $> npm install
		    $> bower install

  You can build this project using `grunt build` command, and launch the server using `sails lift`. 


2. First we want to create a backend representation of the data representing our monsters. 
Generate a sails model and controller to represent our monster.

		    $> sails generate model monster
		    $> sails generate controller monster

  Add an id, xPosition, and yPosition property to our monster model, `/api/models/Monster.js`.
  We'll be using this to track the position on the screen of the monsters in our virtual world.

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
              max: 760,
              required: true
            },
            //direction monster is facing in radians
            direction: {
              type: 'FLOAT'
            }
          }
        };


  At this point, you should have your basic CRUD routes and Pub/Sub counter parts provided 
  by the SailsJS blueprints.


2. Generate the client side model for monster.  We will use this to work with
the same data on the client side that we have on the server side.  This is
because we're using 2 MVC frameworks, MVC on the server side serving up the
API, and MVC again on the client side.

        $> ember generate model monster

  Add the same properties to the client side model, `/app/models/monster.js`.  (Note: we 
  omit the `id` property because ember data automatically tracks this.)

        import DS from 'ember-data';

        export default DS.Model.extend({
          xPosition: DS.attr('number'),
          yPosition: DS.attr('number')
        });


3. Generate a route on the client side to wire up the client side model with the
request.

        $> ember generate route index

  In the `/app/routes/index.js`, wire up the model hook to fetch our monster
  models.

        import Ember from 'ember';

        export default Ember.Route.extend({
        	model: function() {
                     return this.store.find('monster');
        	}
        });

  Routes in the Ember client side framework is the backbone that wires up the various pieces 
  of this MVC framework on the client side.


4. In order to display our monsters, let's create a template that displays an image tag for each monster.

        $> ember generate template index

  In the `/app/templates/index.hbs` template, let's add an image to represent our monster, and bind it to
  those coordinates.


        <div style="width: 1280px; height: 760px;">
          {{#each}}

              <img src="/images/ghost-128.png" {{bind-attr style=computedStyle}} />

          {{/each}}
        </div>

  (Note: the computedStyle bind here will do nothing until we implement that in the controller
  in the next step)


5. We will now work on displaying our monster in our client side app at the
coordinates in the model.

  Start first by generating a controller for our monster and an array controller
  for our monsters.

        $> ember generate controller index
        $> ember generate controller monster

  In the index controller, make it a `Ember.ArrayController`, and set the item
  controller to our monster controller.  This let's us specify the sub controller
  to use to handles computing our monster style properties.

        import Ember from 'ember';

        export default Ember.ArrayController.extend({
          itemController: 'monster'
        });

  In the `app/controllers/monster.js` controller, create a computed property that
  observes changes in the X & Y coordinates.  This will create a computed property
  that our template can bind to and get the styling to set it's top and left
  properties.

        import Ember from 'ember';

        export default Ember.ObjectController.extend({
          computedStyle: function() {
            var model = this.get('model');

            return "position: absolute; " +
                'top: ' + model.get('yPosition') + 'px;' +
                "left:" + model.get('xPosition') + "px;";
          }.property('model.xPosition', 'model.yPosition')
        });


  At this point, you'll have a client side app that can display images of a monster at 
  the coordinates corresponding with the model.  Also notice, when you use the POST, PUT, 
  and DELETE of your sails app, `http://localhost:1337/monster`.  You will see the 
  monster images on the screen update in real time.


6. Now we will create a service to handle the monster's movements.

  Create a file `/api/services/MonsterAiService.js`, then let's add some logic to handle
  the monster's movements.

          
		exports.updateMonster = function() {
		
		  //Find all our monsters
		  Monster.find().exec(function(err, monsters){
		    monsters.forEach(function(monster) {
		
		      //assign a direction if none is there.
		      if(!monster.direction)
		        monster.direction = Math.random() * 2 * Math.PI;
		
		      //move them randomly by and x,y offset.
		      var distance = 5;
		      var xOffset = Math.floor(Math.cos(monster.direction) * distance);
		      var yOffset = Math.floor(Math.sin(monster.direction) * distance);
		
		      //if offset puts the monster off the screen change directions.
		      if (monster.xPosition + xOffset < 0 || monster.xPosition + xOffset > 1280 ||
		        monster.yPosition + yOffset < 0 || monster.yPosition + yOffset > 760 ) {
		
		        monster.direction = Math.random() * 2 * Math.PI;
		
		      } else {
		        monster.xPosition += xOffset;
		        monster.yPosition += yOffset;
		      }
		
		      monster.save(function(err, monsterModel) {
		        //Publish the update so any subscriber will be alerted.
		        if(!err)
		          Monster.publishUpdate(monsterModel.id, monsterModel);
		        else
		          console.log(err);
		      });
		    });
		  });
		
		  // schedule the next update in 50ms.  This will create a sort of infinite loop of scheduled
      // updates.
		  setTimeout(function() {
		    this.updateMonster();
		  }.bind(this), 50);
		
		};

  In `/config/bootstrap.js`, let's start our service.  `bootstrap.js` is a special config file 
  that runs at during the start-up of a SailsJS app.  It's a good place to put any calls to 
  initialization and task scheduling items.

            //Add update monster call before cb()
            MonsterAiService.updateMonster();

  At this point, you'll have monsters floating around the screen.  And if you open multiple browsers,
  you'll see they are all in sync.
