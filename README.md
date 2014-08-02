So Cal Node Meetup - Build a SailsJS Adventure Game series
==========================================================

In this series, we will be building a simple web game from scratch.  Each meetup we will take a new feature, and implement it in the meetup for you to follow.  Bring your laptops and be sure to check out the code branch for that day before the start of the meetup.

Suggest / Vote for which feature we implement at the next meetup.
http://www.google.com/moderator/#15/e=21174e&t=21174e.40



SailsJS Build A Game Series - Day2
----------------------------------

__Goal:__ Create a virtual world with 10 monsters moving about.  When we open the page,
we will see multiple monsters moving around the screen in sync with the server in near real time.


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


2. To handle the physics, let's install `box2d`, a popular 2d physics engine.

        $> npm install box2d


3. Create a service `/api/services/CharacterPhysicsService.js`