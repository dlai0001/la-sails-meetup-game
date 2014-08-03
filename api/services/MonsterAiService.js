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

  handleMovementUpdate: function(monsterModel, position) {
    // Monster will randomly change angles when collided.
    // console.log("handling monster movement update", monsterModel, position);

    // update all our models with new coordinates.
    if (monsterModel.xPosition == position.x && monsterModel.yPosition == position.y) {
      // moster hasn't moved, change directions
      monsterModel.direction = Math.random() * 2 * Math.PI;
    } else {
      monsterModel.xPosition = position.x;
      monsterModel.yPosition = position.y;
    }

    monsterModel.save(function (err, savedMonsterModel) {
      //Publish the update so any subscriber will be alerted.
      if (!err)
        try {
          Monster.publishUpdate(savedMonsterModel.id, savedMonsterModel);
        } catch(e) {
          console.log("unable to publish update", e);
        }

      else
        console.log(err);
    });
  }
};