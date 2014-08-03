/**
 * Created by dlai on 7/31/14.
 */


module.exports = {
  init: function() {
    //Register all monsters to physics service
    console.log("Registering monsters to physics service");

    Monster.find().exec(function(err, monsters) {
      monsters.forEach(function(monster) {
        PhysicsService.registerMonster(monster);
      });
    });

  },



  handleCollision: function(monsterModel) {
    // Monster will randomly change angles when collided.
    console.log("handling monster stall or collision, changing directions");
    monsterModel.direction = Math.random() * 2 * Math.PI;
    monsterModel.save(function (err, savedMonsterModel) {
      //Publish the update so any subscriber will be alerted.
      if (!err)
        Monster.publishUpdate(savedMonsterModel.id, savedMonsterModel);
      else
        console.log(err);

    });
  }
};