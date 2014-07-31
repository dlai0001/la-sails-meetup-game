So Cal Node Meetup - Build a SailsJS Adventure Game series
====================

In this series, we will be building a simple web game from scratch.  Each meetup we will take a new feature, and implement it in the meetup for you to follow.  Bring your laptops and be sure to check out the code branch for that day before the start of the meetup.


Prelude, how this project skeleton was setup
---------------------------------------------
Because we're short on time, we'll skip over a lot of some of the beginning boiler plate and configuration necessary to get the project setup.  For your information, here are the steps I took to get to the Day 1 project skeleton we start the lesson from.

1. Installed and setup necessary CLI tools.  These include generators for Sails and Ember that we use to create this project.  Bower is used to manage the client side package dependencies.

		sudo npm install -g sails
		sudo npm install -g ember-cli
		sudo npm install -g bower


2. Created a new Sails App.
	
		sailsjs new AppName


3. Created a Ember Client application in a separate folder.

		$> ember new AppName


4. Copied over ember files from the Ember app to the SailsJS app.

5. Edit your `packages.json` file to merge together the dev dependencies of the SailsJS and EmberJS projects.


		...
		"dependencies": {
		    "ejs": "0.8.4",
		    "grunt": "0.4.1",
		    "optimist": "0.3.4",
		    "promised-io": "^0.3.4",
		    "sails": "0.9.16",
		    "sails-disk": "~0.9.0"
		  },
		  "devDependencies": {
		    "body-parser": "^1.2.0",
		    "broccoli-asset-rev": "0.0.17",
		    "broccoli-ember-hbs-template-compiler": "^1.5.0",
		    "broccoli-static-compiler": "^0.1.4",
		    "ember-cli": "0.0.40",
		    "ember-cli-ember-data": "0.1.0",
		    "ember-cli-ic-ajax": "0.1.1",
		    "express": "^4.1.1",
		    "glob": "^3.2.9",
		    "grunt-shell": "^0.7.0",
		    "originate": "0.1.5"
		  },
		...



	Then run the install packages command for both npm and bower, to download all the project dependencies.

		$> npm install
		$> bower install


6. Added the following lines in the ember build environment settings, /config/enviornment.js, file to prevent this file from loading in the SailsJS application.

		// PREVENT IMPORT IF NOT EMBER APP //
		if(global.process.title != 'ember') {
  			console.log('Skipping enviornment.js');
  			return;
		}

7. Configure the EmberJS application to use Hash routing.  This is because since the SailsJS app is doing the routing, we want to use Hash routing on the Ember app to not to confuse it. (at least until we implement a feature to handle custom routing logic).  Modify the `/configs/environment.js` file.

		module.exports = function(environment) {
			var ENV = {
		    	environment: environment,
		    	baseURL: '/',
		    	locationType: 'hash',	// UPDATE THIS SETTING TO USE 'hash'
		    	EmberENV: {
		      		FEATURES: {
		      	...


8. Installed grunt-shell task.  We will use this to call the "ember build" command in our build scripts.

		npm install --save-dev grunt-shell

9. Create our grunt task to build and include our ember application when we build our SailsJS application. Add the following to your `Gruntfile.js`

			// INCLUDE THE 'grunt-shell' MODULE FOR RUNNING OUR 'ember build' CLI COMMAND.
		   	grunt.loadNpmTasks('grunt-shell');

		   	...

			grunt.initConfig({
		    pkg: grunt.file.readJSON('package.json'),

		    // CREATE A SHELL TASK CONFIGURATION FOR emberBuild
		    shell: {
		      emberBuild: {
		        command: 'ember build'
		      }
		    },
		    ...

		   	//REGISTER THE 'ember_build' TASK to call 'emberBuild' shell task.
		    grunt.registerTask('ember_build',['shell:emberBuild']);	

		    ...

		    grunt.registerTask('compileAssets', [
			    'ember_build',	//ADD 'ember_build' TASK DEPENDENCY
			    'clean:dev',
			    'jst:dev',
			    'less:dev',
			    'copy:dev',    
			    'coffee:dev'
			  ]);

10. Added an image file under `/public/images` to represent our monster.

11. Install a few libraries we'll be using.

      ## Promises makes JavaScript code with nested
      ## callbacks a lot easier to work with.
      $> npm install promised-io --save

      ## We'll also be installing an ember-sails-adapter to allow our
      ## ember MVC client to connect to our SailsJS backend.
      $> bower install ember-data-sails-adapter --save

  (Note: in theory, when things are fixed that adapter should work.  I did a bit of hacking
  to get real time updates working smoothly, https://github.com/dlai0001/ember-data-sails-adapter )


12. Edit the `Brockfile.js` to include the Ember-Sails adapter.

        ...
        // Include Ember Data Sails Adapter import statement before the `app.toTree()`
        app.import('vendor/ember-data-sails-adapter/ember-data-sails-adapter.js');
        ...
        module.exports = app.toTree();


13. Generate / Add the ember-sails `application` adapter to the ember app.

        $> ember generate adapter application

    Change `/app/adapters/application.js` to use the SailsSocketAdapter.

        import DS from 'ember-data';

        export default DS.SailsSocketAdapter.extend({

        });



14. Genrate / Add a `serializer` for the ember app.

        $> ember generate serializer application

  Change `/app/serializers/application.js` to use explicitly use the JSON serializer
  with some overrides to handle the differences between SailsJS and what Ember
  expects.

        import DS from 'ember-data';
        import Ember from 'ember';

        export default DS.JSONSerializer.extend({

          extractArray: function(store, type, arrayPayload) {
            var serializer = this;
            return Ember.ArrayPolyfills.map.call(arrayPayload, function(singlePayload) {
              return serializer.extractSingle(store, type, singlePayload);
            });
          },

          serializeIntoHash: function(hash, type, record, options) {
            Ember.merge(hash, this.serialize(record, options));
          }

        });


15. Inside `/app/index.html` include the javascript files that are normally included in the layout.
Since the ember build grunt task will overwrite the app.js file, need need to copy the socket.io
initialization code over to the index.html.




    <script src="/js/socket.io.js"></script>
    <script src="/js/sails.io.js"></script>
    <script>

        (function (io) {

            // as soon as this file is loaded, connect automatically,
            var socket = io.connect();
            if (typeof console !== 'undefined') {
                log('Connecting to Sails.js...');
            }

            socket.on('connect', function socketConnected() {

                // Listen for Comet messages from Sails
                socket.on('message', function messageReceived(message) {

                    ///////////////////////////////////////////////////////////
                    // Replace the following with your own custom logic
                    // to run when a new message arrives from the Sails.js
                    // server.
                    ///////////////////////////////////////////////////////////
                    log('New comet message received :: ', message);
                    //////////////////////////////////////////////////////

                });


                ///////////////////////////////////////////////////////////
                // Here's where you'll want to add any custom logic for
                // when the browser establishes its socket connection to
                // the Sails.js server.
                ///////////////////////////////////////////////////////////
                log(
                                'Socket is now connected and globally accessible as `socket`.\n' +
                                'e.g. to send a GET request to Sails, try \n' +
                                '`socket.get("/", function (response) ' +
                                '{ console.log(response); })`'
                );
                ///////////////////////////////////////////////////////////


            });


            // Expose connected `socket` instance globally so that it's easy
            // to experiment with from the browser console while prototyping.
            window.socket = socket;


            // Simple log function to keep the example simple
            function log () {
                if (typeof console !== 'undefined') {
                    console.log.apply(console, arguments);
                }
            }


        })(

                // In case you're wrapping socket.io to prevent pollution of the global namespace,
                // you can replace `window.io` with your own `io` here:
                window.io

        );

    </script>






SailsJS Build A Game Series - Day1
----------------------------------

Goal: Create a world with 10 monsters moving around.  When we open the page, we will see 10 monsters moving around the screen in sync with the server in near real time.

To git checkout "lessons/day1"


1. First we want to create a backend representation of the data
representing our monsters. Generate a sails model and controller to
represent our monster.

		    $> sails generate model monster
		    $> sails generate controller monster

  Add an id, x, and y property to our monster model, `/api/models/Monster.js`

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

  At this point, you should have your basic CRUD routes.


2. Generate the client side model for monster.  We will use this to work with
the same data on the client side that we have on the server side.  This is
because we're using 2 MVC frameworks, MVC on the server side serving up the
API, and MVC again on the client side.

        $> ember generate model monster

  Add the same properties to the client side model, `/app/models/monster.js`

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

