So Cal Node Meetup - Build a SailsJS Adventure Game series
====================

In this series, we will be building a simple web game from scratch.  Each meetup we will take a new feature, and implement it in the meetup for you to follow.  Bring your laptops and be sure to check out the code branch for that day before the start of the meetup.

Suggest / Vote for which feature we implement at the next meetup.
http://www.google.com/moderator/#15/e=21174e&t=21174e.40


SailsJS Build A Game Series - Day1
----------------------------------

Goal: Create a world with 10 monsters moving around.  When we open the page, we will see 10 monsters moving around the screen in sync with the server in near real time.

1. Setup for today's lesson.

  Make sure you have Bower, SailsJS, and EmberJS command line tools installed.

		$> sudo npm install -g bower
		$> sudo npm install -g sails
		$> sudo npm install -g ember-cli


  Fetch the source for today's lesson.  For today, we'll be starting off with a pretty bare project skeleton
  with SailsJS v0.10 beta, EmberJS 1.6, and an SailsSocketAdapter.  (see [Prelude](PRELUDE.md) for full details of the setup)
  
		    $> git clone git@github.com:dlai0001/la-sails-meetup-game.git
		    $> git fetch
		    $> git checkout "lessons/day1"


  Run npm and bower install to download dependencies.  This will download all the dependencies specified in 
  the `package.json` and `bower.json`.

		    $> npm install
		    $> bower install


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
              max: 720,
              required: true
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


4. We will now work on displaying our monster in our client side app at the
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
                'top: ' + model.get('xPosition') + 'px;' +
                "left:" + model.get('yPosition') + "px;";
          }.property('model.xPosition', 'model.yPosition')
        });


  In the index template, let's add an image to represent our monster, and bind it to
  those coordinates.


        <div style="width: 1280px; height: 760px;">
          {{#each}}

              <img src="/images/ghost-128.png" {{bind-attr style=computedStyle}} />

          {{/each}}
        </div>


  At this point, you'll have a client side app that can display images of a monster at 
  the coordinates corresponding with the model.  Also notice, when you use the POST, PUT, 
  and DELETE of your sails app, `http://localhost:1337/monster`.  You will see the 
  monster images on the screen update in real time.






  
