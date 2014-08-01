/**
 * Created by dlai on 7/31/14.
 */


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
};