# la-sails-meetup-game
### a Sails application


Steps so Far...

** Prelude, how this project skeleton was setup **

1. Installed and setup necessary CLI tools.

	npm install -g sails
	npm install -g ember-cli
	npm install -g bower

2. Created a new Sails App.
	
	"sailsjs new AppName"

3. Created a Ember Client application in a separate folder.

		"ember new AppName"

4. Copied over ember files from the Ember app to the SailsJS app.

5. Added the following lines in the ember build environment settings, /config/enviornment.js, file to prevent this file from loading in the SailsJS application.

		// PREVENT IMPORT IF NOT EMBER APP //
		if(global.process.title != 'ember') {
  			console.log('Skipping enviornment.js');
  			return;
		}

6. Configure the EmberJS application to use Hash routing.  This is because since the SailsJS app is doing the routing, we want to use Hash routing on the Ember app to not to confuse it. (at least until we implement a feature to handle custom routing logic).  Modify the `/configs/environment.js` file.

		module.exports = function(environment) {
			var ENV = {
		    	environment: environment,
		    	baseURL: '/',
		    	locationType: 'hash',	// UPDATE THIS SETTING TO USE 'hash'
		    	EmberENV: {
		      		FEATURES: {
		      	...


7. Installed grunt-shell task.  We will use this to call the "ember build" command in our build scripts.

		npm install --save-dev grunt-shell

8. Create our grunt task to build and include our ember application when we build our SailsJS application. Add the following to your Gruntfile.js

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

9. Added an image file under /public/images to represent our monster.


** Node JS Meetup Day1 **

Goal: Create a world with 10 monsters moving around.  When we open the page, we will see 10 monsters moving around the screen in sync with the server in near real time.

To git checkout "lessons/day1"

1. Let's install a few libraries we'll be using.

		## Promises makes JavaScript code with nested 
		## callbacks a lot easier to work with.
		$> npm install promised-io --save

		## We'll also be installing an ember-sails-adapter to allow our 
		## ember MVC client to connect to our SailsJS backend.
		$> bower install ember-data-sails-adapter	


2. Generate a model and controller to represent our monster.

		$> sailsjs generate model monster
		$> sailsjs generate controller monster